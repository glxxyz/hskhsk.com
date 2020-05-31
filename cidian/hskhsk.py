# coding: utf-8
# https://hskhsk.pythonanywhere.com
# Alan Davies alan@hskhsk.com

from flask import Flask, request, make_response
import codecs, unicodedata, urllib.request, urllib.parse, urllib.error, html, re, time, pickle

app = Flask(__name__)
app.secret_key = 'no need for a secret key right now fjblltrltdgghvlufudvlldk'

chinese_comma = "\uFF0C"
chinese_comma_sep = "\uFF0C<wbr />"

page_footer = "<i>If you find this site useful, <a href='http://www.hskhsk.com/contribute.html'>let me know</a>!</i>"

allstyle = """<link rel="stylesheet" href="/static/hskhsk.css" />
<script type="text/javascript" language="JavaScript" src="/static/hskhsk.js"></script>
"""

# try to get the value both from the args and the form, gives me options ;)
def getform(key, default=""):
    value = request.args.get(key, default)
    if value == "" and key in request.form:
        value = request.form[key]
    return value

@app.route('/', methods=['GET', 'PUT', 'POST'])
def handle_root():
    start_time = time.time()
    # init_resources()
    results = []
    results.append("""<html lang="zh-Hans">
<head>
    <title>HSK\u4E1C\u897F Scripts</title>""")
    results.append(allstyle)
    results.append("""
</head>
<body>
<a href="http://hskhsk.com/">HSK\u4E1C\u897F</a>
<h2 lang="en">HSK<span lang="zh-Hans">\u4E1C\u897F</span> Scripts</h2>
<h4 lang="en">Interactive Tools</h4>
<form method="get" action="/cidian"><ul lang="en">
    <li><a href="/cidian">Fast Simple Chinese-English Dictionary</a>
        <input type="text" name="q" value=""/><input type="submit" value="Go" /></li>
    <li><a href="/search">Advanced Hanzi Search</a></li>
    <li><a href="/hanzi">Analyse Your \u6C49\u5B57 Vocabulary/Text</a></li>
    <li><a href="/sets">Character List Set Operations</a></li>
    <li><a href="/pinyinfix">Fix pinyin characters</a></li>
</ul>
</form>
<h4 lang="en">Hanzi Lists</h4>
<ul>
    <li><a href="/radicals">Radicals List</a></li>
    <li><a href="/homophones">Homophones (same pinyin)</a></li>
    <li><a href="/words1000">Highest Frequency Words</a></li>
    <li><a href="/chars1000">Highest Frequency Characters</a></li>
</ul>
<h4 lang="en">'New HSK' Lists</h4>
<ul>
    <li><a href="/hskwords">HSK Words for 2012-2020</a></li>
    <li><a href="/hskchars">HSK Characters for 2012-2020</a></li>
    <li><a href="/hskwords2010">HSK Words for 2010 (outdated)</a></li>
    <li><a href="/hskchars2010">HSK Characters for 2010 (outdated)</a></li>
</ul>
<h4 lang="en">HSK List Comparisons</h4>
<ul>
    <li><a href="/hskwords20102020">Where the HSK 2010 words are in 2020</a></li>
    <li><a href="/hskchars20102020">Where the HSK 2010 characters are in 2020</a></li>
</ul>
<a href="/mandcomp">Mandarin Companion Vocabulary Analysis</a>""")
    results.append("""<p lang="en"><small><i>Page generated in {:1.6f} seconds</i></small></p>""".format(time.time() - start_time))
    results.append(page_footer)
    results.append("\n</body>\n</html>")
    return "\n".join(results)

@app.route('/pinyinfix', methods=['GET', 'PUT', 'POST'])
def handle_pinyinfix():
    start_time = time.time()
    defaultpinyin = ""
    pinyin = getform("pinyin", defaultpinyin)
    if len(pinyin)>100000:
        return "Sorry, that text is too big; It will consume too much server CPU time to process. If you want to set up this script on a dedicated server get in touch with alan@hskhsk.com"
    pinyinfix, countfixed = fixpinyin(pinyin)
    results = []
    results.append("""<html lang="zh-Hans">\n<head>""")
    results.append("<title>HSK\u4E1C\u897F - Pinyin Fixt</title>")
    results.append(allstyle)
    results.append("</head>\n<body>""")
    results.append("""<a href="http://hskhsk.com/analyse.html">HSK\u4E1C\u897F</a>""")
    results.append("""<a href="/">Scripts</a>""")
    results.append("""<a href="/sets">Set Operations</a>""")
    results.append("""<h1 class="compact">Fix pinyin problems <a class="arrowlink" href="javascript:toggle_visibility('mainhelp');"><small><small>(?)</small></small></a></h1>
<div id="mainhelp" class="inlinehelp"  style="max-width:500px;">
    <p>This tool cleans up some specific errors with pinyin text.</p>
    <p>The only errors currently fixed are to correct the caron accents with breve on vowels that take the third tone. For example \u0103 -> \u01CE.</p>
    <p>Other pages on this site may still erroneously use the caron and can be fixed by using this script.</p>
    <p>Enter your erroneous pinyin in the first textbox, and corrected pinyin will be output in the second textbox.</p>
</div>

<form method="POST" action="/pinyinfix">
    <p><textarea name="pinyin" cols="80" rows="8">{}</textarea></p>
    <p><input type="submit" value="    Go!    " /></p>
    <p><textarea name="pinyinfix" cols="80" rows="8">{}</textarea></p>
</form>""".format(pinyin, pinyinfix))
    if len(pinyin) > 0:
        if countfixed == 0:
            results.append("<p>There were no erroneous characters to fix</p>")
        elif countfixed == 1:
            results.append("<p>Fixed 1 erroneous character</p>")
        else:
            results.append("<p>Fixed {} erroneous characters</p>".format(countfixed))
    results.append("""<p><small><i>Page generated in {:1.6f} seconds</i></small></p>""".format(time.time() - start_time))
    results.append(page_footer)
    results.append("\n</body>\n</html>")
    return "\n".join(results)

@app.route('/hsk', methods=['GET', 'PUT', 'POST'])
def handle_hsk():
    return handle_root()

@app.route('/homophones', methods=['GET', 'PUT', 'POST'])
def handle_homophones():
    start_time = time.time()
    expand = getform("expand", "no")
    numchars = getform("chars", "2")
    tones = getform("tones", "no")
    hskwordsonly = getform("hsk", "no")
    cachekey = "homophones" + numchars + tones + hskwordsonly
    if page_not_cached(cachekey):
        numcharsint = int(numchars)
        init_resources()
        results = []
        results.append("""<html lang="zh-Hans">\n<head>""")
        results.append("<title>HSK\u4E1C\u897F\u8BCD\u5178 Homophones</title>")
        results.append(allstyle)
        results.append("</head>\n<body>")
        results.append("""<form method="get" action="/cidian">""")
        results.append("""<a href="http://hskhsk.com/word-lists">HSK\u4E1C\u897F</a>""")
        results.append("""<a href="/">Scripts</a>""")
        if expand == "yes":
            results.append("""<input type="hidden" name="expand" value="yes" />""")
        results.append("""<input type="text" name="q" value=""/><input type="submit" value="Go" />""")
        results.append("""<a href="/search">Advanced Search</a>""")
        results.append("""<a href="/radicals">Radicals</a> """)
        results.append("""</form>""")

        results.append("<div> Other word lengths: ")
        linkres = []
        for c in [1, 2, 3]:
            if c == numcharsint:
                linkres.append(str(c))
            else:
                linkres.append("""<a href="/homophones?chars={}&expand={}&tones={}&hsk={}">{}</a>""".format(c, expand, tones, hskwordsonly, c))
        results.append(", ".join(linkres))
        if expand == "yes":
            results.append("""[<a href="/homophones?chars={}&tones={}&hsk={}">collapse definitions</a>]""".format(numcharsint, tones, hskwordsonly))
        else:
            results.append("""[<a href="/homophones?chars={}&tones={}&hsk={}&expand=yes">expand definitions</a>]""".format(numcharsint, tones, hskwordsonly))
        if tones == "yes":
            results.append("""[<a href="/homophones?chars={}&expand={}&hsk={}">ignore tones</a>]""".format(numcharsint, expand, hskwordsonly))
        else:
            results.append("""[<a href="/homophones?chars={}&expand={}&hsk={}&tones=yes">match tones</a>]""".format(numcharsint, expand, hskwordsonly))
        if hskwordsonly == "yes":
            results.append("""[<a href="/homophones?chars={}&expand={}&tones={}">all words</a>]""".format(numcharsint, expand, tones))
        else:
            results.append("""[<a href="/homophones?chars={}&expand={}&tones={}&hsk=yes">HSK words only</a>]""".format(numcharsint, expand, tones))
        results.append("</div>")

        results.append("""<h3>{}-Character Homophones, {} Tones{}</h3>""".format(
                            numcharsint,
                            "Matching" if tones == "yes" else "Ignoring",
                            ", HSK Words Only" if hskwordsonly == "yes" else ""))
        found = False
        if tones == "yes":
            homophones = [] # ["pinyin", ... ]
            for pinyin, hanziset in tonenum_pinyin.items():
                if len(hanziset) >= 2:
                    randomhanzi = next(iter(hanziset))
                    hanzilen = len(randomhanzi)
                    if hanzilen == numcharsint:
                        homophones.append(pinyin)
            homophones.sort()
            for pinyin in homophones:
                nonvariants = set()
                for w in tonenum_pinyin[pinyin]:
                    if (    ((w not in variant_simp) or (len(variant_simp[w] & nonvariants) == 0))
                        and ((hskwordsonly == "no") or (w in hskwords[16])) ):
                        nonvariants.add(w)
                if len(nonvariants) >= 2:
                    found = True
                    results.append("""<div {}>""".format(""" style="margin-bottom: 10px;" """ if expand == "yes" else """class="paddedbox" """))
                    results.append("""<div style="font-weight: bold;"">{} <a class="arrowlink" href="/search?format=regex&min={}&max={}&pinyin={}{}{}">\u21D2</a></div>""".format(
                                   pinyin_numbers_to_tone_marks(pinyin),
                                   numcharsint,
                                   numcharsint,
                                   html.escape(pinyin),
                                   "&def=compact" if expand == "yes" else "",
                                   "&hsk1=t&hsk2=t&hsk3=t&hsk4=t&hsk5=t&hsk6=t" if hskwordsonly == "yes" else ""))
                    separator = "<br />" if expand == "yes" else chinese_comma_sep
                    results.append(separator.join(freqorder_word_link_hskcolour(nonvariants)))
                    results.append("""</div>""")
        else:
            homophones = [] # ["pinyin", ... ]
            for pinyin, hanziset in toneless_pinyin.items():
                if len(hanziset) >= 2:
                    randomhanzi = next(iter(hanziset))
                    hanzilen = len(randomhanzi)
                    if hanzilen == numcharsint:
                        homophones.append(pinyin)
            homophones.sort()
            for pinyin in homophones:
                nonvariants = set()
                for w in toneless_pinyin[pinyin]:
                    if (    ((w not in variant_simp) or (len(variant_simp[w] & nonvariants) == 0))
                        and ((hskwordsonly == "no") or (w in hskwords[16])) ):
                        nonvariants.add(w)
                if len(nonvariants) >= 2:
                    found = True
                    results.append("""<div {}>""".format(""" style="margin-bottom: 10px;" """ if expand == "yes" else """class="paddedbox" """))
                    results.append("""<div style="font-weight: bold;"">{} <a class="arrowlink" href="/search?format=regex&min={}&max={}&pinyin={}{}{}">\u21D2</a></div>""".format(
                                   pinyin,
                                   numcharsint,
                                   numcharsint,
                                   html.escape(pinyin.replace(" ", r"\d*")),
                                   "&def=compact" if expand == "yes" else "",
                                   "&hsk1=t&hsk2=t&hsk3=t&hsk4=t&hsk5=t&hsk6=t" if hskwordsonly == "yes" else ""))
                    separator = "<br />" if expand == "yes" else chinese_comma_sep
                    results.append(separator.join(freqorder_word_link_hskcolour(nonvariants)))
                    results.append("""</div>""")
        if not found:
            results.append("<i>There are no words...</i>")
        results.append("""<p><small><i>Page generated in {:1.6f}""".format(time.time() - start_time))
        set_page_cache(cachekey, "\n".join(results))
        return query_page_cache(cachekey) + " seconds.</i></small></p>\n" + page_footer + "</body>\n</html>"
    return query_page_cache(cachekey) + ", retrieved in {:1.6f} seconds.</i></small></p>\n".format(time.time() - start_time) + page_footer + "</body>\n</html>"

