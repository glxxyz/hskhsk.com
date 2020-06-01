import re
import time

from flask import request

from pages.deprecated import allstyle, page_footer, word_char_definition_link, space_eight_space, get_compact_hanzi_info
from common.dictionary import cedict_definition, tonenum_pinyin, get_char_composes_set, get_char_composition_set, \
    cedict_pinyintonenum
from common.frequency import char_componentof
from common.hsk import hsk_words
from common.mandarin_comp_parse import mc_words
from common.util import get_parameter, query_word_frequency_index


def search_page(start_time):
    hsk1 = "checked" if get_parameter("hsk1") else ""
    hsk2 = "checked" if get_parameter("hsk2") else ""
    hsk3 = "checked" if get_parameter("hsk3") else ""
    hsk4 = "checked" if get_parameter("hsk4") else ""
    hsk5 = "checked" if get_parameter("hsk5") else ""
    hsk6 = "checked" if get_parameter("hsk6") else ""
    mandcomp = int(get_parameter("mandcomp")) if get_parameter("mandcomp") else 0

    expand = get_parameter("expand")
    pinyin = get_parameter("pinyin")
    hanzi = get_parameter("hanzi")
    component = get_parameter("component")
    compound = get_parameter("compound")
    minlength = int(get_parameter("min", "1"))
    maxlength = int(get_parameter("max", "10"))

    defoff = ""
    deffull = ""
    defcompact = ""
    definition = get_parameter("def", "off")
    if definition == "compact":
        defcompact = "checked"
    elif definition == "full":
        deffull = "checked"
    else:
        defoff = "checked"

    formatwildcard = ""
    formatregex = ""
    searchformat = get_parameter("format", "wildcard")
    if searchformat == "wildcard":
        formatwildcard = "checked"
    else:
        formatregex = "checked"

    sortfreq = ""
    sortpinyin = ""
    sorthanzi = ""
    sort = get_parameter("sort", "freq")
    if sort == "freq":
        sortfreq = "checked"
    elif sort == "pinyin":
        sortpinyin = "checked"
    else:
        sorthanzi = "checked"

    results = []
    results.append("""<html lang="zh-Hans">\n<head>""")
    results.append("<title>HSK\u4E1C\u897F\u8BCD\u5178 - Advanced Hanzi Search</title>")
    results.append(allstyle)
    results.append("</head>")
    results.append("<body>")
    results.append("""<a href="https://hskhsk.com/analyse.html">HSK\u4E1C\u897F</a>""")
    results.append("""<a href="/">Scripts</a>""")
    results.append("""<a href="/cidian">Dictionary</a>""")
    results.append("""<a href="/radicals">Radicals</a>""")
    results.append("""
<h2 class="compact">Advanced Hanzi Search</h2>
<form method="GET" action="/search">
<div class="paddedbox">
    <h4 class="compact">Search Fields <a class="arrowlink" href="javascript:toggle_visibility('searchhelp');"><small>(?)</small></a></h4>

    <div id="searchhelp" class="inlinehelp">
        If a value is entered into any of these fields, or the character composition fields,
        then each of the results returned must match that value.
        The results shown are the logical AND (set intersection) of the results found by each input field.
    </div>

    <div>
        Search format:
    </div>

    <div>
        <input type="radio" name="format" value="wildcard" {}>Wildcard</input>
            <a class="arrowlink" href="javascript:toggle_visibility('wildcardhelp');">(?)</a>
    </div>

    <div id="wildcardhelp" class="inlinehelp">
        Use * to match zero or any number of characters.<br />
        \u5c0f* matches all words beginning with \u5c0f.<br />
        *\u5c0f* matches all words with a \u5c0f.<br />
        Use + to match any one or more characters.<br />
        Use ? to match any single character.<br />
        Use [12] to match the characters '1' or '2'.<br />
    </div>

    <div>
        <input type="radio" name="format" value="regex" {}>Regex</input>
            <a class="arrowlink" href="javascript:toggle_visibility('regexhelp');">(?)</a>
    </div>

    <div id="regexhelp" class="inlinehelp">
        Try <a href="http://docs.python.org/release/2.5.2/lib/re-syntax.html">this link</a> for more
        information about regular expressions.
    </div>

    <div>
        Pinyin <input type="text" name="pinyin" value="{}"></input>
            <a class="arrowlink" href="javascript:toggle_visibility('pinyinhelp');">(?)</a><br />
    </div>

    <div id="pinyinhelp" class="inlinehelp">
        For pinyin search enter tone numbers, (pin1yin1) not tone marks (p\u012Bny\u012Bn).
        There are no spaces between syllables, and the search is case insensitive.
    </div>

    <div>
        Hanzi <input type="text" name="hanzi" value="{}"></input>
    </div>
</div>
<div class="paddedbox">
    <h4 class="compact">Character Composition</h4>

    <div>
Component of <input size="6" type="text" name="component" value="{}"></input>
    <a class="arrowlink" href="javascript:toggle_visibility('componenthelp');">(?)</a><br />
    </div>

    <div id="componenthelp" class="inlinehelp">
One character in the result must be a component of one of the characters in this box.
If you are only interested in single characters, set both the maximum and minmimum hanzi length to 1.
    </div>

    <div>
Compound of <input size="6" type="text" name="compound" value="{}"></input>
    <a class="arrowlink" href="javascript:toggle_visibility('compoundhelp');">(?)</a><br />
    </div>

    <div id="compoundhelp" class="inlinehelp">
One character in the result must be composed of one of the characters in this box.
If you are only interested in single characters, set both the maximum and minmimum hanzi length to 1.
    </div>

</div>
<div class="paddedbox">
    <h4 class="compact">Hanzi Chars <a class="arrowlink" href="javascript:toggle_visibility('hanzicharshelp');"><small>(?)</small></a></h4>
    <div id="hanzicharshelp" class="inlinehelp">
The maximum and minimun length of the hanzi results returned. Set both the max and min to 1 if you only want to see single character words.
    </div>
    <div class="indent">Min <input type="text" name="min" size="4" value="{}"></input></div>
    <div class="indent">Max <input type="text" name="max" size="4" value="{}"></input></div>
</div>
<div class="paddedbox">
    <h4 class="compact">Definition <a class="arrowlink" href="javascript:toggle_visibility('defhelp');"><small>(?)</small></a></h4>
    <div id="defhelp" class="inlinehelp">
Whether or not to display a full or truncated definition alongside the results. The alternative is to just show a list of hanzi words.
    </div>
    <div class="indent"><input type="radio" name="def" value="off" {}>Off</input></div>
    <div class="indent"><input type="radio" name="def" value="compact" {}>Compact</input></div>
    <div class="indent"><input type="radio" name="def" value="full" {}>Full</input></div>
</div>
<div class="paddedbox">
    <h4 class="compact">HSK Level <a class="arrowlink" href="javascript:toggle_visibility('hskhelp');"><small>(?)</small></a></h4>
    <div id="hskhelp" class="inlinehelp">
The results are filtered so that they must be in one of the HSK levels that are checked. If no boxes are checked, HSK filtering is ignored.
    </div>
    <div class="indent"><input type="checkbox" name="hsk1" value="t" {}>HSK 1</input></div>
    <div class="indent"><input type="checkbox" name="hsk2" value="t" {}>HSK 2</input></div>
    <div class="indent"><input type="checkbox" name="hsk3" value="t" {}>HSK 3</input></div>
    <div class="indent"><input type="checkbox" name="hsk4" value="t" {}>HSK 4</input></div>
    <div class="indent"><input type="checkbox" name="hsk5" value="t" {}>HSK 5</input></div>
    <div class="indent"><input type="checkbox" name="hsk6" value="t" {}>HSK 6</input></div>
</div>
<div class="paddedbox">
    <h4 class="compact">Sort Order <a class="arrowlink" href="javascript:toggle_visibility('sorthelp');"><small>(?)</small></a></h4>
    <div id="sorthelp" class="inlinehelp">
Results sorted by frequency show the most frequent words first.
Pinyin sorting should obey the <a href="http://pinyin.info/news/2012/pinyin-sort-order/">most
authoritative rules</a> that I could find about pinyin ordering.
Hanzi sorting uses the <a href="http://www.unicode.org/notes/tn26/">unicode code point</a>
to sort the results.
    </div>
    <div class="indent"><input type="radio" name="sort" value="freq" {}>Frequency</input></div>
    <div class="indent"><input type="radio" name="sort" value="pinyin" {}>Pinyin</input></div>
    <div class="indent"><input type="radio" name="sort" value="hanzi" {}>Hanzi</input></div>
</div>
<br />
<input type="submit" value="    Search!    " /></form>
    """.format(formatwildcard,
               formatregex,
               pinyin,
               hanzi,
               component,
               compound,
               minlength,
               maxlength,
               defoff,
               defcompact,
               deffull,
               hsk1,
               hsk2,
               hsk3,
               hsk4,
               hsk5,
               hsk6,
               sortfreq,
               sortpinyin,
               sorthanzi))

    resultset = processadvancedsearch(searchformat,
                                      sort,
                                      pinyin,
                                      hanzi,
                                      component,
                                      compound,
                                      minlength,
                                      maxlength,
                                      hsk1,
                                      hsk2,
                                      hsk3,
                                      hsk4,
                                      hsk5,
                                      hsk6,
                                      mandcomp,
                                      expand)

    if len(resultset):
        results.append("<h4>Results</h4>")
        params = request.query_string.decode('utf-8')
        results.append("<p><small>Download flashcards: <a href='/flash?card=pleco&{}'>Pleco</a>".format(params))
        results.append("<a href='/flash?card=sticky&{}'>StickyStudy</a></small></p>".format(params))
        word_link_hskcolour_search(results, resultset, definition, expand)

    results.append(
        """<p><small><i>Page generated in {:1.6f} seconds</i></small></p>""".format(time.time() - start_time))
    results.append(page_footer)
    return "\n".join(results)


