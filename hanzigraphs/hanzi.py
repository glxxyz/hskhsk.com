from flask import Flask, request
# from flask import Flask, request, url_for
import codecs, unicodedata, urllib
# import math, time, re, os, os.path, random

app = Flask(__name__)
app.secret_key = 's9z9g8bs8b0jis secret key fdsfsdlj34634jhlh'

# try to get the value both from the args and the form
def getform(key, default=u""):
    value = request.args.get(key, default)
    if value == u"" and key in request.form:
        value = request.form[key]
    return value

@app.route('/', methods=['GET', 'POST'])
def handle_root():
    init_resources()
    results = []
    results.append("<html>\n<head>")
    results.append(u"<title>HSK\u4E1C\u897F Scripts</title>")
    results.append("</head>\n<body>")
    results.append(u"""<a href="http://hskhsk.com/">HSK\u4E1C\u897F</a>""")
    results.append(u"<h1>HSK\u4E1C\u897F Scripts</h1>")
    results.append("Tools")
    results.append("<ul>")
    results.append(u"""<li><a href="/hanzi">Analyse Your \u6C49\u5B57 Vocabulary/Text</a></li>""")
    results.append(u"""<li><a href="/hskwords20102012">Where the HSK 2010 words are in 2013</a></li>""")
    results.append(u"""<li><a href="/hskchars20102012">Where the HSK 2010 characters are in 2013</a></li>""")
    results.append("</ul>")
    results.append("New HSK Lists")
    results.append("<ul>")
    results.append("""<li><a href="/hskwords">HSK Words 2012/2013</a></li>""")
    results.append("""<li><a href="/hskchars">HSK Characters 2012/2013</a></li>""")
    results.append("""<li><a href="/hskwords2010">HSK Words 2010 (outdated)</a></li>""")
    results.append("""<li><a href="/hskchars2010">HSK Characters 2010 (outdated)</a></li>""")
    results.append("</ul>")
    results.append("</body>\n</html>")
    return u"\n".join(results)

@app.route('/hsk', methods=['GET', 'POST'])
def handle_hsk():
    return handle_root()

@app.route('/hskwords', methods=['GET', 'POST'])
def handle_hskwords():
    return handle_hskwords2012()

@app.route('/hskchars', methods=['GET', 'POST'])
def handle_hskchars():
    return handle_hskchars2012()

@app.route('/hskwords2012', methods=['GET', 'POST'])
def handle_hskwords2012():
    init_resources()
    results = []
    results.append("<html>\n<head>")
    results.append(u"<title>New HSK 2013 Words</title>")
    results.append(u"<style>.definition {color: #000; text-decoration: none; }</style>")
    results.append("</head>\n<body>")
    results.append(u"""<a href="http://hskhsk.com/word-lists">HSK\u4E1C\u897F</a>""")
    results.append(u"""<a href="/">Scripts</a>""")
    results.append("""<a href="/hskchars">HSK Characters</a>""")
    results.append(u"<h1>New HSK 2013 Words</h1>")
    for i in range(1, 7):
        results.append(u"<h3>HSK {}</h3>".format(i))
        results.append(", ".join(freqorder_word_link(hskwords[i])))
    results.append("</body>\n</html>")
    return u"\n".join(results)

@app.route('/hskchars2012', methods=['GET', 'POST'])
def handle_hskchars2012():
    init_resources()
    results = []
    results.append("<html>\n<head>")
    results.append(u"<title>New HSK 2013 Characters</title>")
    results.append(u"<style>.definition {color: #000; text-decoration: none; }</style>")
    results.append("</head>\n<body>")
    results.append(u"""<a href="http://hskhsk.com/word-lists">HSK\u4E1C\u897F</a>""")
    results.append(u"""<a href="/">Scripts</a>""")
    results.append("""<a href="/hskwords">HSK Words</a>""")
    results.append(u"<h1>HSK 2013 Characters</h1>")
    for i in range(1, 7):
        results.append(u"<h3>HSK {}</h3>".format(i))
        results.append(u", ".join(freqorder_char_link(hskchars[i])))
    results.append("</body>\n</html>")
    return u"\n".join(results)

@app.route('/hskwords2010', methods=['GET', 'POST'])
def handle_hskwords2010():
    init_resources()
    results = []
    results.append("<html>\n<head>")
    results.append(u"<title>New HSK 2010 Words (outdated)</title>")
    results.append(u"<style>.definition {color: #000; text-decoration: none; }</style>")
    results.append("</head>\n<body>")
    results.append(u"""<a href="http://hskhsk.com/word-lists">HSK\u4E1C\u897F</a>""")
    results.append(u"""<a href="/">Scripts</a>""")
    results.append("""<a href="/hskchars2010">HSK Characters 2010 (outdated)</a>""")
    results.append("""<a href="/hskchars">HSK Characters 2012/2013</a>""")
    results.append(u"<h1>New HSK 2010 Words (outdated)</h1>")
    for i in range(1, 7):
        results.append(u"<h3>HSK {}</h3>".format(i))
        results.append(", ".join(freqorder_word_link(hskwords2010[i])))
    results.append("</body>\n</html>")
    return u"\n".join(results)

