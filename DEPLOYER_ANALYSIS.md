# Garden Factory: Deployer Architecture Analysis

## The Problem

Ethereum's EIP-170 limits deployed contract bytecode to 24,576 bytes.
A garden requires 5 contracts. A deployer that uses Solidity's `new`
keyword embeds the full creation bytecode of every child contract
it deploys. The original monolithic GardenDeployer was 28KB — over
the limit.

## Method A: Split Deployer (Current)

Split the `new` calls across two contracts, each under 24KB.

```
GardenFactory (2.5 KB)
  → GardenDeployerA (21 KB) — deploys Mod, Essay, Garden via `new`
  → GardenDeployerB (7 KB)  — deploys Renderer, Web via `new`
```

### How it works

DeployerA contains the creation bytecode of ModConfigurable + Essay +
GardenConfigurable (embedded by the compiler because of `new`).
DeployerB contains the creation bytecode of GardenRendererConfigurable +
Web. The factory calls A, then B, then links and transfers ownership.

### Pros

- **Simple Solidity.** The deployers are plain Solidity — `new` keyword,
  no assembly, no manual bytecode handling. Easy to read and audit.
- **Simple deploy scripts.** hardhat-deploy handles library linking
  for DeployerB automatically via the `libraries` option.
- **Standard verification.** Etherscan verifies both deployers normally
  since they're standard Solidity contracts.
- **Compiler catches errors.** Constructor arg types are checked at
  compile time. If ModConfigurable's constructor changes, DeployerA
  fails to compile until you update the `new` call.

### Cons

- **Fragile size budget.** DeployerA is 21KB out of 24KB. That's 3KB
  of headroom. Adding a string field to GardenConfigurable, an NFT
  minting function, or any moderate feature risks pushing it over.
  You're perpetually one feature away from a breaking refactor.

