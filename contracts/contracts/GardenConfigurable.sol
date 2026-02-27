// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "solady/src/utils/LibString.sol";
import "./Sculpture.sol";
import "./IWeb.sol";
import "./FlowerGuestbook.sol";
import "./ModConfigurable.sol";

/// @title GardenConfigurable
/// @notice Garden contract with configurable render address (for factory deployment)
contract GardenConfigurable is Sculpture, FlowerGuestbook {

    address[] public sculptures;
    address public immutable data;
    address public render; // Not immutable, can be set after deployment

    constructor(
        address[] memory _sculptures,
        address _render,
        address _data
    ) FlowerGuestbook() {
        sculptures = _sculptures;
        render = _render;
        data = _data;
    }

    /// @notice Update the renderer contract address
    /// @dev Allows fixing bugs and improving HTML generation without redeploying garden.
    ///      Content (sculptures, essays) remains immutable - only presentation changes.
    function setRender(address _render) external onlyOwner {
        require(_render != address(0), "Invalid renderer");
        render = _render;
    }

    ///////////////////////////////////////////////////////////////////////////
    // Web
    ///////////////////////////////////////////////////////////////////////////

    function html() external view returns (string memory) {
        return IWeb(render).html();
    }

    function resolveMode() external view returns (bytes32) {
        return IWeb(render).resolveMode();
    }

    function request(string[] memory resource, KeyValue[] memory params) external view returns (uint statusCode, string memory body, KeyValue[] memory headers) {
        return IWeb(render).request(resource, params);
    }

    fallback() external payable {
        revert(LibString.toHexString(abi.encodeWithSignature("html()")));
    }

    ///////////////////////////////////////////////////////////////////////////
    // Sculptures
    ///////////////////////////////////////////////////////////////////////////

    function getSculptures() public view returns (address[] memory) {
        return sculptures;
    }

    function setSculptures(address[] memory _sculptures) public onlyOwner {
        sculptures = _sculptures;
    }

    ///////////////////////////////////////////////////////////////////////////
    // Sculpture Interface (metadata delegated to Mod)
    ///////////////////////////////////////////////////////////////////////////

    /// @notice Garden title — reads from ModConfigurable to avoid adding
    ///         storage to this contract (which would bloat GardenDeployerA)
    function title() external view returns (string memory) {
        return ModConfigurable(data).gardenTitle();
    }

    function authors() external view returns (string[] memory) {
        // Aggregate: all essay authors + curator
        uint256 length = 1; // curator
        for (uint256 i = 0; i < sculptures.length; i++) {
            try Sculpture(sculptures[i]).authors() returns (string[] memory sculptureAuthors) {
                length += sculptureAuthors.length;
            } catch {}
        }

        string[] memory authors_ = new string[](length);
        uint256 index = 0;

        // Add essay authors
        for (uint256 i = 0; i < sculptures.length; i++) {
            try Sculpture(sculptures[i]).authors() returns (string[] memory sculptureAuthors) {
                for (uint256 j = 0; j < sculptureAuthors.length; j++) {
                    authors_[index] = sculptureAuthors[j];
                    index++;
                }
            } catch {}
        }

        // Add curator
        authors_[index] = ModConfigurable(data).curatorName();

        return authors_;
    }

    function addresses() external view returns (address[] memory) {
        uint256 length = 1; // Garden itself
        for (uint256 i = 0; i < sculptures.length; i++) {
            try Sculpture(sculptures[i]).addresses() returns (address[] memory sculptureAddresses) {
                length += sculptureAddresses.length;
            } catch {}
        }

        address[] memory addresses_ = new address[](length);
        addresses_[0] = address(this);
        uint256 index = 1;

        for (uint256 i = 0; i < sculptures.length; i++) {
            try Sculpture(sculptures[i]).addresses() returns (address[] memory sculptureAddresses) {
                for (uint256 j = 0; j < sculptureAddresses.length; j++) {
                    addresses_[index] = sculptureAddresses[j];
                    index++;
                }
            } catch {}
        }

        return addresses_;
    }

    function text() public view returns (string memory) {
        return ModConfigurable(data).text();
    }

    function urls() public view returns (string[] memory) {
        return ModConfigurable(data).urls();
    }
}
