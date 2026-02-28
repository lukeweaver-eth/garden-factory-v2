// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "solady/src/utils/LibString.sol";
import "./GardenHTML.sol";
import "./IGarden.sol";
import "./Essay.sol";
import "./Sculpture.sol";
import "./ModConfigurable.sol";

library GardenEssay {
    function html(address garden, address essayContract, address data) public view returns (string memory result) {
        ModConfigurable mod = ModConfigurable(data);
        string memory collectionTerm = mod.collectionTerm();
        if (bytes(collectionTerm).length == 0) collectionTerm = "collection";

        string memory symbol = mod.unicodeSymbol();
        if (bytes(symbol).length == 0) symbol = unicode"⚘";

        result = string.concat(result,
            '<div class="c essay"><div class="w"><div class="s g">',
                '<p><i>This text was published as part of the contract ', collectionTerm, ': <a href="/" style="display: block">', Sculpture(garden).title() ,'</a></i></p>',
                '<br><br><br>',
                symbol,
                '<br><br><br><br>',
                '<article>',
                Essay(essayContract).html(),
                '</article>',
                '<br><br><br><br>',
                symbol,
                '<br><br><br>',
                '<p><span class="a">', LibString.toHexStringChecksummed(garden),'</span></p>',
                '<br><br>',
                '<p><i>This text was published as part of the ', collectionTerm, ' <a href="/" style="display: block">', Sculpture(garden).title() ,'</a></i></p>',
                '<br>',
            '</div></div></div>',
            '<div class="f"><a href="/" style="text-decoration: none;">', symbol, '</a></div>'
        );

        string memory description = string.concat(
            'The essay "', Essay(essayContract).title(),
            '" written by ', Essay(essayContract).authors()[0],
            ' was published as part of the contract ', collectionTerm, ': ', Sculpture(garden).title());

        return GardenHTML.htmlConfigurable(result, Essay(essayContract).title(), description, mod.backgroundColor(), mod.textColor(), symbol);
    }
}
