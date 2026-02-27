# Garden Verification Service

Automatic Etherscan verification for all gardens deployed through the factory.

## Overview

When gardens are deployed via `createGarden()`, the factory emits two events:
1. **GardenPlanted** - Contains contract addresses
2. **GardenConstructorArgs** - Contains all constructor arguments needed for verification

The verification service reads these events and automatically verifies all 5 contracts on Etherscan:
- ModConfigurable
- Essay
- GardenConfigurable
- GardenRendererConfigurable
- Web

## Setup

1. **Set your Etherscan API key** (required for verification):
   ```bash
   export ETHERSCAN_API_KEY=your_api_key_here
   ```

   Or add to `.env` file in the root directory.

2. **Install dependencies** (already done if you ran `npm install`):
   ```bash
   cd contracts
   npm install
   ```

## Usage

### One-time verification (catch up on existing gardens)

Verify all gardens that have been planted but not yet verified:

```bash
npx hardhat run scripts/verify-gardens.js --network sepolia
```

This will:
- Fetch all past GardenPlanted events
- Match them with GardenConstructorArgs events
- Verify all 5 contracts for each garden
- Save verification status to `verified-gardens-sepolia.json`

### Continuous watching (auto-verify new gardens)

Run the service continuously to automatically verify new gardens as they're planted:

```bash
WATCH=true npx hardhat run scripts/verify-gardens.js --network sepolia
```

This will:
- Verify all existing unverified gardens (like one-time mode)
- Keep running and watch for new GardenPlanted events
- Automatically verify each new garden within seconds of deployment
- Press Ctrl+C to stop

### Production deployment (recommended)

For production, run the verification service as a background process:

**Using PM2:**
```bash
npm install -g pm2

# Start service
pm2 start "WATCH=true npx hardhat run scripts/verify-gardens.js --network sepolia" --name garden-verifier

# View logs
pm2 logs garden-verifier

# Stop service
pm2 stop garden-verifier

# Restart service
pm2 restart garden-verifier
```

**Using screen/tmux:**
```bash
# Start screen session
screen -S verifier

# Run service
cd contracts
WATCH=true npx hardhat run scripts/verify-gardens.js --network sepolia

# Detach: Ctrl+A, then D
# Reattach: screen -r verifier
```

## Verification Status

The service tracks which gardens have been verified in `verified-gardens-{network}.json`:

```json
{
  "0xabc...": {
    "timestamp": 1234567890,
    "addresses": {
      "garden": "0xabc...",
      "mod": "0xdef...",
      "essay": "0x123...",
      "renderer": "0x456...",
      "web": "0x789..."
    },
    "verified": {
      "mod": true,
      "essay": true,
      "garden": true,
      "renderer": true,
      "web": true
    }
  }
}
```

## Troubleshooting

### "ETHERSCAN_API_KEY not set"
Set your API key:
```bash
export ETHERSCAN_API_KEY=your_key
```

### "No GardenConstructorArgs event found"
Gardens deployed with older factory versions (before this update) don't have constructor args events. These can't be automatically verified. Verify manually if needed.

### "Already Verified"
Contract is already verified on Etherscan - this is normal and not an error.

### "does not have bytecode"
Contract address is invalid or deployment failed. Check the garden deployment.

## Notes

- **Rate limiting**: Etherscan has rate limits (5 requests/second for free tier). The script adds delays between verifications to avoid hitting limits.
- **Gas costs**: Verification is free - it only requires RPC calls and Etherscan API calls.
- **Idempotent**: Running the script multiple times is safe - it skips already-verified gardens.
- **Network support**: Works on any network with Etherscan-compatible explorer (Sepolia, Mainnet, etc.)

## How It Works

1. **Factory emits GardenConstructorArgs event** with all constructor parameters
2. **Verification script reads the event** from the blockchain
3. **Constructor args are reconstructed** for each of the 5 contracts:
   - ModConfigurable: All garden metadata
   - Essay: No args (empty array)
   - GardenConfigurable: Empty sculptures, Web address, Mod address
   - GardenRendererConfigurable: Garden, Essay, Mod addresses
   - Web: No args (empty array)
4. **Each contract is verified** via Etherscan API using hardhat-verify
5. **Status is saved** to avoid re-verifying the same gardens

## Support

For issues or questions, check:
- Hardhat documentation: https://hardhat.org/
- Etherscan verify docs: https://docs.etherscan.io/
- Garden Factory issues: https://github.com/yourusername/garden-factory/issues