def search_to_re(text):
    return "^" + (text.replace("\00D7", "*")
                  .replace("FF1F", "?")
                  .replace("*", ".*")
                  .replace("+", ".+")
                  .replace("?", ".?")) + "$"


def processadvancedsearch(searchformat,
                          sort,
                          pinyin,
                          hanzi,
                          component,
                          compound,
                          minlength,
                          maxlength,
                          hsk1,
                          hsk2,
                          hsk3,
                          hsk4,
                          hsk5,
                          hsk6,
                          mandcomp,
                          expand):
    began_search = False;

    resultset = set()
    if len(hanzi):
        simplified_re = re.compile(hanzi if searchformat == "regex" else search_to_re(hanzi))
        for w in cedict_definition:
            if len(w) >= minlength and len(w) <= maxlength and simplified_re.match(w) != None:
                resultset.add(w)
        began_search = True;

    if len(pinyin):
        pinyinrestrictset = set()
        pinyin_re = re.compile(
            pinyin.lower().replace("5", "0") if searchformat == "regex" else search_to_re(pinyin.lower()))
        for p, words in tonenum_pinyin.items():
            if pinyin_re.match(p) != None:
                pinyinrestrictset.update([w for w in words if len(w) >= minlength and len(w) <= maxlength])
        if began_search:
            resultset &= pinyinrestrictset
        else:
            resultset = pinyinrestrictset
        began_search = True

    if len(compound):
        foundset = set()
        for c in compound:
            foundset.add(c)
            foundset |= get_char_composes_set(c)
        restrictset = set()
        for c in foundset:
            restrictset.add(c)
            if c in char_componentof:
                restrictset |= set([w for w in char_componentof[c] if len(w) >= minlength and len(w) <= maxlength])
        if began_search:
            resultset &= restrictset
        else:
            resultset = restrictset
        began_search = True

    if len(component):
        foundset = set()
        for c in component:
            foundset.add(c)
            foundset |= get_char_composition_set(c)
        restrictset = set()
        for c in foundset:
            restrictset.add(c)
            if c in char_componentof:
                restrictset |= set([w for w in char_componentof[c] if len(w) >= minlength and len(w) <= maxlength])
        if began_search:
            resultset &= restrictset
        else:
            resultset = restrictset
        began_search = True;

    hskrestrict = set()
    if len(hsk1):
        hskrestrict |= hsk_words[1]
    if len(hsk2):
        hskrestrict |= hsk_words[2]
    if len(hsk3):
        hskrestrict |= hsk_words[3]
    if len(hsk4):
        hskrestrict |= hsk_words[4]
    if len(hsk5):
        hskrestrict |= hsk_words[5]
    if len(hsk6):
        hskrestrict |= hsk_words[6]
    if mandcomp:
        hskrestrict |= mc_words[mandcomp]

    if not (len(component) or len(compound) or len(pinyin) or len(hanzi)):
        resultset = hskrestrict
    else:
        if len(hskrestrict):
            resultset &= hskrestrict

    if sort == "freq":
        frequency_list = [(query_word_frequency_index(h), h) for h in resultset]
        frequency_list.sort()
        resultlist = [h for freq, h in frequency_list]
    elif sort == "pinyin":
        pinyinlist = [(cedict_pinyintonenum[h] if h in cedict_pinyintonenum else h, h) for h in resultset]
        pinyinlist.sort()
        resultlist = [h for py, h in pinyinlist]
    else:
        resultlist = [h for h in resultset]
        resultlist.sort()

    return resultlist


def word_link_hskcolour_search(results, hanzi, definition, expand):
    r"""
    TODO: limit was 1000 before, now reset on request to 10000, consider lowering again."

    Keyword Arguments:
    definition -- can be 'off' or 'full'
    """

    suffix = ""
    if len(hanzi) > 10000:
        hanzi = hanzi[:10000]
        suffix = """<p><i>Output limited to 10,000 words for server performance reasons.<br />
The downloadable flashcard file will show the full search result.<br />
You could split up your query into multiple searches.<br />
If you want the full output to display, the script could be run on a dedicated server.<br />
Please contact alan@hskhsk.com for more information.</i></p>"""
    if definition == "off":
        separator = ", "
    else:
        separator = "<br />"
    maxlen = 999 if definition == "full" else 80
    for h in hanzi:
        word_char_definition_link(results, h, "word", expand)
        if definition != "off":
            results.append(space_eight_space)
            get_compact_hanzi_info(results, h, maxlen)
    results.append(suffix)