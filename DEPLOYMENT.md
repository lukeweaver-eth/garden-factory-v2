# Garden Factory V2 - Sepolia Deployment

**Deployed:** February 22, 2026
**Network:** Sepolia Testnet (Chain ID: 11155111)
**Deployer:** 0xEe514bd06a8479E3E4771F03cd01d2aF22AeB86d

---

## 📋 Contract Addresses

### Core Contracts

| Contract | Address | Etherscan |
|----------|---------|-----------|
| **GardenFactory** | `0x6326BBE0996E9CB675B2755487da39BaeC29609E` | [View](https://sepolia.etherscan.io/address/0x6326BBE0996E9CB675B2755487da39BaeC29609E#code) |
| **GardenTemplateDeployer** | `0xb8BC8E680b5c5aD9Bf017DD9BC12b44022BDe23c` | [View](https://sepolia.etherscan.io/address/0xb8BC8E680b5c5aD9Bf017DD9BC12b44022BDe23c#code) |

### Rendering Libraries

| Contract | Address | Etherscan |
|----------|---------|-----------|
| **GardenHTML** | `0x492182029177A5B4edD187DA54eb200b6FA67381` | [View](https://sepolia.etherscan.io/address/0x492182029177A5B4edD187DA54eb200b6FA67381#code) |
| **GardenContributions** | `0x87944443A6d3C89A5044E01EAbd39538DbC2b095` | [View](https://sepolia.etherscan.io/address/0x87944443A6d3C89A5044E01EAbd39538DbC2b095#code) |
| **GardenIndexConfigurable** | `0x3452638cF4e8a43D573b509C65adcf09f2677d52` | [View](https://sepolia.etherscan.io/address/0x3452638cF4e8a43D573b509C65adcf09f2677d52#code) |
| **GardenEssay** | `0x6E32BE763554c1C6C6b780DE2CcbFf7AE94B61dE` | [View](https://sepolia.etherscan.io/address/0x6E32BE763554c1C6C6b780DE2CcbFf7AE94B61dE#code) |

---

## 🌱 Deployed Gardens

### Garden #1 - "Essay Garden"
- **Address:** `0x442ee2757cb616d391280e0c89b6d7f277e85870`
- **Title:** Essay Garden
- **Curator:** [Luke Weaver](https://x.com/lukeweaver_eth)
- **Symbol:** ꖛ
- **Collection Term:** anthology
- **Colors:** Black background (#000000), White text (#ffffff)
- **Thank You:** [fff](https://www.0xfff.love/), [Yigit Duman](https://x.com/YigitDuman)
- **Deployed:** Block 10318443
- **Transaction:** [0xa88765...8b5a6](https://sepolia.etherscan.io/tx/0xa8876515978447a6875c2a3470714b51c70afe27769c7c129aa822478f18b5a6)

#### View Options:
- **Localhost:** http://localhost:3333/address/0x442ee2757cb616d391280e0c89b6d7f277e85870
- **w3eth.io Gateway:** https://0x442ee2757cb616d391280e0c89b6d7f277e85870.w3eth.io
- **web3:// Protocol:** `web3://0x442ee2757cb616d391280e0c89b6d7f277e85870:11155111/`
- **Etherscan:** https://sepolia.etherscan.io/address/0x442ee2757cb616d391280e0c89b6d7f277e85870

#### Garden Contracts (auto-deployed, all verified ✅):
- **ModConfigurable:** [`0xc34247f12e582e0a7bd7fce86344642163f79024`](https://sepolia.etherscan.io/address/0xc34247f12e582e0a7bd7fce86344642163f79024#code)
- **Essay:** [`0x034c45966006fbe9dfd7d414da87cce0dfea6a48`](https://sepolia.etherscan.io/address/0x034c45966006fbe9dfd7d414da87cce0dfea6a48#code)
- **GardenConfigurable:** [`0x442ee2757cb616d391280e0c89b6d7f277e85870`](https://sepolia.etherscan.io/address/0x442ee2757cb616d391280e0c89b6d7f277e85870#code) (main)
- **GardenRendererConfigurable:** [`0xbe48b279d31309813e9d55fe36e3b377ee66f6b2`](https://sepolia.etherscan.io/address/0xbe48b279d31309813e9d55fe36e3b377ee66f6b2#code)
- **Web:** [`0xc9add38d2a58df04d0f5a377d878fdf1accf58d4`](https://sepolia.etherscan.io/address/0xc9add38d2a58df04d0f5a377d878fdf1accf58d4#code)

---

## 🎯 Key Features

### Factory Capabilities
- ✅ Plant new gardens (0.01 ETH per garden)
- ✅ Deploy essays (free via factory)
- ✅ Configurable colors (background + text)
- ✅ Configurable unicode symbol (1 character)
- ✅ Configurable collection term (anthology, show, collection, etc.)
- ✅ Thank you credits with links
- ✅ Exhibition text
- ✅ Garden URLs tracking
- ✅ Ownership transfer support

### On-Chain Rendering
- ✅ ERC-4804 / ERC-5219 compliant (web3:// protocol)
- ✅ Fully on-chain HTML rendering
- ✅ Essay support via SSTORE2 (24KB threshold, 2-part storage)
- ✅ Flower guestbook (0.01 ETH per flower)
- ✅ Sculpture management (add/remove)
- ✅ ENS resolution support

### Frontend Features
- ✅ MetaMask integration
- ✅ Plant gardens UI
- ✅ Write essays UI (Markdown → HTML)
- ✅ Essay size indicator (24KB threshold warning)
- ✅ Manage sculptures UI
- ✅ Sculpture interface validation
- ✅ Garden title in manage dropdown
- ✅ ENS resolution for addresses
- ✅ w3eth.io gateway links
- ✅ Etherscan integration

---

## 🚀 Usage Guide

### Plant a Garden

1. Visit http://localhost:3333 (or open index.html)
2. Connect MetaMask (Sepolia network)
3. Click "plant a garden"
4. Fill in:
   - Garden title (e.g., "My Essay Collection")
   - Curator name
   - Curator URL
   - Symbol (1 character, e.g., ⚘)
   - Collection term (e.g., "anthology")
   - Colors (background + text)
   - Optional: thank you credits
   - Optional: exhibition text
5. Click "plant a garden ⚘ 0.01 ETH"
6. Confirm in MetaMask

**Cost:** 0.01 ETH (planting fee)

### Write an Essay

1. Visit http://localhost:3333
2. Connect MetaMask
3. Click "write an essay"
4. Select your garden (or create independent essay)
5. Fill in:
   - Title
   - Author
   - Content (in Markdown)
6. Preview your essay
7. Click "deploy essay"
8. Confirm 3-4 transactions:
   - Set title
   - Set author
   - Store text part 1
   - Store text part 2 (if > 24KB)

**Cost:** Gas fees only (essay deployment is free via factory)

### Manage Garden

1. Visit http://localhost:3333
2. Connect MetaMask
3. Click "manage garden"
4. Select your garden from dropdown
5. Add sculptures by address (validates interface)
6. Remove sculptures as needed

**Cost:** Gas fees for setSculptures() transactions

---

## 🔧 Development Server

The server provides localhost access to on-chain gardens:

```bash
# Start server pointing to Sepolia
cd server
RPC_URL=https://eth-sepolia.g.alchemy.com/v2/demo PORT=3333 node index.js
```

### Server Routes:

| Route | Description |
|-------|-------------|
| `http://localhost:3333` | Factory frontend |
| `http://localhost:3333/garden/0x...` | Any garden's HTML |
| `http://localhost:3333/address/0x...` | Etherscan-style routing |
| `http://localhost:3333/address/0x.../essay` | Garden essay page |
| `http://localhost:3333/address/0x.../flower/1` | Flower #1 JSON |

**Features:**
- 12-second cache
- Fetches HTML directly from contracts via `html()` or `request()`
- Simulates web3:// protocol locally

---

## 🌐 RPC Configuration

### Recommended RPCs for Sepolia:

**Best (Free):**
- Alchemy: `https://eth-sepolia.g.alchemy.com/v2/demo`
- 1RPC: `https://1rpc.io/sepolia`

**Sign up for better limits:**
- Alchemy: https://alchemy.com
- Infura: https://infura.io

### MetaMask Setup:
1. Click network dropdown
2. Add network manually
3. Use settings:
   - Network Name: `Sepolia (Alchemy)`
   - RPC URL: `https://eth-sepolia.g.alchemy.com/v2/demo`
   - Chain ID: `11155111`
   - Currency: `ETH`
   - Explorer: `https://sepolia.etherscan.io`

---

## 📊 Gas Costs

| Operation | Estimated Gas | Cost @ 20 gwei |
|-----------|--------------|----------------|
| Plant Garden | ~5,900,000 | 0.118 ETH + 0.01 ETH fee |
| Deploy Essay (free) | ~1,500,000 | 0.03 ETH |
| Set Title | ~50,000 | 0.001 ETH |
| Set Author | ~50,000 | 0.001 ETH |
| Store Essay (<24KB) | ~2,000,000 | 0.04 ETH |
| Store Essay (>24KB) | ~4,000,000 | 0.08 ETH |
| Add Sculpture | ~100,000 | 0.002 ETH |
| Remove Sculpture | ~80,000 | 0.0016 ETH |
| Plant Flower | ~150,000 | 0.003 ETH + 0.01 ETH fee |

*Costs are estimates and vary with gas prices*

---

## 🔍 Technical Details

### Template Storage
- Total template size: 29,508 bytes
- Stored via SSTORE2 (2 storage pointers)
- Deployment gas: 7,469,692

### Garden Deployment Flow
1. Factory receives createGarden() call
2. GardenTemplateDeployer reads templates from SSTORE2
3. Deploys 5 contracts per garden:
   - ModConfigurable (config storage)
   - Essay (optional, essay content)
   - GardenConfigurable (main contract)
   - GardenRendererConfigurable (HTML renderer)
   - Web (web3:// protocol handler)
4. Initializes ownership transfer to gardener
5. Emits GardenPlanted event

### Essay Storage
- Essays stored as Markdown → converted to HTML
- HTML stored via SSTORE2 for gas efficiency
- 24KB threshold (Solidity string limit)
- Large essays split into 2 parts automatically
- Essays are fully editable by owner

### Sculpture Interface
Contracts must implement:
```solidity
function title() external view returns (string memory);
function authors() external view returns (string[] memory);
```

Frontend validates before allowing addition.

---

## 📝 Contract Verification Status

All contracts verified on Etherscan ✅

Verification includes:
- Source code
- Constructor arguments
- Compiler version (0.8.28)
- Optimization settings (200 runs)
- Libraries linked

---

## 🎨 Customization Options

### Per-Garden Settings:
- Garden title
- Curator name & URL
- Unicode symbol (1 char)
- Collection term (e.g., "anthology", "show")
- Background color (hex)
- Text color (hex)
- Thank you credits (names + URLs)
- Exhibition text
- Garden URLs

### Global Settings:
- Planting fee: 0.01 ETH (factory owner can change)
- Flower fee: 0.01 ETH (per garden)

---

## 🔐 Security Notes

1. **Ownership:** Gardens are owned by the gardener (msg.sender)
2. **Essay Ownership:** Essays owned by gardener, transferable
3. **Immutability:** Garden config is immutable after deployment
4. **Essay Mutability:** Essays fully editable by owner
5. **Sculpture Validation:** Frontend validates interface before adding
6. **Access Control:** Only garden owner can manage sculptures

---

## 🚧 Known Limitations

1. **RPC Dependency:** Some public RPCs have rate limits
2. **Gas Costs:** Large essays can be expensive to store
3. **Browser Support:** web3:// requires special browser/extension
4. **ENS Resolution:** Depends on provider support
5. **SSTORE2 Text Limit:** Essays split at 24KB boundary

---

## 📚 Resources

- **Frontend:** `/Users/lukeweaver/Downloads/Garden/GardenFactoryV2/index.html`
- **Contracts:** `/Users/lukeweaver/Downloads/Garden/GardenFactoryV2/contracts/contracts/`
- **Deployments:** `/Users/lukeweaver/Downloads/Garden/GardenFactoryV2/contracts/deployments/sepolia/`
- **Server:** `/Users/lukeweaver/Downloads/Garden/GardenFactoryV2/server/`

### Related Projects:
- **World Computer Sculpture Garden:** https://worldcomputersculpturegarden.art
- **w3eth.io Gateway:** https://w3eth.io
- **ERC-4804 Standard:** https://eips.ethereum.org/EIPS/eip-4804
- **ERC-5219 Standard:** https://eips.ethereum.org/EIPS/eip-5219

---

## 📞 Support

For issues or questions:
- Factory owner: 0xEe514bd06a8479E3E4771F03cd01d2aF22AeB86d
- Twitter: @lukeweaver_eth

---

**Last Updated:** February 22, 2026