@app.route('/hskchars2010', methods=['GET', 'POST'])
def handle_hskchars2010():
    init_resources()
    results = []
    results.append("<html>\n<head>")
    results.append(u"<title>New HSK 2010 Characters (oudated)</title>")
    results.append(u"<style>.definition {color: #000; text-decoration: none; }</style>")
    results.append("</head>\n<body>")
    results.append(u"""<a href="http://hskhsk.com/word-lists">HSK\u4E1C\u897F</a>""")
    results.append(u"""<a href="/">Scripts</a>""")
    results.append("""<a href="/hskwords2010">HSK Words 2010 (outdated)</a>""")
    results.append("""<a href="/hskwords">HSK Words 2012/2013</a>""")
    results.append(u"<h1>New HSK 2010 Characters (outdated)</h1>")
    for i in range(1, 7):
        results.append(u"<h3>HSK {}</h3>".format(i))
        results.append(u", ".join(freqorder_char_link(hskchars2010[i])))
    results.append("</body>\n</html>")
    return u"\n".join(results)

@app.route('/hskwords20102012', methods=['GET', 'POST'])
def handle_hskwords20102012():
    init_resources()
    results = []
    results.append("<html>\n<head>")
    results.append(u"<title>Where the HSK 2010 Words are in 2012/2013</title>")
    results.append(u"<style>.definition {color: #000; text-decoration: none; }</style>")
    results.append("</head>\n<body>")
    results.append(u"""<a href="http://hskhsk.com/word-lists">HSK\u4E1C\u897F</a>""")
    results.append(u"""<a href="/">Scripts</a>""")
    results.append("""<a href="/hskchars20102012">Where the HSK 2010 Characters are in 2013</a>""")
    results.append(u"<h1>Where the HSK 2010 Words are in 2013</h1>")
    results.append("""<p>This page shows where the words in the New HSK 2010 ended up when the word lists were revised in 2012 (also valid for 2013).</p>
<table border="1" style="border-collapse:collapse;" cellpadding="2em" cellspacing="0">
<tr><th rowspan=2 colspan=2 style="background-color: #BBBBBB;"></th><th colspan=7>HSK 2012-2013</th></tr>
<tr>
<th><div style="white-space: nowrap;">&nbsp;&nbsp;&nbsp;&nbsp;HSK 1&nbsp;&nbsp;&nbsp;&nbsp;</div></th>
<th><div style="white-space: nowrap;">&nbsp;&nbsp;&nbsp;&nbsp;HSK 2&nbsp;&nbsp;&nbsp;&nbsp;</div></th>
<th><div style="white-space: nowrap;">&nbsp;&nbsp;&nbsp;&nbsp;HSK 3&nbsp;&nbsp;&nbsp;&nbsp;</div></th>
<th><div style="white-space: nowrap;">&nbsp;&nbsp;&nbsp;&nbsp;HSK 4&nbsp;&nbsp;&nbsp;&nbsp;</div></th>
<th><div style="white-space: nowrap;">&nbsp;&nbsp;&nbsp;&nbsp;HSK 5&nbsp;&nbsp;&nbsp;&nbsp;</div></th>
<th><div style="white-space: nowrap;">&nbsp;&nbsp;&nbsp;&nbsp;HSK 6&nbsp;&nbsp;&nbsp;&nbsp;</div></th>
<th><div style="white-space: nowrap;">&nbsp;&nbsp;&nbsp;&nbsp;Non-HSK&nbsp;&nbsp;&nbsp;&nbsp;</div></th>
</tr>""")
    for old in range(1, 8):
        results.append("<tr>")
        if old == 1:
            results.append("""<th rowspan=7>HSK 2010</th>""")
        if old == 7:
            results.append("""<th><div style="white-space: nowrap;">Non-HSK</div></th>""")
        else:
            results.append("""<th><div style="white-space: nowrap;">HSK {}</div></th>""".format(old))
        for new in range(1, 8):
            if old == new:
                results.append("""<td style="background-color: #BBBBBB;"></td>""")
            else:
                if old == 7:
                    somehanzi = hskwords[new] - hskwords2010[16]
                elif new == 7:
                    somehanzi = hskwords2010[old] - hskwords[16]
                else:
                    somehanzi = hskwords2010[old] & hskwords[new]
                results.append("<td>")
                results.append(u", ".join(freqorder_word_link(somehanzi)))
                results.append("</td>")
        results.append("</tr>")
    results.append("</table>\n</body>\n</html>")
    return u"\n".join(results)

