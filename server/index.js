const express = require('express');
const { ethers } = require('ethers');
const path = require('path');
const fs = require('fs');

// Load .env from Garden root (two levels up from server/)
const envPath = path.resolve(__dirname, '../../.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.+)$/);
    if (match) process.env[match[1].trim()] = match[2].trim().replace(/^['"]|['"]$/g, '');
  });
}

const RPC_URL = process.env.RPC_URL || 'http://127.0.0.1:8545';
const PORT = process.env.PORT || 3333;
const CACHE_ENABLED = process.env.CACHE_ENABLED !== 'false';
const CACHE_TTL = 12 * 1000; // 12 seconds

// Minimal ABI — only what the server needs
const HTML_ABI = ['function html() view returns (string)'];

// ERC-5219 ABI — for sub-path routing (essay, flower, etc.)
const REQUEST_ABI = [
  'function request(string[] resource, tuple(string key, string value)[] params) view returns (uint256 statusCode, string body, tuple(string key, string value)[] headers)',
];

const app = express();
const provider = new ethers.JsonRpcProvider(RPC_URL);

// Simple in-memory cache keyed by address
const cache = {};

async function fetchRequest(address, resource) {
  const cacheKey = address + '/' + resource.join('/');
  const now = Date.now();
  if (CACHE_ENABLED && cache[cacheKey] && (now - cache[cacheKey].ts) < CACHE_TTL) {
    console.log(`[cache] ${cacheKey}`);
    return cache[cacheKey];
  }
  console.log(`[rpc]   ${cacheKey}`);
  const contract = new ethers.Contract(address, REQUEST_ABI, provider);
  const [statusCode, body, headers] = await contract.request(resource, []);
  const result = { statusCode: Number(statusCode), body, headers };
  cache[cacheKey] = { ...result, ts: now };
  return result;
}

async function fetchHtml(address) {
  const now = Date.now();
  if (CACHE_ENABLED && cache[address] && (now - cache[address].ts) < CACHE_TTL) {
    console.log(`[cache] ${address}`);
    return cache[address].html;
  }
  console.log(`[rpc]   ${address}`);
  const contract = new ethers.Contract(address, HTML_ABI, provider);
  const html = await contract.html();
  cache[address] = { html, ts: now };
  return html;
}

// Load factory deployment from a network's deployment artifact
function getDeployment(network) {
  const deploymentPath = path.resolve(
    __dirname,
    `../contracts/deployments/${network}/GardenFactory.json`
  );
  try {
    return JSON.parse(fs.readFileSync(deploymentPath, 'utf8'));
  } catch {
    return null;
  }
}

// Determine if we're pointing at a local node
function isLocalRpc() {
  return RPC_URL.includes('127.0.0.1') || RPC_URL.includes('localhost');
}

// Build the CONFIG object to inject into index.html
// If local: reads from deployments/localhost, uses chain 31337
// If remote: pass through without modification (index.html keeps its own CONFIG)
function buildLocalConfig() {
  const deployment = getDeployment('localhost');
  if (!deployment) return null;
  return {
    FACTORY_ADDRESS: deployment.address,
    CHAIN_ID: 31337,
    CHAIN_NAME: 'Localhost',
    RPC_URL: 'http://127.0.0.1:8545',
    EXPLORER: `http://localhost:${PORT}`,
  };
}

// Serve index.html, injecting local network config if running against localhost
app.get('/', (req, res) => {
  const indexPath = path.resolve(__dirname, '../index.html');
  let html = fs.readFileSync(indexPath, 'utf8');

  if (isLocalRpc()) {
    const localConfig = buildLocalConfig();
    if (localConfig) {
      // Replace the CONFIG= line with local values
      html = html.replace(
        /const CONFIG=\{[^}]+\};/,
        `const CONFIG=${JSON.stringify(localConfig)};`
      );
      console.log('[config] injected localhost config:', localConfig.FACTORY_ADDRESS);
    }
  }

  res.setHeader('Content-Type', 'text/html');
  res.send(html);
});

