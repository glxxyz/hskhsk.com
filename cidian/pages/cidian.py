import html
import time
import urllib.parse

from flask import Response

from common.hsk import get_hsk_char_level_negative_notfound, get_hsk_word_level_negative_notfound
from common.util import query_radical_frequency_index, query_char_frequency_index, query_word_frequency_index

from pages.deprecated import allstyle, space_eight_space, page_footer, frequency_order_word, hanzi_definition_link, \
    frequency_order_word_link_hskcolour, frequency_order_char, eight_space, get_compact_hanzi_info
from common.dictionary import cedict_definition, cedict_traditional, cedict_pinyintonemarks, get_words_from_pinyin, \
    get_words_from_english, cc_components, cc_composes, cc_radicals, cc_radicalof, cc_strokes
from common.frequency import char_componentof, max_frequency_index
from pages.vocab_analysis import annotatewords
from common.dictionary_parse import chinese_comma_sep, allvalidwords


def cidian_page(expand, query, results, start_time):
    titlebit = ""
    if query != "":
        titlebit = ": " + query
    results.append("""<html lang="zh-Hans">\n<head>""")
    results.append("<title>HSK\u4E1C\u897F\u8BCD\u5178{}</title>".format(titlebit))
    results.append(allstyle)
    results.append("</head>\n<body>")
    results.append("""<form method="get" action="/cidian">""")
    results.append("""<a href="https://hskhsk.com/word-lists">HSK\u4E1C\u897F</a> """)
    results.append("""<a href="/">Scripts</a> """)
    if expand == "yes":
        results.append("""<input type="hidden" name="expand" value="yes" />""")
    results.append("""<input type="text" name="q" value="{}"/><input type="submit" value="Go" />""".format(query))
    results.append("""<a href="/search">Advanced Search</a> """)
    results.append("""<a href="/radicals">Radicals</a> """)
    if expand == "yes":
        results.append("""[<a href="/cidian?expand=no&q={}">collapse definitions</a>]""".format(html.escape(query)))
    else:
        results.append("""[<a href="/cidian?expand=yes&q={}">expand definitions</a>]""".format(html.escape(query)))
    results.append("""</form>""")
    foundresult = False
    if len(query) == 0:
        foundresult = True
        results.append("""<h4>Please type some hanzi, pinyin, or English into the search box</h4>""".format(query))
    if not foundresult and query in cedict_definition:
        foundresult = True
        results.append("""<table><tr><td valign="top" align="left"><span class='bighanzi'>""")
        for q in query:
            hanzi_definition_link(results, q, q, "none", expand)
        results.append("""</span></td><td valign="top" align="left" width="90%">""")

        results.append("<b>")
        results.append(get_full_hanzi_info(query, expand))
        results.append("</b>")

        tradlist = []
        pinyinlist = []
        deflist = []
        if query in cedict_traditional:
            tradlist = cedict_traditional[query]
        if query in cedict_pinyintonemarks:
            pinyinlist = cedict_pinyintonemarks[query]
        if query in cedict_definition:
            deflist = cedict_definition[query]
        results.append("<table>")
        lasttrad = ""
        lastpinyin = ""
        for i in range(max(len(tradlist), len(pinyinlist), len(deflist))):
            results.append("""<tr><td valign="top" align="left">""")
            newtrad = False;
            if i < len(tradlist) and tradlist[i] != query and tradlist[i] != lasttrad:
                results.append("[" + tradlist[i] + "]")
                lasttrad = tradlist[i]
                newtrad = True;
            results.append("""</td><td valign="top" align="left">""")
            if i < len(pinyinlist) and (pinyinlist[i] != lastpinyin or newtrad):
                results.append(pinyinlist[i])
                lastpinyin = pinyinlist[i]
            results.append("""</td><td valign="top" align="left">""")
            if i < len(deflist):
                results.append(deflist[i].replace("|", "<br />").replace("/", "<br />"))
            results.append("</td></tr>")
        results.append("</table>")
        results.append("</td></tr></table>")

        querynodupes = removedupes(query)

        results.append("""<h4>Character Composition</h4>""")
        results.append("""<div class="outerbox">""")
        for q in querynodupes:
            results.append("""<div class="paddedbox">""")
            results.append("""<span style="font-weight: bold;>""")
            hanzi_definition_link(results, q, q, "char", expand)
            results.append(
                """<a class="arrowlink" href="/search?component={}&min=1&max=1{}">\u21D2</a></span>""".format(
                    html.escape(q),
                    "&def=compact" if expand == "yes" else ""))
            get_char_composition(results, q, expand)
            results.append("""</div>""")
        results.append("""</div>""")

        results.append("""<h4>Character Compounds</h4>""")
        results.append("""<div class="outerbox">""")
        for q in querynodupes:
            results.append("""<div class="paddedbox">""")
            results.append("<span style='font-weight: bold;'>")
            hanzi_definition_link(results, q, q, "char", expand),
            results.append("<a class='arrowlink' href='/search?compound={}&min=1&max=1{}'>\u21D2</a></span>".format(
                html.escape(q), "&def=compact" if expand == "yes" else ""))
            get_char_composes(results, q, expand)
            results.append("""</div>""")
        results.append("""</div>""")

        results.append("""<h4>Word Compounds</h4><p>""")
        results.append("""<div class="outerbox">""")
        for q in querynodupes:
            results.append("""<div class="paddedbox">""")
            results.append("""<span style="font-weight: bold">""")
            hanzi_definition_link(results, q, q, "char", expand)
            results.append("""<a class="arrowlink" href="/search?hanzi=*{}*{}">\u21D2</a></span><br />""".format(
                html.escape(q),
                "&def=compact" if expand == "yes" else ""))
            separator = "<br />" if expand == "yes" else chinese_comma_sep
            if q in char_componentof:
                frequency_order_word_link_hskcolour(results, char_componentof[q], separator, expand)
            results.append("""</div>""")
        results.append("""</div>""")

        mdbgurl = "http://www.mdbg.net/chindict/chindict.php?wdqb=" + urllib.parse.quote(html.escape(query))
        xiaomaurl = "http://www.xiaoma.info/compound.php?cp=" + urllib.parse.quote(html.escape(query))
        ncikuurl = "http://www.nciku.com/search/all/" + urllib.parse.quote(html.escape(query))
        results.append("""<h4>Look up {} in other dictionaries</h4>
                        <ul>
                            <li><a href="{}">MDBG</a></li>
                            <li><a href="{}">\u5C0F\u9A6C\u8BCD\u5178</a></li>
                            <li><a href="{}">nciku</a></li>
                        </ul>""".format(query, mdbgurl, xiaomaurl, ncikuurl))
    if not foundresult and (len(query) < 50):
        words_from_pinyin = get_words_from_pinyin(query)
        if len(words_from_pinyin):
            foundresult = True
            results.append("<h4>Pinyin Results for '{}'</h4>".format(query))
            for c in frequency_order_word(words_from_pinyin):
                hanzi_definition_link(results, c, c, "auto", expand)
                results.append(space_eight_space)
                get_compact_hanzi_info(results, c, 80)
                results.append("<br />")

        words_from_en = get_words_from_english(query)
        if len(words_from_en):
            foundresult = True
            results.append("""<h4>Definition Results for "{}"</h4>""".format(query))
            for word_en in frequency_order_word(words_from_en):
                hanzi_definition_link(results, word_en, word_en, "auto", expand)
                results.append(space_eight_space)
                get_compact_hanzi_info(results, word_en, 80)
                results.append("<br />")
    if (not foundresult) and len(query) < 50:
        foundresult = True
        validwords = allvalidwords(query)
        results.append("""<h4>All Possible Words</h4>""".format(query))
        for word in validwords:
            hanzi_definition_link(results, word, word, "auto", expand)
            results.append(space_eight_space)
            get_compact_hanzi_info(results, word, 80)
    if not foundresult:
        annotatewords(results, query, expand)
    results.append(
        """<p><small><i>Page generated in {:1.6f} seconds</i></small></p>""".format(time.time() - start_time))
    results.append(page_footer)
    return Response(results)