@app.route('/hskchars20102012', methods=['GET', 'POST'])
def handle_hskchars20102012():
    init_resources()
    results = []
    results.append("<html>\n<head>")
    results.append(u"<title>Where the HSK 2010 Characters are in 2013</title>")
    results.append(u"<style>.definition {color: #000; text-decoration: none; }</style>")
    results.append("</head>\n<body>")
    results.append(u"""<a href="http://hskhsk.com/word-lists">HSK\u4E1C\u897F</a>""")
    results.append(u"""<a href="/">Scripts</a>""")
    results.append("""<a href="/hskwords20102012">Where the HSK 2010 Words are in 2013</a>""")
    results.append(u"<h1>Where the HSK 2010 Characters are in 2013</h1>")
    results.append("""<p>This page shows where the characters in the New HSK 2010 ended up when the word lists were revised in 2012 (also valid for 2013).</p>
<table border="1" style="border-collapse:collapse;" cellpadding="2em" cellspacing="0">
<tr><th rowspan=2 colspan=2 style="background-color: #BBBBBB;"></th><th colspan=7>HSK 2012-2013</th></tr>
<tr>
<th><div style="white-space: nowrap;">&nbsp;&nbsp;&nbsp;&nbsp;HSK 1&nbsp;&nbsp;&nbsp;&nbsp;</div></th>
<th><div style="white-space: nowrap;">&nbsp;&nbsp;&nbsp;&nbsp;HSK 2&nbsp;&nbsp;&nbsp;&nbsp;</div></th>
<th><div style="white-space: nowrap;">&nbsp;&nbsp;&nbsp;&nbsp;HSK 3&nbsp;&nbsp;&nbsp;&nbsp;</div></th>
<th><div style="white-space: nowrap;">&nbsp;&nbsp;&nbsp;&nbsp;HSK 4&nbsp;&nbsp;&nbsp;&nbsp;</div></th>
<th><div style="white-space: nowrap;">&nbsp;&nbsp;&nbsp;&nbsp;HSK 5&nbsp;&nbsp;&nbsp;&nbsp;</div></th>
<th><div style="white-space: nowrap;">&nbsp;&nbsp;&nbsp;&nbsp;HSK 6&nbsp;&nbsp;&nbsp;&nbsp;</div></th>
<th><div style="white-space: nowrap;">&nbsp;&nbsp;&nbsp;&nbsp;Non-HSK&nbsp;&nbsp;&nbsp;&nbsp;</div></th>
</tr>""")
    for old in range(1, 8):
        results.append("<tr>")
        if old == 1:
            results.append("""<th rowspan=7>HSK 2010</th>""")
        if old == 7:
            results.append("""<th><div style="white-space: nowrap;">Non-HSK</div></th>""")
        else:
            results.append("""<th><div style="white-space: nowrap;">HSK {}</div></th>""".format(old))
        for new in range(1, 8):
            if old == new:
                results.append("""<td style="background-color: #BBBBBB;"></td>""")
            else:
                if old == 7:
                    somehanzi = hskchars[new] - hskchars2010[16]
                elif new == 7:
                    somehanzi = hskchars2010[old] - hskchars[16]
                else:
                    somehanzi = hskchars2010[old] & hskchars[new]
                results.append("<td>")
                results.append(u", ".join(freqorder_char_link(somehanzi)))
                results.append("</td>")
        results.append("</tr>")
    results.append("</table>\n</body>\n</html>")
    return u"\n".join(results)