@app.route('/radicals', methods=['GET', 'PUT', 'POST'])
def handle_radicals():
    start_time = time.time()
    if page_not_cached("radicals"):
        init_resources()
        hsklevel = int(getform("hsk", 0)) # can be e.g. 12 and 14 etc.
        results = []
        results.append("""<html lang="zh-Hans">\n<head>""")
        results.append("<title>HSK\u4E1C\u897F\u8BCD\u5178 Radicals</title>")
        results.append(allstyle)
        results.append("</head>\n<body>")
        results.append("""<form method="get" action="/cidian">""")
        results.append("""<a href="http://hskhsk.com/word-lists">HSK\u4E1C\u897F</a>""")
        results.append("""<a href="/">Scripts</a>""")
        if getform("expand") == "yes":
            results.append("""<input type="hidden" name="expand" value="yes" />""")
        results.append("""<input type="text" name="q" value=""/><input type="submit" value="Go" />""")
        results.append("""<a href="/search">Advanced Search</a>""")
        results.append("""<a href="/radicals">Radicals</a> """)
        if getform("expand") == "yes":
            results.append("""[<a href="/radicals{}">collapse definitions</a>]""".format("" if hsklevel == 0 else "?hsk=" + getform("hsk")))
        else:
            results.append("""[<a href="/radicals?{}expand=yes">expand definitions</a>]""".format("" if hsklevel == 0 else "hsk=" + getform("hsk") + "&"))
        results.append("""</form>""")

        results.append("""<p>
Show HSK Characters by Radical:
<a href="/radicals?hsk=1{0}" class="hsk1">HSK 1</a>,
<a href="/radicals?hsk=2{0}" class="hsk2">HSK 2</a>,
<a href="/radicals?hsk=3{0}" class="hsk3">HSK 3</a>,
<a href="/radicals?hsk=4{0}" class="hsk4">HSK 4</a>,
<a href="/radicals?hsk=5{0}" class="hsk5">HSK 5</a>,
<a href="/radicals?hsk=6{0}" class="hsk6">HSK 6</a>,
<a href="/radicals?hsk=12{0}" class="hsk2">HSK 1-2</a>,
<a href="/radicals?hsk=13{0}" class="hsk3">HSK 1-3</a>,
<a href="/radicals?hsk=14{0}" class="hsk4">HSK 1-4</a>,
<a href="/radicals?hsk=15{0}" class="hsk5">HSK 1-5</a>,
<a href="/radicals?hsk=16{0}" class="hsk6">HSK 1-6</a>
</p>""".format("&expand=yes" if getform("expand") == "yes" else ""))

        if hsklevel != 0:
            if hsklevel < 10:
                results.append("""<h4><span class="hsk{0}">HSK {0}</span> Characters by Radical</h4>""".format(hsklevel))
            else:
                results.append("""<h4>HSK <span class="hsk{0}">{0}</span>-<span class="hsk{1}">{1}</span> Characters by Radical</h4>""".format(hsklevel//10, hsklevel%10))
            freqlist = [(query_radical_freq_index(r), r) for r in list(cc_radicals.keys())]
            freqlist.sort()
            # results.append("<table><tr>")
            for freq, radical in freqlist:
                radicalchars = cc_radicals[radical]
                hskradchars = radicalchars & hskchars[hsklevel]
                if len(hskradchars):
                    results.append("""<div class="paddedbox">""")
                    results.append("""<b>{}</b></br>""".format(hanzideflink(radical, radical, "none")))
                    separator = "<br />" if getform("expand") == "yes" else chinese_comma_sep
                    results.append(separator.join(freqorder_char_link_hskcolour(hskradchars)))
                    results.append("</div>")
            # results.append("</tr></table>")
        else:
            results.append("""<h4>Radicals</h4>""")
            separator = "<br />" if getform("expand") == "yes" else chinese_comma_sep
            results.append(separator.join(freqorder_radical_link(list(cc_radicals.keys()))))

        results.append("""<p><small><i>Page generated in {:1.6f}""".format(time.time() - start_time))
        set_page_cache("radicals", "\n".join(results))
        return query_page_cache("radicals") + " seconds.</i></small></p>\n" + page_footer + "</body>\n</html>"
    return query_page_cache("radicals") + ", retrieved in {:1.6f} seconds.</i></small></p>\n".format(time.time() - start_time) + page_footer + "</body>\n</html>"

@app.route('/mandcomp', methods=['GET', 'PUT', 'POST'])
def handle_mandcomp():
    start_time = time.time()
    if page_not_cached("mandcomp"):
        init_resources()
        results = []
        results.append("""<html lang="zh-Hans">\n<head>""")
        results.append("<title>Mandarin Companion Vocabulary Analysis</title>")
        results.append(allstyle)
        results.append("</head>\n<body>")
        results.append("""<form method="get" action="/cidian">""")
        results.append("""<a href="http://hskhsk.com/word-lists">HSK\u4E1C\u897F</a>""")
        results.append("""<a href="/">Scripts</a>""")
        if getform("expand") == "yes":
            results.append("""<input type="hidden" name="expand" value="yes" />""")
        results.append("""<input type="text" name="q" value=""/><input type="submit" value="Go" />""")
        results.append("""<a href="/search">Advanced Search</a>""")
        results.append("""<a href="/radicals">Radicals</a> """)
        if getform("expand") == "yes":
            results.append("""[<a href="/mandcomp">collapse definitions</a>]""")
        else:
            results.append("""[<a href="/mandcomp?expand=yes">expand definitions</a>]""")
        results.append("""</form>""")

        results.append("""<h3>Mandarin Companion Vocabulary Analysis</h3>""")

        results.append("""See <a href="http://mandarincompanion.com/">mandarincompanion.com</a> for more information about these graded Chinese readers.""")

        results.append("<hr />")
        mandcomp_appendset(results, 1, """Vocab for "The Secret Garden" """)
        mandcomp_appendset(results, 2, """Vocab for "Sherlock Holmes and the Red-Headed League" """)
        mandcomp_appendset(results, 3, """Vocab for "The Monkey's Paw" """)
        mandcomp_appendset(results, 4, """Vocab for "The Country of the Blind" """)
        mandcomp_appendset(results, 5, """Vocab for "The Sixty-Year Dream" """)
        results.append("<hr />")
        mandcomp_appendset(results, 105, """Vocab Used in Every Book""")
        mandcomp_appendset(results, 301, """Additional Vocab for "The Secret Garden" """)
        mandcomp_appendset(results, 302, """Additional Vocab for "Sherlock Holmes and the Red-Headed League" """)
        mandcomp_appendset(results, 303, """Additional Vocab for "The Monkey's Paw" """)
        mandcomp_appendset(results, 304, """Additional Vocab for "The Country of the Blind" """)
        mandcomp_appendset(results, 305, """Additional Vocab for "The Sixty-Year Dream" """)
        results.append("<hr />")
        mandcomp_appendset(results, 201, """Vocab Used Only in "The Secret Garden" """)
        mandcomp_appendset(results, 202, """Vocab Used Only in "Sherlock Holmes and the Red-Headed League" """)
        mandcomp_appendset(results, 203, """Vocab Used Only in "The Monkey's Paw" """)
        mandcomp_appendset(results, 204, """Vocab Used Only in "The Country of the Blind" """)
        mandcomp_appendset(results, 205, """Vocab Used Only in "The Sixty-Year Dream" """)
        results.append("<hr />")
        mandcomp_appendset(results, 101, """Vocab Used in Exactly One Book""")
        mandcomp_appendset(results, 102, """Vocab Used in Exactly Two Books""")
        mandcomp_appendset(results, 103, """Vocab Used in Exactly Three Books""")
        mandcomp_appendset(results, 104, """Vocab Used in Exactly Four Books""")
        results.append("<hr />")
        mandcomp_appendset(results, 100, "Whole Series Vocab")

        results.append("""<p><small><i>Page generated in {:1.6f}""".format(time.time() - start_time))
        set_page_cache("mandcomp", "\n".join(results))
        return query_page_cache("mandcomp") + " seconds.</i></small></p>\n" + page_footer + "</body>\n</html>"
    return query_page_cache("mandcomp") + ", retrieved in {:1.6f} seconds.</i></small></p>\n".format(time.time() - start_time) + page_footer + "</body>\n</html>"

def mandcomp_appendset(results, wordlist, title):
    results.append("""<h4>{} ({} Words) <a class="arrowlink" title="Download Pleco Flashcards" href="/flash?card=pleco&mandcomp={}">&dArr;</a></h4>""".format(title, len(mc_words[wordlist]), wordlist))
    separator = "<br />" if getform("expand") == "yes" else chinese_comma_sep
    results.append(separator.join(freqorder_word_link_hskcolour(mc_words[wordlist])))

@app.route('/dict', methods=['GET', 'PUT', 'POST'])
def handle_dict():
    return handle_cidian()

@app.route('/cidian', methods=['GET', 'PUT', 'POST'])
def handle_cidian():
    start_time = time.time()
    init_resources()
    results = []
    query = getform("q")
    titlebit = ""
    if query != "":
        titlebit = ": " + query
    results.append("""<html lang="zh-Hans">\n<head>""")
    results.append("<title>HSK\u4E1C\u897F\u8BCD\u5178{}</title>".format(titlebit))
    results.append(allstyle)
    results.append("</head>\n<body>")
    results.append("""<form method="get" action="/cidian">""")
    results.append("""<a href="http://hskhsk.com/word-lists">HSK\u4E1C\u897F</a> """)
    results.append("""<a href="/">Scripts</a> """)
    if getform("expand") == "yes":
        results.append("""<input type="hidden" name="expand" value="yes" />""")
    results.append("""<input type="text" name="q" value="{}"/><input type="submit" value="Go" />""".format(query))
    results.append("""<a href="/search">Advanced Search</a> """)
    results.append("""<a href="/radicals">Radicals</a> """)
    expandcollapseentry = len(results) # a bit ugly, keep this for later in case we need to update it
    if getform("expand") == "yes":
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
        results.append("""<table><tr><td valign="top" align="left">""")
        results.append("""<span class="bighanzi">{}</span>""".format("".join([hanzideflink(q, q, "none") for q in query])))
        results.append("""</td><td valign="top" align="left" width="90%">""")

        results.append("<b>")
        results.append(get_full_hanzi_info(query, 30))
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
            results.append("""<span style="font-weight: bold;"">{} <a class="arrowlink" href="/search?component={}&min=1&max=1{}">\u21D2</a></span>""".format(hanzideflink(q, q, "char"), html.escape(q), "&def=compact" if getform("expand") == "yes" else ""))
            results = results + get_char_composition(q)
            results.append("""</div>""")
        results.append("""</div>""")

        results.append("""<h4>Character Compounds</h4>""")
        results.append("""<div class="outerbox">""")
        for q in querynodupes:
            results.append("""<div class="paddedbox">""")
            results.append("""<span style="font-weight: bold;"">{} <a class="arrowlink" href="/search?compound={}&min=1&max=1{}">\u21D2</a></span>""".format(hanzideflink(q, q, "char"), html.escape(q), "&def=compact" if getform("expand") == "yes" else ""))
            results = results + get_char_composes(q)
            results.append("""</div>""")
        results.append("""</div>""")

        results.append("""<h4>Word Compounds</h4><p>""")
        results.append("""<div class="outerbox">""")
        for q in querynodupes:
            results.append("""<div class="paddedbox">""")
            results.append("""<span style="font-weight: bold;"">{} <a class="arrowlink" href="/search?hanzi=*{}*{}">\u21D2</a></span><br />""".format(hanzideflink(q, q, "char"), html.escape(q), "&def=compact" if getform("expand") == "yes" else ""))
            separator = "<br />" if getform("expand") == "yes" else chinese_comma_sep
            if q in char_componentof:
                results.append(separator.join(freqorder_word_link_hskcolour(char_componentof[q])))
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
        pywords = get_words_from_pinyin(query)
        if len(pywords):
            foundresult = True
            results.append("""<h4>Pinyin Results for "{}"</h4>""".format(query))
            for c in freqorder_word(pywords):
                results.append("""{} {}<br />""".format(hanzideflink(c, c, "auto"), ("&nbsp;" * 8) + get_compact_hanzi_info(c, 80)))

        enwords = get_words_from_english(query)
        if len(enwords):
            foundresult = True
            results.append("""<h4>Definition Results for "{}"</h4>""".format(query))
            for c in freqorder_word(enwords):
                results.append("""{} {}<br />""".format(hanzideflink(c, c, "auto"), ("&nbsp;" * 8) + get_compact_hanzi_info(c, 80)))

    if (not foundresult) and (len(query) < 50 or getform("expand") == "yes") and (getform("expand") != "no"):
        # a bit ugly, but night have to update the earlier link to say 'collapse'
        results[expandcollapseentry] = """[<a href="/cidian?expand=no&q={}">collapse definitions</a>]""".format(html.escape(query))
        foundresult = True
        validwords = allvalidwords(query)
        results.append("""<h4>All Possible Words</h4>""".format(query))
        for word in validwords:
            results.append("""{} {}<br />""".format(hanzideflink(word, word, "auto"), ("&nbsp;" * 8) + get_compact_hanzi_info(word, 80)))

    if not foundresult:
        foundresult = True
        annotatewords(results, query)

    results.append("""<p><small><i>Page generated in {:1.6f} seconds</i></small></p>""".format(time.time() - start_time))
    results.append(page_footer)
    results.append("\n</body>\n</html>")
    return "\n".join(results)

@app.route('/search', methods=['GET', 'PUT', 'POST'])
def handle_search():
    start_time = time.time()
    init_resources()

    hsk1 = "checked" if getform("hsk1") else ""
    hsk2 = "checked" if getform("hsk2") else ""
    hsk3 = "checked" if getform("hsk3") else ""
    hsk4 = "checked" if getform("hsk4") else ""
    hsk5 = "checked" if getform("hsk5") else ""
    hsk6 = "checked" if getform("hsk6") else ""
    mandcomp = int(getform("mandcomp")) if getform("mandcomp") else 0


    pinyin = getform("pinyin")
    hanzi = getform("hanzi")
    component = getform("component")
    compound = getform("compound")
    minlength = int(getform("min", "1"))
    maxlength = int(getform("max", "10"))

    defoff = ""
    deffull = ""
    defcompact = ""
    definition = getform("def", "off")
    if definition == "compact":
        defcompact = "checked"
    elif definition == "full":
        deffull = "checked"
    else:
        defoff = "checked"

    formatwildcard = ""
    formatregex = ""
    searchformat = getform("format", "wildcard")
    if searchformat == "wildcard":
        formatwildcard = "checked"
    else:
        formatregex = "checked"

    sortfreq = ""
    sortpinyin = ""
    sorthanzi = ""
    sort = getform("sort", "freq")
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
    results.append("""<a href="http://hskhsk.com/analyse.html">HSK\u4E1C\u897F</a>""")
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
                                      mandcomp)

    if len(resultset):
        results.append("<h4>Results</h4>")
        params = request.query_string
        results.append("<p><small>Download flashcards: <a href='/flash?card=pleco&{0}'>Pleco</a> <a href='/flash?card=sticky&{0}'>StickyStudy</a></small></p>".format(params))
        results.append(word_link_hskcolour_search(resultset, definition))

    results.append("""<p><small><i>Page generated in {:1.6f} seconds</i></small></p>""".format(time.time() - start_time))
    results.append(page_footer)
    results.append("\n</body>\n</html>")
    return "\n".join(results)

@app.route('/flash')
def handle_flash():
    init_resources()

    searchformat = getform("format", "wildcard")
    hsk1 = "checked" if getform("hsk1") else ""
    hsk2 = "checked" if getform("hsk2") else ""
    hsk3 = "checked" if getform("hsk3") else ""
    hsk4 = "checked" if getform("hsk4") else ""
    hsk5 = "checked" if getform("hsk5") else ""
    hsk6 = "checked" if getform("hsk6") else ""
    mandcomp = int(getform("mandcomp")) if getform("mandcomp") else ""
    pinyin = getform("pinyin")
    hanzi = getform("hanzi")
    component = getform("component")
    compound = getform("compound")
    minlength = int(getform("min", "1"))
    maxlength = int(getform("max", "4"))
    fileformat = getform("card", "pleco")
    sort = getform("sort", "freq")

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
                                      mandcomp)

    if len(resultset):
        results = flashcard_list(resultset, fileformat)
        response= make_response("\r\n".join(results))
        response.headers['Content-Disposition'] = 'attachment; filename=' + "hskhsk-" + fileformat + "-flascards.txt"
        return response
    else:
        return "No Results Found"

def flashcard_list(resultset, fileformat):
    results = []
    for word in resultset:
        line = []
        trad = cedict_traditional[word][0] if word in cedict_traditional else ""
        toned = ", ".join(set(cedict_pinyintonemarks[word])) if word in cedict_pinyintonemarks else ""
        numbered = toned # TODO: keep or generate numbered pinyin...
        definition = get_dictionary_entry(word)
        if fileformat == "sticky":
            line.append(word)
            line.append(trad)
            line.append(numbered)
            line.append(toned)
            line.append(definition)
        else:
            if len(trad):
                line.append(word + "[" + trad + "]")
            else:
                line.append(word)
            line.append(toned)
            line.append(definition)
        results.append("\t".join(line))
    return results

def search_to_re(text):
    return "^" + (text.replace("\00D7", "*")
                      .replace("FF1F", "?")
                      .replace("*", ".*")
                      .replace("+", ".+")
                      .replace("?", ".?"))  + "$"

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
                          mandcomp):
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
        pinyin_re = re.compile(pinyin.lower().replace("5", "0") if searchformat == "regex" else search_to_re(pinyin.lower()))
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
        hskrestrict |= hskwords[1]
    if len(hsk2):
        hskrestrict |= hskwords[2]
    if len(hsk3):
        hskrestrict |= hskwords[3]
    if len(hsk4):
        hskrestrict |= hskwords[4]
    if len(hsk5):
        hskrestrict |= hskwords[5]
    if len(hsk6):
        hskrestrict |= hskwords[6]
    if mandcomp:
        hskrestrict |= mc_words[mandcomp]

    if not (len(component) or len(compound) or len(pinyin) or len(hanzi)):
        resultset = hskrestrict
    else:
        if len(hskrestrict):
            resultset &= hskrestrict

    if sort == "freq":
        freqlist = [(query_word_freq_index(h), h) for h in resultset]
        freqlist.sort()
        resultlist = [h for freq, h in freqlist]
    elif sort == "pinyin":
        pinyinlist = [(cedict_pinyintonenum[h] if h in cedict_pinyintonenum else h, h) for h in resultset]
        pinyinlist.sort()
        resultlist = [h for py, h in pinyinlist]
    else:
        resultlist = [h for h in resultset]
        resultlist.sort()

    return resultlist

page_cache = {}
def query_page_cache(page):
    return page_cache[page + getform("expand") + getform("hsk")]
def set_page_cache(page, data):
    page_cache[page + getform("expand") + getform("hsk")] = data
def page_not_cached(page):
    return (page + getform("expand") + getform("hsk")) not in page_cache

@app.route('/hskwords', methods=['GET', 'PUT', 'POST'])
@app.route('/hskwords2012', methods=['GET', 'PUT', 'POST'])
@app.route('/hskwords2013', methods=['GET', 'PUT', 'POST'])
@app.route('/hskwords2014', methods=['GET', 'PUT', 'POST'])
@app.route('/hskwords2015', methods=['GET', 'PUT', 'POST'])
@app.route('/hskwords2016', methods=['GET', 'PUT', 'POST'])
@app.route('/hskwords2017', methods=['GET', 'PUT', 'POST'])
@app.route('/hskwords2018', methods=['GET', 'PUT', 'POST'])
@app.route('/hskwords2019', methods=['GET', 'PUT', 'POST'])
@app.route('/hskwords2020', methods=['GET', 'PUT', 'POST'])
def handle_hskwords():
    pagetitle = "HSK Words for 2012-2020"
    extralink = ""
    return hskvocablist('/hskwords', pagetitle, extralink, "words", "/hskchars", "characters", hskwords, freqorder_word_link_table)

@app.route('/hskwords2010', methods=['GET', 'PUT', 'POST'])
@app.route('/hskwords2011', methods=['GET', 'PUT', 'POST'])
@app.route('/hskwords2012', methods=['GET', 'PUT', 'POST'])
def handle_hskwords2010():
    pagetitle = "HSK Words for 2010 (outdated)"
    extralink = """ <a href="/hskwords">HSK Words for 2012-2020</a>"""
    return hskvocablist('/hskwords2010', pagetitle, extralink, "words", "/hskchars2010", "characters", hskwords2010, freqorder_word_link_table)

@app.route('/hskchars', methods=['GET', 'PUT', 'POST'])
@app.route('/hskchars2012', methods=['GET', 'PUT', 'POST'])
@app.route('/hskchars2013', methods=['GET', 'PUT', 'POST'])
@app.route('/hskchars2014', methods=['GET', 'PUT', 'POST'])
@app.route('/hskchars2015', methods=['GET', 'PUT', 'POST'])
@app.route('/hskchars2016', methods=['GET', 'PUT', 'POST'])
@app.route('/hskchars2017', methods=['GET', 'PUT', 'POST'])
@app.route('/hskchars2018', methods=['GET', 'PUT', 'POST'])
@app.route('/hskchars2019', methods=['GET', 'PUT', 'POST'])
@app.route('/hskchars2020', methods=['GET', 'PUT', 'POST'])
def handle_hskchars():
    pagetitle = "HSK Characters for 2012-2020"
    extralink = ""
    return hskvocablist('/hskchars', pagetitle, extralink, "characters", "/hskwords", "words", hskchars, freqorder_char_link_table)

@app.route('/hskchars2010', methods=['GET', 'PUT', 'POST'])
@app.route('/hskchars2011', methods=['GET', 'PUT', 'POST'])
@app.route('/hskchars2012', methods=['GET', 'PUT', 'POST'])
def handle_hskchars2010():
    pagetitle = "HSK Characters for 2010 (outdated)"
    extralink = """ <a href="/hskchars">HSK Characters 2012-2020</a>"""
    return hskvocablist('/hskchars2010', pagetitle, extralink, "characters", "/hskwords2010", "words", hskchars2010, freqorder_char_link_table)

