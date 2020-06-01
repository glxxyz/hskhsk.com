# a bunch of junk that is being deprecated as the code gets cleaned up
import html
import time
import urllib.parse

from common.dictionary import cedict_pinyintonemarks, cedict_traditional, cedict_definition
from common.frequency import query_word_freq, max_frequency_index, query_char_freq
from common.hsk import get_hsk_word_level, get_hsk_char_level, get_hsk_word_level_negative_notfound
from common.util import query_word_frequency_index, get_parameter, query_char_frequency_index, get_hsk_radical_level, \
    query_radical_frequency_index

eight_space = "&nbsp;" * 8  # note: not eight ace

space_eight_space = " " + eight_space

page_footer = """<i>If you find this site useful, <a href='https://hskhsk.com/contribute.html'>let me know</a>!</i>
</body>
</html>
"""

allstyle = """<link rel="stylesheet" href="/static/hskhsk.css" />
<script type="text/javascript" language="JavaScript" src="/static/hskhsk.js"></script>
"""


def frequency_order_word(hanzi):
    frequency_list = [(query_word_frequency_index(h), h) for h in hanzi]
    frequency_list.sort()
    if get_parameter("outputcommasep"):
        return [",".join([h for f, h in frequency_list])]
    elif get_parameter("addfreqindex") and get_parameter("addfreqvalue"):
        return ["{}\t{}\t{}".format(h, f, query_word_freq(h)) for f, h in frequency_list]
    elif get_parameter("addfreqindex"):
        return ["{}\t{}".format(h, 0 if f >= max_frequency_index else f) for f, h in frequency_list]
    elif get_parameter("addfreqvalue"):
        return ["{}\t{}".format(h, query_word_freq(h)) for f, h in frequency_list]
    else:
        return [h for f, h in frequency_list]


def frequency_order_char(hanzi):
    frequency_list = [(query_char_frequency_index(h), h) for h in hanzi]
    frequency_list.sort()
    if get_parameter("outputcommasep"):
        return [",".join([h for f, h in frequency_list])]
    elif get_parameter("addfreqindex") and get_parameter("addfreqvalue"):
        return ["{}\t{}\t{}".format(h, f, query_char_freq(h)) for f, h in frequency_list]
    elif get_parameter("addfreqindex"):
        return ["{}\t{}".format(h, 0 if f >= max_frequency_index else f) for f, h in frequency_list]
    elif get_parameter("addfreqvalue"):
        return ["{}\t{}".format(h, query_char_freq(h)) for f, h in frequency_list]
    else:
        return [h for f, h in frequency_list]


def hanzi_definition_link(results, hanziword, hanzichar, colour, expand):
    r"""
    Keyword arguments:

    colour -- can be 'char', 'word', 'none', 'auto'
    """

    urlstub = "/cidian?{}q=".format("expand=yes&" if expand == "yes" else "")
    url = urlstub + urllib.parse.quote(html.escape(hanziword))
    title = get_linktext_hanzi_info(hanziword, hanzichar, 30)
    wordlevel = get_hsk_word_level(hanziword)
    charlevel = get_hsk_char_level(hanzichar)
    radicallevel = get_hsk_radical_level(hanzichar)
    linkclass = "definition"
    if (colour == "word" or colour == "auto") and wordlevel > 0:
        linkclass = "hsk{3}";
    elif (colour == "char" or colour == "auto") and charlevel > 0:
        linkclass = "hsk{4}";
    elif colour == "radical":
        linkclass = "hsk{5}";
    link_format = '<a class="' + linkclass + '" href="{0}" title="{1}">{2}</a>'
    results.append(
        link_format.format(url, html.escape(title), html.escape(hanzichar), wordlevel, charlevel, radicallevel))


def word_char_definition_link(results, hanzi, colour, expand):
    r"""
    Keyword arguments:

    colour -- can be 'char', 'word', 'none', 'auto'
    """

    for c in hanzi:
        hanzi_definition_link(results, hanzi, c, colour, expand)


def frequency_order_word_link(results, hanzi, expand, word_separator, expand_separator="\n"):
    frequency_list = [(query_word_frequency_index(h), h) for h in hanzi]
    frequency_list.sort()
    sep = ""
    for f, h in frequency_list:
        results.append(sep)
        sep = word_separator
        word_char_definition_link(results, h, "none", expand)
        if expand == "yes":
            results.append(expand_separator)
            get_compact_hanzi_info(results, h, 80)