@app.route('/hanzi', methods=['GET', 'POST'])
def handle_hanzi():
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
    addfreqindexchecked = "checked" if getform("addfreqindex", defaultistrue) else ""
    addfreqvaluechecked = "checked" if getform("addfreqvalue") else ""

    oneperlinechecked = ""
    blockchecked = "checked" if getform("format") == "block" else ""
    if blockchecked == "":
        oneperlinechecked = "checked"

    defaulthanzi = u""
    hanzi = getform("hanzi", defaulthanzi)
    results = []
    results.append("<html>\n<head>")
    results.append(u"<title>Analyse Your \u6C49\u5B57 Vocabulary/Text</title>")
    results.append("""<style>
        .box {
            display: inline-block;
        }

        .title {
            text-align:center;
            font-weight: bolder;
        }

        .indent {
            clear: both;
            padding-left: 1.8em;
            text-indent: -1.3em;
        }

        table tr td {
            padding-right: 1em;
        }

        .compact {
            margin-bottom: 0.4em;
            margin-top: 0.2em;
        }
    </style>""")
    results.append("</head>")
    results.append("<body>")
    results.append(u"""<a href="http://hskhsk.com/analyse.html">HSK\u4E1C\u897F</a>""")
    results.append(u"""<a href="/">Scripts</a>""")
    results.append(u"""<h1 class="compact">Analyse Your \u6C49\u5B57 Vocabulary/Text</h1>
        <form method="POST" action="/hanzi">
        <input type='hidden' value='true' name='ignoredefaults'>
        <table>
            <tr><td valign="top">
                <h3 class="compact">Actions</h3>
                <div class="indent"><input type="checkbox" name="analysevocab" value="true" {}>Analyse words/characters in input</input></div>
                <div class="indent"><input type="checkbox" name="analysehskwords" value="true" {}>Analyse HSK words in input</input></div>
                <div class="indent"><input type="checkbox" name="analysehskchars" value="true" {}>Analyse HSK characters in input</input></div>
                <div class="indent"><input type="checkbox" name="suggesthskwords" value="true" {}>Suggest HSK words not in input</input></div>
                <div class="indent"><input type="checkbox" name="suggesthskchars" value="true" {}>Suggest HSK characters not in input</input></div>
                <div class="indent"><input type="checkbox" name="suggestwords" value="true" {}>Suggest words not input</input></div>
                <div class="indent"><input type="checkbox" name="suggestwordsreuse" value="true" {}>Suggest words using characters in input</input></div>
                <div class="indent"><input type="checkbox" name="suggestchars" value="true" {}>Suggest characters not in input</input></div>
            </td>
            <td valign="top">
                <h3 class="compact">Vocabulary/Text Input Options</h3>
                <div class="indent"><input type="radio" name="format" value="oneperline" {}>One word/character per line (anything after first whitespace ignored, use this for Skritter word lists)</input></div>
                <div class="indent"><input type="radio" name="format" value="block" {}>Big block of text (use this if pasting from a web page etc.)</input></div>
                </ul>
                <h3 class="compact">Hanzi List Output Options</h3>
                <div class="indent"><input type="checkbox" name="addfreqindex" value="true" {}>Add SUBTLEX-CH frequency index (1 for highest frequency word/character, higher values are less frequent)</input></div>
                <div class="indent"><input type="checkbox" name="addfreqvalue" value="true" {}>Add SUBTLEX-CH raw word/character frequency (higher values are more frequent)</div>
            </td></tr>
        </table>
        <h3 class="compact">Input your simpflified Chinese vocabulary or text here</h3>
        <textarea name="hanzi" cols="80" rows="15">{}</textarea><br />
        <input type="submit" value="    Go!    " /></form>
    """.format(wordfreqchecked, hskanalwordschecked, hskanalcharschecked, hskwordschecked, hskcharschecked, freqwordschecked, freqwordsrechecked, freqcharschecked,
               oneperlinechecked, blockchecked,
               addfreqindexchecked, addfreqvaluechecked,
               hanzi))
    if hanzi != defaulthanzi:
        performactions(hanzi, results)
    results.append("</body>\n</html>")
    return u"\n".join(results)

def performactions(hanzi, results):
    init_resources()
    notes = []
    if getform("format") == "block":
        words, chars, hskwordcount, hskcharcount = parseblock(hanzi, notes)
    else:
        words, chars, hskwordcount, hskcharcount = parselist(hanzi, notes)
    if len(notes):
        results.append("""<span style="color:red;"><h1>Warnings</h1><ul>""")
        for note in notes:
            results.append(u"<li>{}</li>".format(note))
        results.append("</ul></span>")
    results.append("<h1>Results</h1>Note that all word/character lists are in descending order of frequency.")
    if getform("analysevocab"):
        analysewords(results, words, chars, hskwordcount, hskcharcount)
    if getform("analysehskwords"):
        analysehskwords(results, words, hskwordcount)
    if getform("analysehskchars"):
        analysehskchars(results, chars, hskcharcount)
    if getform("suggesthskwords"):
        suggesthskwords(results, words, chars)
    if getform("suggesthskchars"):
        suggesthskchars(results, words, chars)
    if getform("suggestwords"):
        suggestfreqwords(results, words, chars)
    if getform("suggestwordsreuse"):
        suggestfreqwordsre(results, words, chars)
    if getform("suggestchars"):
        suggestfreqchars(results, words, chars)