def hskvocablist(thislink, pagetitle, extralink, thisitem, otherlink, otheritem, vocab, linkfunction):
    start_time = time.time()
    if page_not_cached(thislink):
        init_resources()
        results = []
        results.append("""<html lang="zh-Hans">\n<head>""")
        results.append("<title>HSK\u4E1C\u897F - {}</title>".format(pagetitle))
        results.append(allstyle)
        results.append("</head>\n<body>")
        results.append("""<a href="http://hskhsk.com/word-lists">HSK\u4E1C\u897F</a>""")
        results.append("""<a href="/">Scripts</a>""")
        results.append("""<a href="{}{}">HSK {}</a>""".format(otherlink, "?expand=yes" if getform("expand") == "yes" else "", otheritem[0].upper() + otheritem[1:]))
        results.append(extralink)
        results.append("""[<a href="{}">collapse definitions</a>]""".format(thislink) if getform("expand") == "yes" else """[<a href="{}?expand=yes">expand definitions</a>]""".format(thislink))
        results.append("<h2>{}</h2>".format(pagetitle))
        if getform("expand") != "yes":
            results.append("""<p>For definitions hover over or click on the {}, or <a href="{}?expand=yes">expand definitions</a>.</p>""".format(thisitem, thislink))
        for i in range(1, 7):
            results.append("""<h4><a class="hsk{0}" name="hsk{0}">HSK {0} {1}</a></h4>""".format(i, thisitem[0].upper() + thisitem[1:]))
            if getform("expand") == "yes":
                results.append("<table><tr><td>")
                results.append("</td></tr><tr><td>".join(linkfunction(vocab[i])))
                results.append("</td></tr></table>")
            else:
                results.append(chinese_comma_sep.join(linkfunction(vocab[i])))
        results.append("""<p><small><i>Page generated in {:1.6f}""".format(time.time() - start_time))
        set_page_cache(thislink, "\n".join(results))
        return query_page_cache(thislink)+" seconds.</i></small></p>\n" + page_footer + "</body>\n</html>"
    return query_page_cache(thislink) + ", retrieved in {:1.6f} seconds.</i></small></p>\n".format(time.time() - start_time) + page_footer + "</body>\n</html>"

@app.route('/words1000', methods=['GET', 'PUT', 'POST'])
def handle_words1000():
    start_time = time.time()
    if page_not_cached("/words1000"):
        init_resources()
        results = []
        results.append("""<html lang="zh-Hans">\n<head>""")
        results.append("<title>HSK\u4E1C\u897F - Highest Frequency Words</title>")
        results.append(allstyle)
        results.append("</head>\n<body>")
        results.append("""<a href="http://hskhsk.com/word-lists">HSK\u4E1C\u897F</a>""")
        results.append("""<a href="/">Scripts</a>""")
        results.append("""<a href="/chars1000{}">Highest Frequency Characters</a>""".format("?expand=yes" if getform("expand") == "yes" else ""))
        results.append("""[<a href="words1000">collapse definitions</a>]""" if getform("expand") == "yes" else """[<a href="words1000?expand=yes">expand definitions</a>]""")
        results.append("<h2>Highest Frequency Words</h2>")
        if getform("expand") != "yes":
            results.append("<p>For definitions hover over or click on the word, or select 'expand definitions'.</p>")
        separator = "<br />" if getform("expand") == "yes" else chinese_comma_sep
        topwords = [word for (freq, word) in word_freq_ordered[:1000] ]
        results.append(separator.join(freqorder_word_link_hskcolour(topwords)))
        results.append("""<p><small><i>Page generated in {:1.6f}""".format(time.time() - start_time))
        set_page_cache("/words1000", "\n".join(results))
        return query_page_cache("/words1000")+" seconds.</i></small></p>\n" + page_footer + "</body>\n</html>"
    return query_page_cache("/words1000") + ", retrieved in {:1.6f} seconds.</i></small></p>\n".format(time.time() - start_time) + page_footer + "</body>\n</html>"

@app.route('/chars1000', methods=['GET', 'PUT', 'POST'])
def handle_chars1000():
    start_time = time.time()
    if page_not_cached("/chars1000"):
        init_resources()
        results = []
        results.append("""<html lang="zh-Hans">\n<head>""")
        results.append("<title>HSK\u4E1C\u897F - Highest Frequency Characters</title>")
        results.append(allstyle)
        results.append("</head>\n<body>")
        results.append("""<a href="http://hskhsk.com/word-lists">HSK\u4E1C\u897F</a>""")
        results.append("""<a href="/">Scripts</a>""")
        results.append("""<a href="/words1000{}">Highest Frequency Words</a>""".format("?expand=yes" if getform("expand") == "yes" else ""))
        results.append("""[<a href="chars1000">collapse definitions</a>]""" if getform("expand") == "yes" else """[<a href="chars1000?expand=yes">expand definitions</a>]""")
        results.append("<h2>Highest Frequency Characters</h2>")
        if getform("expand") != "yes":
            results.append("<p>For definitions hover over or click on the character, or select 'expand definitions'.</p>")
        separator = "<br />" if getform("expand") == "yes" else chinese_comma_sep
        topchars = [char for (freq, char) in char_freq_ordered[:1000] ]
        results.append(separator.join(freqorder_char_link_hskcolour(topchars)))
        results.append("""<p><small><i>Page generated in {:1.6f}""".format(time.time() - start_time))
        set_page_cache("/chars1000", "\n".join(results))
        return query_page_cache("/chars1000")+" seconds.</i></small></p>\n" + page_footer + "</body>\n</html>"
    return query_page_cache("/chars1000") + ", retrieved in {:1.6f} seconds.</i></small></p>\n".format(time.time() - start_time) + page_footer + "</body>\n</html>"

@app.route('/hskwords20102012', methods=['GET', 'PUT', 'POST'])
@app.route('/hskwords20102013', methods=['GET', 'PUT', 'POST'])
@app.route('/hskwords20102014', methods=['GET', 'PUT', 'POST'])
@app.route('/hskwords20102015', methods=['GET', 'PUT', 'POST'])
@app.route('/hskwords20102016', methods=['GET', 'PUT', 'POST'])
@app.route('/hskwords20102017', methods=['GET', 'PUT', 'POST'])
@app.route('/hskwords20102018', methods=['GET', 'PUT', 'POST'])
@app.route('/hskwords20102019', methods=['GET', 'PUT', 'POST'])
@app.route('/hskwords20102020', methods=['GET', 'PUT', 'POST'])
def handle_hskwords20102012():
    return hskvocabdiff("/hskwords2010", "/hskwords2020", "/hskwords20102020", "words", "/hskchars20102020", "characters", hskwords2010, hskwords, freqorder_word_link)

@app.route('/hskchars20102012', methods=['GET', 'PUT', 'POST'])
@app.route('/hskchars20102013', methods=['GET', 'PUT', 'POST'])
@app.route('/hskchars20102014', methods=['GET', 'PUT', 'POST'])
@app.route('/hskchars20102015', methods=['GET', 'PUT', 'POST'])
@app.route('/hskchars20102016', methods=['GET', 'PUT', 'POST'])
@app.route('/hskchars20102017', methods=['GET', 'PUT', 'POST'])
@app.route('/hskchars20102018', methods=['GET', 'PUT', 'POST'])
@app.route('/hskchars20102019', methods=['GET', 'PUT', 'POST'])
@app.route('/hskchars20102020', methods=['GET', 'PUT', 'POST'])
def handle_hskchars20102012():
    return hskvocabdiff("/hskchars2010", "/hskchars2020", "/hskchars20102020", "characters", "/hskwords20102020", "words", hskchars2010, hskchars, freqorder_char_link)

def hskvocabdiff(oldlink, newlink, thislink, thisitem, otherlink, otheritem, oldvocab, newvocab, linkfunction):
    start_time = time.time()
    if page_not_cached(thislink):
        init_resources()
        results = []
        results.append("""<html lang="zh-Hans">\n<head>""")
        results.append("<title>HSK\u4E1C\u897F - Where the HSK 2010 {} are in 2012-2020</title>".format(thisitem[0].upper() + thisitem[1:]))
        results.append(allstyle)
        results.append("</head>\n<body>")
        results.append("""<a href="http://hskhsk.com/word-lists">HSK\u4E1C\u897F</a>""")
        results.append("""<a href="/">Scripts</a>""")
        results.append("""<a href="{}">Where the HSK 2010 {} are in 2012-2020</a>""".format(otherlink, otheritem[0].upper() + otheritem[1:]))
        results.append("<h3>HSK 2010 {} that changed level in 2012-2020</h3>".format(thisitem[0].upper() + thisitem[1:]))
        results.append("""<p>This table shows the {0} in the New HSK 2010 that changed level when the word lists were revised
in 2012 (also valid to date as of 2020), {0} that didn't change level are shown below.
For definitions hover over the characters, or try clicking on almost anything.</p>
<table border="1" style="border-collapse:collapse;" cellpadding="2em" cellspacing="0">
<tr><th rowspan=2 colspan=2 style="background-color: #FFFFFF;"></th><th colspan=7><a href="{1}" class="hsk0">HSK 2012-2020</a></th></tr>
<tr>""".format(thisitem, newlink))
        for i in range(1, 7):
            results.append("""<th><div style="white-space: nowrap;">&nbsp;&nbsp;&nbsp;&nbsp;<a href="{}#hsk{}" class="hsk{}">HSK {}</a>&nbsp;&nbsp;&nbsp;&nbsp;</div></th>""".format(newlink, i, i, i))
        results.append("""<th><div class="hsk0" style="white-space: nowrap;">&nbsp;&nbsp;&nbsp;&nbsp;Non-HSK&nbsp;&nbsp;&nbsp;&nbsp;</div></th></tr>""")
        for old in range(1, 8):
            results.append("<tr>")
            if old == 1:
                results.append("""<th rowspan=7><a href="{}" class="hsk0">HSK 2010</a></th>""".format(oldlink))
            if old == 7:
                results.append("""<th><div style="white-space: nowrap;">Non-HSK</div></th>""")
            else:
                results.append("""<th><div style="white-space: nowrap;"><a href="{}#hsk{}" class="hsk{}">HSK {}</a></div></th>""".format(oldlink, old, old, old))
            for new in range(1, 8):
                if old == new:
                    if old >= 1 and old <= 6:
                        results.append("""<td class="hsk{0}light" onClick="document.location.href='#hsk{0}';" onmouseover="this.style.cursor='pointer';"> </td>""".format(old))
                    else:
                        results.append("""<td class="hsk0light"></td>""")
                else:
                    if old == 7:
                        somehanzi = newvocab[new] - oldvocab[16]
                    elif new == 7:
                        somehanzi = oldvocab[old] - newvocab[16]
                    else:
                        somehanzi = (oldvocab[old] & newvocab[new]) - newvocab[old] # add the set subtract to account for case where word exists at multiple levels
                    results.append("<td>")
                    separator = "<br />" if getform("expand") == "yes" else chinese_comma_sep
                    results.append(separator.join(linkfunction(somehanzi)))
                    results.append("</td>")
            results.append("</tr>")
        results.append("</table>")

        results.append("<h3>HSK 2010 {} that didn't change level in 2012-2020</h3>".format(thisitem[0].upper() + thisitem[1:]))
        for level in range(1, 7):
            results.append("""<h4><a class="hsk{0}" name="hsk{0}">HSK {0} {1} that didn't change level</a></h4>""".format(level, thisitem[0].upper() + thisitem[1:]))
            somehanzi = newvocab[level] & oldvocab[level]
            separator = "<br />" if getform("expand") == "yes" else chinese_comma_sep
            results.append(separator.join(linkfunction(somehanzi)))

        results.append("""<p><small><i>Page generated in {:1.6f}""".format(time.time() - start_time))
        set_page_cache(thislink, "\n".join(results))
        return query_page_cache(thislink) + " seconds.</i></small></p>\n" + page_footer + "</body>\n</html>"
    return query_page_cache(thislink) + ", retrieved in {:1.6f} seconds.</i></small></p>\n".format(time.time() - start_time) + page_footer + "</body>\n</html>"

@app.route('/hanzi', methods=['GET', 'PUT', 'POST'])
def handle_hanzi():
    start_time = time.time()
    defaultistrue = "true"
    if getform("ignoredefaults", ""):
        defaultistrue = ""
    wordfreqchecked = "checked" if getform("analysevocab", defaultistrue) else ""
    hskanalwordschecked = "checked" if getform("analysehskwords", defaultistrue) else ""
    hskanalcharschecked = "checked" if getform("analysehskchars") else ""
    hskwordschecked = "checked" if getform("suggesthskwords") else ""
    hskcharschecked = "checked" if getform("suggesthskchars") else ""
    freqwordschecked = "checked" if getform("suggestwords") else ""
    freqwordsrechecked = "checked" if getform("suggestwordsreuse") else ""
    freqcharschecked = "checked" if getform("suggestchars") else ""
    annotatewordschecked = "checked" if getform("annotatewords") else ""
    annotatecharschecked = "checked" if getform("annotatechars") else ""
    outputcommasepchecked = "checked" if getform("outputcommasep") else ""
    addfreqindexchecked = "checked" if getform("addfreqindex", defaultistrue) else ""
    addfreqvaluechecked = "checked" if getform("addfreqvalue") else ""

    oneperlinechecked = ""
    commasepchecked = ""
    blockchecked = "checked" if getform("format") == "block" else ""
    commasepchecked = "checked" if getform("format") == "commasep" else ""
    if blockchecked == "" and commasepchecked == "":
        oneperlinechecked = "checked"

    defaulthanzi = ""
    hanzi = getform("hanzi", defaulthanzi)
    if blockchecked and len(hanzi)>10000:
        return "Sorry, that text is too big; It will consume too much server CPU time to process. If you want to set up this script on a dedicated server get in touch with alan@hskhsk.com"
    results = []
    results.append("""<html lang="zh-Hans">\n<head>""")
    results.append("<title>HSK\u4E1C\u897F - Analyse Your \u6C49\u5B57 Vocabulary/Text</title>")
    results.append(allstyle)
    results.append("""<script>function outputcommaclick() {
        var c = document.getElementsByName("outputcommasep")[0].checked;
        document.getElementsByName("addfreqindex")[0].disabled = c;
        document.getElementsByName("addfreqvalue")[0].disabled = c;
    }
    </script>""")
    results.append("</head>")
    results.append("""<body onload="outputcommaclick();">""")
    results.append("""<a href="http://hskhsk.com/analyse.html">HSK\u4E1C\u897F</a>""")
    results.append("""<a href="/">Scripts</a>""")
    results.append("""<a href="/sets">Set Operations</a>""")
    results.append("""<h2 class="compact">Analyse Your \u6C49\u5B57 <a class="arrowlink" href="javascript:toggle_visibility('mainhelp');"><small><small>(?)</small></small></a></h2>
<div id="mainhelp" class="inlinehelp">
    <p>The purpose of this tool is to analyse a Chinese vocabulary list or block of Chinese text, to give information about the words and characters it contains.</p>
    <p>See the (?) info buttons below below for more information about how to use the various features of this tool.</p>
</div>

<form method="POST" action="/hanzi">
<input type='hidden' value='true' name='ignoredefaults'>
<table>
    <tr><td valign="top">
        <h4 class="compact">Vocabulary Actions <a class="arrowlink" href="javascript:toggle_visibility('vocabactionshelp');"><small>(?)</small></a></h4>

        <div id="vocabactionshelp" class="inlinehelp">
<p>Select the actions to be performed on the inputted text or vocabulary list.</p>
<p>The 'analyse' functions will give you statistics such as word counts, and for the HSK options how many words/characters you know at each HSK level.</p>
<p>The 'suggest' options show how the highest frequency words or characters that you don't know.</p>
        </div>

        <div class="indent"><input type="checkbox" name="analysevocab" value="true" {}>Analyse words/characters</input></div>
        <div class="indent"><input type="checkbox" name="analysehskwords" value="true" {}>Analyse HSK words</input></div>
        <div class="indent"><input type="checkbox" name="analysehskchars" value="true" {}>Analyse HSK characters</input></div>
        <div class="indent"><input type="checkbox" name="suggesthskwords" value="true" {}>Suggest HSK words</input></div>
        <div class="indent"><input type="checkbox" name="suggesthskchars" value="true" {}>Suggest HSK characters</input></div>
        <div class="indent"><input type="checkbox" name="suggestwords" value="true" {}>Suggest words</input></div>
        <div class="indent"><input type="checkbox" name="suggestwordsreuse" value="true" {}>Suggest words using input characters</input></div>
        <div class="indent"><input type="checkbox" name="suggestchars" value="true" {}>Suggest characters</input></div>
    </td>
    <td valign="top">
        <h4 class="compact">Annotated Version <a class="arrowlink" href="javascript:toggle_visibility('annotationactionshelp');"><small>(?)</small></a></h4>

        <div id="annotationactionshelp" class="inlinehelp">
<p>These options will output a version of your source text with popup information giving HSK levels, frequency stroke and radical information, etc.</p>
<p>The words/characters are also clickable, with the links taking you to a full dictionary entry. In addition, words/characters are coloured by HSK level.</p>
        </div>

        <div class="indent"><input type="checkbox" name="annotatewords" value="true" {}>Annotate words</input></div>
        <div class="indent"><input type="checkbox" name="annotatechars" value="true" {}>Annotate characters</input></div>

        <h4 class="compact">Input Options <a class="arrowlink" href="javascript:toggle_visibility('inputoptionshelp');"><small>(?)</small></a></h4>

        <div id="inputoptionshelp" class="inlinehelp">
<p>Choose one word/character per line when the input is a vocabulary list from Skritter or a flashcard text file. Anything after first whitespace on each line ignored.</p>
<p>Comma/whitespace separated will use the characters ,;| or any whitespace to separate the words in your input.</p>
<p>If pasting text from a web page or document use the 'Big block of text' option. This option is less precise, as word breaks have to be determined by this tool.</p>
        </div>

        <div class="indent"><input type="radio" name="format" value="oneperline" {}>One word/character per line</input></div>
        <div class="indent"><input type="radio" name="format" value="commasep" {}>Comma/whitespace separated</input></div>
        <div class="indent"><input type="radio" name="format" value="block" {}>Big block of text</input></div>

        <h4 class="compact">Output List Options <a class="arrowlink" href="javascript:toggle_visibility('outputoptionshelp');"><small>(?)</small></a></h4>

        <div id="outputoptionshelp" class="inlinehelp">
<p>The Comma Separated option will output comma separated words/characters, with no frequency information (the other two options will be ignored).</p>
<p>The other two otions add frequency information to the listboxes of hanzi characters that are output.</p>
<p>With the frequency index, 1 is the highest frequency word/character, and higher values are less frequent.</p>
<p>The raw word/character frequency is the actual frequency reported by SUBTLEX-CH, with higher values being more
frequent, which helps to understand the relative frequency of each character.</p>
        </div>

        <div class="indent"><input type="checkbox" name="outputcommasep" value="true" {} onclick="outputcommaclick()">Comma Separated</input></div>
        <div class="indent"><input type="checkbox" name="addfreqindex" value="true" {}>Add frequency index</input></div>
        <div class="indent"><input type="checkbox" name="addfreqvalue" value="true" {}>Add raw frequency</div>
    </td></tr>
</table>
<h4 class="compact">Input your simpflified Chinese here <a class="arrowlink" href="javascript:toggle_visibility('textinputhelp');"><small>(?)</small></a></h4>

<div id="textinputhelp" class="inlinehelp" style="max-width:500px;">
    <p>This edit box is for the vocabulary list or block of text that you wish to analyse. Choose the format of your list using by selecting the appropriate value from the 'Input Options' section above.</p>
    <p>To help to resolve ambiguous words when analysing a block of text, place a | character (vertical bar) between words.</p>
</div>

<textarea name="hanzi" cols="80" rows="15">{}</textarea><br />
<input type="submit" value="    Go!    " /></form>
    """.format(wordfreqchecked, hskanalwordschecked, hskanalcharschecked, hskwordschecked, hskcharschecked, freqwordschecked, freqwordsrechecked, freqcharschecked, annotatewordschecked, annotatecharschecked,
               oneperlinechecked, commasepchecked, blockchecked,
               outputcommasepchecked, addfreqindexchecked, addfreqvaluechecked,
               hanzi))
    if hanzi != defaulthanzi:
        performactions(hanzi, results)
    results.append("""<p><small><i>Page generated in {:1.6f} seconds</i></small></p>""".format(time.time() - start_time))
    results.append(page_footer)
    results.append("\n</body>\n</html>")
    return "\n".join(results)

