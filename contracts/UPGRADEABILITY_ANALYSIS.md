# Upgradeability Analysis - Garden Factory V2

**Question:** Should GardenFactory or individual Gardens be upgradeable for future token functionality?

---

## Current Architecture

```
GardenFactory (immutable)
    └── GardenTemplateDeployer (immutable)
            └── Creates Gardens (5 contracts each, all immutable):
                ├── GardenConfigurable (main contract)
                ├── ModConfigurable (config storage)
                ├── Essay (content)
                ├── GardenRendererConfigurable (HTML)
                └── Web (web3:// handler)
```

**Current State:** Everything is immutable and non-upgradeable.

---

## Option 1: Make Gardens Upgradeable

### Approach: Proxy Pattern for Each Garden

```solidity
// Each garden would use UUPS or Transparent Proxy
GardenProxy → GardenImplementation (upgradeable)
```

### ✅ Pros

1. **Individual Garden Owners Control Upgrades**
   - Each gardener can upgrade their own garden
   - Can add token functionality per-garden
   - No dependency on factory owner

2. **Gradual Migration**
   - Old gardens can stay as-is
   - New gardens can have token features
   - No forced upgrades

3. **Customization**
   - Different gardens could have different token models
   - Some gardens with tokens, some without

### ❌ Cons

1. **Massive Gas Increase**
   - Current: 5.7M gas to deploy garden
   - With proxy: ~8-10M gas (+ proxy overhead)
   - Every garden call adds 2,600 gas (proxy delegatecall)

2. **Complexity for Users**
   - Gardeners need to understand proxy patterns
   - Risk of upgrade bugs breaking gardens
   - Need to implement upgrade authorization

3. **Security Risks**
   - Malicious upgrades could steal assets
   - Storage collisions between versions
   - Initialization vulnerabilities
   - Each gardener is upgrade admin (dangerous)

4. **Breaks Immutability Promise**
   - Current gardens are "set in stone" (feature!)
   - Art/content being immutable is valuable
   - Upgradeability contradicts permanence ethos

### 💰 Cost Analysis

**Current Garden Deployment:**
- 5,731,449 gas
- ~$430 at 20 gwei, $3000 ETH

**With UUPS Proxy per Garden:**
- Proxy deployment: ~500,000 gas
- Implementation: ~6,000,000 gas
- Initialization: ~300,000 gas
- **Total: ~6,800,000 gas (+19% cost)**

**Plus ongoing costs:**
- Every function call +2,600 gas (DELEGATECALL overhead)
- Over garden lifetime: thousands of wasted gas

---

## Option 2: Make Factory Upgradeable

### Approach: Proxy Pattern for Factory Only

```solidity
FactoryProxy → FactoryImplementation (upgradeable)
```

### ✅ Pros

1. **Can Deploy New Garden Types**
   - Upgrade factory to deploy "V3 Gardens"
   - New gardens have token functionality
   - Old gardens unaffected

2. **Centralized Control**
   - Factory owner manages upgrades
   - Professional handling of upgrades
   - Lower risk than individual owners

3. **Lower Cost**
   - Only one proxy (factory)
   - Gardens themselves still cheap to deploy
   - No ongoing gas overhead for gardens

4. **Preserves Garden Immutability**
   - Individual gardens stay immutable
   - Only factory logic changes

### ❌ Cons

1. **Centralization Risk**
   - Factory owner has upgrade power
   - Could change planting fees
   - Could change fee recipient
   - Requires trust or timelock

2. **Old Gardens Can't Get New Features**
   - Gardens deployed before upgrade stuck with old features
   - No way to add tokens to existing gardens
   - Creates "legacy" gardens vs "new" gardens

3. **Template Deployer Limitation**
   - Current deployer stores templates in SSTORE2 (immutable)
   - Would need new deployer for new templates
   - Factory upgrade alone isn't sufficient

---

## Option 3: Modular Token System (RECOMMENDED)

### Approach: Separate Token Contracts + Garden Extensions

```solidity
Garden (immutable)
    └── setSculptures([tokenContract]) // Add token as "sculpture"

TokenContract (new contract)
    ├── Implements Sculpture interface
    ├── ERC-721/1155 for the garden
    └── References garden via address
```