def blockboxtemplate():
    if getform("addfreqindex") and getform("addfreqvalue"):
        cols="cols=\"25\""
    else:
        cols="cols=\"15\""
    return u"""<div class="box"><div class="title">{}</div><div><textarea name="{}" """ + cols + """ rows="12">{}</textarea></div></div>"""

textareatemplate = u"""<textarea name="{}" cols="40" rows="12">{}</textarea>"""

def analysewords(results, words, chars, hskwordcount, hskcharcount):
    results.append("<h3>Analysis of Words/Characters in Input</h3>")
    singlecharcount = len([w for w in words if len(w) == 1])
    wordcount = len(words)
    charcount = len(chars)
    totalwords = sum(hskwordcount.values())
    totalchars = sum(hskcharcount.values())
    results.append(u"""Input contained:<ul>
        <li>{} unique single-character words</li>
        <li>{} unique multi-character words</li>
        <li>{} unique words</li>
        <li>{} unique characters</li>
        <li>{} total words</li>
        <li>{} total characters</li>
        </ul>""".format(singlecharcount, wordcount-singlecharcount, wordcount, charcount, totalwords, totalchars))
    wordsknown = u"\n".join(freqorder_word(words))
    charsknown = u"\n".join(freqorder_char(chars))
    results.append(blockboxtemplate().format("Unique Words", "wordsknown", wordsknown))
    results.append(blockboxtemplate().format("Unique Characters", "charsknown", charsknown))

def analysehskwords(results, words, hskwordcount):
    knownintersect = {}
    results.append("<h3>Analysis of HSK Words in Input</h3>")
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
        results.append(u"""<li>{} ({:.2f}%) of the {} HSK {} words""".format(numknown[i], percentknown, numhsk[i], i))
        if i > 1 > 0:
            cumpercentknown = 100 * float(cumulativeknown[i]) / cumulativetotal[i]
            results.append(u""" <i>(Cumulative: {} ({:.2f}%) of the {} HSK 1-{} words)</i>""".format(cumulativeknown[i], cumpercentknown, cumulativetotal[i], i))
        results.append("</li>")
    results.append("</ul>")
    totalunique = len(words)
    if totalunique > 0:
        numknown_nonhsk = totalunique - cumulativeknown[6]
        results.append("Of the {} <b>unique</b> words in the input:<ul>".format(totalunique))
        for i in range(1, 7):
            percentknown = 100 * float(numknown[i]) / totalunique
            results.append(u"""<li>{} ({:.2f}%) were HSK {} words""".format(numknown[i], percentknown, i))
            if i > 1:
                cumpercentknown = 100 * float(cumulativeknown[i]) / totalunique
                results.append(u"""<i>(Cumulative: {} ({:.2f}%) were HSK 1-{} words)</i>""".format(cumulativeknown[i], cumpercentknown, i))
            results.append("</li>")
        numknown_nonhsk_percent = 100 * float(numknown_nonhsk) / totalunique
        results.append(u"""<li>{} ({:.2f}%) were non-HSK words</li>""".format(numknown_nonhsk, numknown_nonhsk_percent))
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
            results.append(u"""<li>{} ({:.2f}%) were HSK {} words""".format(hskwordcount[i], percentknown, i))
            if i > 1:
                cumpercentknown = 100 * float(cumknown) / totalwords
                results.append(u"""<i>(Cumulative: {} ({:.2f}%) were HSK 1-{} words)</i>""".format(cumknown, cumpercentknown, i))
            results.append("</li>")
        num_nonhsk = totalwords - cumknown
        numknown_nonhsk_percent = 100 * float(num_nonhsk) / totalwords
        results.append(u"""<li>{} ({:.2f}%) were non-HSK words</li>""".format(num_nonhsk, numknown_nonhsk_percent))
        results.append("</ul>")
    for i in range(1, 7):
        wordsknown = u"\n".join(freqorder_word(knownintersect[i]))
        results.append(blockboxtemplate().format("HSK " + str(i), "hskwordsknown" + str(i), wordsknown))
    nonhskwords = u"\n".join(freqorder_word(words - hskwords[16]))
    results.append(blockboxtemplate().format("Non-HSK", "nonhskwordsknown", nonhskwords))