@app.route('/sets', methods=['GET', 'PUT', 'POST'])
def handle_sets():
    start_time = time.time()

    outputoneperlinechecked = ""
    outputoneperlinechecked = "checked" if getform("outputformat") == "oneperline" else ""
    outputcommasepchecked = "checked" if getform("outputformat") == "commasep" else ""
    outputtabsepchecked = "checked" if getform("outputformat") == "tabsep" else ""
    outputspacesepchecked = "checked" if getform("outputformat") == "spacesep" else ""
    if outputoneperlinechecked == "" and outputcommasepchecked == "" and outputspacesepchecked == "":
        outputoneperlinechecked = "checked"

    oneperlinecheckedA = ""
    blockcheckedA = "checked" if getform("formatA") == "block" else ""
    commasepcheckedA = "checked" if getform("formatA") == "commasep" else ""
    if blockcheckedA == "" and commasepcheckedA == "":
        oneperlinecheckedA = "checked"

    oneperlinecheckedB = ""
    commasepcheckedB = ""
    blockcheckedB = "checked" if getform("formatB") == "block" else ""
    commasepcheckedB = "checked" if getform("formatB") == "commasep" else ""
    if blockcheckedB == "" and commasepcheckedB == "":
        oneperlinecheckedB = "checked"

    hanziA = getform("hanziA", "")
    hanziB = getform("hanziB", "")
    if (blockcheckedA and len(hanziA)>10000) or (blockcheckedB and len(hanziB)>10000):
        return "Sorry, that text is too big; It will consume too much server CPU time to process. If you want to set up this script on a dedicated server get in touch with alan@hskhsk.com"

    results = []
    results.append("""<html lang="zh-Hans">\n<head>""")
    results.append("<title>HSK\u4E1C\u897F - Vocabulary Set Operations</title>")
    results.append(allstyle)
    results.append("</head>")
    results.append("<body>")
    results.append("""<a href="http://hskhsk.com/analyse.html">HSK\u4E1C\u897F</a>""")
    results.append("""<a href="/">Scripts</a>""")
    results.append("""<a href="/hanzi">Analyse Your \u6C49\u5B57</a>""")
    results.append("""<h2 class="compact">Vocabulary Set Operations <a class="arrowlink" href="javascript:toggle_visibility('mainhelp');"><small><small>(?)</small></small></a></h2>

<div id="mainhelp" class="inlinehelp">
    <p>Use this tool to compare two vocabulary lists.</p>
    <p>You can analyse the results using the <a href="/hanzi">Analyse Your \u6C49\u5B57</a> page.</p>
    <p>Although intended for use with Chinese characters, any sets of text strings can be compared. See <a href="http://hskhsk.pythonanywhere.com/sets?hanziA=Apple,Banana,Cherry&hanziB=Banana,Cherry,Durian&outputformat=oneperline&formatA=commasep&formatB=commasep">this example</a> to see how it works. </p>
</div>

<form method="POST" action="/sets">
<table>
    <tr>
        <td valign="top">
<h4 class="compact">Output Options <a class="arrowlink" href="javascript:toggle_visibility('outputoptionshelp');"><small>(?)</small></a></h4>

<div id="outputoptionshelp" class="inlinehelp">
    <p>Pretty self-explatory, try them out to see the difference.</p>
</div>

<div class="indent"><input type="radio" name="outputformat" value="oneperline" value="true" {}>One per line</input></div>
<div class="indent"><input type="radio" name="outputformat" value="commasep" value="true" {}>Comma separated</input></div>
<div class="indent"><input type="radio" name="outputformat" value="tabsep" value="true" {}>Tab separated</div>
<div class="indent"><input type="radio" name="outputformat" value="spacesep" value="true" {}>Space separated</div>
        </td>
    </tr>
</table>

<table>
    <tr>
        <td>
            <h4 class="compact">Word List A <a class="arrowlink" href="javascript:toggle_visibility('inputoptionshelp');"><small>(?)</small></a></h4>

            <div class="indent"><input type="radio" name="formatA" value="oneperline" {}>One word/character per line</input></div>
            <div class="indent"><input type="radio" name="formatA" value="commasep" {}>Comma/whitespace separated</input></div>
            <div class="indent"><input type="radio" name="formatA" value="block" {}>Big block of text</input></div>
        </td>
        <td>
            <h4 class="compact">Word List B <a class="arrowlink" href="javascript:toggle_visibility('inputoptionshelp');"><small>(?)</small></a></h4>

            <div class="indent"><input type="radio" name="formatB" value="oneperline" {}>One word/character per line</input></div>
            <div class="indent"><input type="radio" name="formatB" value="commasep" {}>Comma/whitespace separated</input></div>
            <div class="indent"><input type="radio" name="formatB" value="block" {}>Big block of text</input></div>
        </td>
    </tr>
    <tr>
        <td colspan="2">
            <div id="inputoptionshelp" class="inlinehelp" style="max-width:600px;">
                <p>These edit boxes are for the vocabulary lists or blocks of text that you wish to compare. Choose the format of your lists using by selecting the appropriate values from the 'Input Options' section above.</p>
                <p>To help to resolve ambiguous words when analysing a block of text, place a | character (vertical bar) between words.</p>
                <p>Choose one word/character per line when the input is a vocabulary list from Skritter or a flashcard text file. Anything after first whitespace on each line ignored.</p>
                <p>Comma/whitespace separated will use the characters ,;| or any whitespace to separate the words in your input.</p>
                <p>If pasting text from a web page or document use the 'Big block of text' option. This option is less precise, as word breaks have to be determined by this tool.</p>
            </div>
        </td>
    </tr>
    <tr>
        <td>
            <textarea name="hanziA" cols="50" rows="15">{}</textarea><br />
        </td>
        <td>
            <textarea name="hanziB" cols="50" rows="15">{}</textarea><br />
        </td>
    </tr>
</table>

<input type="submit" value="    Go!    " /></form>
    """.format(outputoneperlinechecked, outputcommasepchecked, outputtabsepchecked, outputspacesepchecked,
               oneperlinecheckedA, commasepcheckedA, blockcheckedA,
               oneperlinecheckedB, commasepcheckedB, blockcheckedB,
               hanziA, hanziB))
    if hanziA != "" or hanziB != "":
        performsetops(hanziA, hanziB, results)
    results.append("""<p><small><i>Page generated in {:1.6f} seconds</i></small></p>""".format(time.time() - start_time))
    results.append(page_footer)
    results.append("\n</body>\n</html>")
    return "\n".join(results)

def performsetops(hanziA, hanziB, results):
    init_resources()

    notes = []
    if getform("formatA") == "block":
        wordsA, charsA, hskwordcount, hskcharcount = parseblock(hanziA, notes)
    elif getform("formatA") == "commasep":
        wordsA, charsA, hskwordcount, hskcharcount = parsecommasep(hanziA, notes, True)
    else:
        wordsA, charsA, hskwordcount, hskcharcount = parselist(hanziA, notes, True)
    if len(notes):
        results.append("""<h2><span style="color:red;">Warnings (List A)</span> <a class="arrowlink" href="javascript:toggle_visibility('warningshelp');"><small><small>(?)</small></small></a></h2><ul>
 <div id="warningshelp" class="inlinehelp" style="max-width:600px;">
    <p>This section lists words and character that are being treated as Chinese but aren't in the CC-CEDICT that is being used.</p>
    <p>In addition, when potential word matches are ignored during parsing of a block of text, warnings below will show you
    the words that are in the dictionary but which were not chosen by the script.</p>
 </div><span style="color:red;">""")
        for note in notes:
            results.append("<li>{}</li>".format(note))
        results.append("</ul></span>")

    notes = []
    if getform("formatB") == "block":
        wordsB, charsB, hskwordcount, hskcharcount = parseblock(hanziB, notes)
    elif getform("formatB") == "commasep":
        wordsB, charsB, hskwordcount, hskcharcount = parsecommasep(hanziB, notes, True)
    else:
        wordsB, charsB, hskwordcount, hskcharcount = parselist(hanziB, notes, True)
    if len(notes):
        results.append("""<h2><span style="color:red;">Warnings (List B)</span> <a class="arrowlink" href="javascript:toggle_visibility('warningshelp');"><small><small>(?)</small></small></a></h2><ul>
 <div id="warningshelp" class="inlinehelp" style="max-width:600px;">
    <p>This section lists words and character that are being treated as Chinese but aren't in the CC-CEDICT that is being used.</p>
    <p>In addition, when potential word matches are ignored during parsing of a block of text, warnings below will show you
    the words that are in the dictionary but which were not chosen by the script.</p>
 </div><span style="color:red;">""")
        for note in notes:
            results.append("<li>{}</li>".format(note))
        results.append("</ul></span>")

    joinchar = ""
    if getform("outputformat") == "oneperline":
        joinchar = "\n"
    elif getform("outputformat") == "commasep":
        joinchar = ","
    elif getform("outputformat") == "tabsep":
        joinchar = "\t"
    else:
        joinchar = " "

    results.append("""<h4>Set Operations on Words <a class="arrowlink" href="javascript:toggle_visibility('wordoperationshelp');"><small><small>(?)</small></small></a></h4>
 <div id="wordoperationshelp" class="inlinehelp" style="max-width:600px;">
 <p><b>A<sub>w</sub></b> and <b>B<sub>w</sub></b> are the sets of all unique words derived from Word Lists A and B above.</p>
 <p><b>A<sub>w</sub> \u2229 B<sub>w</sub></b> <i>Intersection, words that appear in both sets.</i><br />
    <b>A<sub>w</sub> \u222A B<sub>w</sub></b> <i>Union, both sets of words combined together as a single set.</i><br />
    <b>A<sub>w</sub> \u2216 B<sub>w</sub></b> <i>Difference, words that are <b>A<sub>w</sub></b> but not <b>B<sub>w</sub></b>.</i><br />
    <b>B<sub>w</sub> \u2216 A<sub>w</sub></b> <i>Difference, words that are <b>B<sub>w</sub></b> but not <b>A<sub>w</sub></b>.</i><br />
    <b>A<sub>w</sub> \u2206 B<sub>w</sub></b> <i>Symmetric Difference, words that are in only one of the two sets.</i></p>
    <p>All sets are sorted with the most frequently used words first.</p>
 </div>""")

    results.append(setresultbox("A<sub>w</sub>",                      "Awords",            freqorder_word(wordsA),          joinchar, "word"))
    results.append(setresultbox("B<sub>w</sub>",                      "Bwords",            freqorder_word(wordsB),          joinchar, "word"))
    results.append(setresultbox("A<sub>w</sub> \u2229 B<sub>w</sub>", "AintersectBwords",  freqorder_word(wordsA & wordsB), joinchar, "word"))
    results.append(setresultbox("A<sub>w</sub> \u222A B<sub>w</sub>", "AunionBwords",      freqorder_word(wordsA | wordsB), joinchar, "word"))
    results.append(setresultbox("A<sub>w</sub> \u2216 B<sub>w</sub>", "AdifferenceBwords", freqorder_word(wordsA - wordsB), joinchar, "word"))
    results.append(setresultbox("B<sub>w</sub> \u2216 A<sub>w</sub>", "BdifferenceAwords", freqorder_word(wordsB - wordsA), joinchar, "word"))
    results.append(setresultbox("A<sub>w</sub> \u2206 B<sub>w</sub>", "AsymmmetricBwords", freqorder_word(wordsA ^ wordsB), joinchar, "word"))

    results.append("""<h4>Set Operations on Characters <a class="arrowlink" href="javascript:toggle_visibility('charoperationshelp');"><small><small>(?)</small></small></a></h4>
 <div id="charoperationshelp" class="inlinehelp" style="max-width:600px;">
 <p><b>A<sub>c</sub></b> and <b>B<sub>c</sub></b> are the sets of all unique characters derived from Word Lists A and B above.</p>
 <p><b>A<sub>c</sub> \u2229 B<sub>c</sub></b> <i>Intersection, characters that appear in both sets.</i><br />
    <b>A<sub>c</sub> \u222A B<sub>c</sub></b> <i>Union, both sets of characters combined together as a single set.</i><br />
    <b>A<sub>c</sub> \u2216 B<sub>c</sub></b> <i>Difference, characters that are <b>A<sub>c</sub></b> but not <b>B<sub>c</sub></b>.</i><br />
    <b>B<sub>c</sub> \u2216 A<sub>c</sub></b> <i>Difference, characters that are <b>B<sub>c</sub></b> but not <b>A<sub>c</sub></b>.</i><br />
    <b>A<sub>c</sub> \u2206 B<sub>c</sub></b> <i>Symmetric Difference, characters that are in only one of the two sets.</i></p>
    <p>All sets are sorted with the most frequently used characters first.</p>
 </div>""")

    results.append(setresultbox("A<sub>c</sub>",                      "Achars",            freqorder_word(charsA),          joinchar, "char"))
    results.append(setresultbox("B<sub>c</sub>",                      "Bchars",            freqorder_word(charsB),          joinchar, "char"))
    results.append(setresultbox("A<sub>c</sub> \u2229 B<sub>c</sub>", "AintersectBchars",  freqorder_char(charsA & charsB), joinchar, "char"))
    results.append(setresultbox("A<sub>c</sub> \u222A B<sub>c</sub>", "AunionBchars",      freqorder_char(charsA | charsB), joinchar, "char"))
    results.append(setresultbox("A<sub>c</sub> \u2216 B<sub>c</sub>", "AdifferenceBchars", freqorder_char(charsA - charsB), joinchar, "char"))
    results.append(setresultbox("B<sub>c</sub> \u2216 A<sub>c</sub>", "BdifferenceAchars", freqorder_char(charsB - charsA), joinchar, "char"))
    results.append(setresultbox("A<sub>c</sub> \u2206 B<sub>c</sub>", "AsymmmetricBchars", freqorder_char(charsA ^ charsB), joinchar, "char"))

def setresultbox(title, idname, itemset, joinchar, itemname):
    setlen = len(itemset)
    if setlen == 0:
        titlewithsize = title + """<span style="font-weight: lighter; font-size: 80%; font-style: italic;"> (empty)</span>"""
    else:
        titlewithsize = title + """<span style="font-weight: lighter; font-size: 80%; font-style: italic;"> ({} {}{})</span>""".format(setlen, itemname, "s" if setlen>1 else "")
    return blockboxtemplate().format(titlewithsize, idname , joinchar.join(itemset))