- **Lopsided split.** A holds 3 contracts (21KB), B holds 2 (7KB).
  There's no way to rebalance — a contract can't be split between
  deployers (it must be `new`'d in one place). If A overflows, you'd
  need a C.

- **Child changes require redeployment of deployers AND factory.**
  Any change to Mod, Essay, or Garden means recompiling and redeploying
  DeployerA. Any change to Renderer or Web means redeploying DeployerB.
  Either change means redeploying the Factory (since it stores deployer
  addresses as immutables). All gardens created before the change remain
  on the old bytecode (this is actually desirable for immutability, but
  it means the old deployers/factory become dead weight on-chain).

- **Ownership dance.** DeployerA transfers ownership to Factory.
  Factory then transfers to the user. Web ownership goes:
  DeployerB → Factory → user. Three hops for some contracts.

- **Two deploy transactions for deployers.** Two contracts to deploy,
  verify, and manage instead of one.

---

## Method B: SSTORE2 Template Deployer (Proposed)

Store each child contract's creation bytecode in SSTORE2. Deploy a
single small deployer that reads the bytecodes and deploys via
assembly `CREATE` at runtime.

```
GardenFactory (2.5 KB)
  → GardenTemplateDeployer (~4 KB code + bytecodes in SSTORE2)
        reads: SSTORE2[ModConfigurable creation bytecode]
        reads: SSTORE2[Essay creation bytecode]
        reads: SSTORE2[GardenConfigurable creation bytecode]
        reads: SSTORE2[GardenRendererConfigurable creation bytecode]
        reads: SSTORE2[Web creation bytecode]
```

### How it works

At deployment, the template deployer's constructor receives the raw
creation bytecodes of all 5 child contracts and stores each via
SSTORE2.write(). At runtime, deployAll() reads each bytecode with
SSTORE2.read(), appends ABI-encoded constructor args via
abi.encodePacked(), and deploys via assembly CREATE.

The deployed children are full independent contracts with their own
storage — NOT proxies. They're bytecode-identical to what `new` would
produce.

### Pros

- **Size-immune.** The deployer's own bytecode is ~4KB. Child contracts
  can be any size (up to 24KB each, the EIP-170 limit for them, which
  they're well under). Adding features to any child contract has zero
  effect on the deployer's size.

- **Single deployer.** One contract replaces DeployerA + DeployerB.
  One address to track, one deployment to manage.

- **Child contracts can evolve independently.** Want to add an NFT
  minting function to GardenConfigurable? Just recompile, store the
  new bytecode in a new template deployer, and deploy a new factory
  pointing to it. The deployer contract's code doesn't change at all.

- **Clean ownership.** Template deployer is transient owner → transfers
  directly to user. No intermediate factory ownership hop.

- **Template reusability.** The 5 bytecodes are stored once on-chain
  (in SSTORE2 data contracts) and reused for every garden creation.
  This is exactly the same reuse pattern as `new` — but the storage
  is external to the deployer.

### Cons

- **Assembly required.** The `_deploy` and `_deployWithArgs` functions
  use assembly CREATE. This is a well-known 4-line pattern, but it's
  still assembly. Auditors need to verify that constructor args are
  correctly appended.

  ```solidity
  bytes memory code = abi.encodePacked(SSTORE2.read(template), args);
  assembly { deployed := create(0, add(code, 0x20), mload(code)) }
  ```

- **Constructor arg encoding is manual.** With `new`, the compiler
  type-checks constructor args. With template deployment, you pass
  `abi.encode(arg1, arg2, ...)` and the compiler can't verify these
  match the child contract's constructor signature. A mismatch would
  cause CREATE to revert at runtime with no helpful error message.
  This is the primary correctness risk.

- **Deploy script is more complex.** The script must:
  1. Read creation bytecode from compiled artifacts
  2. Link library placeholders in the renderer bytecode using the
     artifact's linkReferences metadata
  3. Pass all 5 bytecodes as constructor args
  This is ~50 lines more than the split deployer scripts and requires
  understanding Solidity's compilation artifacts format.

- **Large constructor calldata.** Deploying the template deployer
  sends all 5 creation bytecodes as calldata (potentially 50-80KB).
  This is a one-time cost and cheaper than deploying two separate
  deployer contracts, but it's a large transaction. On L1 at high
  gas prices, this calldata cost matters (though it's paid once and
  saves gas on every subsequent garden creation by avoiding the
  DeployerA → Factory → DeployerB call chain overhead).

- **Etherscan verification is harder.** The template deployer's
  constructor args are raw bytecode blobs. Automated verification
  tools may struggle with this. You might need to manually submit
  the ABI-encoded constructor args to Etherscan. (The child contracts
  deployed by the factory verify normally.)

- **No compile-time checking of child contracts.** If you change
  ModConfigurable's constructor signature, the template deployer
  still compiles. The error only surfaces at runtime when CREATE
  reverts. This can be mitigated with integration tests.

---

## Gas Comparison

### One-time deployment cost

| Component              | Split Deployers | Template Deployer |
|------------------------|-----------------|-------------------|
| Libraries (4)          | Same            | Same              |
| Deployer(s)            | 2 contracts     | 1 contract        |
| Deployer bytecode cost | ~28KB deployed  | ~4KB deployed     |
| Template storage       | N/A             | ~50-80KB calldata |
| Factory                | Same            | Same              |
| **Total contracts**    | **8**           | **7**             |

The template approach deploys one fewer contract but has higher
calldata in the template deployer's constructor. Net deployment
cost is roughly similar.

### Per-garden creation cost

| Operation                 | Split Deployers       | Template Deployer     |
|---------------------------|-----------------------|-----------------------|
| Cross-contract calls      | Factory→A, Factory→B  | Factory→Template      |
| SSTORE2 reads             | 0                     | 5                     |
| Memory allocation         | Compiler-managed      | 5 bytecode loads      |
| CREATE operations         | 5 (via `new`)         | 5 (via assembly)      |
| Ownership transfers       | 4 + re-transfers      | 4 direct              |

The template approach has 5 SSTORE2 reads (cold storage reads) but
saves one cross-contract CALL (no DeployerA → Factory → DeployerB
round-trip). Net gas per garden creation is roughly similar, within
10-15%.

---

## Correctness Risk Matrix

| Risk                        | Split    | Template | Mitigation                        |
|-----------------------------|----------|----------|-----------------------------------|
| Constructor arg mismatch    | None     | Medium   | Integration tests                 |
| Library linking error       | Low      | Low      | linkReferences from artifact      |
| Size limit exceeded         | **High** | None     | —                                 |
| Assembly bug                | None     | Low      | Standard CREATE pattern           |
| Ownership transfer failure  | Low      | Low      | Same pattern in both              |
| Bytecode storage corruption | None     | Very Low | SSTORE2 is battle-tested          |

---

## Recommendation

The template approach is better for this project because:

1. **The size constraint is real and active.** DeployerA is already at
   87% capacity. The gardenTitle change alone required careful analysis.
   Future features (NFT minting, WebRenderer integration, MediaFiles)
   will make the split approach unworkable.

2. **The assembly is minimal and standard.** The CREATE pattern is 4
   lines, widely used in factory contracts across the ecosystem (Uniswap,
   Aave, etc.). It's not novel or risky.

3. **The main risk (constructor arg mismatch) is fully testable.** A
   single integration test that calls createGarden and verifies all 5
   contracts respond correctly catches 100% of encoding errors.

4. **The deploy script complexity is one-time.** You write it once, and
   it works for every deployment. The split approach's "simplicity" is
   undermined by the ongoing anxiety of size management.

The split approach is fine for a frozen codebase that will never change.
The template approach is better for a living protocol.