def removedupes(source):
    result = []
    for s in source:
        if s not in result:
            result.append(s)
    return result


def get_char_composition(results, query, expand):
    if query in cc_components:
        results.append("""<ul class="tree">""")
        for c in frequency_order_char(cc_components[query]):
            results.append("<li>")
            hanzi_definition_link(results, c, c, "char", expand)
            if expand == "yes":
                results.append(eight_space)
                get_compact_hanzi_info(results, c, 80)
            get_char_composition(results, c, expand)
            results.append("</li>")
        results.append("</ul>")


def get_char_composes(results, query, expand):
    if query in cc_composes:
        results.append("""<ul class="tree">""")
        expandyes = expand == "yes"
        needsendli = False
        isfirst = True
        for c in frequency_order_char(cc_composes[query]):
            haschildren = c in cc_composes
            if isfirst or expandyes or haschildren:
                if needsendli:
                    results.append("</li>")
                results.append("<li>")
                hanzi_definition_link(results, c, c, "char", expand)
                if expandyes:
                    results.append(eight_space)
                    get_compact_hanzi_info(results, c, 80)
                if haschildren:
                    get_char_composes(results, c, expand)
                    isfirst = True
                else:
                    isfirst = False
                needsendli = True
            else:
                results.append(chinese_comma_sep)
                hanzi_definition_link(results, c, c, "char", expand)
                needsendli = False
        if needsendli:
            results.append("</li>")
        results.append("</ul>")