def analysehskchars(results, chars, hskcharcount):
    knownintersect = {}
    results.append("<h3>Analysis of HSK Characters in Input</h3>")
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
        results.append(u"""<li>{} ({:.2f}%) of the {} HSK {} characters""".format(numknown[i], percentknown, numhsk[i], i))
        if i > 1 > 0:
            cumpercentknown = 100 * float(cumulativeknown[i]) / cumulativetotal[i]
            results.append(u""" <i>(Cumulative: {} ({:.2f}%) of the {} HSK 1-{} characters)</i>""".format(cumulativeknown[i], cumpercentknown, cumulativetotal[i], i))
        results.append("</li>")
    results.append("</ul>")
    totalunique = len(chars)
    if totalunique > 0:
        numknown_nonhsk = totalunique - cumulativeknown[6]
        results.append("Of the {} <b>unique</b> characters in the input:<ul>".format(totalunique))
        for i in range(1, 7):
            percentknown = 100 * float(numknown[i]) / totalunique
            results.append(u"""<li>{} ({:.2f}%) were HSK {} characters""".format(numknown[i], percentknown, i))
            if i > 1:
                cumpercentknown = 100 * float(cumulativeknown[i]) / totalunique
                results.append(u"""<i>(Cumulative: {} ({:.2f}%) were HSK 1-{} characters)</i>""".format(cumulativeknown[i], cumpercentknown, i))
            results.append("</li>")
        numknown_nonhsk_percent = 100 * float(numknown_nonhsk) / totalunique
        results.append(u"""<li>{} ({:.2f}%) were non-HSK characters</li>""".format(numknown_nonhsk, numknown_nonhsk_percent))
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
            results.append(u"""<li>{} ({:.2f}%) were HSK {} characters""".format(hskcharcount[i], percentknown, i))
            if i > 1:
                cumpercentknown = 100 * float(cumknown) / totalchars
                results.append(u"""<i>(Cumulative: {} ({:.2f}%) were HSK 1-{} characters)</i>""".format(cumknown, cumpercentknown, i))
            results.append("</li>")
        num_nonhsk = totalchars - cumknown
        numknown_nonhsk_percent = 100 * float(num_nonhsk) / totalchars
        results.append(u"""<li>{} ({:.2f}%) were non-HSK characters</li>""".format(num_nonhsk, numknown_nonhsk_percent))
        results.append("</ul>")
    for i in range(1, 7):
        charsknown = u"\n".join(freqorder_char(knownintersect[i]))
        results.append(blockboxtemplate().format("HSK " + str(i), "hskcharsknown" + str(i), charsknown))
    nonhskchars = u"\n".join(freqorder_char(chars - hskchars[16]))
    results.append(blockboxtemplate().format("Non-HSK", "nonhskcharsknown", nonhskchars))

def suggesthskwords(results, words, chars):
    results.append("""<h3>Suggested HSK Words not in Input</h3>""")
    for i in range(1, 7):
        wordstolearn = u"\n".join(freqorder_word(hskwords[i] - words))
        results.append(blockboxtemplate().format("HSK " + str(i), "hskwordstolearn" + str(i), wordstolearn))
    foundwords = []
    for freq, word in word_freq_ordered:
        if word not in words and word not in hskwords[16]:
            foundwords.append(word)
        if len(foundwords)>=1000:
            break
    wordstext = u"\n".join(freqorder_word(foundwords))
    results.append(blockboxtemplate().format("Non-HSK", "nonhskwordstolearn" + str(i), wordstext))

def suggesthskchars(results, words, chars):
    results.append("""<h3>Suggested HSK Characters not in Input</h3>""")
    for i in range(1, 7):
        charstolearn = u"\n".join(freqorder_char(hskchars[i] - chars))
        results.append(blockboxtemplate().format("HSK " + str(i), "hskcharstolearn" + str(i), charstolearn))
    foundchars = []
    for freq, char in char_freq_ordered:
        if char not in chars and char not in hskchars[16]:
            foundchars.append(char)
        if len(foundchars)>=1000:
            break
    charstext = u"\n".join(freqorder_char(foundchars))
    results.append(blockboxtemplate().format("Non-HSK", "nonhskcharstolearn" + str(i), charstext))

def suggestfreqwords(results, words, chars):
    results.append("""<h3>Suggested Words not in Input</h3>""")
    foundwords = []
    for freq, word in word_freq_ordered:
        if word not in words:
            foundwords.append(word)
        if len(foundwords)>=1000:
            break
    wordstext = u"\n".join(freqorder_word(foundwords))
    results.append(textareatemplate.format("highfreqwords", wordstext))

def suggestfreqwordsre(results, words, chars):
    results.append("""<h3>Suggested Words Using Characters in Input</h3>""")
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
    wordstext = u"\n".join(freqorder_word(foundwords))
    results.append(textareatemplate.format("highfreqwordsreuse", wordstext))

def suggestfreqchars(results, words, chars):
    results.append("""<h3>Suggested Characters not in Input</h3>""")
    foundchars = []
    for freq, char in char_freq_ordered:
        if char not in chars:
            foundchars.append(char)
        if len(foundchars)>=1000:
            break
    charstext = u"\n".join(freqorder_char(foundchars))
    results.append(textareatemplate.format("highfreqchars", charstext))

