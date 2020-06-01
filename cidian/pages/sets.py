from flask import Response

from common.dictionary_parse import parse_block, parse_comma_sep, parse_list
from common.util import get_parameter
from init import init_resources
from pages.deprecated import allstyle, frequency_order_word, frequency_order_char, word_char_definition_link, \
    blockboxtemplate, append_page_end


def sets_page(block_checked_a, block_checked_b, comma_sep_checked_a, comma_sep_checked_b, expand, hanzi_a, hanzi_b,
              one_per_line_checked_a, one_per_line_checked_b, output_comma_sep_checked, output_one_per_line_checked,
              output_space_sep_checked, output_tab_sep_checked, start_time):
    results = []
    results.append("""<html lang="zh-Hans">\n<head>""")
    results.append("<title>HSK\u4E1C\u897F - Vocabulary Set Operations</title>")
    results.append(allstyle)
    results.append("</head>")
    results.append("<body>")
    results.append("""<a href="https://hskhsk.com/analyse.html">HSK\u4E1C\u897F</a>""")
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
    """.format(output_one_per_line_checked, output_comma_sep_checked, output_tab_sep_checked, output_space_sep_checked,
               one_per_line_checked_a, comma_sep_checked_a, block_checked_a,
               one_per_line_checked_b, comma_sep_checked_b, block_checked_b,
               hanzi_a, hanzi_b))
    if hanzi_a != "" or hanzi_b != "":
        perform_set_operations(hanzi_a, hanzi_b, results, expand)
    append_page_end(results, start_time)
    return Response(results)


def perform_set_operations(hanzi_a, hanzi_b, results, expand):
    init_resources()

    notes = []
    if get_parameter("formatA") == "block":
        words_a, chars_a, hsk_word_count, hsk_char_count = parse_block(hanzi_a, notes, expand, word_char_definition_link)
    elif get_parameter("formatA") == "commasep":
        words_a, chars_a, hsk_word_count, hsk_char_count = parse_comma_sep(hanzi_a, notes, True, expand, word_char_definition_link)
    else:
        words_a, chars_a, hsk_word_count, hsk_char_count = parse_list(hanzi_a, notes, True, expand, word_char_definition_link)
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
    if get_parameter("formatB") == "block":
        words_b, chars_b, hsk_word_count, hsk_char_count = parse_block(hanzi_b, notes, expand, word_char_definition_link)
    elif get_parameter("formatB") == "commasep":
        words_b, chars_b, hsk_word_count, hsk_char_count = parse_comma_sep(hanzi_b, notes, True, expand, word_char_definition_link)
    else:
        words_b, chars_b, hsk_word_count, hsk_char_count = parse_list(hanzi_b, notes, True, expand, word_char_definition_link)
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
    if get_parameter("outputformat") == "oneperline":
        joinchar = "\n"
    elif get_parameter("outputformat") == "commasep":
        joinchar = ","
    elif get_parameter("outputformat") == "tabsep":
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

    results.append(setresultbox("A<sub>w</sub>", "Awords", frequency_order_word(words_a), joinchar, "word"))
    results.append(setresultbox("B<sub>w</sub>", "Bwords", frequency_order_word(words_b), joinchar, "word"))
    results.append(
        setresultbox("A<sub>w</sub> \u2229 B<sub>w</sub>", "AintersectBwords", frequency_order_word(words_a & words_b),
                     joinchar, "word"))
    results.append(
        setresultbox("A<sub>w</sub> \u222A B<sub>w</sub>", "AunionBwords", frequency_order_word(words_a | words_b),
                     joinchar,
                     "word"))
    results.append(
        setresultbox("A<sub>w</sub> \u2216 B<sub>w</sub>", "AdifferenceBwords", frequency_order_word(words_a - words_b),
                     joinchar, "word"))
    results.append(
        setresultbox("B<sub>w</sub> \u2216 A<sub>w</sub>", "BdifferenceAwords", frequency_order_word(words_b - words_a),
                     joinchar, "word"))
    results.append(
        setresultbox("A<sub>w</sub> \u2206 B<sub>w</sub>", "AsymmmetricBwords", frequency_order_word(words_a ^ words_b),
                     joinchar, "word"))

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

    results.append(setresultbox("A<sub>c</sub>", "Achars", frequency_order_word(chars_a), joinchar, "char"))
    results.append(setresultbox("B<sub>c</sub>", "Bchars", frequency_order_word(chars_b), joinchar, "char"))
    results.append(
        setresultbox("A<sub>c</sub> \u2229 B<sub>c</sub>", "AintersectBchars", frequency_order_char(chars_a & chars_b),
                     joinchar, "char"))
    results.append(
        setresultbox("A<sub>c</sub> \u222A B<sub>c</sub>", "AunionBchars", frequency_order_char(chars_a | chars_b),
                     joinchar,
                     "char"))
    results.append(
        setresultbox("A<sub>c</sub> \u2216 B<sub>c</sub>", "AdifferenceBchars", frequency_order_char(chars_a - chars_b),
                     joinchar, "char"))
    results.append(
        setresultbox("B<sub>c</sub> \u2216 A<sub>c</sub>", "BdifferenceAchars", frequency_order_char(chars_b - chars_a),
                     joinchar, "char"))
    results.append(
        setresultbox("A<sub>c</sub> \u2206 B<sub>c</sub>", "AsymmmetricBchars", frequency_order_char(chars_a ^ chars_b),
                     joinchar, "char"))


def setresultbox(title, idname, itemset, joinchar, itemname):
    setlen = len(itemset)
    if setlen == 0:
        titlewithsize = title + """<span style="font-weight: lighter; font-size: 80%; font-style: italic;"> (empty)</span>"""
    else:
        titlewithsize = title + """<span style="font-weight: lighter; font-size: 80%; font-style: italic;"> ({} {}{})</span>""".format(
            setlen, itemname, "s" if setlen > 1 else "")
    return blockboxtemplate().format(titlewithsize, idname, joinchar.join(itemset))