def get_full_hanzi_info(hanzi, expand):
    charbits = []
    wordbits = []
    chardefbits = []
    worddefbits = []
    if hanzi in cc_radicals:
        charbits.append("is radical, radical freq index {}".format(query_radical_frequency_index(hanzi)))
    if hanzi in cc_radicalof:
        charbits.append("radical ")
        hanzi_definition_link(charbits, cc_radicalof[hanzi], cc_radicalof[hanzi], "char", expand)
    if hanzi in cc_strokes:
        strokes = cc_strokes[hanzi]
        charbits.append("""{} stroke{}""".format(strokes, "s" if strokes > 1 else ""))
    char_freq_idx = query_char_frequency_index(hanzi)
    if char_freq_idx < max_frequency_index:
        charbits.append("{} {}".format("freq index ", char_freq_idx))
    wordfreqidx = query_word_frequency_index(hanzi)
    if wordfreqidx < max_frequency_index:
        wordbits.append("{} {}".format("freq index ", wordfreqidx))
    expandtext = "?expand=yes" if expand == "yes" else ""
    charlevel = get_hsk_char_level_negative_notfound(hanzi)
    wordlevel = get_hsk_word_level_negative_notfound(hanzi)
    result = ""
    if len(charbits) > 0 or len(wordbits) > 0 or len(worddefbits) > 0 or len(
            chardefbits) > 0 or charlevel > 0 or wordlevel > 0:
        if len(wordbits) > 0 or wordlevel > 0 or len(worddefbits) > 0:
            if wordlevel > 0:
                result += """<a href="/hskwords{0}#hsk{1}" class="hsk{1}">HSK {1} word</a>: """.format(expandtext,
                                                                                                       wordlevel)
            else:
                result += "Word: "
            if len(wordbits) > 0:
                result += ", ".join(wordbits)
        if len(worddefbits) > 0:
            if len(result) > 0 and result[-1] != " ":
                result += ", "
            result += ", ".join(worddefbits)
        if len(charbits) > 0 or charlevel > 0 or len(chardefbits) > 0:
            if len(result) > 0:
                result += "<br />"
            if charlevel > 0:
                result += """<a href="/hskchars{0}#hsk{1}" class="hsk{1}">HSK {1} {2}</a>: """.format(expandtext,
                                                                                                      charlevel,
                                                                                                      "character")
            else:
                result += "Character: "
            if len(charbits) > 0:
                result += ", ".join(charbits)
        if len(chardefbits) > 0:
            if len(result) > 0 and result[-1] != " ":
                result += ", "
            result += ", ".join(chardefbits)
    return result