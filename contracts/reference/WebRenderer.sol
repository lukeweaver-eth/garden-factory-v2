// SPDX-License-Identifier: MIT
pragma solidity >=0.8.30;

import { IWeb, KeyValue } from "./IWeb.sol";
import { IndexPage } from "./pages/IndexPage.sol";
import { MediaPage } from "./pages/MediaPage.sol";
import { EssayPage } from "./pages/EssayPage.sol";
import { Sculpture } from "../Sculpture.sol";
import { ContractShow } from "../ContractShow.sol";
import { JSONParserLib } from "solady/utils/JSONParserLib.sol";

contract WebRenderer is IWeb {
    address public immutable show;
    address public immutable essayContract;
    address public immutable data;

    constructor(address _show, address _essayContract, address _data) {
        show = _show;
        essayContract = _essayContract;
        data = _data;
    }

    function html() public view returns (string memory) {
        return index();
    }

    function index() public view returns (string memory) {
        return IndexPage.html(show, data);
    }

    function essay() public view returns (string memory) {
        return EssayPage.html(show, essayContract, data);
    }

    function sculptureMedia(uint256 i) public view returns (string memory) {
        return MediaPage.html(show, i);
    }

    function tokenUri(uint256 i) public view returns (string memory) {
        return MediaPage.tokenUri(show, i);
    }

    function resolveMode() external pure returns (bytes32) {
        return "5219";
    }

    function request(
        string[] memory resource,
        KeyValue[] memory params
    ) external view returns (uint statusCode, string memory body, KeyValue[] memory headers) {
        params;
        if (resource.length == 0) {
            body = index();
            statusCode = 200;
            headers = new KeyValue[](1);
            headers[0].key = "Content-Type";
            headers[0].value = "text/html; charset=utf-8";
            return (statusCode, body, headers);
        } else if (
            resource.length == 1 && keccak256(abi.encodePacked(resource[0])) == keccak256(abi.encodePacked("essay"))
        ) {
            body = essay();
            statusCode = 200;
            headers = new KeyValue[](1);
            headers[0].key = "Content-Type";
            headers[0].value = "text/html; charset=utf-8";
            return (statusCode, body, headers);
        } else if (
            resource.length == 2 &&
            keccak256(abi.encodePacked(resource[0])) == keccak256(abi.encodePacked("sculpture-media"))
        ) {
            uint256 i = JSONParserLib.parseUint(resource[1]);
            Sculpture[] memory sculptures = ContractShow(show).getSculptures();
            if (i >= sculptures.length) {
                statusCode = 404;
                return (statusCode, body, headers);
            }
            body = sculptureMedia(i);
            statusCode = 200;
            headers = new KeyValue[](1);
            headers[0].key = "Content-Type";
            headers[0].value = "text/html; charset=utf-8";
            return (statusCode, body, headers);
        } else if (
            resource.length == 2 && keccak256(abi.encodePacked(resource[0])) == keccak256(abi.encodePacked("token-uri"))
        ) {
            uint256 i = JSONParserLib.parseUint(resource[1]);
            Sculpture[] memory sculptures = ContractShow(show).getSculptures();
            if (i >= sculptures.length) {
                statusCode = 404;
                return (statusCode, body, headers);
            }
            body = tokenUri(i);
            statusCode = 200;
            headers = new KeyValue[](1);
            headers[0].key = "Content-Type";
            headers[0].value = "text/plain; charset=utf-8";
            return (statusCode, body, headers);
        }
        statusCode = 404;
        return (statusCode, body, headers);
    }
}