// Serve the factory's on-chain html() — preview the web3:// view locally
app.get('/factory', async (req, res) => {
  const deployment = getDeployment('localhost');
  const address = req.query.address || deployment?.address;
  if (!address) {
    return res.status(400).send('No factory address. Pass ?address=0x... or deploy locally first.');
  }
  try {
    const html = await fetchHtml(address);
    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  } catch (err) {
    console.error(err);
    res.status(500).send(`Error fetching html() from ${address}: ${err.message}`);
  }
});

// Serve any garden's on-chain html() by address
app.get('/garden/:address?', async (req, res) => {
  const address = req.params.address || req.query.address;
  if (!address) {
    return res.status(400).send('Provide a garden address: /garden/0xABC...');
  }
  try {
    const html = await fetchHtml(ethers.getAddress(address));
    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  } catch (err) {
    console.error(err);
    res.status(500).send(`Error fetching html() from ${address}: ${err.message}`);
  }
});

// Etherscan-style address route — proxies ERC-5219 request() for all sub-paths
// Link pattern: CONFIG.EXPLORER + '/address/' + gardenAddr
//   /address/0x...          → request([])       → index
//   /address/0x.../essay    → request(["essay"]) → essay page
//   /address/0x.../flower/3 → request(["flower","3"]) → flower JSON
app.get('/address/:address', async (req, res) => {
  try {
    const addr = ethers.getAddress(req.params.address);
    const { statusCode, body, headers } = await fetchRequest(addr, []);
    const contentType = headers.find(h => h.key === 'Content-Type')?.value || 'text/html';
    res.status(statusCode).setHeader('Content-Type', contentType).send(body);
  } catch (err) {
    console.error(err);
    res.status(500).send(`Error fetching from ${req.params.address}: ${err.message}`);
  }
});

app.get('/address/:address/*', async (req, res) => {
  try {
    const addr = ethers.getAddress(req.params.address);
    // Express puts the wildcard in req.params[0], split into resource segments
    const resource = req.params[0].split('/').filter(Boolean);
    const { statusCode, body, headers } = await fetchRequest(addr, resource);
    const contentType = headers.find(h => h.key === 'Content-Type')?.value || 'text/html';
    res.status(statusCode).setHeader('Content-Type', contentType).send(body);
  } catch (err) {
    console.error(err);
    res.status(500).send(`Error fetching from ${req.params.address}: ${err.message}`);
  }
});

// Generic: any contract's html()
app.get('/contract/:address', async (req, res) => {
  try {
    const html = await fetchHtml(ethers.getAddress(req.params.address));
    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  } catch (err) {
    console.error(err);
    res.status(500).send(`Error fetching html() from ${req.params.address}: ${err.message}`);
  }
});

app.listen(PORT, () => {
  const deployment = getDeployment('localhost');
  const local = isLocalRpc();
  console.log(`\nGarden Factory V2 — dev server`);
  console.log(`  http://localhost:${PORT}           → factory frontend`);
  console.log(`  http://localhost:${PORT}/factory    → factory on-chain html()`);
  console.log(`  http://localhost:${PORT}/garden/0x  → any garden's html()`);
  console.log(`\n  RPC:          ${RPC_URL}`);
  console.log(`  Cache:        ${CACHE_ENABLED ? `enabled (${CACHE_TTL / 1000}s TTL)` : 'disabled'}`);
  if (local && deployment) {
    console.log(`  Factory:      ${deployment.address}  (localhost — config injected)`);
    console.log(`\n  MetaMask setup for localhost:`);
    console.log(`    Network:    Localhost 8545  (chain ID 31337)`);
    console.log(`    Add at:     Settings → Networks → Add network manually`);
    console.log(`    RPC URL:    http://127.0.0.1:8545`);
    console.log(`    Chain ID:   31337`);
    console.log(`    Import a test account private key from "npx hardhat node" output`);
  }
  console.log('');
});
