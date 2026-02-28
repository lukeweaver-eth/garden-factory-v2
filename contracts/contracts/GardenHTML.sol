// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

library GardenHTML {
    function html(string memory body, string memory title, string memory description) external pure returns (string memory) {
        string memory html_ = '<!DOCTYPE html><html lang="en">';
        html_ = string.concat(html_,
            '<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">',
            '<link rel="icon" type="image/svg+xml" href="data:image/svg+xml,%3Csvg%20xmlns=', unicode"'http://www.w3.org/2000/svg'%20viewBox='0%200%20100%20100'%3E%3Cstyle%3E%20text%20%7B%20fill:%20%23000;%20%7D%20@media%20(prefers-color-scheme:%20dark)%20%7B%20text%20%7B%20fill:%20%23fff;%20%7D%20%7D%20%3C/style%3E%3Ctext%20y='.9em'%20font-size='90'%3E%20⚘%20%3C/text%3E%3C/svg%3E%0A",'">',
            '<title>', title ,'</title>',
            "<meta name='description' content='", description, "'>",
            '<style>',
            '*, *::before, *::after { box-sizing: border-box; }',
            'html { -moz-text-size-adjust: none; -webkit-text-size-adjust: none; text-size-adjust: none; } html, body { margin: 0; padding: 0; } body { min-height: 100vh } html,body,pre,button{ font-family: "Courier New", "Courier", monospace; font-size: 15px; line-height: 1.3; }',
            'h1,h2,h3,h4,h5,h6 { margin: 0; font-weight: bold; }',
            'h1 { font-size: 2em; margin: 0.67em 0; }',
            'h2 { font-size: 1.5em; margin: 0.75em 0; }',
            'h3 { font-size: 1.17em; margin: 0.83em 0; }',
            'h4 { font-size: 1em; margin: 1em 0; }',
            'h5 { font-size: 0.83em; margin: 1.5em 0; }',
            'h6 { font-size: 0.67em; margin: 2.33em 0; }',
            '.c { max-width: 860px; margin: 0 auto; padding: 0 20px; box-sizing: border-box; }',
            '.c.essay { max-width: 620px; }',
            'a { color: inherit; text-decoration: underline; }',
            '.w { position: relative; min-height: 100vh; display: flex; align-items: center; padding: 10em 0; }',
            '.s { width: 100%; max-width: 860px; }',
            '.s:not(.g) a { max-width: 100%; display: inline-block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; vertical-align: baseline; }',
            '.s.g a { display: inline; }',
            '.t { max-width: 100%; overflow-x: auto; margin: 1em 0; white-space: pre-wrap; }',
            '.i { margin: 0 0 5em; }',
            '.f { position: fixed; bottom: 1em; right: 1.3em; }',
            '.p { position: absolute; bottom: 2rem; left: 50%; transform: translateX(-50%); font-size: 1.4em; }',
            '.field { white-space: pre; margin: 0 auto; max-width: 100%; overflow: none; }',
            '@media (screen) and (max-width: 900px) { .field { overflow-x: auto } }',
            '.field a { text-decoration: none; }',
            '.a { overflow: hidden; display: inline-block; max-width: 100%; text-overflow: ellipsis; vertical-align: middle; }',
            '</style>',
            '</head>'
        );
        html_ = string.concat(html_, '<body>', body, '</body></html>');
        return html_;
    }

    function htmlConfigurable(
        string memory body,
        string memory title,
        string memory description,
        string memory backgroundColor,
        string memory textColor,
        string memory symbol
    ) external pure returns (string memory) {
        string memory html_ = '<!DOCTYPE html><html lang="en">';
        html_ = string.concat(html_,
            '<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">',
            '<link rel="icon" type="image/svg+xml" href="data:image/svg+xml,%3Csvg%20xmlns=', unicode"'http://www.w3.org/2000/svg'%20viewBox='0%200%20100%20100'%3E%3Cstyle%3E%20text%20%7B%20fill:%20%23000;%20%7D%20@media%20(prefers-color-scheme:%20dark)%20%7B%20text%20%7B%20fill:%20%23fff;%20%7D%20%7D%20%3C/style%3E%3Ctext%20y='.9em'%20font-size='90'%3E%20", symbol, unicode"%20%3C/text%3E%3C/svg%3E%0A",'">',
            '<title>', title ,'</title>',
            "<meta name='description' content='", description, "'>",
            '<style>',
            '*, *::before, *::after { box-sizing: border-box; }',
            'html { -moz-text-size-adjust: none; -webkit-text-size-adjust: none; text-size-adjust: none; } html, body { margin: 0; padding: 0; } body { min-height: 100vh; background: ', backgroundColor, '; color: ', textColor, '; } html,body,pre,button{ font-family: "Courier New", "Courier", monospace; font-size: 15px; line-height: 1.3; }',
            'h1,h2,h3,h4,h5,h6 { margin: 0; font-weight: bold; }',
            'h1 { font-size: 2em; margin: 0.67em 0; }',
            'h2 { font-size: 1.5em; margin: 0.75em 0; }',
            'h3 { font-size: 1.17em; margin: 0.83em 0; }',
            'h4 { font-size: 1em; margin: 1em 0; }',
            'h5 { font-size: 0.83em; margin: 1.5em 0; }',
            'h6 { font-size: 0.67em; margin: 2.33em 0; }',
            '.c { max-width: 860px; margin: 0 auto; padding: 0 20px; box-sizing: border-box; }',
            '.c.essay { max-width: 620px; }',
            'a { color: inherit; text-decoration: underline; }',
            '.w { position: relative; min-height: 100vh; display: flex; align-items: center; padding: 10em 0; }',
            '.s { width: 100%; max-width: 860px; }',
            '.s:not(.g) a { max-width: 100%; display: inline-block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; vertical-align: baseline; }',
            '.s.g a { display: inline; }',
            '.t { max-width: 100%; overflow-x: auto; margin: 1em 0; white-space: pre-wrap; }',
            '.i { margin: 0 0 5em; }',
            '.f { position: fixed; bottom: 1em; right: 1.3em; }',
            '.p { position: absolute; bottom: 2rem; left: 50%; transform: translateX(-50%); font-size: 1.4em; }',
            '.field { white-space: pre; margin: 0 auto; max-width: 100%; overflow: none; }',
            '@media (screen) and (max-width: 900px) { .field { overflow-x: auto } }',
            '.field a { text-decoration: none; }',
            '.a { overflow: hidden; display: inline-block; max-width: 100%; text-overflow: ellipsis; vertical-align: middle; }',
            '</style>',
            '</head>'
        );
        html_ = string.concat(html_, '<body>', body, '</body></html>');
        return html_;
    }
}