init_done = False;

# ================
# Initialise
def init_resources():
    global init_done, zh_punctuation
    if init_done:
        return;
    parse_hsk_file("/home/hskhsk/data/HSK Official With Definitions 2012 L1.txt", 1)
    parse_hsk_file("/home/hskhsk/data/HSK Official With Definitions 2012 L2.txt", 2)
    parse_hsk_file("/home/hskhsk/data/HSK Official With Definitions 2012 L3.txt", 3)
    parse_hsk_file("/home/hskhsk/data/HSK Official With Definitions 2012 L4.txt", 4)
    parse_hsk_file("/home/hskhsk/data/HSK Official With Definitions 2012 L5.txt", 5)
    parse_hsk_file("/home/hskhsk/data/HSK Official With Definitions 2012 L6.txt", 6)
    build_hsk_extralists(hskwords, hskchars)
    parse_hsk_2010_file("/home/hskhsk/data/New_HSK_2010.csv")
    build_hsk_extralists(hskwords2010, hskchars2010)
    parse_word_freq_file("/home/hskhsk/data/SUBTLEX-CH-WF.txt")
    parse_char_freq_file("/home/hskhsk/data/SUBTLEX-CH-CHR.txt")
    init_done = True;

# ================
# Parse Hanzi input
def parseblock(hanzi, notes):
    hskwordcount = {}
    hskcharcount = {}
    hskwordcount[0] = hskwordcount[1] = hskwordcount[2] = hskwordcount[3] = hskwordcount[4] = hskwordcount[5] = hskwordcount[6] = 0
    hskcharcount[0] = hskcharcount[1] = hskcharcount[2] = hskcharcount[3] = hskcharcount[4] = hskcharcount[5] = hskcharcount[6] = 0
    words = set()
    chars = set()
    overlaps = set()
    ignorechars = set()
    unknownchars = set()
    for chunk in hanzi.split():
        lastfoundend=-1
        lastfoundword = ""
        for i in range(len(chunk)+1):
            maxfound = 0
            foundword = ""
            for j in range(1, min(6, len(chunk)-i+1)):
                testword = chunk[i:i+j]
                if testword in word_freq and i+j>lastfoundend:
                    maxfound = j
                    foundword = testword
            if maxfound > 0:
                if lastfoundend > i and i+maxfound > lastfoundend and (lastfoundword, foundword) not in overlaps:
                    notes.append(u"Overlapping words, added both: {} and {}".format(lastfoundword, foundword))
                    overlaps.add( (lastfoundword,foundword) )
                if i+maxfound > lastfoundend:
                    lastfoundword = foundword
                    lastfoundend = i+maxfound
                words.add(foundword)
                hskwordcount[query_hsk_word_level(foundword)] += 1
        for char in chunk:
            if char_is_ok(char):
                chars.add(char)
                hskcharcount[query_hsk_char_level(char)] += 1
                if char not in char_freq:
                    unknownchars.add(char)
            else:
                ignorechars.add(char)
    if len(ignorechars):
        notes.append("Ignored characters: " + u", ".join(list(ignorechars)))
    if len(unknownchars):
        notes.append("Unknown characters: " + u", ".join(list(unknownchars)))
    return words, chars, hskwordcount, hskcharcount

def parselist(hanzi, notes):
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
    for line in hanzi.split(u"\n"):
        chunks = line.split()
        if len(chunks):
            word = chunks[0]
            if len([c for c in word if not char_is_ok(c)]) == 0:
                words.add(word)
                hskwordcount[query_hsk_word_level(word)] += 1
                if word not in word_freq:
                    unknownwords.add(word)
            else:
                ignorewords.add(word)
            for char in word:
                if char_is_ok(char):
                    chars.add(char)
                    hskcharcount[query_hsk_char_level(char)] += 1
                    if char not in char_freq:
                        unknownchars.add(char)
                else:
                    ignorechars.add(char)

    if len(ignorewords):
        notes.append("Ignored words: " + u", ".join(list(ignorewords)))
    if len(ignorechars):
        notes.append("Ignored characters: " + u", ".join(list(ignorechars)))
    if len(unknownwords):
        notes.append("Unknown words: " + u", ".join(list(unknownwords)))
    if len(unknownchars):
        notes.append("Unknown characters: " + u", ".join(list(unknownchars)))
    return words, chars, hskwordcount, hskcharcount

# ================
# Utilities for freq order