### ✅ Pros

1. **No Upgradeability Needed**
   - Gardens stay immutable ✅
   - Tokens are separate contracts
   - Composable, not coupled

2. **Works with Existing Gardens**
   - Any garden can add tokens now
   - Just deploy token contract
   - Add as sculpture via `setSculptures()`

3. **Flexible Token Models**
   - Different token standards (ERC-721, 1155, 20)
   - Different mint rules per garden
   - Can have multiple token contracts per garden

4. **Low Risk**
   - Token bugs don't affect garden
   - Garden bugs don't affect tokens
   - Can replace token contract if needed

5. **Low Cost**
   - No proxy overhead
   - Deploy token only when needed
   - No change to existing gardens

### Example Implementation

```solidity
// GardenToken.sol - New contract (not deployed yet)
contract GardenToken is ERC721, Sculpture {
    address public garden;

    constructor(address _garden, string memory name, string memory symbol)
        ERC721(name, symbol)
    {
        garden = _garden;
    }

    // Implement Sculpture interface
    function title() external view returns (string memory) {
        return string.concat(name(), " Collection");
    }

    function authors() external view returns (string[] memory) {
        // Return garden curator
        return IGarden(garden).authors();
    }

    // Token functionality
    function mint(address to, uint256 tokenId) external {
        require(msg.sender == garden || msg.sender == owner());
        _mint(to, tokenId);
    }
}

// Usage:
// 1. Deploy GardenToken(gardenAddress)
// 2. Garden owner calls: garden.setSculptures([tokenAddress])
// 3. Token shows up in garden display
// 4. Garden can call token.mint() if needed
```

### ❌ Cons

1. **Separate Contract**
   - Not built-in to garden
   - Users need to understand composition
   - Two transactions (deploy token + add to garden)

2. **Limited Integration**
   - Token can't directly modify garden state
   - Garden can't enforce token rules automatically
   - Loose coupling (but this is also a pro)

---

## Option 4: Deploy New Factory Version

### Approach: GardenFactoryV3 with Token Support

```solidity
// Deploy entirely new factory
GardenFactoryV3 (new address)
    └── Creates gardens with built-in tokens

// Old factory still exists
GardenFactoryV2 (0x6326BBE...)
    └── Old gardens still work
```

### ✅ Pros

1. **Clean Slate**
   - Design tokens properly from start
   - No upgrade complexity
   - No legacy issues

2. **Both Versions Coexist**
   - Old gardens stay immutable
   - New gardens have tokens
   - Users choose which to use

3. **No Security Risks**
   - No proxy vulnerabilities
   - No upgrade authorization issues
   - Each version independently secure

4. **Can Optimize**
   - Redesign for token use cases
   - Better integration
   - Learn from V2 experience

### ❌ Cons

1. **Fragmentation**
   - Two factories to maintain
   - Split user base
   - Confusing for users

2. **Old Gardens Stuck**
   - Can't add tokens to existing gardens
   - (But can use Option 3 for that)

3. **Deployment Cost**
   - Full redeployment cost
   - ~$450+ for mainnet deployment

---

## Detailed Comparison Matrix

| Factor | Current (Immutable) | Upgradeable Gardens | Upgradeable Factory | Modular Tokens | New Factory V3 |
|--------|---------------------|---------------------|---------------------|----------------|----------------|
| **Deployment Cost** | $430 | $510 (+19%) | $430 (factory) + $50 (proxy) | $430 + $100 (token) | $450 |
| **Ongoing Gas** | Normal | +2600/call | Normal | Normal | Normal |
| **Old Gardens Work?** | N/A | Yes | Yes | Yes | Yes |
| **Add Tokens to Old?** | No | Yes | No | **Yes** ✅ | No |
| **Security Risk** | Low | **High** ⚠️ | Medium | Low | Low |
| **Complexity** | Low | **High** ⚠️ | Medium | Low | Low |
| **Garden Immutability** | ✅ | ❌ | ✅ | ✅ | ✅ |
| **Centralization** | Owner withdraws | Owner per garden | **Factory owner** ⚠️ | None | Owner withdraws |
| **Implementation Time** | N/A | 2 weeks | 1 week | **2 days** ✅ | 1 week |

