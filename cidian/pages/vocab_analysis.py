import html
import time

from flask import Response

from common.dictionary import cedict_word_set
from common.frequency import subtlex_word_set, word_frequency_ordered, char_frequency_ordered
from common.hsk import hsk_words, hsk_chars

from common.dictionary_parse import parse_block, parse_comma_sep, parse_list, mostlikelywordsallchars, char_is_ok
from common.util import get_parameter
from init import init_resources
from pages.deprecated import allstyle, page_footer, frequency_order_word, frequency_order_char, word_char_definition_link, \
    hanzi_definition_link, blockboxtemplate


def vocab_analysis_page(expand, start_time):
    defaultistrue = "true"
    if get_parameter("ignoredefaults", ""):
        defaultistrue = ""
    wordfreqchecked = "checked" if get_parameter("analysevocab", defaultistrue) else ""
    hskanalwordschecked = "checked" if get_parameter("analysehskwords", defaultistrue) else ""
    hskanalcharschecked = "checked" if get_parameter("analysehskchars") else ""
    hskwordschecked = "checked" if get_parameter("suggesthskwords") else ""
    hskcharschecked = "checked" if get_parameter("suggesthskchars") else ""
    freqwordschecked = "checked" if get_parameter("suggestwords") else ""
    freqwordsrechecked = "checked" if get_parameter("suggestwordsreuse") else ""
    freqcharschecked = "checked" if get_parameter("suggestchars") else ""
    annotatewordschecked = "checked" if get_parameter("annotatewords") else ""
    annotatecharschecked = "checked" if get_parameter("annotatechars") else ""
    outputcommasepchecked = "checked" if get_parameter("outputcommasep") else ""
    addfreqindexchecked = "checked" if get_parameter("addfreqindex", defaultistrue) else ""
    addfreqvaluechecked = "checked" if get_parameter("addfreqvalue") else ""
    oneperlinechecked = ""
    commasepchecked = ""
    blockchecked = "checked" if get_parameter("format") == "block" else ""
    commasepchecked = "checked" if get_parameter("format") == "commasep" else ""
    if blockchecked == "" and commasepchecked == "":
        oneperlinechecked = "checked"
    defaulthanzi = ""
    hanzi = get_parameter("hanzi", defaulthanzi)
    if blockchecked and len(hanzi) > 10000:
        return "Sorry, that text is too big; It will consume too much server CPU time to process." \
               "If you want to set up this script on a dedicated server you can find the source" \
               "at https://github.com/glxxyz/hskhsk.com/tree/master/cidian"
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
    results.append("""<a href="https://hskhsk.com/analyse.html">HSK\u4E1C\u897F</a>""")
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
<p>The other two options add frequency information to the listboxes of hanzi characters that are output.</p>
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
    """.format(wordfreqchecked, hskanalwordschecked, hskanalcharschecked, hskwordschecked, hskcharschecked,
               freqwordschecked, freqwordsrechecked, freqcharschecked, annotatewordschecked, annotatecharschecked,
               oneperlinechecked, commasepchecked, blockchecked,
               outputcommasepchecked, addfreqindexchecked, addfreqvaluechecked,
               hanzi))
    if hanzi != defaulthanzi:
        performactions(hanzi, results, expand)
    results.append(
        """<p><small><i>Page generated in {:1.6f} seconds</i></small></p>""".format(time.time() - start_time))
    results.append(page_footer)
    return Response(results)


def performactions(hanzi, results, expand):
    init_resources()
    # only parse if one of these actions is being performed
    if (get_parameter("analysevocab")
            or get_parameter("analysehskwords")
            or get_parameter("analysehskchars")
            or get_parameter("suggesthskwords")
            or get_parameter("suggesthskchars")
            or get_parameter("suggestwords")
            or get_parameter("suggestwordsreuse")
            or get_parameter("suggestchars")):
        notes = []
        if get_parameter("format") == "block":
            words, chars, hsk_word_count, hsk_char_count = parse_block(hanzi, notes, expand)
        elif get_parameter("format") == "commasep":
            words, chars, hsk_word_count, hsk_char_count = parse_comma_sep(hanzi, notes, False, expand)
        else:
            words, chars, hsk_word_count, hsk_char_count = parse_list(hanzi, notes, False, expand)
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

        if get_parameter("analysevocab"):
            analysewords(results, words, chars, hsk_word_count, hsk_char_count)
        if get_parameter("analysehskwords"):
            analysehskwords(results, words, hsk_word_count)
        if get_parameter("analysehskchars"):
            analysehskchars(results, chars, hsk_char_count)
        if get_parameter("suggesthskwords"):
            suggesthskwords(results, words)
        if get_parameter("suggesthskchars"):
            suggesthskchars(results, chars)
        if get_parameter("suggestwords"):
            suggestfreqwords(results, words)
        if get_parameter("suggestwordsreuse"):
            suggestfreqwordsre(results, words, chars)
        if get_parameter("suggestchars"):
            suggestfreqchars(results, chars)
    else:
        results.append("<h2>Results</h2>")
    # these actions just use the raw hanzi
    if get_parameter("annotatewords"):
        annotatewords(results, hanzi, expand)
    if get_parameter("annotatechars"):
        annotatechars(results, hanzi, expand)


def analysewords(results, words, chars, hsk_word_count, hsk_char_count):
    results.append("<h4>Analysis of Words/Characters in Input</h4>")
    singlecharcount = len([w for w in words if len(w) == 1])
    wordcount = len(words)
    charcount = len(chars)
    totalwords = sum(hsk_word_count.values())
    totalchars = sum(hsk_char_count.values())
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
                wordcount - singlecharcount,
                wordcount,
                totalwords,
                charcount,
                totalchars,
                len(subtlexwords),
                len(ccedictwords)))
    wordsknown = "\n".join(frequency_order_word(words))
    charsknown = "\n".join(frequency_order_char(chars))
    subtlexknown = "\n".join(frequency_order_word(subtlexwords))
    ccedictknown = "\n".join(frequency_order_word(ccedictwords))
    results.append(blockboxtemplate().format("Unique Entries", "wordsknown", wordsknown))
    results.append(blockboxtemplate().format("Unique Characters", "charsknown", charsknown))
    results.append(blockboxtemplate().format("SUBTLEX Words", "subtlexknown", subtlexknown))
    results.append(blockboxtemplate().format("CC-CEDICT Words", "cedictknown", ccedictknown))


def analysehskwords(results, words, hsk_word_count):
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
        knownintersect[i] = words & hsk_words[i]
        numknown[i] = len(knownintersect[i])
        numhsk[i] = len(hsk_words[i])
        percentknown = 100 * float(numknown[i]) / numhsk[i]
        cumulativeknown[i] = cumulativeknown[i - 1] + numknown[i]
        cumulativetotal[i] = cumulativetotal[i - 1] + numhsk[i]
        results.append("""<li>{} ({:.2f}%) of the {} HSK {} words""".format(numknown[i], percentknown, numhsk[i], i))
        if i > 1 > 0:
            cumpercentknown = 100 * float(cumulativeknown[i]) / cumulativetotal[i]
            results.append(""" <i>(Cumulative: {} ({:.2f}%) of the {} HSK 1-{} words)</i>""".format(cumulativeknown[i],
                                                                                                    cumpercentknown,
                                                                                                    cumulativetotal[i],
                                                                                                    i))
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
                results.append("""<i>(Cumulative: {} ({:.2f}%) were HSK 1-{} words)</i>""".format(cumulativeknown[i],
                                                                                                  cumpercentknown, i))
            results.append("</li>")
        numknown_nonhsk_percent = 100 * float(numknown_nonhsk) / totalunique
        results.append("""<li>{} ({:.2f}%) were non-HSK words</li>""".format(numknown_nonhsk, numknown_nonhsk_percent))
        results.append("</ul>")
    totalwords = sum(hsk_word_count.values())
    if totalwords == totalunique:
        results.append("<p><i>Each word appeared only once in the input.</i></p>")
    else:
        cumknown = 0
        results.append("Of the {} <b>total</b> words that were input:<ul>".format(totalwords))
        for i in range(1, 7):
            percentknown = 100 * float(hsk_word_count[i]) / totalwords
            cumknown += hsk_word_count[i]
            results.append("""<li>{} ({:.2f}%) were HSK {} words""".format(hsk_word_count[i], percentknown, i))
            if i > 1:
                cumpercentknown = 100 * float(cumknown) / totalwords
                results.append(
                    """<i>(Cumulative: {} ({:.2f}%) were HSK 1-{} words)</i>""".format(cumknown, cumpercentknown, i))
            results.append("</li>")
        num_nonhsk = totalwords - cumknown
        numknown_nonhsk_percent = 100 * float(num_nonhsk) / totalwords
        results.append("""<li>{} ({:.2f}%) were non-HSK words</li>""".format(num_nonhsk, numknown_nonhsk_percent))
        results.append("</ul>")
    for i in range(1, 7):
        wordsknown = "\n".join(frequency_order_word(knownintersect[i]))
        results.append(blockboxtemplate().format("HSK " + str(i), "hskwordsknown" + str(i), wordsknown))
    nonhskwords = "\n".join(frequency_order_word(words - hsk_words[16]))
    results.append(blockboxtemplate().format("Non-HSK", "nonhskwordsknown", nonhskwords))


def analysehskchars(results, chars, hsk_char_count):
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
        knownintersect[i] = chars & hsk_chars[i]
        numknown[i] = len(knownintersect[i])
        numhsk[i] = len(hsk_chars[i])
        percentknown = 100 * float(numknown[i]) / numhsk[i]
        cumulativeknown[i] = cumulativeknown[i - 1] + numknown[i]
        cumulativetotal[i] = cumulativetotal[i - 1] + numhsk[i]
        results.append(
            """<li>{} ({:.2f}%) of the {} HSK {} characters""".format(numknown[i], percentknown, numhsk[i], i))
        if i > 1 > 0:
            cumpercentknown = 100 * float(cumulativeknown[i]) / cumulativetotal[i]
            results.append(
                """ <i>(Cumulative: {} ({:.2f}%) of the {} HSK 1-{} characters)</i>""".format(cumulativeknown[i],
                                                                                              cumpercentknown,
                                                                                              cumulativetotal[i], i))
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
                results.append(
                    """<i>(Cumulative: {} ({:.2f}%) were HSK 1-{} characters)</i>""".format(cumulativeknown[i],
                                                                                            cumpercentknown, i))
            results.append("</li>")
        numknown_nonhsk_percent = 100 * float(numknown_nonhsk) / totalunique
        results.append(
            """<li>{} ({:.2f}%) were non-HSK characters</li>""".format(numknown_nonhsk, numknown_nonhsk_percent))
        results.append("</ul>")
    totalchars = sum(hsk_char_count.values())
    if totalchars == totalunique:
        results.append("<p><i>Each character appeared only once in the input.</i></p>")
    else:
        cumknown = 0
        results.append("Of the {} <b>total</b> characters that were input:<ul>".format(totalchars))
        for i in range(1, 7):
            percentknown = 100 * float(hsk_char_count[i]) / totalchars
            cumknown += hsk_char_count[i]
            results.append("""<li>{} ({:.2f}%) were HSK {} characters""".format(hsk_char_count[i], percentknown, i))
            if i > 1:
                cumpercentknown = 100 * float(cumknown) / totalchars
                results.append(
                    """<i>(Cumulative: {} ({:.2f}%) were HSK 1-{} characters)</i>""".format(cumknown, cumpercentknown,
                                                                                            i))
            results.append("</li>")
        num_nonhsk = totalchars - cumknown
        numknown_nonhsk_percent = 100 * float(num_nonhsk) / totalchars
        results.append("""<li>{} ({:.2f}%) were non-HSK characters</li>""".format(num_nonhsk, numknown_nonhsk_percent))
        results.append("</ul>")
    for i in range(1, 7):
        charsknown = "\n".join(frequency_order_char(knownintersect[i]))
        results.append(blockboxtemplate().format("HSK " + str(i), "hskcharsknown" + str(i), charsknown))
    nonhskchars = "\n".join(frequency_order_char(chars - hsk_chars[16]))
    results.append(blockboxtemplate().format("Non-HSK", "nonhskcharsknown", nonhskchars))


def suggesthskwords(results, words):
    results.append("""<h4>Suggested HSK Words not in Input</h4>""")
    for i in range(1, 7):
        wordstolearn = "\n".join(frequency_order_word(hsk_words[i] - words))
        results.append(blockboxtemplate().format("HSK " + str(i), "hskwordstolearn" + str(i), wordstolearn))
    foundwords = []
    for freq, word in word_frequency_ordered:
        if word not in words and word not in hsk_words[16]:
            foundwords.append(word)
        if len(foundwords) >= 1000:
            break
    wordstext = "\n".join(frequency_order_word(foundwords))
    results.append(blockboxtemplate().format("Non-HSK", "nonhskwordstolearn" + str(i), wordstext))


def suggesthskchars(results, chars):
    results.append("""<h4>Suggested HSK Characters not in Input</h4>""")
    for i in range(1, 7):
        charstolearn = "\n".join(frequency_order_char(hsk_chars[i] - chars))
        results.append(blockboxtemplate().format("HSK " + str(i), "hskcharstolearn" + str(i), charstolearn))
    foundchars = []
    for freq, char in char_frequency_ordered:
        if char not in chars and char not in hsk_chars[16]:
            foundchars.append(char)
        if len(foundchars) >= 1000:
            break
    charstext = "\n".join(frequency_order_char(foundchars))
    results.append(blockboxtemplate().format("Non-HSK", "nonhskcharstolearn" + str(i), charstext))


def suggestfreqwords(results, words):
    results.append("""<h4>Suggested Words not in Input</h4>""")
    foundwords = []
    for freq, word in word_frequency_ordered:
        if word not in words:
            foundwords.append(word)
        if len(foundwords) >= 1000:
            break
    wordstext = "\n".join(frequency_order_word(foundwords))
    results.append(textareatemplate.format("highfreqwords", wordstext))


def suggestfreqwordsre(results, words, chars):
    results.append("""<h4>Suggested Words Using Characters in Input</h4>""")
    foundwords = []
    for freq, word in word_frequency_ordered:
        if word not in words:
            allcharsmatch = True
            for char in word:
                if char not in chars:
                    allcharsmatch = False
                    break
            if not allcharsmatch:
                continue
            foundwords.append(word)
        if len(foundwords) >= 1000:
            break
    wordstext = "\n".join(frequency_order_word(foundwords))
    results.append(textareatemplate.format("highfreqwordsreuse", wordstext))


def suggestfreqchars(results, chars):
    results.append("""<h4>Suggested Characters not in Input</h4>""")
    foundchars = []
    for freq, char in char_frequency_ordered:
        if char not in chars:
            foundchars.append(char)
        if len(foundchars) >= 1000:
            break
    charstext = "\n".join(frequency_order_char(foundchars))
    results.append(textareatemplate.format("highfreqchars", charstext))


def annotatewords(results, hanzi, expand):
    results.append("""<h4>Annotated Words</h4>""")
    results.append("""<p class="bordered">""")
    tokenised = mostlikelywordsallchars(hanzi, expand, word_char_definition_link)
    textblocks = []
    for ishanzi, text in tokenised:
        if ishanzi == True:
            textblocks.append(word_char_definition_link(text, "word", expand))
        elif text == "\n":
            results.append("".join(textblocks))
            results.append("<br>")
            textblocks = []
        elif text == "|":
            pass  # ignore this character
        else:
            textblocks.append(html.escape(text))
    results.append("".join(textblocks))
    results.append("</p>")


def annotatechars(results, hanzi, expand):
    results.append("""<h4>Annotated Characters</h4>""")
    results.append("""<p class="bordered">""")
    charlist = [c for c in hanzi]
    textblocks = []
    for char in charlist:
        if char_is_ok(char):
            textblocks.append(hanzi_definition_link(char, char, "char", expand))
        elif char == "\n":
            results.append("".join(textblocks))
            results.append("<br>")
            textblocks = []
        elif char == "|":
            pass  # ignore this character
        else:
            textblocks.append(html.escape(char))
    results.append("".join(textblocks))
    results.append("</p>")


textareatemplate = """<textarea name="{}" cols="40" rows="12">{}</textarea>"""