# Recursive Garden Structure - Setup Guide

## Summary

This guide walks through setting up the recursive structure where:
1. **GardenFactory** exhibits itself (garden 0) and WCSG (garden 1)
2. **WCSG** can exhibit GardenFactory (coordinated with fff later)

## Changes Made

### 1. Fixed GardenFactory.authors()

**File:** `contracts/contracts/GardenFactory.sol` (line 292-302)

**Change:** Append "Luke Weaver" as last author to follow WCSG convention

```solidity
function authors() external view returns (string[] memory) {
    string[] memory names = new string[](_gardens.length + 1);
    for (uint256 i = 0; i < _gardens.length; i++) {
        names[i] = _gardens[i].curatorName;
    }
    // Curator as last author (WCSG convention)
    names[_gardens.length] = "Luke Weaver";
    return names;
}
```

**Result:** When empty, returns `["Luke Weaver"]`. When populated, returns `["Gardener1", "Gardener2", ..., "Luke Weaver"]`.

### 2. Updated hardhat.config.ts

**File:** `contracts/hardhat.config.ts`

Added support for plain `.env` files for testing (falls back from encrypted `.env.enc`).

## Deployment Steps (Sepolia)

The deployment is currently running in the background. Once complete:

### Step 1: Deploy WCSG-style Test Garden

```bash
cd contracts
npx hardhat run scripts/deploy-wcsg-sepolia.js --network sepolia
```

This will:
- Create a garden via the factory with WCSG-style metadata
- Curator: "0xfff"
- Title: "World Computer Sculpture Garden"
- Returns the deployed garden address

**Save the address** - you'll need it for the next step.

### Step 2: Setup Recursive Structure

```bash
# Set the WCSG address from step 1
export WCSG_ADDRESS=0xYourWCSGSepoliaAddress

npx hardhat run scripts/setup-recursive-structure.js --network sepolia
```

This will:
1. Add GardenFactory to itself (garden 0)
2. Add WCSG to factory (garden 1)
3. Verify the Sculpture interface for both
4. Display the final garden list

### Step 3: Verify on Sepolia

Visit https://factory.garden and check:
- Garden 0: ⚘ Luke Weaver (Garden Factory)
- Garden 1: ⚘ 0xfff (World Computer Sculpture Garden)

Click each to verify they load correctly.

## Expected Results

### GardenFactory Sculpture Interface

When called as a Sculpture:
```
title()     → "Garden Factory"
authors()   → ["Luke Weaver"] (when empty) or ["Name1", "Name2", ..., "Luke Weaver"]
addresses() → [0x556875432a224b2d6eC96Ae54F1772c229180Ed7, ...garden addresses]
text()      → "I invite you into the garden of many gardens..."
urls()      → ["https://factory.garden"]
```

### WCSG Sepolia Garden (after step 1)

```
title()     → "World Computer Sculpture Garden"
authors()   → ["0xfff"]
addresses() → [0xSepoliaWCSGAddress]
text()      → "I invite you into the garden of many running sculptures..."
urls()      → []
```

### Factory Registry (after step 2)

```
Garden 0:
  address: 0x556875432a224b2d6eC96Ae54F1772c229180Ed7 (factory)
  curator: "Luke Weaver"
  symbol: ⚘

Garden 1:
  address: 0xSepoliaWCSGAddress (WCSG test garden)
  curator: "0xfff"
  symbol: ⚘
```

## Mainnet Deployment (After Sepolia Testing)

Once verified on Sepolia, repeat for mainnet:

### 1. Update Factory Address in Frontend

Update `index.html`:
```javascript
const CONFIG = {
  FACTORY_ADDRESS: '0xNewMainnetFactoryAddress',
  CHAIN_ID: 1,
  // ...
};
```

### 2. Setup Mainnet Recursive Structure

```bash
# Use actual WCSG mainnet address
export WCSG_ADDRESS=0x2a362fF002f7ce62D3468509dD2A4a9f5A8EBBb0

npx hardhat run scripts/setup-recursive-structure.js --network mainnet
```

### 3. Coordinate with fff

Contact fff to add GardenFactory to WCSG's sculptures:

```solidity
// fff calls on WCSG mainnet (0x2a362fF002f7ce62D3468509dD2A4a9f5A8EBBb0):
Garden(wcsg).setSculptures([
    ...existingSculptures,
    0xYourMainnetFactoryAddress
])
```

This completes the recursive loop:
- WCSG exhibits GardenFactory
- GardenFactory exhibits itself + WCSG

## Troubleshooting

**"Private key not found"**
- Ensure `.env` exists in `contracts/` directory with `PRIVATE_KEY=...`

**"Garden not showing"**
- Clear browser cache
- Verify factory address in CONFIG matches deployment
- Check RPC_URL in Netlify env vars

**"Authors() returns empty"**
- Deploy the updated GardenFactory with the authors() fix
- Check that you're calling the right contract address

## Files Created

- `contracts/scripts/deploy-wcsg-sepolia.js` - Deploy WCSG test garden
- `contracts/scripts/setup-recursive-structure.js` - Setup recursive structure
- `contracts/contracts/GardenFactory.sol` - Updated with authors() fix
- `contracts/hardhat.config.ts` - Updated to load .env

## Current Status

✅ GardenFactory.authors() fixed
✅ Sepolia deployment in progress
⏳ Awaiting deployment completion
⏳ WCSG test garden deployment pending
⏳ Recursive structure setup pending

Check deployment status:
```bash
ls -la contracts/deployments/sepolia/GardenFactory.json
```