---

## Recommendation: **Modular Token System (Option 3)**

### Why This Is Best:

1. **Preserves Core Value Proposition**
   - Gardens remain immutable art pieces ✅
   - "Set in stone" permanence maintained
   - No upgrade attack surface

2. **Works with Existing Gardens**
   - Any current Sepolia garden can add tokens TODAY
   - No redeployment needed
   - No factory upgrade needed

3. **Lowest Risk**
   - Token bugs isolated from garden
   - No proxy vulnerabilities
   - No upgrade authorization issues

4. **Most Flexible**
   - Different token models per garden
   - Optional - gardens can choose
   - Can iterate on token contracts separately

5. **Composable**
   - Follows Ethereum composability ethos
   - Gardens + tokens + anything else
   - Can add other modules later (governance, etc.)

---

## Implementation Plan for Modular Tokens

### Phase 1: Design Token Contracts (1-2 days)

```solidity
// GardenERC721.sol
contract GardenERC721 is ERC721, Sculpture {
    address public immutable garden;
    uint256 public nextTokenId;

    constructor(address _garden) ERC721("Garden NFT", "GNFT") {
        garden = _garden;
    }

    function mint(address to) external {
        require(msg.sender == Ownable(garden).owner(), "Not garden owner");
        _mint(to, nextTokenId++);
    }

    // Sculpture interface for garden display
    function title() external pure returns (string memory) {
        return "Garden Collection";
    }

    function authors() external view returns (string[] memory) {
        return IGarden(garden).authors();
    }

    function addresses() external view returns (address[] memory) {
        address[] memory addrs = new address[](1);
        addrs[0] = address(this);
        return addrs;
    }

    function text() external pure returns (string memory) {
        return "<p>NFT collection for this garden.</p>";
    }

    function urls() external pure returns (string[] memory) {
        return new string[](0);
    }
}
```

### Phase 2: Deploy Token Deployer (1 day)

```solidity
// GardenTokenFactory.sol
contract GardenTokenFactory {
    event TokenContractDeployed(address garden, address token);

    function deployTokenForGarden(
        address garden,
        TokenType tokenType
    ) external returns (address token) {
        require(msg.sender == Ownable(garden).owner(), "Not garden owner");

        if (tokenType == TokenType.ERC721) {
            token = address(new GardenERC721(garden));
        } else if (tokenType == TokenType.ERC1155) {
            token = address(new GardenERC1155(garden));
        }

        emit TokenContractDeployed(garden, token);
        return token;
    }
}
```

### Phase 3: Update Frontend (2-3 days)

Add to index.html:
```javascript
// "Add Tokens" section
async function deployTokens() {
    const gardenAddress = getSelectedGarden();
    const tokenFactory = new ethers.Contract(TOKEN_FACTORY_ADDRESS, ...);
    const tx = await tokenFactory.deployTokenForGarden(gardenAddress, 0); // ERC721
    const receipt = await tx.wait();
    const tokenAddress = receipt.events[0].args.token;

    // Add to garden as sculpture
    const garden = new ethers.Contract(gardenAddress, ...);
    await garden.setSculptures([...existingSculptures, tokenAddress]);
}
```

### Phase 4: Test & Document (1 day)

- Deploy to Sepolia
- Add tokens to test garden
- Verify display in garden
- Document usage

**Total Time: ~1 week**
**Cost: ~$100 for token contract deployment per garden**

---

## Alternative Token Models

### Model A: Membership Tokens (ERC-721)
```solidity
// 1 token = 1 membership in garden
// Can gate certain features to token holders
// Token image could be garden symbol
```

### Model B: Edition Tokens (ERC-1155)
```solidity
// Multiple editions of essays/sculptures
// Track quantity per piece
// Fractional ownership of garden
```

### Model C: Access Tokens (ERC-20)
```solidity
// Fungible tokens for garden
// Could be used for voting, tipping, etc.
// Easily transferable
```