def performactions(hanzi, results):
    init_resources()
    # only parse if one of these actions is being performed
    if (   getform("analysevocab")
        or getform("analysehskwords")
        or getform("analysehskchars")
        or getform("suggesthskwords")
        or getform("suggesthskchars")
        or getform("suggestwords")
        or getform("suggestwordsreuse")
        or getform("suggestchars")):
        notes = []
        if getform("format") == "block":
            words, chars, hskwordcount, hskcharcount = parseblock(hanzi, notes)
        elif getform("format") == "commasep":
            words, chars, hskwordcount, hskcharcount = parsecommasep(hanzi, notes, False)
        else:
            words, chars, hskwordcount, hskcharcount = parselist(hanzi, notes, False)
        if len(notes):
            results.append("""<h2><span style="color:red;">Warnings</span> <a class="arrowlink" href="javascript:toggle_visibility('warningshelp');"><small><small>(?)</small></small></a></h4><ul>
 <div id="warningshelp" class="inlinehelp" style="max-width:500px;">
    <p>This section lists words and character that are being treated as Chinese but aren't in the CC-CEDICT that is being used.</p>
    <p>In addition, when potential word matches are ignored during parsing of a block of text, warnings below will show you
    the words that are in the dictionary but which were not chosen by the script.</p>
 </div><span style="color:red;">""")
            for note in notes:
                results.append("<li>{}</li>".format(note))
            results.append("</ul></span>")

        results.append("""<h2>Results <a class="arrowlink" href="javascript:toggle_visibility('resultshelp');"><small><small>(?)</small></small></a></h4>
 <div id="resultshelp" class="inlinehelp" style="max-width:500px;">
    All word/character lists are in descending order of frequency, with the most frequently used words/characters at the top of each list.
 </div>""")

        if getform("analysevocab"):
            analysewords(results, words, chars, hskwordcount, hskcharcount)
        if getform("analysehskwords"):
            analysehskwords(results, words, hskwordcount)
        if getform("analysehskchars"):
            analysehskchars(results, chars, hskcharcount)
        if getform("suggesthskwords"):
            suggesthskwords(results, words)
        if getform("suggesthskchars"):
            suggesthskchars(results, chars)
        if getform("suggestwords"):
            suggestfreqwords(results, words)
        if getform("suggestwordsreuse"):
            suggestfreqwordsre(results, words, chars)
        if getform("suggestchars"):
            suggestfreqchars(results, chars)
    else:
        results.append("<h2>Results</h2>")
    # these actions just use the raw hanzi
    if getform("annotatewords"):
        annotatewords(results, hanzi)
    if getform("annotatechars"):
        annotatechars(results, hanzi)

def blockboxtemplate(cols=""):
    if getform("outputcommasep") or getform("hanziA"):
        cols='cols="30"'
    elif getform("addfreqindex") and getform("addfreqvalue"):
        cols='cols="25"'
    else:
        cols='cols="15"'
    return """<div class="box"><div class="title">{}</div><div><textarea name="{}" """ + cols + """ rows="12">{}</textarea></div></div>"""

textareatemplate = """<textarea name="{}" cols="40" rows="12">{}</textarea>"""

def analysewords(results, words, chars, hskwordcount, hskcharcount):
    results.append("<h4>Analysis of Words/Characters in Input</h4>")
    singlecharcount = len([w for w in words if len(w) == 1])
    wordcount = len(words)
    charcount = len(chars)
    totalwords = sum(hskwordcount.values())
    totalchars = sum(hskcharcount.values())
    subtlexwords = subtlex_word_set & words
    ccedictwords = cedict_word_set & words
    results.append("""Input contained:<ul>
<li>{} unique single-character entries</li>
<li>{} unique multi-character entries</li>
<li>{} unique entries</li>
<li>{} total entries</li>
<li>{} unique characters</li>
<li>{} total characters</li>
<li>{} unique words as recognised by SUBTLEX-CH</li>
<li>{} unique words as recognised by CC-CEDICT</li>
</ul>""".format(singlecharcount,
                wordcount-singlecharcount,
                wordcount,
                totalwords,
                charcount,
                totalchars,
                len(subtlexwords),
                len(ccedictwords)))
    wordsknown = "\n".join(freqorder_word(words))
    charsknown = "\n".join(freqorder_char(chars))
    subtlexknown = "\n".join(freqorder_word(subtlexwords))
    ccedictknown = "\n".join(freqorder_word(ccedictwords))
    results.append(blockboxtemplate().format("Unique Entries", "wordsknown", wordsknown))
    results.append(blockboxtemplate().format("Unique Characters", "charsknown", charsknown))
    results.append(blockboxtemplate().format("SUBTLEX Words", "subtlexknown", subtlexknown))
    results.append(blockboxtemplate().format("CC-CEDICT Words", "cedictknown", ccedictknown))

def analysehskwords(results, words, hskwordcount):
    knownintersect = {}
    results.append("<h4>Analysis of HSK Words in Input</h4>")
    results.append("Input contained:<ul>")
    cumulativeknown = {}
    cumulativetotal = {}
    cumulativeknown[0] = 0
    cumulativetotal[0] = 0
    numknown = {}
    numhsk = {}
    for i in range(1, 7):
        knownintersect[i] = words & hskwords[i]
        numknown[i] = len(knownintersect[i])
        numhsk[i] = len(hskwords[i])
        percentknown = 100 * float(numknown[i]) / numhsk[i]
        cumulativeknown[i] = cumulativeknown[i-1] + numknown[i]
        cumulativetotal[i] = cumulativetotal[i-1] + numhsk[i]
        results.append("""<li>{} ({:.2f}%) of the {} HSK {} words""".format(numknown[i], percentknown, numhsk[i], i))
        if i > 1 > 0:
            cumpercentknown = 100 * float(cumulativeknown[i]) / cumulativetotal[i]
            results.append(""" <i>(Cumulative: {} ({:.2f}%) of the {} HSK 1-{} words)</i>""".format(cumulativeknown[i], cumpercentknown, cumulativetotal[i], i))
        results.append("</li>")
    results.append("</ul>")
    totalunique = len(words)
    if totalunique > 0:
        numknown_nonhsk = totalunique - cumulativeknown[6]
        results.append("Of the {} <b>unique</b> words in the input:<ul>".format(totalunique))
        for i in range(1, 7):
            percentknown = 100 * float(numknown[i]) / totalunique
            results.append("""<li>{} ({:.2f}%) were HSK {} words""".format(numknown[i], percentknown, i))
            if i > 1:
                cumpercentknown = 100 * float(cumulativeknown[i]) / totalunique
                results.append("""<i>(Cumulative: {} ({:.2f}%) were HSK 1-{} words)</i>""".format(cumulativeknown[i], cumpercentknown, i))
            results.append("</li>")
        numknown_nonhsk_percent = 100 * float(numknown_nonhsk) / totalunique
        results.append("""<li>{} ({:.2f}%) were non-HSK words</li>""".format(numknown_nonhsk, numknown_nonhsk_percent))
        results.append("</ul>")
    totalwords = sum(hskwordcount.values())
    if totalwords == totalunique:
        results.append("<p><i>Each word appeared only once in the input.</i></p>")
    else:
        cumknown = 0
        results.append("Of the {} <b>total</b> words that were input:<ul>".format(totalwords))
        for i in range(1, 7):
            percentknown = 100 * float(hskwordcount[i]) / totalwords
            cumknown += hskwordcount[i]
            results.append("""<li>{} ({:.2f}%) were HSK {} words""".format(hskwordcount[i], percentknown, i))
            if i > 1:
                cumpercentknown = 100 * float(cumknown) / totalwords
                results.append("""<i>(Cumulative: {} ({:.2f}%) were HSK 1-{} words)</i>""".format(cumknown, cumpercentknown, i))
            results.append("</li>")
        num_nonhsk = totalwords - cumknown
        numknown_nonhsk_percent = 100 * float(num_nonhsk) / totalwords
        results.append("""<li>{} ({:.2f}%) were non-HSK words</li>""".format(num_nonhsk, numknown_nonhsk_percent))
        results.append("</ul>")
    for i in range(1, 7):
        wordsknown = "\n".join(freqorder_word(knownintersect[i]))
        results.append(blockboxtemplate().format("HSK " + str(i), "hskwordsknown" + str(i), wordsknown))
    nonhskwords = "\n".join(freqorder_word(words - hskwords[16]))
    results.append(blockboxtemplate().format("Non-HSK", "nonhskwordsknown", nonhskwords))

def analysehskchars(results, chars, hskcharcount):
    knownintersect = {}
    results.append("<h4>Analysis of HSK Characters in Input</h4>")
    results.append("Input contained:<ul>")
    cumulativeknown = {}
    cumulativetotal = {}
    cumulativeknown[0] = 0
    cumulativetotal[0] = 0
    numknown = {}
    numhsk = {}
    for i in range(1, 7):
        knownintersect[i] = chars & hskchars[i]
        numknown[i] = len(knownintersect[i])
        numhsk[i] = len(hskchars[i])
        percentknown = 100 * float(numknown[i]) / numhsk[i]
        cumulativeknown[i] = cumulativeknown[i-1] + numknown[i]
        cumulativetotal[i] = cumulativetotal[i-1] + numhsk[i]
        results.append("""<li>{} ({:.2f}%) of the {} HSK {} characters""".format(numknown[i], percentknown, numhsk[i], i))
        if i > 1 > 0:
            cumpercentknown = 100 * float(cumulativeknown[i]) / cumulativetotal[i]
            results.append(""" <i>(Cumulative: {} ({:.2f}%) of the {} HSK 1-{} characters)</i>""".format(cumulativeknown[i], cumpercentknown, cumulativetotal[i], i))
        results.append("</li>")
    results.append("</ul>")
    totalunique = len(chars)
    if totalunique > 0:
        numknown_nonhsk = totalunique - cumulativeknown[6]
        results.append("Of the {} <b>unique</b> characters in the input:<ul>".format(totalunique))
        for i in range(1, 7):
            percentknown = 100 * float(numknown[i]) / totalunique
            results.append("""<li>{} ({:.2f}%) were HSK {} characters""".format(numknown[i], percentknown, i))
            if i > 1:
                cumpercentknown = 100 * float(cumulativeknown[i]) / totalunique
                results.append("""<i>(Cumulative: {} ({:.2f}%) were HSK 1-{} characters)</i>""".format(cumulativeknown[i], cumpercentknown, i))
            results.append("</li>")
        numknown_nonhsk_percent = 100 * float(numknown_nonhsk) / totalunique
        results.append("""<li>{} ({:.2f}%) were non-HSK characters</li>""".format(numknown_nonhsk, numknown_nonhsk_percent))
        results.append("</ul>")
    totalchars = sum(hskcharcount.values())
    if totalchars == totalunique:
        results.append("<p><i>Each character appeared only once in the input.</i></p>")
    else:
        cumknown = 0
        results.append("Of the {} <b>total</b> characters that were input:<ul>".format(totalchars))
        for i in range(1, 7):
            percentknown = 100 * float(hskcharcount[i]) / totalchars
            cumknown += hskcharcount[i]
            results.append("""<li>{} ({:.2f}%) were HSK {} characters""".format(hskcharcount[i], percentknown, i))
            if i > 1:
                cumpercentknown = 100 * float(cumknown) / totalchars
                results.append("""<i>(Cumulative: {} ({:.2f}%) were HSK 1-{} characters)</i>""".format(cumknown, cumpercentknown, i))
            results.append("</li>")
        num_nonhsk = totalchars - cumknown
        numknown_nonhsk_percent = 100 * float(num_nonhsk) / totalchars
        results.append("""<li>{} ({:.2f}%) were non-HSK characters</li>""".format(num_nonhsk, numknown_nonhsk_percent))
        results.append("</ul>")
    for i in range(1, 7):
        charsknown = "\n".join(freqorder_char(knownintersect[i]))
        results.append(blockboxtemplate().format("HSK " + str(i), "hskcharsknown" + str(i), charsknown))
    nonhskchars = "\n".join(freqorder_char(chars - hskchars[16]))
    results.append(blockboxtemplate().format("Non-HSK", "nonhskcharsknown", nonhskchars))

def suggesthskwords(results, words):
    results.append("""<h4>Suggested HSK Words not in Input</h4>""")
    for i in range(1, 7):
        wordstolearn = "\n".join(freqorder_word(hskwords[i] - words))
        results.append(blockboxtemplate().format("HSK " + str(i), "hskwordstolearn" + str(i), wordstolearn))
    foundwords = []
    for freq, word in word_freq_ordered:
        if word not in words and word not in hskwords[16]:
            foundwords.append(word)
        if len(foundwords)>=1000:
            break
    wordstext = "\n".join(freqorder_word(foundwords))
    results.append(blockboxtemplate().format("Non-HSK", "nonhskwordstolearn" + str(i), wordstext))

def suggesthskchars(results, chars):
    results.append("""<h4>Suggested HSK Characters not in Input</h4>""")
    for i in range(1, 7):
        charstolearn = "\n".join(freqorder_char(hskchars[i] - chars))
        results.append(blockboxtemplate().format("HSK " + str(i), "hskcharstolearn" + str(i), charstolearn))
    foundchars = []
    for freq, char in char_freq_ordered:
        if char not in chars and char not in hskchars[16]:
            foundchars.append(char)
        if len(foundchars)>=1000:
            break
    charstext = "\n".join(freqorder_char(foundchars))
    results.append(blockboxtemplate().format("Non-HSK", "nonhskcharstolearn" + str(i), charstext))

def suggestfreqwords(results, words):
    results.append("""<h4>Suggested Words not in Input</h4>""")
    foundwords = []
    for freq, word in word_freq_ordered:
        if word not in words:
            foundwords.append(word)
        if len(foundwords)>=1000:
            break
    wordstext = "\n".join(freqorder_word(foundwords))
    results.append(textareatemplate.format("highfreqwords", wordstext))

def suggestfreqwordsre(results, words, chars):
    results.append("""<h4>Suggested Words Using Characters in Input</h4>""")
    foundwords = []
    for freq, word in word_freq_ordered:
        if word not in words:
            allcharsmatch = True
            for char in word:
                if char not in chars:
                    allcharsmatch = False
                    break
            if not allcharsmatch:
                continue
            foundwords.append(word)
        if len(foundwords)>=1000:
            break
    wordstext = "\n".join(freqorder_word(foundwords))
    results.append(textareatemplate.format("highfreqwordsreuse", wordstext))

def suggestfreqchars(results, chars):
    results.append("""<h4>Suggested Characters not in Input</h4>""")
    foundchars = []
    for freq, char in char_freq_ordered:
        if char not in chars:
            foundchars.append(char)
        if len(foundchars)>=1000:
            break
    charstext = "\n".join(freqorder_char(foundchars))
    results.append(textareatemplate.format("highfreqchars", charstext))

def annotatewords(results, hanzi):
    results.append("""<h4>Annotated Words</h4>""")
    results.append("""<p class="bordered">""")
    tokenised = mostlikelywordsallchars(hanzi)
    textblocks = []
    for ishanzi, text in tokenised:
        if ishanzi == True:
            textblocks.append(wordchardeflink(text, "word"))
        elif text == "\n":
            results.append("".join(textblocks))
            results.append("<br>")
            textblocks=[]
        elif text == "|":
            pass # ignore this character
        else:
            textblocks.append(html.escape(text))
    results.append("".join(textblocks))
    results.append("</p>")

def annotatechars(results, hanzi):
    results.append("""<h4>Annotated Characters</h4>""")
    results.append("""<p class="bordered">""")
    charlist = [c for c in hanzi]
    textblocks = []
    for char in charlist:
        if char_is_ok(char):
            textblocks.append(hanzideflink(char, char, "char"))
        elif char == "\n":
            results.append("".join(textblocks))
            results.append("<br>")
            textblocks=[]
        elif char == "|":
            pass # ignore this character
        else:
            textblocks.append(html.escape(char))
    results.append("".join(textblocks))
    results.append("</p>")

# ================
# Initialise
init_done = False;
def init_resources():
    global init_done
    if init_done:
        return;
    do_hsk_parsing("/home/hskhsk/data/HSK")
    do_mc_parsing("/home/hskhsk/data/")
    parse_word_freq_file("/home/hskhsk/data/SUBTLEX-CH-WF.txt")
    parse_char_freq_file("/home/hskhsk/data/SUBTLEX-CH-CHR.txt")
    parse_ccedict("/home/hskhsk/data/cedict_ts.u8")
    parse_cc_file("/home/hskhsk/data/ChineseCharacterDecomposition.txt")
    init_radical_data("/home/hskhsk/data/")
    init_done = True;

# ================
# Parse Hanzi input
def parselist(hanzi, notes, allownonhanzi):
    hskwordcount = {}
    hskcharcount = {}
    hskwordcount[0] = hskwordcount[1] = hskwordcount[2] = hskwordcount[3] = hskwordcount[4] = hskwordcount[5] = hskwordcount[6] = 0
    hskcharcount[0] = hskcharcount[1] = hskcharcount[2] = hskcharcount[3] = hskcharcount[4] = hskcharcount[5] = hskcharcount[6] = 0
    words = set()
    chars = set()
    ignorewords = set()
    ignorechars = set()
    unknownwords = set()
    unknownchars = set()
    for line in hanzi.split("\n"):
        chunks = line.split()
        if len(chunks):
            word = chunks[0]
            if allownonhanzi or len([c for c in word if not char_is_ok(c)]) == 0:
                words.add(word)
                hskwordcount[query_hsk_word_level(word)] += 1
                if (not allownonhanzi) and word not in word_freq:
                    unknownwords.add(word)
            else:
                ignorewords.add(word)
            for char in word:
                if allownonhanzi or char_is_ok(char):
                    chars.add(char)
                    hskcharcount[query_hsk_char_level(char)] += 1
                    if (not allownonhanzi) and char not in char_freq:
                        unknownchars.add(char)
                else:
                    ignorechars.add(char)

    if len(ignorewords):
        notes.append("Ignored words: " + ", ".join([wordchardeflink(h, "none") for h in ignorewords]))
    if len(ignorechars):
        notes.append("Ignored characters: " + ", ".join([wordchardeflink(h, "none") for h in ignorechars]))
    if len(unknownwords):
        notes.append("Unknown words: " + ", ".join([wordchardeflink(h, "none") for h in unknownwords]))
    if len(unknownchars):
        notes.append("Unknown characters: " + ", ".join([wordchardeflink(h, "none") for h in unknownchars]))
    return words, chars, hskwordcount, hskcharcount

