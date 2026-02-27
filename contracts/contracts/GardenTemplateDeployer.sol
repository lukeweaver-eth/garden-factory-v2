// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "solady/src/utils/SSTORE2.sol";
import "./GardenConfigurable.sol";
import "./ModConfigurable.sol";
import "./Essay.sol";
import "./Web.sol";

/// @title GardenTemplateDeployer
/// @notice Deploys complete Garden instances from stored bytecode templates.
///
/// Instead of embedding child contract bytecodes via `new` (which makes the
/// deployer inherit their sizes), this contract stores each child's creation
/// bytecode in SSTORE2 and deploys them via assembly CREATE at runtime.
///
/// Benefits:
/// - Deployer size is ~4KB regardless of child contract sizes
/// - No EIP-170 size pressure from child contracts
/// - Child contracts can grow freely without affecting deployability
/// - Single deployer replaces the split DeployerA/DeployerB architecture
///
/// The 5 template bytecodes are stored once (in the constructor) and reused
/// for every createGarden call. Each garden gets its own fresh contract
/// instances — these are NOT proxies, they are full independent deployments.
///
/// @dev Template bytecodes must be the full creation bytecode (init code)
/// WITHOUT constructor arguments. Arguments are ABI-encoded and appended
/// at deploy time. Library linking (for GardenRendererConfigurable) must
/// be done BEFORE passing the bytecode to the constructor.
contract GardenTemplateDeployer {

    // SSTORE2 pointers to creation bytecodes
    address public immutable modTemplate;
    address public immutable essayTemplate;
    address public immutable gardenTemplate;
    address public immutable rendererTemplate;
    address public immutable webTemplate;

    struct DeployedGarden {
        address garden;
        address mod;
        address essay;
        address renderer;
        address web;
    }

    /// @param _modCode Creation bytecode for ModConfigurable
    /// @param _essayCode Creation bytecode for Essay
    /// @param _gardenCode Creation bytecode for GardenConfigurable
    /// @param _rendererCode Creation bytecode for GardenRendererConfigurable (libraries must be pre-linked)
    /// @param _webCode Creation bytecode for Web
    constructor(
        bytes memory _modCode,
        bytes memory _essayCode,
        bytes memory _gardenCode,
        bytes memory _rendererCode,
        bytes memory _webCode
    ) {
        modTemplate = SSTORE2.write(_modCode);
        essayTemplate = SSTORE2.write(_essayCode);
        gardenTemplate = SSTORE2.write(_gardenCode);
        rendererTemplate = SSTORE2.write(_rendererCode);
        webTemplate = SSTORE2.write(_webCode);
    }

    /// @notice Deploy a complete garden (5 contracts), link them, and transfer
    ///         ownership directly to the specified creator address.
    /// @param creator Address that will own all deployed contracts
    /// @param gardenTitle Title of the garden
    /// @param curatorName Curator's display name
    /// @param curatorUrl Curator's URL
    /// @param thankYouNames People to acknowledge
    /// @param thankYouUrls Their URLs
    /// @param unicodeSymbol Garden's unicode symbol (default: ⚘)
    /// @param exhibitionText Introduction text
    /// @param gardenUrls URLs where garden is accessible
    /// @param collectionTerm Terminology (anthology, show, collection)
    /// @param backgroundColor Hex color code for background
    /// @param textColor Hex color code for text
    /// @return deployed Struct containing all 5 deployed contract addresses
    function deployAll(
        address creator,
        string memory gardenTitle,
        string memory curatorName,
        string memory curatorUrl,
        string[] memory thankYouNames,
        string[] memory thankYouUrls,
        string memory unicodeSymbol,
        string memory exhibitionText,
        string[] memory gardenUrls,
        string memory collectionTerm,
        string memory backgroundColor,
        string memory textColor
    ) external returns (DeployedGarden memory deployed) {

        // 1. Deploy ModConfigurable
        deployed.mod = _deployWithArgs(modTemplate, abi.encode(
            gardenTitle, curatorName, curatorUrl,
            thankYouNames, thankYouUrls,
            unicodeSymbol, collectionTerm,
            backgroundColor, textColor
        ));

        // Set exhibition text (SSTORE2) and URLs — requires ownership
        if (bytes(exhibitionText).length > 0) {
            ModConfigurable(deployed.mod).setText(exhibitionText);
        }
        if (gardenUrls.length > 0) {
            ModConfigurable(deployed.mod).setExhibitionUrls(gardenUrls);
        }

        // 2. Deploy Essay (no constructor args)
        deployed.essay = _deploy(essayTemplate);

        // 3. Deploy GardenConfigurable
        deployed.garden = _deployWithArgs(gardenTemplate, abi.encode(
            new address[](0),   // no sculptures yet
            address(0),         // render — set below
            deployed.mod        // data pointer
        ));

        // 4. Deploy GardenRendererConfigurable
        deployed.renderer = _deployWithArgs(rendererTemplate, abi.encode(
            deployed.garden,
            deployed.essay,
            deployed.mod
        ));

        // 5. Deploy Web (no constructor args)
        deployed.web = _deploy(webTemplate);

        // 6. Link: Web → Renderer, Garden → Web
        Web(deployed.web).setRenderer(deployed.renderer);
        GardenConfigurable(payable(deployed.garden)).setRender(deployed.web);

        // 7. Transfer ownership to creator
        //    (Renderer is not Ownable — no transfer needed)
        ModConfigurable(deployed.mod).transferOwnership(creator);
        Essay(deployed.essay).transferOwnership(creator);
        GardenConfigurable(payable(deployed.garden)).transferOwnership(creator);
        Web(deployed.web).transferOwnership(creator);

        return deployed;
    }

    /// @notice Deploy a standalone Essay contract and transfer ownership to creator.
    ///         No garden required — essays can be published independently and
    ///         later added as sculptures to any garden.
    /// @param creator Address that will own the essay contract
    /// @return essay Address of the deployed Essay contract
    function deployEssay(address creator) external returns (address essay) {
        essay = _deploy(essayTemplate);
        Essay(essay).transferOwnership(creator);
    }

    /// @dev Deploy a contract from stored template (no constructor args)
    function _deploy(address template) internal returns (address deployed) {
        bytes memory code = SSTORE2.read(template);
        assembly {
            deployed := create(0, add(code, 0x20), mload(code))
        }
        require(deployed != address(0), "Deploy failed");
    }

    /// @dev Deploy a contract from stored template with ABI-encoded constructor args
    function _deployWithArgs(address template, bytes memory args) internal returns (address deployed) {
        bytes memory code = abi.encodePacked(SSTORE2.read(template), args);
        assembly {
            deployed := create(0, add(code, 0x20), mload(code))
        }
        require(deployed != address(0), "Deploy failed");
    }
}
