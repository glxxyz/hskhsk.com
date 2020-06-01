import time

from flask import Response

from pages.deprecated import allstyle, page_footer, hanzi_definition_link, frequency_order_char_link_hskcolour, \
    frequency_order_radical_link
from common.dictionary import cc_radicals
from common.hsk import hsk_chars
from common.dictionary_parse import chinese_comma_sep
from common.util import query_radical_frequency_index


def radicals_page(expand, hsk_level, start_time):
    results = []
    results.append("""<html lang="zh-Hans">\n<head>\n<title>HSK\u4E1C\u897F\u8BCD\u5178 Radicals</title>""")
    results.append(allstyle)
    results.append("""</head>\n<body>
<form method="get" action="/cidian">
<a href="https://hskhsk.com/word-lists">HSK\u4E1C\u897F</a>
<a href="/">Scripts</a>""")
    if expand == "yes":
        results.append("""<input type="hidden" name="expand" value="yes" />""")
    results.append("""<input type="text" name="q" value=""/><input type="submit" value="Go" />
<a href="/search">Advanced Search</a>
<a href="/radicals">Radicals</a> """)
    if expand == "yes":
        results.append("""[<a href="/radicals{}">collapse definitions</a>]""".format(
            "" if hsk_level == 0 else "?hsk=" + str(hsk_level)))
    else:
        results.append("""[<a href="/radicals?{}expand=yes">expand definitions</a>]""".format(
            "" if hsk_level == 0 else "hsk=" + str(hsk_level) + "&"))
    results.append("""</form><p>
Show HSK Characters by Radical:
<ul><li><a href="/radicals?hsk=1{0}" class="hsk1">HSK 1</a>,
<a href="/radicals?hsk=2{0}" class="hsk2">HSK 2</a>,
<a href="/radicals?hsk=3{0}" class="hsk3">HSK 3</a>,
<a href="/radicals?hsk=4{0}" class="hsk4">HSK 4</a>,
<a href="/radicals?hsk=5{0}" class="hsk5">HSK 5</a>,
<a href="/radicals?hsk=6{0}" class="hsk6">HSK 6</a></li>
<li><a href="/radicals?hsk=12{0}" class="hsk2">HSK 1-2</a>,
<a href="/radicals?hsk=13{0}" class="hsk3">HSK 1-3</a>,
<a href="/radicals?hsk=14{0}" class="hsk4">HSK 1-4</a>,
<a href="/radicals?hsk=15{0}" class="hsk5">HSK 1-5</a>,
<a href="/radicals?hsk=16{0}" class="hsk6">HSK 1-6</a></li>
</ul></p>""".format("&expand=yes" if expand == "yes" else ""))
    if hsk_level != 0:
        if hsk_level < 10:
            results.append("""<h4><span class="hsk{0}">HSK {0}</span> Characters by Radical</h4>""".format(hsk_level))
        else:
            results.append(
                """<h4>HSK <span class="hsk{0}">{0}</span>-<span class="hsk{1}">{1}</span> Characters by Radical</h4>""".format(
                    hsk_level // 10, hsk_level % 10))
        frequency_list = [(query_radical_frequency_index(r), r) for r in list(cc_radicals.keys())]
        frequency_list.sort()
        for freq, radical in frequency_list:
            radicalchars = cc_radicals[radical]
            hskradchars = radicalchars & hsk_chars[hsk_level]
            if len(hskradchars):
                results.append("""<div class="paddedbox">""")
                results.append("<b>")
                hanzi_definition_link(results, radical, radical, "none", expand)
                results.append("</b></br>")
                separator = "<br />" if expand == "yes" else chinese_comma_sep
                frequency_order_char_link_hskcolour(results, hskradchars, separator, expand)
                results.append("</div>")
    else:
        results.append("<h4>Radicals</h4>")
        separator = "<br />" if expand == "yes" else chinese_comma_sep
        frequency_order_radical_link(results, list(cc_radicals.keys()), separator, expand)
    results.append("<p><small><i>Page generated in {:1.6f} seconds</i></small></p>".format(time.time() - start_time))
    results.append(page_footer)
    return Response(results)