def parsecommasep(hanzi, notes, allownonhanzi):
    hskwordcount = {}
    hskcharcount = {}
    hskwordcount[0] = hskwordcount[1] = hskwordcount[2] = hskwordcount[3] = hskwordcount[4] = hskwordcount[5] = hskwordcount[6] = 0
    hskcharcount[0] = hskcharcount[1] = hskcharcount[2] = hskcharcount[3] = hskcharcount[4] = hskcharcount[5] = hskcharcount[6] = 0
    words = set()
    chars = set()
    ignorewords = set()
    ignorechars = set()
    unknownwords = set()
    unknownchars = set()
    cleanhanzi = re.sub("[,;\|\t\r\n "+chinese_comma+"]+", " ", hanzi)
    for word in cleanhanzi.split():
        if allownonhanzi or len([c for c in word if not char_is_ok(c)]) == 0:
            words.add(word)
            hskwordcount[query_hsk_word_level(word)] += 1
            if (not allownonhanzi) and word not in word_freq:
                unknownwords.add(word)
        else:
            ignorewords.add(word)
        for char in word:
            if allownonhanzi or char_is_ok(char):
                chars.add(char)
                hskcharcount[query_hsk_char_level(char)] += 1
                if (not allownonhanzi) and char not in char_freq:
                    unknownchars.add(char)
            else:
                ignorechars.add(char)

    if len(ignorewords):
        notes.append("Ignored words: " + ", ".join([wordchardeflink(h, "none") for h in ignorewords]))
    if len(ignorechars):
        notes.append("Ignored characters: " + ", ".join([wordchardeflink(h, "none") for h in ignorechars]))
    if len(unknownwords):
        notes.append("Unknown words: " + ", ".join([wordchardeflink(h, "none") for h in unknownwords]))
    if len(unknownchars):
        notes.append("Unknown characters: " + ", ".join([wordchardeflink(h, "none") for h in unknownchars]))
    return words, chars, hskwordcount, hskcharcount

def parseblock(hanzi, notes):
    hskwordcount = {}
    hskcharcount = {}
    hskwordcount[0] = hskwordcount[1] = hskwordcount[2] = hskwordcount[3] = hskwordcount[4] = hskwordcount[5] = hskwordcount[6] = 0
    hskcharcount[0] = hskcharcount[1] = hskcharcount[2] = hskcharcount[3] = hskcharcount[4] = hskcharcount[5] = hskcharcount[6] = 0
    words = set()
    chars = set()
    ignorechars = set()
    unknownchars = set()
    tokenised = mostlikelywordsallchars(hanzi, notes)
    for ishanzi, text in tokenised:
        if ishanzi:
            for char in text:
                chars.add(char)
                hskcharcount[query_hsk_char_level(char)] += 1
                if char not in char_freq:
                    unknownchars.add(char)
            words.add(text)
            hskwordcount[query_hsk_word_level(text)] += 1
        else:
            ignorechars.add(text)
    if len(ignorechars):
        notes.append("Ignored characters: " + ", ".join([wordchardeflink(h, "none") for h in ignorechars]))
    if len(unknownchars):
        notes.append("Unknown characters: " + ", ".join([wordchardeflink(h, "none") for h in unknownchars]))
    return words, chars, hskwordcount, hskcharcount

def determinefreqscore(split):
    score = 0
    for s in split:
        if s in word_freq:
            score += query_word_freq(s) * len(s)**3
        else:
            score -= 1000000000
    return score

def allpossiblesplits(hanzi):
    if len(hanzi) == 0:
        return [ [] ]
    if len(hanzi) == 1:
        return [ [hanzi] ]
    splits = []
    for i in range(len(hanzi), 0, -1):
        test = hanzi[:i]
        if len(test) == 1 or test in word_freq:
            testsplits = allpossiblesplits(hanzi[i:])
            for t in testsplits:
                splits.append( [test] + t )
    return splits

def determinebestsplit(hanzi, notes):
    allsplits = allpossiblesplits(hanzi)
    maxfreq = 0
    maxsplit = []
    for split in allsplits:
        freqscore = determinefreqscore(split)
        if (freqscore > maxfreq):
            maxfreq = freqscore
            maxsplit = split
    if notes is not None:
        # firstslice, lastslice = sliceoffallsame(allsplits)
        if sum([1 if max(list(map(len, s))) > 1 else 0 for s in allsplits]) > 1:
            note = "Ambiguous words detected. Chose split: " + "|".join([wordchardeflink(h, "none") for h in maxsplit]) + ". Words not chosen: "
            wordsout = set()
            for split in allsplits:
                wordsout = wordsout | set(split)
            wordsout = wordsout - set(maxsplit)
            note += ", ".join([wordchardeflink(h, "none") for h in wordsout])
            notes.append(note)
    return maxsplit

def sliceoffallsame(lists):
    minlen = min(list(map(len, lists)))
    different = False
    for first in range(0, minlen):
        for i in range(0, len(lists)-1):
            if lists[i][first] != lists[i+1][first]:
                different = True
                break
        if different:
            break
    different = False
    for last in range(-1, -1 * minlen, -1):
        for i in range(0, len(lists)-1):
            if lists[i][last] != lists[i+1][last]:
                different = True
                break
        if different:
            break
    if different:
        last += 1
    if last == 0:
        last = None
    return first, last

# more advanced version of 'parseblock'
def mostlikelywordsallchars(hanzi, notes=None):
    rawtokens = []
    startofchunk = 0
    for i in range (0, len(hanzi)):
        # big optimisation; break at boundaries of characters that cannot be part of a word
        if (not hanzi[i] in part_of_multichar_word) or (not char_is_ok(hanzi[i])):
            if startofchunk < i:
                rawtokens.append( (True, hanzi[startofchunk:i]) )
            rawtokens.append( (char_is_ok(hanzi[i]), hanzi[i]) )
            startofchunk = i+1
    if startofchunk < len(hanzi):
        rawtokens.append( (True, hanzi[startofchunk:len(hanzi)]) )
    tokens = []
    for ishanzi, hanzi in rawtokens:
        if ishanzi:
            split = determinebestsplit(hanzi, notes)
            for s in split:
                tokens.append( (True, s) )
        else:
            tokens.append( (ishanzi, hanzi) )
    return tokens

def allvalidwords(hanzi):
    rawtokens = []
    startofchunk = 0
    for i in range (0, len(hanzi)):
        # big optimisation; break at boundaries of characters that cannot be part of a word
        if (not hanzi[i] in part_of_multichar_word) or (not char_is_ok(hanzi[i])):
            if startofchunk < i:
                rawtokens.append(hanzi[startofchunk:i])
            elif char_is_ok(hanzi[i]):
                rawtokens.append(hanzi[i])
            startofchunk = i+1
    if startofchunk < len(hanzi):
        rawtokens.append(hanzi[startofchunk:len(hanzi)])
    tokens = []
    for possible in rawtokens:
        for i in range(0, len(possible)):
            for j in range(1, len(possible)+1):
                candidate = possible[i:j]
                if candidate in cedict_definition:
                    tokens.append(candidate)
    return tokens

# ================
# Utilities for freq order

def freqorder_word(hanzi):
    freqlist = [(query_word_freq_index(h), h) for h in hanzi]
    freqlist.sort()
    if getform("outputcommasep"):
        return [",".join([h for f, h in freqlist])]
    elif getform("addfreqindex") and getform("addfreqvalue"):
        return ["{}\t{}\t{}".format(h, f, query_word_freq(h)) for f, h in freqlist]
    elif getform("addfreqindex"):
        return ["{}\t{}".format(h, 0 if f >= max_freq_index else f) for f, h in freqlist]
    elif getform("addfreqvalue"):
        return ["{}\t{}".format(h, query_word_freq(h)) for f, h in freqlist]
    else:
        return [h for f, h in freqlist]

def freqorder_char(hanzi):
    freqlist = [(query_char_freq_index(h), h) for h in hanzi]
    freqlist.sort()
    if getform("outputcommasep"):
        return [",".join([h for f, h in freqlist])]
    elif getform("addfreqindex") and getform("addfreqvalue"):
        return ["{}\t{}\t{}".format(h, f, query_char_freq(h)) for f, h in freqlist]
    elif getform("addfreqindex"):
        return ["{}\t{}".format(h, 0 if f >= max_freq_index else f) for f, h in freqlist]
    elif getform("addfreqvalue"):
        return ["{}\t{}".format(h, query_char_freq(h)) for f, h in freqlist]
    else:
        return [h for f, h in freqlist]

# colour can be "char", "word", "none", "auto"
def hanzideflink(hanziword, hanzichar, colour):
    urlstub = "/cidian?{}q=".format("expand=yes&" if getform("expand") == "yes" else "")
    url = urlstub + urllib.parse.quote(html.escape(hanziword))
    title = get_linktext_hanzi_info(hanziword, hanzichar, 30)
    wordlevel = query_hsk_word_level(hanziword)
    charlevel = query_hsk_char_level(hanzichar)
    radicallevel = query_hsk_radical_level(hanzichar)
    linkclass = "definition"
    if (colour == "word" or colour == "auto") and wordlevel > 0:
        linkclass = "hsk{3}";
    elif (colour == "char" or colour == "auto") and charlevel > 0:
        linkclass = "hsk{4}";
    elif (colour == "radical"):
        linkclass = "hsk{5}";
    linkformat = '<a class="' + linkclass + '" href="{0}" title="{1}">{2}</a>'
    return linkformat.format(url, html.escape(title), html.escape(hanzichar), wordlevel, charlevel, radicallevel)

# colour can be "char", "word", "none", "auto"
def wordchardeflink(hanzi, colour):
    return "".join([hanzideflink(hanzi, c, colour) for c in hanzi])

def freqorder_word_link_table(hanzi):
    return freqorder_word_link(hanzi, "</td><td>")

def freqorder_word_link(hanzi, infosep="&nbsp;" * 8):
    withinfo = getform("expand") == "yes"
    freqlist = [(query_word_freq_index(h), h) for h in hanzi]
    freqlist.sort()
    return [wordchardeflink(h, "none") + (" " + infosep + get_compact_hanzi_info(h, 80) if withinfo else "") for f, h in freqlist]

def freqorder_word_link_hskcolour(hanzi):
    withinfo = getform("expand") == "yes"
    freqlist = [(query_word_freq_index(h), h) for h in hanzi]
    freqlist.sort()
    return [wordchardeflink(h, "word") + (" " + ("&nbsp;" * 8) + get_compact_hanzi_info(h, 80) if withinfo else "") for f, h in freqlist]

def freqorder_char_link_hskcolour(hanzi):
    withinfo = getform("expand") == "yes"
    freqlist = [(query_char_freq_index(h), h) for h in hanzi]
    freqlist.sort()
    return [wordchardeflink(h, "char") + (" " + ("&nbsp;" * 8) + get_compact_hanzi_info(h, 80) if withinfo else "") for f, h in freqlist]

def freqorder_radical_link(hanzi):
    withinfo = getform("expand") == "yes"
    freqlist = [(query_radical_freq_index(h), h) for h in hanzi]
    freqlist.sort()
    return [wordchardeflink(h, "radical") + (" " + ("&nbsp;" * 8) + get_compact_hanzi_info(h, 80) if withinfo else "") for f, h in freqlist]

def freqorder_char_link_table(hanzi):
    return freqorder_char_link(hanzi, "</td><td>")

def freqorder_char_link(hanzi, infosep="&nbsp;" * 8):
    withinfo = getform("expand") == "yes"
    freqlist = [(query_char_freq_index(h), h) for h in hanzi]
    freqlist.sort()
    return [hanzideflink(h, h, "none") + (" " + infosep + get_compact_hanzi_info(h, 80) if withinfo else "") for f, h in freqlist]

#todo limit was 1000 before, now reset to 10000
# definition is off, full
def word_link_hskcolour_search(hanzi, definition):
    separator = ""
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
    listpart = separator.join([  wordchardeflink(h, "word")
                               + ("" if definition == "off" else " " + ("&nbsp;" * 8) + get_compact_hanzi_info(h, maxlen))
                               for h in hanzi])
    return listpart + suffix

def char_is_ok(char):
    if ord(char) < 128:
        return False # ignore ASCII
    if ord(char) >= 0x2000 and ord(char) <= 0x206F:
        return False # ignore General punctuation
    if ord(char) >= 0x3000 and ord(char) <= 0x303F:
        return False # ignore Chinese punctuation
    if ord(char) >= 0xFF00 and ord(char) <= 0xFFEF:
        return False # ignore full width and half width forms
    return True

# ================
# HSK Parsing

hsk_word_level = {} # {"A" : 1, "ABC" : 1 }
hsk_char_level = {} # {"A" : 1, "B" : 1 , "C" : 1}
hskwords = {} # {1 : set("A", "ABC"), ...}
hskchars = {}
hskwords2010 = {} # {1 : set("A", "ABC"), ...}
hskchars2010 = {}

def query_hsk_word_level(somehanzi):
    if somehanzi in hsk_word_level:
        return hsk_word_level[somehanzi]
    return 0

def query_hsk_char_level(somehanzi):
    if somehanzi in hsk_char_level:
        return hsk_char_level[somehanzi]
    return 0

def query_hsk_word_level_negative_notfound(somehanzi):
    if somehanzi in hsk_word_level:
        return hsk_word_level[somehanzi]
    elif somehanzi in cedict_definition:
        return 0
    return -1

def query_hsk_char_level_negative_notfound(somehanzi):
    if somehanzi in hsk_char_level:
        return hsk_char_level[somehanzi]
    elif somehanzi in cedict_definition:
        return 0
    return -1

def query_hsk_radical_level(somehanzi):
    if somehanzi in hsk_radical_level:
        return hsk_radical_level[somehanzi]
    return 0

def do_hsk_parsing(infilename):
    global hsk_word_level, hsk_char_level, hskwords, hskchars, hskwords2010, hskchars2010
    try:
        with open(infilename + ".hsk_word_level.cache", "rb") as pfile:
            hsk_word_level = pickle.load(pfile)
        with open(infilename + ".hsk_char_level.cache", "rb") as pfile:
            hsk_char_level = pickle.load(pfile)
        with open(infilename + ".hskwords.cache", "rb") as pfile:
            hskwords = pickle.load(pfile)
        with open(infilename + ".hskchars.cache", "rb") as pfile:
            hskchars = pickle.load(pfile)
        with open(infilename + ".hskwords2010.cache", "rb") as pfile:
            hskwords2010 = pickle.load(pfile)
        with open(infilename + ".hskchars2010.cache", "rb") as pfile:
            hskchars2010 = pickle.load(pfile)
    except:
        hsk_word_level = {} # {"A" : 1, "ABC" : 1 }
        hsk_char_level = {} # {"A" : 1, "B" : 1 , "C" : 1}
        hskwords = {} # {1 : set("A", "ABC"), ...}
        hskchars = {}
        hskwords2010 = {} # {1 : set("A", "ABC"), ...}
        hskchars2010 = {}

        parse_hsk_file("/home/hskhsk/data/HSK Official With Definitions 2012 L1.txt", 1)
        parse_hsk_file("/home/hskhsk/data/HSK Official With Definitions 2012 L2.txt", 2)
        parse_hsk_file("/home/hskhsk/data/HSK Official With Definitions 2012 L3.txt", 3)
        parse_hsk_file("/home/hskhsk/data/HSK Official With Definitions 2012 L4.txt", 4)
        parse_hsk_file("/home/hskhsk/data/HSK Official With Definitions 2012 L5.txt", 5)
        parse_hsk_file("/home/hskhsk/data/HSK Official With Definitions 2012 L6.txt", 6)
        build_hsk_extralists(hskwords, hskchars)
        parse_hsk_2010_file("/home/hskhsk/data/New_HSK_2010.csv")
        build_hsk_extralists(hskwords2010, hskchars2010)

        with open(infilename + ".hsk_word_level.cache", "wb") as pfile:
            pickle.dump(hsk_word_level, pfile, -1)
        with open(infilename + ".hsk_char_level.cache", "wb") as pfile:
            pickle.dump(hsk_char_level, pfile, -1)
        with open(infilename + ".hskwords.cache", "wb") as pfile:
            pickle.dump(hskwords, pfile, -1)
        with open(infilename + ".hskchars.cache", "wb") as pfile:
            pickle.dump(hskchars, pfile, -1)
        with open(infilename + ".hskwords2010.cache", "wb") as pfile:
            pickle.dump(hskwords2010, pfile, -1)
        with open(infilename + ".hskchars2010.cache", "wb") as pfile:
            pickle.dump(hskchars2010, pfile, -1)

# parse newer 2012 HSK format
def parse_hsk_file(infilename, hsklevel):
    hskwords[hsklevel] = set()
    infile = codecs.open(infilename, 'r', "utf-8")
    for line in infile:
        splitted = line.strip().split("\t")
        if len(splitted) >= 4:
            word = unicodedata.normalize("NFKC", splitted[0].strip()).replace('\ufeff',"")
            if word != "":
                hskwords[hsklevel].add(word)
                if word in hsk_word_level:
                    hsk_word_level[word] = min(hsk_word_level[word], hsklevel)
                else:
                    hsk_word_level[word] = hsklevel
                for somehanzi in word:
                    if somehanzi in hsk_char_level:
                        hsk_char_level[somehanzi] = min(hsk_char_level[somehanzi], hsklevel)
                    else:
                        hsk_char_level[somehanzi] = hsklevel
                trad = splitted[1].strip()
                pinyin = splitted[2].strip()
                definition = splitted[4].strip()
                add_dict_entry(word, trad, pinyin, definition)
    infile.close()