def freqorder_word(hanzi):
    freqlist = [(query_word_freq(h), h) for h in hanzi]
    freqlist.sort()
    freqlist.reverse()
    if getform("addfreqindex") and getform("addfreqvalue"):
        return [u"{}\t{}\t{}".format(h, query_word_freq_index(h), f) for f, h in freqlist]
    elif getform("addfreqindex"):
        return [u"{}\t{}".format(h, query_word_freq_index(h)) for f, h in freqlist]
    elif getform("addfreqvalue"):
        return [u"{}\t{}".format(h, f) for f, h in freqlist]
    else:
        return [h for f, h in freqlist]

def freqorder_char(hanzi):
    freqlist = [(query_char_freq(h), h) for h in hanzi]
    freqlist.sort()
    freqlist.reverse()
    if getform("addfreqindex") and getform("addfreqvalue"):
        return [u"{}\t{}\t{}".format(h, query_char_freq_index(h), f) for f, h in freqlist]
    elif getform("addfreqindex"):
        return [u"{}\t{}".format(h, query_char_freq_index(h)) for f, h in freqlist]
    elif getform("addfreqvalue"):
        return [u"{}\t{}".format(h, f) for f, h in freqlist]
    else:
        return [h for f, h in freqlist]

def hanzideflink(hanzi):
    url = u"http://www.mdbg.net/chindict/chindict.php?wdqb=" + urllib.quote(hanzi.encode('utf-8'))
    return u"""<a class="definition" href="{}">{}</a>""".format(url, hanzi)

def freqorder_word_link(hanzi):
    freqlist = [(query_word_freq(h), h) for h in hanzi]
    freqlist.sort()
    freqlist.reverse()
    return [hanzideflink(h) for f, h in freqlist]

def freqorder_char_link(hanzi):
    freqlist = [(query_char_freq(h), h) for h in hanzi]
    freqlist.sort()
    freqlist.reverse()
    return [hanzideflink(h) for f, h in freqlist]

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
    level = 0
    if somehanzi in hsk_word_level:
        level = hsk_word_level[somehanzi]
    return level

def query_hsk_char_level(somehanzi):
    level = 0
    if somehanzi in hsk_char_level:
        level = hsk_char_level[somehanzi]
    return level

# parse newer 2012 HSK format
def parse_hsk_file(infilename, hsklevel):
    hskwords[hsklevel] = set()
    infile = codecs.open(infilename, 'r', "utf-8")
    for line in infile:
        splitted = line.strip().split("\t")
        if len(splitted) >= 4:
            word = unicodedata.normalize("NFKC", splitted[0].strip()).replace(u'\ufeff',"")
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
            hsklevel = int(splitted[0].strip().replace(u'\ufeff',""))
            word = unicodedata.normalize("NFKC", splitted[1].strip()).replace(u'\ufeff',"")
            if word != "":
                hskwords2010[hsklevel].add(word)
    infile.close()

# ================
# Frequency parsing

word_freq = {} # {"AB" : 1234, ...}
char_freq = {} # {"A" : 6789, ...}
word_freq_index = {} # {"AB" : 1, ...}
char_freq_index = {} # {"A" : 1, ...}
word_freq_ordered = [] # [(1234, "AB"), ...] # sorted by descending frequency
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

def query_word_freq_index(word):
    if word in word_freq_index:
        return word_freq_index[word]
    return 0

def query_char_freq_index(char):
    if char in char_freq_index:
        return char_freq_index[char]
    return 0

# parse SUBTLEX word frequency
def parse_word_freq_file(infilename):
    infile = codecs.open(infilename, 'r', "utf-8")
    freq_index = 1
    for line in infile:
        splitted = line.strip().split("\t")
        if len(splitted) == 7:
            word = unicodedata.normalize("NFKC", splitted[0].strip()).replace(u'\ufeff',"")
            freq = int(splitted[1].strip())
            if word != "" and freq > 0:
                word_freq[word] = freq
                word_freq_index[word] = freq_index
                freq_index += 1
    for word, freq in word_freq.iteritems():
        word_freq_ordered.append( (freq, word) )
    word_freq_ordered.sort()
    word_freq_ordered.reverse()
    infile.close()

# parse SUBTLEX char frequency
def parse_char_freq_file(infilename):
    infile = codecs.open(infilename, 'r', "utf-8")
    freq_index = 1
    for line in infile:
        splitted = line.strip().split("\t")
        if len(splitted) == 7:
            char = unicodedata.normalize("NFKC", splitted[0].strip()).replace(u'\ufeff',"")
            freq = int(splitted[1].strip())
            if char != "" and freq > 0:
                char_freq[char] = freq
                char_freq_index[char] = freq_index
                freq_index += 1
    for char, freq in char_freq.iteritems():
        char_freq_ordered.append( (freq, char) )
    char_freq_ordered.sort()
    char_freq_ordered.reverse()
    infile.close()