def frequency_order_char_link(results, hanzi, expand, char_separator, expand_separator="\n"):
    frequency_list = [(query_char_frequency_index(h), h) for h in hanzi]
    frequency_list.sort()
    sep = ""
    for f, h in frequency_list:
        results.append(sep)
        sep = char_separator
        hanzi_definition_link(results, h, h, "none", expand)
        if expand == "yes":
            results.append(expand_separator)
            get_compact_hanzi_info(results, h, 80)


def frequency_order_word_link_hskcolour(results, hanzi, separator, expand):
    frequency_list = [(query_word_frequency_index(h), h) for h in hanzi]
    frequency_list.sort()
    sep = ""
    for f, h in frequency_list:
        results.append(sep)
        sep = separator
        word_char_definition_link(results, h, "word", expand)
        if expand == "yes":
            results.append(space_eight_space)
            get_compact_hanzi_info(results, h, 80)


def frequency_order_char_link_hskcolour(results, hanzi, separator, expand):
    frequency_list = [(query_char_frequency_index(h), h) for h in hanzi]
    frequency_list.sort()
    sep = ""
    for f, h in frequency_list:
        results.append(sep)
        sep = separator
        word_char_definition_link(results, h, "char", expand)
        if expand == "yes":
            results.append(space_eight_space)
            get_compact_hanzi_info(results, h, 80)


def frequency_order_radical_link(results, hanzi, separator, expand):
    frequency_list = [(query_radical_frequency_index(h), h) for h in hanzi]
    frequency_list.sort()
    sep = ""
    for f, h in frequency_list:
        results.append(sep)
        sep = separator
        word_char_definition_link(results, h, "radical", expand)
        if expand == "yes":
            results.append(space_eight_space)
            get_compact_hanzi_info(results, h, 80)


def blockboxtemplate(cols=""):
    if get_parameter("outputcommasep") or get_parameter("hanziA"):
        cols = 'cols="30"'
    elif get_parameter("addfreqindex") and get_parameter("addfreqvalue"):
        cols = 'cols="25"'
    else:
        cols = 'cols="15"'
    return """<div class="box"><div class="title">{}</div><div><textarea name="{}" """ + cols + """ rows="12">{}</textarea></div></div>"""


def get_compact_hanzi_info(results, hanzi, maxlen):
    defbits = get_hanzi_compactdeflist(hanzi, maxlen)
    sep = ""
    for d in defbits:
        results.append(sep)
        sep = ", "
        results.append(d)


def get_linktext_hanzi_info(word, char, maxlen):
    chardefbits = []
    worddefbits = get_hanzi_compactdeflist(word, maxlen)
    result = ""
    wordlevel = get_hsk_word_level_negative_notfound(word)
    if wordlevel > 0:
        result = """HSK {} word: """.format(wordlevel)
    elif word != char:
        result = "Word: "
    result += ", ".join(worddefbits)
    if word != char:
        chardefbits = get_hanzi_compactdeflist(char, maxlen)
        if len(chardefbits) > 0:
            result += " Char: "
            result += ", ".join(chardefbits)
    return result


def get_hanzi_compactdeflist(query, max_def_len):
    results = []
    if query in cedict_pinyintonemarks:
        pinyin = []
        for p in cedict_pinyintonemarks[query]:
            if p not in pinyin:
                pinyin.append(p)
        if len(pinyin):
            results.append("/".join([p for p in pinyin]))
    if query in cedict_traditional:
        trad = []
        for t in cedict_traditional[query]:
            if t not in trad and t != query:
                trad.append(t)
        if len(trad):
            results.append("/".join(["[" + t + "]" for t in trad]))
    if query in cedict_definition:
        definition = ""
        for d in cedict_definition[query]:
            dstrip = d.strip("\r\n ,/")
            if len(definition) < max_def_len and len(dstrip):
                if len(definition):
                    definition += ", "
                definition += dstrip
        if len(definition) > max_def_len:
            definition = definition[:max_def_len] + "..."
        results.append(definition)
    return results


def append_page_end(results, start_time):
    time_taken = time.time() - start_time
    results.append("<p><small><i>Page generated in {:1.6f} seconds.</i></small></p>".format(time_taken))
    results.append(page_footer)