def build_hsk_extralists(words, chars):
    # build a list of characters from the words lists
    for i in range(1, 7):
        chars[i] = set()
        for word in words[i]:
            for char in word:
                chars[i].add(char)
    chars[2] = chars[2] - chars[1]
    chars[3] = chars[3] - chars[2] - chars[1]
    chars[4] = chars[4] - chars[3] - chars[2] - chars[1]
    chars[5] = chars[5] - chars[4] - chars[3] - chars[2] - chars[1]
    chars[6] = chars[6] - chars[5] - chars[4] - chars[3] - chars[2] - chars[1]

    # build lists of character/word ranges; e.g. words[13] is the
    # union of the words for HSK levels 1, 2, and 3.
    for i in range(1, 6):
        for j in range (i+1, 7):
            words[i*10 + j] = words[i]
            chars[i*10 + j] = chars[i]
            for k in range (i+1, j+1):
                words[i*10 + j] = words[i*10 + j].union(words[k])
                chars[i*10 + j] = chars[i*10 + j].union(chars[k])

def parse_hsk_2010_file(infilename):
    infile = codecs.open(infilename, 'r', "utf-8")
    hskwords2010[1] = set()
    hskwords2010[2] = set()
    hskwords2010[3] = set()
    hskwords2010[4] = set()
    hskwords2010[5] = set()
    hskwords2010[6] = set()
    for line in infile:
        splitted = line.split(",")
        if len(splitted) > 1:
            hsklevel = int(splitted[0].strip().replace('\ufeff',""))
            word = unicodedata.normalize("NFKC", splitted[1].strip()).replace('\ufeff',"")
            if word != "":
                hskwords2010[hsklevel].add(word)
    infile.close()

# ================
# Mandarin Companion Wordlists

mc_words = {} # # {1 : set("A", "ABC"), ...}

def do_mc_parsing(indir):
    global mc_words
    try:
        with open(indir + "MandarinCompanion.mc_words.cache", "rb") as pfile:
            mc_words = pickle.load(pfile)
    except:
        parse_mc_file(indir + "MandarinCompanion1_secret_garden.txt", 1)
        parse_mc_file(indir + "MandarinCompanion2_sherlock_holmes.txt", 2)
        parse_mc_file(indir + "MandarinCompanion3_monkeys_paw.txt", 3)
        parse_mc_file(indir + "MandarinCompanion4_country_of_the_blind.txt", 4)
        parse_mc_file(indir + "MandarinCompanion5_sixty_year_dream.txt", 5)
        build_mc_extralists()

        with open("/home/hskhsk/data/MandarinCompanion.mc_words.cache", "wb") as pfile:
            pickle.dump(mc_words, pfile, -1)

def parse_mc_file(infilename, mclevel):
    mc_words[mclevel] = set()
    infile = codecs.open(infilename, 'r', "utf-8")
    for line in infile:
        word = unicodedata.normalize("NFKC", line.strip()).replace('\ufeff',"")
        if word != "":
            mc_words[mclevel].add(word)
    infile.close()

def build_mc_extralists():

    # Words that appear any list
    mc_words[100] = mc_words[1] | mc_words[2] | mc_words[3] | mc_words[4] | mc_words[5]

    # words that appear only in individual lists
    mc_words[201] = mc_words[1] - mc_words[2] - mc_words[3] - mc_words[4] - mc_words[5]
    mc_words[202] = mc_words[2] - mc_words[1] - mc_words[3] - mc_words[4] - mc_words[5]
    mc_words[203] = mc_words[3] - mc_words[1] - mc_words[2] - mc_words[4] - mc_words[5]
    mc_words[204] = mc_words[4] - mc_words[1] - mc_words[2] - mc_words[3] - mc_words[5]
    mc_words[205] = mc_words[5] - mc_words[1] - mc_words[2] - mc_words[3] - mc_words[4]

    # Words that appear in only 1 list
    mc_words[101] = mc_words[201] | mc_words[202] | mc_words[203] | mc_words[204] | mc_words[205]

    # Words that appear in any 2 lists
    mc_words[102] = (  ((mc_words[1] & mc_words[2]) - mc_words[3] - mc_words[4] - mc_words[5])
                     | ((mc_words[1] & mc_words[3]) - mc_words[2] - mc_words[4] - mc_words[5])
                     | ((mc_words[1] & mc_words[4]) - mc_words[2] - mc_words[3] - mc_words[5])
                     | ((mc_words[1] & mc_words[5]) - mc_words[2] - mc_words[3] - mc_words[4])
                     | ((mc_words[2] & mc_words[3]) - mc_words[1] - mc_words[4] - mc_words[5])
                     | ((mc_words[2] & mc_words[4]) - mc_words[1] - mc_words[3] - mc_words[5])
                     | ((mc_words[2] & mc_words[5]) - mc_words[1] - mc_words[3] - mc_words[4])
                     | ((mc_words[3] & mc_words[4]) - mc_words[1] - mc_words[2] - mc_words[5])
                     | ((mc_words[3] & mc_words[5]) - mc_words[1] - mc_words[2] - mc_words[4])
                     | ((mc_words[4] & mc_words[5]) - mc_words[1] - mc_words[2] - mc_words[3]))

    # Words that appear in any 3 lists
    mc_words[103] = (  ((mc_words[3] & mc_words[4] & mc_words[5]) - mc_words[1] - mc_words[2])
                     | ((mc_words[2] & mc_words[4] & mc_words[5]) - mc_words[1] - mc_words[3])
                     | ((mc_words[2] & mc_words[3] & mc_words[5]) - mc_words[1] - mc_words[4])
                     | ((mc_words[2] & mc_words[3] & mc_words[4]) - mc_words[1] - mc_words[5])
                     | ((mc_words[1] & mc_words[4] & mc_words[5]) - mc_words[2] - mc_words[3])
                     | ((mc_words[1] & mc_words[3] & mc_words[5]) - mc_words[2] - mc_words[4])
                     | ((mc_words[1] & mc_words[3] & mc_words[4]) - mc_words[2] - mc_words[5])
                     | ((mc_words[1] & mc_words[2] & mc_words[5]) - mc_words[3] - mc_words[4])
                     | ((mc_words[1] & mc_words[2] & mc_words[4]) - mc_words[3] - mc_words[5])
                     | ((mc_words[1] & mc_words[2] & mc_words[3]) - mc_words[4] - mc_words[5]))

    # Words that appear in any 4 lists
    mc_words[104] = (  ((mc_words[1] & mc_words[2] & mc_words[3] & mc_words[4]) - mc_words[5])
                     | ((mc_words[1] & mc_words[2] & mc_words[3] & mc_words[5]) - mc_words[4])
                     | ((mc_words[1] & mc_words[2] & mc_words[4] & mc_words[5]) - mc_words[3])
                     | ((mc_words[1] & mc_words[3] & mc_words[4] & mc_words[5]) - mc_words[2])
                     | ((mc_words[2] & mc_words[3] & mc_words[4] & mc_words[5]) - mc_words[1]))

    # Words that appear every list
    mc_words[105] = mc_words[1] & mc_words[2] & mc_words[3] & mc_words[4] & mc_words[5]

    # words that are added onto the core vocabulary
    mc_words[301] = mc_words[1] - mc_words[105]
    mc_words[302] = mc_words[2] - mc_words[105]
    mc_words[303] = mc_words[3] - mc_words[105]
    mc_words[304] = mc_words[4] - mc_words[105]
    mc_words[305] = mc_words[5] - mc_words[105]

# ================
# Frequency parsing

subtlex_word_set = set()
word_freq = {} # {"AB" : 1234, ...}
word_freq_index = {} # {"AB" : 1, ...}
word_freq_ordered = [] # [(1234, "AB"), ...] # sorted by descending frequency
part_of_multichar_word = set() # a set of characters that make up multi-character words
char_componentof = {} # {"A" : set(["AB", ...]}

char_freq = {} # {"A" : 6789, ...}
char_freq_index = {} # {"A" : 1, ...}
char_freq_ordered = [] # [(1234, "A"), ...] # sorted by descending frequency

# don't do anything fancy here, no point - want to show the actual freq
def query_word_freq(somehanzi):
    if somehanzi in word_freq:
        return word_freq[somehanzi]
    return 0

def query_char_freq(char):
    if char in char_freq:
        return char_freq[char]
    return 0

def query_radical_freq(char):
    if char in radical_freq:
        return radical_freq[char]
    return 0

max_freq_index = 999999

def query_word_freq_index(word):
    if word in word_freq_index:
        return word_freq_index[word]
    if word in cedict_definition:
        return max_freq_index
    return max_freq_index + 1

def query_char_freq_index(char):
    if char in char_freq_index:
        return char_freq_index[char]
    if char in hskchars:
        return max_freq_index
    if char in cedict_definition: # TODO: should be able to test if char is in any of the words in there too
        return max_freq_index + 1
    return max_freq_index + 2

def query_radical_freq_index(char):
    if char in radical_freq_index:
        return radical_freq_index[char]
    if char in hskchars:
        return max_freq_index
    if char in cedict_definition: # TODO: should be able to test if char is in any of the words in there too
        return max_freq_index + 1
    return max_freq_index + 2

# parse SUBTLEX word frequency
def parse_word_freq_file(infilename):
    global word_freq, word_freq_index, word_freq_ordered, part_of_multichar_word, char_componentof, subtlex_word_set
    try:
        with open(infilename + ".word_freq.cache", "rb") as pfile:
            word_freq = pickle.load(pfile)
        with open(infilename + ".word_freq_index.cache", "rb") as pfile:
            word_freq_index = pickle.load(pfile)
        with open(infilename + ".word_freq_ordered.cache", "rb") as pfile:
            word_freq_ordered = pickle.load(pfile)
        with open(infilename + ".part_of_multichar_word.cache") as pfile:
            part_of_multichar_word = pickle.load(pfile)
        with open(infilename + ".char_componentof.cache", "rb") as pfile:
            char_componentof = pickle.load(pfile)
        with open(infilename + ".subtlex_word_set.cache", "rb") as pfile:
            subtlex_word_set = pickle.load(pfile)
    except:
        word_freq = {} # {"AB" : 1234, ...}
        word_freq_index = {} # {"AB" : 1, ...}
        word_freq_ordered = [] # [(1234, "AB"), ...] # sorted by descending frequency
        part_of_multichar_word = set() # a set of characters that make up multi-character words
        char_componentof = {} # {"A" : set(["AB", ...]}
        subtlex_word_set = set()

        infile = codecs.open(infilename, 'r', "utf-8")
        freq_index = 1
        for line in infile:
            splitted = line.strip().split("\t")
            if len(splitted) == 7:
                word = unicodedata.normalize("NFKC", splitted[0].strip()).replace('\ufeff',"")
                freq = int(splitted[1].strip())
                if word != "" and freq > 0:
                    subtlex_word_set.add(word)
                    word_freq[word] = freq
                    word_freq_index[word] = freq_index
                    freq_index += 1
                    for char in word:
                        part_of_multichar_word.add(char)
                        if char not in char_componentof:
                            char_componentof[char] = set()
                        char_componentof[char].add(word)
        for word, freq in word_freq.items():
            word_freq_ordered.append( (freq, word) )
        word_freq_ordered.sort()
        word_freq_ordered.reverse()
        infile.close()
        with open(infilename + ".word_freq.cache", "wb") as pfile:
            pickle.dump(word_freq, pfile, -1)
        with open(infilename + ".word_freq_index.cache", "wb") as pfile:
            pickle.dump(word_freq_index, pfile, -1)
        with open(infilename + ".word_freq_ordered.cache", "wb") as pfile:
            pickle.dump(word_freq_ordered, pfile, -1)
        with open(infilename + ".part_of_multichar_word.cache", "wb") as pfile:
            pickle.dump(part_of_multichar_word, pfile, -1)
        with open(infilename + ".char_componentof.cache", "wb") as pfile:
            pickle.dump(char_componentof, pfile, -1)
        with open(infilename + ".subtlex_word_set.cache", "wb") as pfile:
            pickle.dump(subtlex_word_set, pfile, -1)

# parse SUBTLEX char frequency
def parse_char_freq_file(infilename):
    global char_freq, char_freq_index, char_freq_ordered
    try:
        with open(infilename + ".char_freq.cache", "rb") as pfile:
            char_freq = pickle.load(pfile)
        with open(infilename + ".char_freq_index.cache", "rb") as pfile:
            char_freq_index = pickle.load(pfile)
        with open(infilename + ".char_freq_ordered.cache", "rb") as pfile:
            char_freq_ordered = pickle.load(pfile)
    except:
        char_freq = {} # {"A" : 6789, ...}
        char_freq_index = {} # {"A" : 1, ...}
        char_freq_ordered = [] # [(1234, "A"), ...] # sorted by descending frequency

        infile = codecs.open(infilename, 'r', "utf-8")
        freq_index = 1
        for line in infile:
            splitted = line.strip().split("\t")
            if len(splitted) == 7:
                char = unicodedata.normalize("NFKC", splitted[0].strip()).replace('\ufeff',"")
                freq = int(splitted[1].strip())
                if char != "" and freq > 0:
                    char_freq[char] = freq
                    char_freq_index[char] = freq_index
                    freq_index += 1
        for char, freq in char_freq.items():
            char_freq_ordered.append( (freq, char) )
        char_freq_ordered.sort()
        char_freq_ordered.reverse()
        infile.close()
        with open(infilename + ".char_freq.cache", "wb") as pfile:
            pickle.dump(char_freq, pfile, -1)
        with open(infilename + ".char_freq_index.cache", "wb") as pfile:
            pickle.dump(char_freq_index, pfile, -1)
        with open(infilename + ".char_freq_ordered.cache", "wb") as pfile:
            pickle.dump(char_freq_ordered, pfile, -1)

# ================
# CC-CEDICT parsing for definitions, pinyin, traditional characters

cedict_traditional = {}
cedict_pinyintonemarks = {}
cedict_pinyintonenum = {}
toneless_pinyin = {} # { "hao" : set([hanzi, ...])}
toned_pinyin = {} # { "ha^o" : set([hanzi, ...])}
tonenum_pinyin = {} # { "hao3" : set([hanzi, ...])}
cedict_definition = {} # hanzi : [definitions]
english_words = {} # { "test" : set([hanzi, ...])}
cedict_word_set = set()
variant_trad = {} # { "h" : set(["H", ...])}
variant_simp = {} # { "h" : set(["H", ...])}

def get_words_from_pinyin(pinyin):
    results = set()
    pylower = pinyin.lower()
    pytones = pinyin_numbers_to_tone_marks(pylower)
    if pylower in toneless_pinyin:
        results = toneless_pinyin[pylower]
    if pytones in toned_pinyin:
        results |= toned_pinyin[pytones]
    return results

def get_words_from_english(english):
    lower = english.lower()
    if lower in english_words:
        return english_words[lower]
    return set()

ccedict_variant_re = re.compile("(also written|variant of|written as) ([^ \[\],\.\(\)]+)")
ccedict_lineparse  = re.compile("^(\S+)\s+(\S+).*?\[(.*?)\] /(.*)")
def parse_ccedict(infilename):
    global cedict_traditional, cedict_pinyintonemarks, cedict_pinyintonenum, toneless_pinyin, toned_pinyin, cedict_definition, english_words, cedict_word_set, tonenum_pinyin, variant_trad, variant_simp
    try:
        with open(infilename + ".cedict_traditional.cache", "rb") as pfile:
            cedict_traditional = pickle.load(pfile)
        with open(infilename + ".cedict_pinyintonemarks.cache", "rb") as pfile:
            cedict_pinyintonemarks = pickle.load(pfile)
        with open(infilename + ".cedict_pinyintonenum.cache", "rb") as pfile:
            cedict_pinyintonenum = pickle.load(pfile)
        with open(infilename + ".toneless_pinyin.cache", "rb") as pfile:
            toneless_pinyin = pickle.load(pfile)
        with open(infilename + ".toned_pinyin.cache", "rb") as pfile:
            toned_pinyin = pickle.load(pfile)
        with open(infilename + ".cedict_definition.cache", "rb") as pfile:
            cedict_definition = pickle.load(pfile)
        with open(infilename + ".english_words.cache", "rb") as pfile:
            english_words = pickle.load(pfile)
        with open(infilename + ".cedict_word_set.cache", "rb") as pfile:
            cedict_word_set = pickle.load(pfile)
        with open(infilename + ".tonenum_pinyin.cache", "rb") as pfile:
            tonenum_pinyin = pickle.load(pfile)
        with open(infilename + ".variant_trad.cache", "rb") as pfile:
            variant_trad = pickle.load(pfile)
        with open(infilename + ".variant_simp.cache", "rb") as pfile:
            variant_simp = pickle.load(pfile)
    except:
        cedict_traditional = {}
        cedict_pinyintonemarks = {}
        cedict_pinyintonenum = {}
        toneless_pinyin = {} # { "hao" : set([hanzi, ...])}
        toned_pinyin = {} # { "ha^o" : set([hanzi, ...])}
        tonenum_pinyin = {} # { "hao3" : set([hanzi, ...])}
        cedict_definition = {} # hanzi : [definitions]
        english_words = {} # { "test" : set([hanzi, ...])}
        cedict_word_set = set()
        variant_trad = {} # { "h" : set(["H", ...])}
        variant_simp = {} # { "h" : set(["H", ...])}

        infile = codecs.open(infilename, 'r', "utf-8")
        for line in infile:
            if line[0] != "#":
                match = ccedict_lineparse.search(line)
                if match is not None:
                    trad = match.group(1)
                    word = match.group(2)
                    pinyin = match.group(3)
                    definition = match.group(4)
                    add_dict_entry(word, trad, pinyin, definition)
        with open(infilename + ".cedict_traditional.cache", "wb") as pfile:
            pickle.dump(cedict_traditional, pfile, -1)
        with open(infilename + ".cedict_pinyintonemarks.cache", "wb") as pfile:
            pickle.dump(cedict_pinyintonemarks, pfile, -1)
        with open(infilename + ".cedict_pinyintonenum.cache", "wb") as pfile:
            pickle.dump(cedict_pinyintonenum, pfile, -1)
        with open(infilename + ".toneless_pinyin.cache", "wb") as pfile:
            pickle.dump(toneless_pinyin, pfile, -1)
        with open(infilename + ".toned_pinyin.cache", "wb") as pfile:
            pickle.dump(toned_pinyin, pfile, -1)
        with open(infilename + ".cedict_definition.cache", "wb") as pfile:
            pickle.dump(cedict_definition, pfile, -1)
        with open(infilename + ".english_words.cache", "wb") as pfile:
            pickle.dump(english_words, pfile, -1)
        with open(infilename + ".cedict_word_set.cache", "wb") as pfile:
            pickle.dump(cedict_word_set, pfile, -1)
        with open(infilename + ".tonenum_pinyin.cache", "wb") as pfile:
            pickle.dump(tonenum_pinyin, pfile, -1)
        with open(infilename + ".variant_trad.cache", "wb") as pfile:
            pickle.dump(variant_trad, pfile, -1)
        with open(infilename + ".variant_simp.cache", "wb") as pfile:
            pickle.dump(variant_simp, pfile, -1)

