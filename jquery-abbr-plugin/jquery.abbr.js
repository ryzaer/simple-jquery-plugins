
(function($) {
    const parentProp = /^(blockquote|progress|optgroup|textarea|colgroup|section|details|marquee|summary|button|select|option|center|canvas|source|script|footer|strong|style|header|tbody|thead|table|input|video|label|embed|meter|param|audio|meta|link|form|font|area|html|head|body|main|menu|abbr|span|div|img|col|nav|pre|map|h3|hr|br|h1|h4|ul|ol|li|tr|th|td|h2|h6|h5|u|p|i|a|b)/i;
    const noEndSpr = ['source', 'param', 'input', 'embed', 'meta', 'link', 'col', 'img', 'br', 'hr'];

    function parseLineBase(string, extra = '') {
        let parent = buildParent(string);
        let value = buildValue(string);

        let parse = [];
        parse.push(buildID(string));
        parse.push(buildClass(string));
        parse.push(buildProp(string));

        let newParse = parse.filter(item => item);
        let html = newParse.length > 0 ? ' ' + newParse.join(" ") : '';

        return '<' + parent[0] + html + (parent[1] ? '>' + (value ? saveValues(value, false) : '') + saveValues(extra, false) + '</' + parent[0] + '>' : '>' + (value ? saveValues(value, false) : '') + saveValues(extra, false));
    }

    function applyMultiLine(strs) {
        let $data = strs.split('>');
        let extra = '';

        let $ndata = $data.slice(1);
        let nline = $data[0];

        if ($ndata.length > 0) {
            nline = $ndata.join('>');
            let nparse = $ndata[0].match(/\((.*?)\)/i);
            extra = nparse ? checkExtraLineBases(nparse[1]) : applyMultiLine(nline);
        }

        let fparse = $data[0].match(/\((.*?)\)/i);
        let result = fparse ? checkExtraLineBases(fparse[1]) : parseLineBase($data[0], extra);

        return result;
    }

    function checkExtraLineBases(strings) {
        let extra = '';
        let multi = strings.split('|');
        let args = [];
        $.each(multi, function(key, value) {
            args.push(applyMultiLine(value));
        });
        if (args.length > 0) {
            extra = args.join('');
        }
        return extra;
    }

    function buildParent(string) {
        let endtags = true;
        let deft = 'div';
        let chck = string.trim().replace(/([\[({.#\s].*)/g, ' ');
        let parn = chck.split(' ');
        chck = parn[0].match(parentProp);

        if (chck) {
            if (noEndSpr.includes(chck[0])) {
                deft = chck[0];
                endtags = false;
            } else {
                deft = chck[0];
            }
        }

        return [deft, endtags];
    }

    function buildValue(string) {
        let str = string.match(/\{(.*?)\}/i);
        return str ? str[1].trim() : '';
    }

    function buildID(string) {
        let str = string.match(/#(.*)/i);
        return str ? 'id="' + str[1].replace(/([\s\[{.#].*)/g, '') + '"' : '';
    }

    function buildClass(string) {
        let str = string.match(/\.(.*)/i);
        return str ? 'class="' + str[1].replace(/\./g, ' ').replace(/([\[{#,].*)/g, '') + '"' : '';
    }

    function buildProp(string) {
        let str = string.match(/\[(.*?)\]/i);
        if (str) {
            let arrstr = [];
            let arrsConsProp = ['class', 'id'];
            let args = saveValues(str[1], false).split('|');
            $.each(args, function(key, val) {
                if (val) {
                    let newstr = val.trim().split('=');
                    if (newstr[0] && !arrsConsProp.includes(newstr[0].trim())) {
                        let props = newstr.length == 2 ? newstr[0] + '="' + newstr[1] + '"' : newstr[0];
                        arrstr.push(props);
                    }
                }
            });
            return arrstr.join(' ');
        }
        return '';
    }

    function saveValues(_str, _encode = true) {
        if (_str) {
            if (_encode) {
                _str = _str.replace(/\./g, "*").replace(/\(/g, "~?").replace(/\)/g, "?~");
                _str = encodeURIComponent(_str);
            } else {
                _str = decodeURIComponent(_str).replace(/\*/g, ".").replace(/~\?/g, "(").replace(/\?~/g, ")");
            }
        }
        return _str || '';
    }

    function passValues(abbr) {
        if (!abbr) return false;

        let rslt = abbr;
        let mtch = abbr.match(/\{(.*?)\}/g);
        if (mtch) {
            $.each(mtch, function(m, item) {
                let save = '{' + saveValues(item.slice(1, -1)) + '}';
                rslt = rslt.replace(item, save);
            });
        }

        mtch = rslt.match(/\[(.*?)\]/g);
        if (mtch) {
            $.each(mtch, function(m, item) {
                let save = '[' + saveValues(item.slice(1, -1)) + ']';
                rslt = rslt.replace(item, save);
            });
        }

        return rslt;
    }

    $.abbr = function(_args, beauty = false) {
        let result = '';
        if (_args) {
            if (_args.length == 2) {
                let val1 = passValues(_args[0]) || _args[0];
                let val2 = passValues(_args[1]) || _args[1];

                result = parseLineBase(val1, val2);
            } else {
                let pass = passValues(_args);
                if (pass) _args = pass;
                result = applyMultiLine(_args);
            }
        }
        return beauty ? beautifyTags(result) : result;
    }

    function beautifyTags(html) {
        return parses(html.replace(/(\r\n|\n|\r)/gm, " ").replace(/ +(?= )/g, ''));
    }

    function parses(html, tab = 0) {
        let formatHtml = '';
        let parsedHtml = $.parseHTML(html);

        function setTabs() {
            return '\t'.repeat(tab);
        }

        $.each(parsedHtml, function(i, el) {
            if (el.nodeName == '#text') {
                if ($(el).text().trim().length) {
                    formatHtml += setTabs() + $(el).text().trim() + '\n';
                }
            } else {
                let innerHTML = $(el).html().trim();
                $(el).html(innerHTML.replace('\n', '').replace(/ +(?= )/g, ''));

                if ($(el).children().length) {
                    $(el).html('\n' + parses(innerHTML, tab + 1) + setTabs());
                    formatHtml += setTabs() + $(el).prop('outerHTML').trim() + '\n';
                } else {
                    formatHtml += setTabs() + $(el).prop('outerHTML').trim() + '\n';
                }
            }
        });

        return formatHtml;
    }

})(jQuery);
