// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "solady/src/utils/SSTORE2.sol";

/// @title ModConfigurable - Configurable metadata for a Garden
/// @notice Stores curator info, thank-yous, exhibition text, colors, and garden title
contract ModConfigurable is Ownable {

    // Exhibition text (stored via SSTORE2 for gas efficiency)
    address private exhibitionText;

    // Exhibition URLs
    string[] private exhibitionUrls;

    // Garden title
    string public gardenTitle;

    // Curator
    string public curatorName;
    string public curatorUrl;

    // Thank you list
    string[] public thankYouNames;
    string[] public thankYouUrls;

    // Unicode symbol (default: ⚘)
    string public unicodeSymbol;

    // Collection term (anthology, show, collection, etc.)
    string public collectionTerm;

    // Color scheme
    string public backgroundColor;
    string public textColor;

    constructor(
        string memory _gardenTitle,
        string memory _curatorName,
        string memory _curatorUrl,
        string[] memory _thankYouNames,
        string[] memory _thankYouUrls,
        string memory _unicodeSymbol,
        string memory _collectionTerm,
        string memory _backgroundColor,
        string memory _textColor
    ) Ownable(msg.sender) {
        gardenTitle = bytes(_gardenTitle).length > 0 ? _gardenTitle : "Essay Garden";
        curatorName = _curatorName;
        curatorUrl = _curatorUrl;
        thankYouNames = _thankYouNames;
        thankYouUrls = _thankYouUrls;
        unicodeSymbol = bytes(_unicodeSymbol).length > 0 ? _unicodeSymbol : unicode"⚘";
        collectionTerm = bytes(_collectionTerm).length > 0 ? _collectionTerm : "collection";
        backgroundColor = bytes(_backgroundColor).length > 0 ? _backgroundColor : "#ffffff";
        textColor = bytes(_textColor).length > 0 ? _textColor : "#000000";
    }

    // Garden title
    function setGardenTitle(string memory _title) public onlyOwner {
        gardenTitle = _title;
    }

    // Exhibition text (SSTORE2)
    function setText(string memory _text) public onlyOwner {
        exhibitionText = SSTORE2.write(bytes(_text));
    }

    function text() public view returns (string memory) {
        if (exhibitionText == address(0)) {
            return "";
        }
        return string(SSTORE2.read(exhibitionText));
    }

    // Exhibition URLs
    function setExhibitionUrls(string[] memory _urls) public onlyOwner {
        exhibitionUrls = _urls;
    }

    function urls() public view returns (string[] memory) {
        return exhibitionUrls;
    }

    // Curator
    function setCurator(string memory _name, string memory _url) public onlyOwner {
        curatorName = _name;
        curatorUrl = _url;
    }

    // Thank you list
    function setThankYous(string[] memory _names, string[] memory _urls) public onlyOwner {
        require(_names.length == _urls.length, "Names and URLs length mismatch");
        thankYouNames = _names;
        thankYouUrls = _urls;
    }

    function getThankYouCount() public view returns (uint256) {
        return thankYouNames.length;
    }

    function getThankYou(uint256 index) public view returns (string memory name, string memory url) {
        require(index < thankYouNames.length, "Index out of bounds");
        require(index < thankYouUrls.length, "URL index out of bounds");
        return (thankYouNames[index], thankYouUrls[index]);
    }

    // Unicode symbol
    function setUnicodeSymbol(string memory _symbol) public onlyOwner {
        unicodeSymbol = _symbol;
    }

    // Collection term
    function setCollectionTerm(string memory _term) public onlyOwner {
        collectionTerm = _term;
    }

    // Color scheme
    function setColors(string memory _backgroundColor, string memory _textColor) public onlyOwner {
        backgroundColor = _backgroundColor;
        textColor = _textColor;
    }
}