removetone = re.compile("[012345]")
findenglish = re.compile("[A-Za-z]+")
def add_dict_entry(word, trad, pinyinorig, definition):
    if word != "":
        cedict_word_set.add(word)
        pinyin = pinyinorig.replace(" ", "")
        if pinyin != "":
            pinyin_notones = removetone.sub("", pinyinorig).lower()
            pinyin_tones = pinyin_numbers_to_tone_marks(pinyin)
            if len(pinyin_notones) > 0:
                if pinyin_notones not in toneless_pinyin:
                    toneless_pinyin[pinyin_notones] = set()
                toneless_pinyin[pinyin_notones].add(word)
            if len(pinyin_tones) > 0:
                pylower = pinyin_tones.lower()
                if pylower not in toned_pinyin:
                    toned_pinyin[pylower] = set()
                toned_pinyin[pylower].add(word)
            if len(pinyin) > 0:
                pylower = pinyin.lower().replace(" ", "")
                if pylower not in tonenum_pinyin:
                    tonenum_pinyin[pylower] = set()
                tonenum_pinyin[pylower].add(word)
            if word not in cedict_pinyintonenum:
                cedict_pinyintonenum[word] = []
            cedict_pinyintonenum[word].append(pinyin)
            if word not in cedict_pinyintonemarks:
                cedict_pinyintonemarks[word] = []
            cedict_pinyintonemarks[word].append(pinyin_tones)
        for e in findenglish.findall(definition):
            elower = e.lower()
            if elower not in english_words:
                english_words[elower] = set()
            english_words[elower].add(word)
        if trad != "":
            if word not in cedict_traditional:
                cedict_traditional[word] = []
            cedict_traditional[word].append(trad)
        if definition != "":
            if word not in cedict_definition:
                cedict_definition[word] = []
            cedict_definition[word].append(pinyin_numbers_to_tone_marks(definition))
            for varmatchobj in ccedict_variant_re.finditer(definition):
                if varmatchobj:
                    varstr = varmatchobj.group(2)
                    if "|" in varstr:
                        tradvar, simpvar = varstr.split("|")
                    else:
                        tradvar, simpvar = varstr, varstr
                    if trad not in variant_trad:
                        variant_trad[trad] = set()
                    if tradvar not in variant_trad:
                        variant_trad[tradvar] = set()
                    if word not in variant_simp:
                        variant_simp[word] = set()
                    if simpvar not in variant_simp:
                        variant_simp[simpvar] = set()
                    variant_trad[trad].add(tradvar)
                    variant_trad[tradvar].add(trad)
                    variant_simp[word].add(simpvar)
                    variant_simp[simpvar].add(word)


# need to filter out invalid chars
invalid_unicode_re_pattern = re.compile('[^\u0000-\uD7FF\uE000-\uFFFF]', re.UNICODE)
ignore_invalid_unicode = False

# ================
# parse wikimedia composition file
cc_components = {} # {"H" : set(["|", "-"])}
cc_composes = {} # {"-" : set(["H"]), "|" : set(["H"])}
cc_radicals = {} # {"|" : set(["H"])}
cc_radicalof = {} # {"H" : "|"}
cc_strokes = {} # {"H" : 3}

def parse_cc_file(infilename):
    global cc_components, cc_composes, cc_radicals, cc_radicalof, cc_strokes
    try:
        with open(infilename + ".cc_components.cache", "rb") as pfile:
            cc_components = pickle.load(pfile)
        with open(infilename + ".cc_composes.cache", "rb") as pfile:
            cc_composes = pickle.load(pfile)
        with open(infilename + ".cc_radicals.cache", "rb") as pfile:
            cc_radicals = pickle.load(pfile)
        with open(infilename + ".cc_radicalof.cache", "rb") as pfile:
            cc_radicalof = pickle.load(pfile)
        with open(infilename + ".cc_strokes.cache", "rb") as pfile:
            cc_strokes = pickle.load(pfile)
    except:
        cc_components = {} # {"H" : set(["|", "-"])}
        cc_composes = {} # {"-" : set(["H"]), "|" : set(["H"])}
        cc_radicals = {} # {"|" : set(["H"])}
        cc_radicalof = {} # {"H" : "|"}
        cc_strokes = {} # {"H" : 3}

        infile = codecs.open(infilename, 'r', "utf-8")
        for line in infile:
            if ignore_invalid_unicode and invalid_unicode_re_pattern.search(line) != None:
                print("Ignoring line with invalid Unicode: ", line)
                continue
            splitted = line.strip("\r\n").replace('\ufeff',"").split("\t")
            if len(splitted) == 12:
                zi = splitted[1]
                strokes = splitted[2]
                first = splitted [4]
                second = splitted[7]
                radical = splitted [11]
                for char in first + second:
                    if char != "" and char != zi and char != "*":
                        if zi not in cc_components:
                            cc_components[zi] = set()
                        cc_components[zi].add(char)
                        if char not in cc_composes:
                            cc_composes[char] = set()
                        cc_composes[char].add(zi)
                if radical== "*":
                    if zi not in cc_radicals:
                        cc_radicals[zi] = set()
                    cc_radicals[zi].add(zi)
                    cc_radicalof[zi] = zi
                elif radical != "":
                    if radical not in cc_radicals:
                        cc_radicals[radical] = set()
                    cc_radicals[radical].add(zi)
                    cc_radicalof[zi] = radical
                if zi not in cc_strokes:
                    cc_strokes[zi] = int(strokes)
        with open(infilename + ".cc_components.cache", "wb") as pfile:
            pickle.dump(cc_components, pfile, -1)
        with open(infilename + ".cc_composes.cache", "wb") as pfile:
            pickle.dump(cc_composes, pfile, -1)
        with open(infilename + ".cc_radicals.cache", "wb") as pfile:
            pickle.dump(cc_radicals, pfile, -1)
        with open(infilename + ".cc_radicalof.cache", "wb") as pfile:
            pickle.dump(cc_radicalof, pfile, -1)
        with open(infilename + ".cc_strokes.cache", "wb") as pfile:
            pickle.dump(cc_strokes, pfile, -1)

def get_char_composition(query):
    result = []
    if query in cc_components:
        result.append("""<ul class="tree">""")
        for c in freqorder_char(cc_components[query]):
            result.append("""<li>{}""".format(hanzideflink(c, c, "char")))
            if getform("expand") == "yes":
                result.append(("&nbsp;" * 8) + get_compact_hanzi_info(c, 80))
            result = result + get_char_composition(c)
            result.append("</li>")
        result.append("</ul>")
    return result

def get_char_composes(query):
    result = []
    if query in cc_composes:
        result.append("""<ul class="tree">""")
        expandyes = getform("expand") == "yes"
        needsendli = False
        isfirst = True
        subresult = []
        for c in freqorder_char(cc_composes[query]):
            haschildren = c in cc_composes
            if isfirst or expandyes or haschildren:
                if needsendli:
                    subresult.append("</li>")
                subresult.append("""<li>{}""".format(hanzideflink(c, c, "char")))
                if expandyes:
                    subresult.append(("&nbsp;" * 8) + get_compact_hanzi_info(c, 80))
                if haschildren:
                    subresult = subresult + get_char_composes(c)
                    isfirst = True
                else:
                    isfirst = False
                needsendli = True
            else:
                subresult.append(chinese_comma_sep)
                subresult.append(hanzideflink(c, c, "char"))
                needsendli = False
        result.append("".join(subresult))
        if needsendli:
            result.append("</li>")
        result.append("</ul>")
    return result

def get_char_composition_set(query):
    result = set()
    if query in cc_components:
        for c in cc_components[query]:
            result.add(c)
            result |= get_char_composition_set(c)
    return result

def get_char_composes_set(query):
    result = set()
    if query in cc_composes:
        for c in cc_composes[query]:
            result.add(c)
            result |= get_char_composes_set(c)
    return result

def get_dictionary_entry(word):
    results = []
    if word in cedict_definition:
        definition = ""
        for d in cedict_definition[word]:
            dstrip = d.strip("\r\n ,/")
            if len(dstrip):
                if len(definition):
                    definition += ", "
                definition += dstrip
        results.append(definition)
    return ", ".join(results)

def get_full_hanzi_info(hanzi,  maxlen):
    charbits = []
    wordbits = []
    chardefbits = []
    worddefbits = []
    if hanzi in cc_radicals:
        charbits.append("is radical, radical {} {}".format("freq index ", query_radical_freq_index(hanzi)))
    if hanzi in cc_radicalof:
        charbits.append("""radical {}""".format(hanzideflink(cc_radicalof[hanzi], cc_radicalof[hanzi], "char")))
    if hanzi in cc_strokes:
        strokes = cc_strokes[hanzi]
        charbits.append("""{} stroke{}""".format(strokes, "s" if strokes > 1 else ""))
    charfreqidx = query_char_freq_index(hanzi)
    if charfreqidx < max_freq_index:
        charbits.append("{} {}".format("freq index ", charfreqidx))
    wordfreqidx = query_word_freq_index(hanzi)
    if wordfreqidx < max_freq_index:
        wordbits.append("{} {}".format("freq index ", wordfreqidx))
    expandtext = "?expand=yes" if getform("expand") == "yes" else ""
    charlevel = query_hsk_char_level_negative_notfound(hanzi)
    wordlevel = query_hsk_word_level_negative_notfound(hanzi)
    result = ""
    if len(charbits) > 0  or len(wordbits) > 0 or len(worddefbits) > 0 or len(chardefbits) > 0 or charlevel > 0 or wordlevel > 0:
        if len (wordbits) > 0 or wordlevel > 0 or len(worddefbits) > 0:
            if wordlevel > 0:
                result += """<a href="/hskwords{0}#hsk{1}" class="hsk{1}">HSK {1} word</a>: """.format(expandtext, wordlevel)
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
                result += """<a href="/hskchars{0}#hsk{1}" class="hsk{1}">HSK {1} {2}</a>: """.format(expandtext, charlevel, "character")
            else:
                result += "Character: "
            if len(charbits) > 0:
                result += ", ".join(charbits)
        if len(chardefbits) > 0:
            if len(result) > 0 and result[-1] != " ":
                result += ", "
            result += ", ".join(chardefbits)
    return result

def get_compact_hanzi_info(hanzi, maxlen):
    defbits = get_hanzi_compactdeflist(hanzi, maxlen)
    result = ", ".join(defbits)
    return result

def get_linktext_hanzi_info(word, char, maxlen):
    chardefbits = []
    worddefbits = get_hanzi_compactdeflist(word, maxlen)
    result = ""
    wordlevel = query_hsk_word_level_negative_notfound(word)
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
            results.append ("/".join([p for p in pinyin]))
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

def removedupes(source):
    result = []
    for s in source:
        if s not in result:
            result.append(s)
    return result


# radicals
radical_freq = {}
radical_freq_index = {}
hsk_radical_level = {} # {"A" : 1, "B" : 1 , "C" : 1}

# init_radical_data
def init_radical_data(indir):
    global radical_freq, radical_freq_index, hsk_radical_level
    try:
        with open(indir + "radical_freq.cache", "rb") as pfile:
            radical_freq = pickle.load(pfile)
        with open(indir + "radical_freq_index.cache", "rb") as pfile:
            radical_freq_index = pickle.load(pfile)
        with open(indir + "hsk_radical_level.cache", "rb") as pfile:
            hsk_radical_level = pickle.load(pfile)
    except:
        radical_freq = {}
        radical_freq_index = {}
        hsk_radical_level = {} # {"A" : 1, "B" : 1 , "C" : 1}

        build_radical_data()

        with open(indir + "radical_freq.cache", "wb") as pfile:
            pickle.dump(radical_freq, pfile, -1)
        with open(indir + "radical_freq_index.cache", "wb") as pfile:
            pickle.dump(radical_freq_index, pfile, -1)
        with open(indir + "hsk_radical_level.cache", "wb") as pfile:
            pickle.dump(hsk_radical_level, pfile, -1)

def build_radical_data():
    for char, freq in char_freq.items():
        if char in cc_radicalof:
            radical = cc_radicalof[char]
            if radical not in radical_freq:
                radical_freq[radical] = 0
            radical_freq[radical] += freq
            radical_level = query_hsk_char_level(radical)
            char_level_char = query_hsk_char_level(char)
            if char_level_char != 0 and char_level_char < radical_level:
                radical_level = char_level_char
            if (   (radical in hsk_radical_level and radical_level < hsk_radical_level[radical] and radical_level != 0)
                or (radical not in hsk_radical_level)):
                hsk_radical_level[radical] = radical_level
    freqorder = [(freq, radical) for (radical, freq) in radical_freq.items()]
    freqorder.sort()
    freqorder.reverse()
    for i in range(len(freqorder)):
        radical_freq_index[freqorder[i][1]] = i+1

# ================
# Pinyin numbers to tone marks

pinyintones = ["A\u0100\u00C1\u01CD\u00C0A", "a\u0101\u00E1\u01CE\u00E0a",
               "E\u0112\u00C9\u011A\u00C8E", "e\u0113\u00E9\u011B\u00E8e",
               "O\u014C\u00D3\u01D1\u00D2O", "o\u014D\u00F3\u01D2\u00F2o",
               "I\u012A\u00CD\u01CF\u00CCI", "i\u012B\u00ED\u01D0\u00ECi",
               "U\u016A\u00DA\u01D3\u00D9U", "u\u016B\u00FA\u01D4\u00F9u",
               "\u00DC\u01D5\u01D7\u01D9\u01DB\u00DC", "\u00FC\u01D6\u01D8\u01DA\u01DC\u00FC"]
pyreplacements = [("u:", "\u00FC"), ("v", "\u00FC"), ("U:", "\u00DC"), ("V", "\u00DC")]
pinyinfindregex = re.compile("([A-Za-z\u00FC\u00DC:]+)([1-5])")

def pinyin_numbers_to_tone_marks(inputstr):
    result = []
    nexthanzi = 0
    for match in pinyinfindregex.finditer(inputstr):
        if nexthanzi != match.start():
            result.append(inputstr[nexthanzi:match.start()])
        syllable = match.group(1)
        for fr, to in pyreplacements:
            syllable = syllable.replace(fr, to)
        tone = int(match.group(2))
        for tonetest in pinyintones:
            if tonetest[0] in syllable and not (tonetest[0].lower() == "i" and "iu" in syllable.lower()):
                syllable = syllable.replace(tonetest[0], tonetest[tone])
                break
        result.append(syllable)
        nexthanzi = match.end()
    if nexthanzi < len(inputstr):
        result.append(inputstr[nexthanzi:])
    return "".join(result)

# correct invalid pinyin tone marks
brevetocaron = {
    "\u0103" : "\u01CE", # a breve -> a caron
    "\u0115" : "\u011B", # e breve -> e caron
    "\u014F" : "\u01D2", # o breve -> o caron
    "\u012D" : "\u01D0", # i breve -> i caron
    "\u016D" : "\u01D4", # u breve -> u caron
    "\u0102" : "\u01CD", # A breve -> A caron
    "\u0114" : "\u011A", # E breve -> E caron
    "\u014E" : "\u01D1", # O breve -> O caron
    "\u012C" : "\u01CF", # I breve -> I caron
    "\u016C" : "\u01D3", # U breve -> U caron
}

def fixpinyin(pinyin):
    pinyinfix = ""
    countfixed = 0
    fixed = []
    normalized = unicodedata.normalize("NFKC", pinyin)
    for c in normalized:
        if c in brevetocaron:
            fixed.append(brevetocaron[c])
            countfixed += 1
        else:
            fixed.append(c)
    pinyinfix = "".join(fixed)
    return (pinyinfix, countfixed)
