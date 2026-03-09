// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "solady/src/utils/LibString.sol";
import "./GardenTemplateDeployer.sol";
import "./Sculpture.sol";
import "./IWeb.sol";

/// @title GardenFactory
/// @notice A garden of gardens. Each garden planted here costs 0.01 ETH —
///         the payment is the gesture, the garden is the mark.
///
///         Implements Sculpture so the factory itself is a sculpture whose
///         "sculptures" are the gardens deployed through it. The garden
///         registry IS the guestbook: each entry records who planted what,
///         when, and with which symbol.
///
///         Individual gardens still have their own FlowerGuestbook for visitors.
///         This contract does not inherit FlowerGuestbook — the act of
///         deploying a garden IS planting a flower here.
contract GardenFactory is Sculpture, Ownable, IWeb {

    uint256 public constant PLANTING_FEE = 0.01 ether;

    GardenTemplateDeployer public immutable deployer;

    /// @notice Each garden planted in the factory
    struct GardenEntry {
        address garden;
        address gardener;       // who planted it
        string curatorName;
        string unicodeSymbol;
        uint256 timestamp;
    }

    GardenEntry[] private _gardens;

    // Gardener tracking
    uint256 public totalGardeners;
    mapping(address => uint256) public gardensPlantedBy;

    event GardenPlanted(
        address indexed garden,
        address indexed gardener,
        string curatorName,
        string unicodeSymbol,
        address mod,
        address essay,
        address renderer,
        address web
    );

    /// @notice Emitted with full constructor args for Etherscan verification
    event GardenConstructorArgs(
        address indexed garden,
        string gardenTitle,
        string curatorName,
        string curatorUrl,
        string[] thankYouNames,
        string[] thankYouUrls,
        string unicodeSymbol,
        string exhibitionText,
        string[] gardenUrls,
        string collectionTerm,
        string backgroundColor,
        string textColor
    );

    event EssayDeployed(
        address indexed essay,
        address indexed author
    );

    constructor(address _deployer) Ownable(msg.sender) {
        deployer = GardenTemplateDeployer(_deployer);
    }

    /// @notice Plant a new garden. Costs 0.01 ETH.
    ///         All 5 contracts are deployed, linked, and ownership
    ///         is transferred to msg.sender.
    function createGarden(
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
    ) external payable returns (address garden) {
        require(msg.value >= PLANTING_FEE, "Send 0.01 ETH to plant a garden");

        GardenTemplateDeployer.DeployedGarden memory d = deployer.deployAll(
            msg.sender,
            gardenTitle,
            curatorName,
            curatorUrl,
            thankYouNames,
            thankYouUrls,
            unicodeSymbol,
            exhibitionText,
            gardenUrls,
            collectionTerm,
            backgroundColor,
            textColor
        );

        // Resolve symbol default
        string memory sym = bytes(unicodeSymbol).length > 0
            ? unicodeSymbol
            : unicode"⚘";

        // Track unique gardeners
        if (gardensPlantedBy[msg.sender] == 0) {
            totalGardeners++;
        }
        gardensPlantedBy[msg.sender]++;

        // Refund excess ETH
        if (msg.value > PLANTING_FEE) {
            (bool ok, ) = msg.sender.call{value: msg.value - PLANTING_FEE}("");
            require(ok, "Refund failed");
        }

        // Add to registry via internal helper
        _addGardenEntry(d.garden, msg.sender, curatorName, sym);

        emit GardenPlanted(
            d.garden,
            msg.sender,
            curatorName,
            sym,
            d.mod,
            d.essay,
            d.renderer,
            d.web
        );

        // Emit constructor args for verification
        emit GardenConstructorArgs(
            d.garden,
            gardenTitle,
            curatorName,
            curatorUrl,
            thankYouNames,
            thankYouUrls,
            unicodeSymbol,
            exhibitionText,
            gardenUrls,
            collectionTerm,
            backgroundColor,
            textColor
        );

        return d.garden;
    }

    /// @notice Manually add an existing garden to the factory registry.
    ///         Reads metadata from the garden's Sculpture interface.
    ///         Useful for including external gardens like World Computer Sculpture Garden.
    function addGarden(address garden) external onlyOwner {
        require(garden != address(0), "Invalid garden address");

        // Try to read curator name from Sculpture interface
        // Convention: last author = curator (follows WCSG pattern)
        string memory curatorName = "Unknown";
        try Sculpture(garden).authors() returns (string[] memory authors) {
            if (authors.length > 0 && bytes(authors[authors.length - 1]).length > 0) {
                curatorName = authors[authors.length - 1];
            }
        } catch {}

        // Add to registry with default symbol
        _addGardenEntry(garden, address(0), curatorName, unicode"⚘");
    }

    /// @notice Remove a garden from the registry by index.
    ///         Useful for removing malicious or unwanted gardens.
    ///         Uses swap-and-pop for gas efficiency (changes order).
    function removeGarden(uint256 index) external onlyOwner {
        require(index < _gardens.length, "Index out of bounds");

        // Swap with last element and pop
        _gardens[index] = _gardens[_gardens.length - 1];
        _gardens.pop();
    }

    /// @notice Manually set the entire gardens array.
    ///         Nuclear option for reordering or batch operations.
    ///         Reads metadata from each garden's Sculpture interface.
    function setGardens(address[] memory gardens) external onlyOwner {
        // Clear existing
        delete _gardens;

        // Add each garden
        for (uint256 i = 0; i < gardens.length; i++) {
            require(gardens[i] != address(0), "Invalid garden address");

            // Try to read curator name from Sculpture interface
            // Convention: last author = curator (follows WCSG pattern)
            string memory curatorName = "Unknown";
            try Sculpture(gardens[i]).authors() returns (string[] memory authors) {
                if (authors.length > 0 && bytes(authors[authors.length - 1]).length > 0) {
                    curatorName = authors[authors.length - 1];
                }
            } catch {}

            _gardens.push(GardenEntry({
                garden: gardens[i],
                gardener: address(0),
                curatorName: curatorName,
                unicodeSymbol: unicode"⚘",
                timestamp: block.timestamp
            }));
        }
    }

    /// @notice Internal helper to add a garden entry
    function _addGardenEntry(
        address garden,
        address gardener,
        string memory curatorName,
        string memory unicodeSymbol
    ) private {
        _gardens.push(GardenEntry({
            garden: garden,
            gardener: gardener,
            curatorName: curatorName,
            unicodeSymbol: unicodeSymbol,
            timestamp: block.timestamp
        }));
    }

    /// @notice Deploy a standalone Essay contract. Free — no fee required.
    ///         Ownership is transferred to msg.sender immediately.
    ///         The essay can be written to independently and optionally added
    ///         as a sculpture to any garden.
    function deployEssay() external returns (address essay) {
        essay = deployer.deployEssay(msg.sender);
        emit EssayDeployed(essay, msg.sender);
    }

    ///////////////////////////////////////////////////////////////////////////
    // Garden Registry (the guestbook)
    ///////////////////////////////////////////////////////////////////////////

    /// @notice Total gardens planted
    function gardenCount() external view returns (uint256) {
        return _gardens.length;
    }

    /// @notice Get a garden entry by index
    function garden(uint256 index) external view returns (
        address gardenAddr,
        address gardener,
        string memory curatorName,
        string memory unicodeSymbol,
        uint256 timestamp
    ) {
        require(index < _gardens.length, "Index out of bounds");
        GardenEntry storage g = _gardens[index];
        return (g.garden, g.gardener, g.curatorName, g.unicodeSymbol, g.timestamp);
    }

    /// @notice Get all garden addresses
    function getGardens() external view returns (address[] memory) {
        address[] memory addrs = new address[](_gardens.length);
        for (uint256 i = 0; i < _gardens.length; i++) {
            addrs[i] = _gardens[i].garden;
        }
        return addrs;
    }

    /// @notice Get all garden entries
    function getGardenEntries() external view returns (GardenEntry[] memory) {
        return _gardens;
    }

    ///////////////////////////////////////////////////////////////////////////
    // Sculpture Interface — the factory is a sculpture
    ///////////////////////////////////////////////////////////////////////////

    /// @notice The factory's title
    function title() external pure returns (string memory) {
        return "Garden Factory";
    }

    /// @notice All gardeners (curator names of each planted garden) + Luke Weaver as curator
    ///         Last author = curator (follows WCSG convention)
    function authors() external view returns (string[] memory) {
        string[] memory names = new string[](_gardens.length + 1);
        for (uint256 i = 0; i < _gardens.length; i++) {
            names[i] = _gardens[i].curatorName;
        }
        // Curator as last author (WCSG convention)
        names[_gardens.length] = "Luke Weaver";
        return names;
    }

    /// @notice All contract addresses: factory + all gardens
    function addresses() external view returns (address[] memory) {
        address[] memory addrs = new address[](_gardens.length + 1);
        addrs[0] = address(this);
        for (uint256 i = 0; i < _gardens.length; i++) {
            addrs[i + 1] = _gardens[i].garden;
        }
        return addrs;
    }

    /// @notice Factory description (HTML formatted to match WCSG convention)
    function text() external pure returns (string memory) {
        return string.concat(
            "<p>I invite you into the garden of many gardens \u2013 an open ground for all to plant.</p>\n<br>\n",
            "<p>The World Computer Sculpture Garden (2024) established a pattern that opened the infinite garden of Ethereum up to everyone.</p>\n<br>\n",
            "<p>This pattern inspired the contract show Intimate Systems in 2026, for which I wrote the introductory essay, 'The Garden', that planted the seed of the idea for the Garden Factory.</p>\n<br>\n",
            "<p>This garden of gardens is an attempt to expand the invitation offered by fff and the artists of the World Computer Sculpture Garden to anyone willing to plant a garden and place a sculpture.</p>\n<br>\n",
            "<p>The proliferation of large language models has eliminated the moat to the garden. All that is required to plant a sculpture is to ask for and deploy a contract that fits the sculpture interface.</p>\n<br>\n",
            "<p>This Garden Factory is an encouragement to become a gardener.</p>\n<br>\n",
            "<p>Exhibit your collections. Own your own anthology. Create a public program sketchbook.</p>\n<br>\n",
            "<p>Get your hands dirty. Dig into the medium. Plant a garden, then fill that garden with durable living sculptures \u2013 long-running programs on the world computer.</p>\n<br>\n",
            "<p>Over time, as people use the Garden Factory to plant their gardens, the information rendered here will change, block by block, year by year.</p>"
        );
    }

    /// @notice Factory URLs
    function urls() external pure returns (string[] memory) {
        string[] memory urls_ = new string[](1);
        urls_[0] = "https://factory.garden";
        return urls_;
    }

    /// @notice The sculptures in this garden are the gardens themselves
    function getSculptures() external view returns (address[] memory) {
        address[] memory addrs = new address[](_gardens.length);
        for (uint256 i = 0; i < _gardens.length; i++) {
            addrs[i] = _gardens[i].garden;
        }
        return addrs;
    }

    ///////////////////////////////////////////////////////////////////////////
    // ETH Management
    ///////////////////////////////////////////////////////////////////////////

    /// @notice Withdraw collected planting fees
    function withdraw(address _to) external onlyOwner {
        (bool ok, ) = _to.call{value: address(this).balance}("");
        require(ok, "Withdraw failed");
    }

    /// @notice No anonymous ETH — must call createGarden
    receive() external payable {
        revert("Call createGarden() to plant a garden");
    }

    ///////////////////////////////////////////////////////////////////////////
    // ERC-5219 Web Interface
    ///////////////////////////////////////////////////////////////////////////

    function html() external view returns (string memory) {
        string memory gardenList;

        for (uint256 i = 0; i < _gardens.length; i++) {
            gardenList = string.concat(
                gardenList,
                '<li>',
                _gardens[i].unicodeSymbol,
                ' <a href="web3://',
                LibString.toHexStringChecksummed(_gardens[i].garden),
                '" target="_blank">',
                _gardens[i].curatorName,
                '</a></li>'
            );
        }

        return string.concat(
            '<!DOCTYPE html><html><head><meta charset="UTF-8">',
            '<title>Garden Factory</title>',
            '<style>body{font-family:monospace;max-width:620px;margin:2em auto;padding:0 1em;line-height:1.6}h1{font-size:1.5em;margin-bottom:1em}p{margin:1em 0}a{color:inherit}ul{margin:2em 0}</style>',
            '</head><body>',
            unicode'<h1>⚘ Garden Factory</h1>',
            '<p>I invite you into the garden of many gardens \u2013 an open ground for all to plant.</p>',
            '<p>The World Computer Sculpture Garden (2024) established a pattern that opened the infinite garden of Ethereum up to everyone.</p>',
            '<p>This pattern inspired the contract show Intimate Systems in 2026, for which I wrote the introductory essay, \'The Garden\', that planted the seed of the idea for the Garden Factory.</p>',
            '<p>This garden of gardens is an attempt to expand the invitation offered by fff and the artists of the World Computer Sculpture Garden to anyone willing to plant a garden and place a sculpture.</p>',
            '<p>The proliferation of large language models has eliminated the moat to the garden. All that is required to plant a sculpture is to ask for and deploy a contract that fits the sculpture interface.</p>',
            '<p>This Garden Factory is an encouragement to become a gardener.</p>',
            '<p>Exhibit your collections. Own your own anthology. Create a public program sketchbook.</p>',
            '<p>Get your hands dirty. Dig into the medium. Plant a garden, then fill that garden with durable living sculptures \u2013 long-running programs on the world computer.</p>',
            '<p>Over time, as people use the Garden Factory to plant their gardens, the information rendered here will change, block by block, year by year.</p>',
            '<hr style="margin:2em 0">',
            '<p>', LibString.toString(_gardens.length), ' gardens planted by ',
            LibString.toString(totalGardeners), ' gardeners.</p>',
            '<ul>', gardenList, '</ul>',
            '<hr style="margin:2em 0">',
            '<p><small>Factory: ', LibString.toHexStringChecksummed(address(this)), '</small></p>',
            '</body></html>'
        );
    }

    function resolveMode() external pure returns (bytes32) {
        return "5219";
    }

    function request(
        string[] memory resource,
        KeyValue[] memory params
    ) external view returns (uint statusCode, string memory body, KeyValue[] memory headers) {
        if (resource.length == 0) {
            body = this.html();
            statusCode = 200;
            headers = new KeyValue[](1);
            headers[0].key = "Content-Type";
            headers[0].value = "text/html; charset=utf-8";
        } else {
            statusCode = 404;
        }
        return (statusCode, body, headers);
    }

    fallback() external {
        revert(LibString.toHexString(abi.encodeWithSignature("html()")));
    }
}
