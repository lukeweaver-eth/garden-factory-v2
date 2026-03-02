// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "solady/src/utils/LibString.sol";
import "./GardenHTML.sol";
import "./GardenContributions.sol";
import "./lib/Format.sol";
import "./Essay.sol";
import "./IGarden.sol";
import "./Sculpture.sol";
import "./ModConfigurable.sol";

/// @title GardenIndexConfigurable
/// @notice Configurable index page renderer for factory-deployed Gardens
library GardenIndexConfigurable {
    function html(address garden, address essayContract, address data) public view returns (string memory html) {
        address[] memory sculptures = IGarden(garden).getSculptures();
        ModConfigurable mod = ModConfigurable(data);
        string memory symbol = mod.unicodeSymbol();

        // Header with configurable symbol
        html = string.concat(html,
            '<div class="c">',
            '<div class="w" id="hi">',
            '<div class="s g">',
            '<pre class="garden">',
            unicode"       ", symbol, unicode"                    ", symbol, unicode"\n",
            unicode"             ", symbol, unicode"\n",
            symbol, unicode"                       ", symbol, unicode"         ", symbol, unicode"\n",
            unicode"        ", symbol, unicode"         ", symbol, unicode"\n",
            unicode"   ", symbol, unicode"                          ", symbol, unicode"\n",
            unicode"</pre>",
            '<br><br>',
            Sculpture(garden).title(), "\n",
            '<br><br>'
        );

        // Essay authors
        for (uint256 i = 0; i < sculptures.length; i++) {
            try Sculpture(sculptures[i]).authors() returns (string[] memory authors) {
                for (uint256 j = 0; j < authors.length; j++) {
                    if (bytes(authors[j]).length == 0) continue;
                    html = string.concat(html, authors[j], "<br>");
                }
            } catch {
                html = string.concat(html, "Unknown<br>");
            }
        }

        // Header End with configurable curator
        html = string.concat(html,
            '<br><br>',
            '<span class="a">', LibString.toHexStringChecksummed(garden), '</span><br><br>',
            '<pre class="garden">',
            unicode'      ', symbol, unicode'                      ', symbol, unicode'\n',
            unicode'              ', symbol, unicode'\n',
            unicode' ', symbol, unicode'                     ', symbol, unicode'         ', symbol, unicode'\n',
            unicode'          ', symbol, unicode'      ', symbol, unicode'\n',
            unicode'     ', symbol, unicode'                     ', symbol, unicode'\n',
            unicode'</pre><br>',
            '<p>'
        );

        // Configurable collection term (anthology, show, etc.)
        string memory collectionTerm = mod.collectionTerm();
        if (bytes(collectionTerm).length == 0) {
            collectionTerm = "collection";
        }

        // Curator (with optional URL)
        string memory curatorUrl = mod.curatorUrl();
        html = string.concat(html, 'A contract ', collectionTerm, ' curated by ');
        if (bytes(curatorUrl).length > 0) {
            html = string.concat(html, '<a href="', curatorUrl, '" target="_blank" rel="noopener noreferrer">', mod.curatorName(), '</a>');
        } else {
            html = string.concat(html, mod.curatorName());
        }

        // Thank yous
        try mod.getThankYouCount() returns (uint256 thankYouCount) {
            if (thankYouCount > 0) {
                html = string.concat(html, '<br>with special thanks to ');
                for (uint256 i = 0; i < thankYouCount; i++) {
                    try mod.getThankYou(i) returns (string memory name, string memory url) {
                        if (i > 0 && i == thankYouCount - 1) {
                            html = string.concat(html, ' and ');
                        } else if (i > 0) {
                            html = string.concat(html, ', ');
                        }
                        // Only create link if URL is provided, otherwise just show name
                        if (bytes(url).length > 0) {
                            html = string.concat(html, '<a href="', url, '" target="_blank" rel="noopener noreferrer">', name, '</a>');
                        } else {
                            html = string.concat(html, name);
                        }
                    } catch {
                        // Skip this thank you entry if it fails
                    }
                }
            }
        } catch {
            // No thank yous if call fails
        }

        html = string.concat(html, '</p>');

        // Introductory Essay link (only if a title has been set)
        try Essay(essayContract).title() returns (string memory essayTitle) {
            if (bytes(essayTitle).length > 0) {
                string memory essayAuthor = "";
                try Essay(essayContract).authors() returns (string[] memory eas) {
                    if (eas.length > 0 && bytes(eas[0]).length > 0) essayAuthor = eas[0];
                } catch {}

                // Use relative path so it works on any domain
                html = string.concat(html, '<br><br>');
                html = string.concat(html, 'With an <a href="./essay">introductory essay</a>');
                if (bytes(essayAuthor).length > 0) {
                    html = string.concat(html, ' by ', essayAuthor);
                }
            }
        } catch {}

        html = string.concat(html, '<br><br>');

        // Scroll Indicator
        html = string.concat(
            html,
            '<br></div>',
            unicode'<div class="p">↓</div></div>'
        );

        // Exhibition Text
        html = string.concat(html,
            '<div class="w" id="intro"><div class="s">',
            Sculpture(garden).text(),
            '<br>',
            '<p>This website was generated from the contract itself at block ', LibString.toString(block.number), '.</p>',
            '</div></div>'
        );

        // Essays/Sculptures
        for (uint256 i = 0; i < sculptures.length; i++) {
            Sculpture sculpture = Sculpture(sculptures[i]);

            html = string.concat(html, '<div class="w" id="', LibString.toString(i+1) ,'"><div class="s">');

            // Authors
            try sculpture.authors() returns (string[] memory authors) {
                if (authors.length > 0) {
                    html = string.concat(html, '<p>');
                    for (uint256 j = 0; j < authors.length; j++) {
                        if (bytes(authors[j]).length == 0) continue;
                        html = string.concat(html, authors[j], '<br>');
                    }
                    html = string.concat(html, '</p>');
                }
            } catch {
                html = string.concat(html, '<p><i>Unknown</i></p>');
            }

            // Title
            try sculpture.title() returns (string memory title) {
                if (bytes(title).length > 0) {
                    html = string.concat(html, '<p><i>', title, '</i></p>');
                } else {
                    html = string.concat(html, '<p><i>Untitled</i></p>');
                }
            } catch {
                html = string.concat(html, '<p><i>Untitled</i></p>');
            }

            // Addresses
            try sculpture.addresses() returns (address[] memory addresses) {
                if (addresses.length > 0) {
                    html = string.concat(html, '<p>');
                    for (uint256 j = 0; j < addresses.length; j++) {
                        html = string.concat(html, '<span class="a">', LibString.toHexStringChecksummed(addresses[j]), '</span><br>');
                    }
                    html = string.concat(html, '</p>');
                }
            } catch {
                html = string.concat(html, '<p><span class="a">', LibString.toHexStringChecksummed(sculptures[i]) , '</span></p>');
            }

            // Urls
            try sculpture.urls() returns (string[] memory urls) {
                if (urls.length > 0) {
                    html = string.concat(html, '<p>');
                    for (uint256 j = 0; j < urls.length; j++) {
                        if (bytes(urls[j]).length == 0) continue;
                        html = string.concat(html, Format.renderUrl(urls[j]), '<br>');
                    }
                    html = string.concat(html, '</p>');
                }
            } catch {
                // ignore reverting urls
            }

            // Text
            try sculpture.text() returns (string memory text) {
                if (bytes(text).length > 0) {
                    html = string.concat(html, '<div class="t">', text, '</div>');
                }
            } catch {
                html = string.concat(html, '<div class="t"><i>Contract Reverted</i></div>');
            }

            html = string.concat(html, '</div></div>');
        }

        // Contributions (flowers/guestbook)
        html = string.concat(html, GardenContributions.html(garden, data));

        // Footer with factory link
        html = string.concat(html, '<div class="i"><a href="/">Garden Factory</a><br><br>Generated in block ', LibString.toString(block.number), ' from <span class="a">', LibString.toHexStringChecksummed(address(this)) ,"</span></div>");

        // End
        html = string.concat(html, '</div>');

        string memory description = string.concat(Sculpture(garden).title(), ' at ', LibString.toHexStringChecksummed(garden), '. Curated by ', mod.curatorName(), '.');

        // Use configurable colors and symbol
        return GardenHTML.htmlConfigurable(html, Sculpture(garden).title(), description, mod.backgroundColor(), mod.textColor(), symbol);
    }
}
