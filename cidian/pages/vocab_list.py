import time

from flask import Response

from common.frequency import word_frequency_ordered, char_frequency_ordered
from common.dictionary_parse import chinese_comma_sep
from pages.deprecated import allstyle, page_footer, frequency_order_word_link_hskcolour, frequency_order_char_link_hskcolour


def list_page_words1000(expand, start_time):
    results = []
    results.append("""<html lang="zh-Hans">\n<head>""")
    results.append("<title>HSK\u4E1C\u897F - Highest Frequency Words</title>")
    results.append(allstyle)
    results.append("</head>\n<body>")
    results.append("""<a href="https://hskhsk.com/word-lists">HSK\u4E1C\u897F</a> """)
    results.append("""<a href="/">Scripts</a> """)
    results.append(
        """<a href="/chars1000{}">Highest Frequency Characters</a> """.format("?expand=yes" if expand == "yes" else ""))
    results.append(
        """[<a href="words1000">collapse definitions</a>]""" if expand == "yes" else """[<a href="words1000?expand=yes">expand definitions</a>]""")
    results.append("<h2>Highest Frequency Words</h2>")
    if expand != "yes":
        results.append("<p>For definitions hover over or click on the word, or select 'expand definitions'.</p>")
    separator = "<br />" if expand == "yes" else chinese_comma_sep
    topwords = [word for (freq, word) in word_frequency_ordered[:1000]]
    results.append(separator.join(frequency_order_word_link_hskcolour(topwords, expand)))
    results.append(
        """<p><small><i>Page generated in {:1.6f} seconds.</i></small></p>""".format(time.time() - start_time))
    results.append(page_footer)
    return Response(results)


def list_page_chars1000(expand, start_time):
    results = []
    results.append("""<html lang="zh-Hans">\n<head>""")
    results.append("<title>HSK\u4E1C\u897F - Highest Frequency Characters</title>")
    results.append(allstyle)
    results.append("</head>\n<body>")
    results.append("""<a href="https://hskhsk.com/word-lists">HSK\u4E1C\u897F</a> """)
    results.append("""<a href="/">Scripts</a> """)
    results.append(
        """<a href="/words1000{}">Highest Frequency Words</a> """.format("?expand=yes" if expand == "yes" else ""))
    results.append(
        """[<a href="chars1000">collapse definitions</a>]""" if expand == "yes" else """[<a href="chars1000?expand=yes">expand definitions</a>]""")
    results.append("<h2>Highest Frequency Characters</h2>")
    if expand != "yes":
        results.append("<p>For definitions hover over or click on the character, or select 'expand definitions'.</p>")
    separator = "<br />" if expand == "yes" else chinese_comma_sep
    topchars = [char for (freq, char) in char_frequency_ordered[:1000]]
    frequency_order_char_link_hskcolour(results, topchars, separator, expand)
    results.append(
        """<p><small><i>Page generated in {:1.6f} seconds.</i></small></p>\n""".format(time.time() - start_time))
    results.append(page_footer)
    return Response(results)


def hsk_vocabulary_page(thislink, pagetitle, extralink, thisitem, otherlink, otheritem, vocab, linkfunction, expand):
    start_time = time.time()
    results = []
    results.append("""<html lang="zh-Hans">\n<head>""")
    results.append("<title>HSK\u4E1C\u897F - {}</title>".format(pagetitle))
    results.append(allstyle)
    results.append("</head>\n<body>")
    results.append("""<a href="https://hskhsk.com/word-lists">HSK\u4E1C\u897F</a> """)
    results.append("""<a href="/">Scripts</a> """)
    results.append("""<a href="{}{}">HSK {}</a> """.format(otherlink, "?expand=yes" if expand == "yes" else "",
                                                          otheritem[0].upper() + otheritem[1:]))
    results.append(extralink)
    results.append("""[<a href="{}">collapse definitions</a>]""".format(
        thislink) if expand == "yes" else """[<a href="{}?expand=yes">expand definitions</a>]""".format(thislink))
    results.append("<h2>{}</h2>".format(pagetitle))
    if expand != "yes":
        results.append(
            """<p>For definitions hover over or click on the {}, or <a href="{}?expand=yes">expand definitions</a>.</p>""".format(
                thisitem, thislink))
    for i in range(1, 7):
        results.append("""<h4><a class="hsk{0}" name="hsk{0}">HSK {0} {1}</a></h4>""".format(i, thisitem[
            0].upper() + thisitem[1:]))
        if expand == "yes":
            results.append("<table><tr><td>")
            linkfunction(results, vocab[i], expand, "</td></tr><tr><td>", "</td><td>")
            results.append("</td></tr></table>")
        else:
            linkfunction(results, vocab[i], expand, chinese_comma_sep)
    results.append(
        """<p><small><i>Page generated in {:1.6f} seconds.</i></small></p>""".format(time.time() - start_time))
    results.append(page_footer)
    return Response(results)
