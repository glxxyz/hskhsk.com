import time

from flask import Response

from pages.deprecated import allstyle, page_footer
from common.dictionary_parse import chinese_comma_sep
from common.util import get_parameter
from init import init_resources


def vocab_diff_page(oldlink, newlink, thislink, thisitem, otherlink, otheritem, oldvocab, newvocab, linkfunction):
    start_time = time.time()
    init_resources()
    expand = get_parameter("expand")
    results = []
    results.append("""<html lang="zh-Hans">\n<head>""")
    results.append("<title>HSK\u4E1C\u897F - Where the HSK 2010 {} are in 2012-2020</title>".format(
        thisitem[0].upper() + thisitem[1:]))
    results.append(allstyle)
    results.append("</head>\n<body>")
    results.append("""<a href="https://hskhsk.com/word-lists">HSK\u4E1C\u897F</a>""")
    results.append("""<a href="/">Scripts</a>""")
    results.append("""<a href="{}">Where the HSK 2010 {} are in 2012-2020</a>""".format(otherlink, otheritem[
        0].upper() + otheritem[1:]))
    results.append("<h3>HSK 2010 {} that changed level in 2012-2020</h3>".format(thisitem[0].upper() + thisitem[1:]))
    results.append("""<p>This table shows the {0} in the New HSK 2010 that changed level when the word lists were revised
in 2012 (also valid to date as of 2020), {0} that didn't change level are shown below.
For definitions hover over the characters, or try clicking on almost anything.</p>
<table border="1" style="border-collapse:collapse;" cellpadding="2em" cellspacing="0">
<tr><th rowspan=2 colspan=2 style="background-color: #FFFFFF;"></th><th colspan=7><a href="{1}" class="hsk0">HSK 2012-2020</a></th></tr>
<tr>""".format(thisitem, newlink))
    for i in range(1, 7):
        results.append(
            """<th><div style="white-space: nowrap;">&nbsp;&nbsp;&nbsp;&nbsp;<a href="{}#hsk{}" class="hsk{}">HSK {}</a>&nbsp;&nbsp;&nbsp;&nbsp;</div></th>""".format(
                newlink, i, i, i))
    results.append(
        """<th><div class="hsk0" style="white-space: nowrap;">&nbsp;&nbsp;&nbsp;&nbsp;Non-HSK&nbsp;&nbsp;&nbsp;&nbsp;</div></th></tr>""")
    for old in range(1, 8):
        results.append("<tr>")
        if old == 1:
            results.append("""<th rowspan=7><a href="{}" class="hsk0">HSK 2010</a></th>""".format(oldlink))
        if old == 7:
            results.append("""<th><div style="white-space: nowrap;">Non-HSK</div></th>""")
        else:
            results.append(
                """<th><div style="white-space: nowrap;"><a href="{}#hsk{}" class="hsk{}">HSK {}</a></div></th>""".format(
                    oldlink, old, old, old))
        for new in range(1, 8):
            if old == new:
                if old >= 1 and old <= 6:
                    results.append(
                        """<td class="hsk{0}light" onClick="document.location.href='#hsk{0}';" onmouseover="this.style.cursor='pointer';"> </td>""".format(
                            old))
                else:
                    results.append("""<td class="hsk0light"></td>""")
            else:
                if old == 7:
                    somehanzi = newvocab[new] - oldvocab[16]
                elif new == 7:
                    somehanzi = oldvocab[old] - newvocab[16]
                else:
                    somehanzi = (oldvocab[old] & newvocab[new]) - newvocab[
                        old]  # add the set subtract to account for case where word exists at multiple levels
                results.append("<td>")
                separator = "<br />" if expand == "yes" else chinese_comma_sep
                results.append(separator.join(linkfunction(somehanzi, expand)))
                results.append("</td>")
        results.append("</tr>")
    results.append("</table>")

    results.append(
        "<h3>HSK 2010 {} that didn't change level in 2012-2020</h3>".format(thisitem[0].upper() + thisitem[1:]))
    for level in range(1, 7):
        results.append(
            """<h4><a class="hsk{0}" name="hsk{0}">HSK {0} {1} that didn't change level</a></h4>""".format(level,
                                                                                                           thisitem[
                                                                                                               0].upper() + thisitem[
                                                                                                                            1:]))
        somehanzi = newvocab[level] & oldvocab[level]
        separator = "<br />" if expand == "yes" else chinese_comma_sep
        results.append(separator.join(linkfunction(somehanzi, expand)))

    results.append(
        """<p><small><i>Page generated in {:1.6f} seconds.</i></small></p>\n""".format(time.time() - start_time))
    results.append(page_footer)
    return Response(results)