### Model D: Soulbound Tokens (ERC-721 non-transferable)
```solidity
// Proof of contribution to garden
// Cannot be transferred
// Permanent recognition
```

---

## Security Considerations for Tokens

### If Using Modular Approach:

1. **Token Contract Security**
   - Audit token contracts separately
   - Use OpenZeppelin standards
   - Test extensively

2. **Garden Integration**
   - Garden can remove token from sculptures if compromised
   - Token can't affect garden state
   - Clean separation of concerns

3. **Upgrade Path**
   - Deploy new token version
   - Migrate liquidity/holders
   - Update garden sculptures array
   - No proxy needed

### If Using Upgradeable Gardens:

⚠️ **Additional Security Risks:**

1. **Storage Layout**
   - Must maintain storage compatibility
   - Adding token fields could corrupt state
   - Need storage gap patterns

2. **Initialization**
   - Token state must be initialized carefully
   - Can't use constructor
   - Risk of uninitialized state

3. **Upgrade Authorization**
   - Who can upgrade? Garden owner only?
   - Need timelock for security
   - Risk of malicious upgrade

---

## Cost Comparison: 10 Gardens with Tokens

### Modular Approach:
- 10 gardens: 10 × $430 = $4,300
- 10 token contracts: 10 × $100 = $1,000
- **Total: $5,300**

### Upgradeable Gardens:
- 10 gardens with proxies: 10 × $510 = $5,100
- Ongoing gas overhead: ~30% increase
- **Total: $5,100 + 30% ongoing**

### Upgradeable Factory + New Template:
- Factory upgrade: $200
- New template deployer: $300
- 10 new gardens: 10 × $500 = $5,000
- Old gardens can't use tokens
- **Total: $5,500 (old gardens excluded)**

**Winner: Modular Approach** (lowest cost + works with old gardens)

---

## Recommendations by Use Case

### If you want to add tokens to EXISTING gardens:
→ **Use Modular Token System (Option 3)**
- Works today, no redeployment
- Low risk, low cost
- Composable and flexible

### If you want ALL NEW gardens to have tokens:
→ **Deploy GardenFactoryV3 (Option 4)**
- Clean design from scratch
- Both versions coexist
- Can optimize for token use cases

### If you need OLD gardens to upgrade in-place:
→ **Make Gardens Upgradeable (Option 1)**
- Only if absolutely necessary
- High risk, high complexity
- Requires professional audit
- Consider insurance/bug bounty

### If you want flexibility for factory itself:
→ **Make Factory Upgradeable (Option 2)**
- Allows deploying new garden types
- Keep garden immutability
- Factory owner must be multi-sig

---

## Final Recommendation

**Start with Modular Token System (Option 3)**

**Reasons:**
1. ✅ Can implement in 1 week
2. ✅ Works with all existing gardens
3. ✅ Low security risk
4. ✅ Preserves garden immutability
5. ✅ Composable and extensible
6. ✅ Low cost ($100 per garden)
7. ✅ No factory changes needed
8. ✅ Can iterate quickly

**Migration Path:**
1. **Now:** Keep gardens immutable (as deployed)
2. **Phase 1:** Build token contracts implementing Sculpture
3. **Phase 2:** Garden owners add tokens via setSculptures()
4. **Phase 3:** Observe usage and iterate
5. **Phase 4:** If needed, deploy V3 factory with integrated tokens
6. **Long-term:** Both systems coexist

**This preserves the "gardens are immutable art" ethos while allowing future flexibility.**

---

## Code Example: Adding Tokens Today

Your Sepolia garden (`0x442ee2757cb616d391280e0c89b6d7f277e85870`) can add tokens RIGHT NOW:

```solidity
// 1. Deploy token contract
GardenToken token = new GardenToken(0x442ee2757cb616d391280e0c89b6d7f277e85870);

// 2. Add to garden (as gardener)
garden.setSculptures([address(token)]);

// 3. Token now appears in garden's sculpture list
// 4. Token can mint NFTs, garden owner controls
```

No factory upgrade needed. No garden upgrade needed. Works today.

---

**Summary: Keep gardens immutable, add tokens as composable modules.**
