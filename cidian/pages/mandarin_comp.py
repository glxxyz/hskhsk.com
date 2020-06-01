import time

from flask import Response

from common.dictionary_parse import chinese_comma_sep
from common.mandarin_comp_parse import mc_words
from pages.deprecated import page_footer, frequency_order_word_link_hskcolour, allstyle


def mandarin_companion_page(start_time, expand):
    results = []
    results.append("""<html lang=zh-Hans">
<head>
<title>Mandarin Companion Vocabulary Analysis</title>""")
    results.append(allstyle)
    results.append("""</head>
<body>
<form method="get" action="/cidian">
<a href="https://hskhsk.com/word-lists">HSK\u4E1C\u897F</a>
<a href="/">Scripts</a>""")
    if expand == "yes":
        results.append("""<input type="hidden" name="expand" value="yes" />""")
    results.append("""<input type="text" name="q" value=""/><input type="submit" value="Go" />
<a href="/search">Advanced Search</a>
<a href="/radicals">Radicals</a> """)
    if expand == "yes":
        results.append("""[<a href="/mandcomp">collapse definitions</a>]""")
    else:
        results.append("""[<a href="/mandcomp?expand=yes">expand definitions</a>]""")
    results.append("""</form>
<h3>Mandarin Companion Vocabulary Analysis</h3>
See <a href="http://mandarincompanion.com/">mandarincompanion.com</a> for more information about these graded Chinese readers.
<hr />""")
    append_mandcomp_set(results, 1, """Vocab for "The Secret Garden" """, expand)
    append_mandcomp_set(results, 2, """Vocab for "Sherlock Holmes and the Red-Headed League" """, expand)
    append_mandcomp_set(results, 3, """Vocab for "The Monkey's Paw" """, expand)
    append_mandcomp_set(results, 4, """Vocab for "The Country of the Blind" """, expand)
    append_mandcomp_set(results, 5, """Vocab for "The Sixty-Year Dream" """, expand)
    results.append("<hr />")
    append_mandcomp_set(results, 105, """Vocab Used in Every Book""", expand)
    append_mandcomp_set(results, 301, """Additional Vocab for "The Secret Garden" """, expand)
    append_mandcomp_set(results, 302, """Additional Vocab for "Sherlock Holmes and the Red-Headed League" """, expand)
    append_mandcomp_set(results, 303, """Additional Vocab for "The Monkey's Paw" """, expand)
    append_mandcomp_set(results, 304, """Additional Vocab for "The Country of the Blind" """, expand)
    append_mandcomp_set(results, 305, """Additional Vocab for "The Sixty-Year Dream" """, expand)
    results.append("<hr />")
    append_mandcomp_set(results, 201, """Vocab Used Only in "The Secret Garden" """, expand)
    append_mandcomp_set(results, 202, """Vocab Used Only in "Sherlock Holmes and the Red-Headed League" """, expand)
    append_mandcomp_set(results, 203, """Vocab Used Only in "The Monkey's Paw" """, expand)
    append_mandcomp_set(results, 204, """Vocab Used Only in "The Country of the Blind" """, expand)
    append_mandcomp_set(results, 205, """Vocab Used Only in "The Sixty-Year Dream" """, expand)
    results.append("<hr />")
    append_mandcomp_set(results, 101, """Vocab Used in Exactly One Book""", expand)
    append_mandcomp_set(results, 102, """Vocab Used in Exactly Two Books""", expand)
    append_mandcomp_set(results, 103, """Vocab Used in Exactly Three Books""", expand)
    append_mandcomp_set(results, 104, """Vocab Used in Exactly Four Books""", expand)
    results.append("<hr />")
    append_mandcomp_set(results, 100, """Whole Series Vocab""", expand)

    results.append("<p><small><i>Page generated in {:1.6f} seconds</i></small></p>".format(time.time() - start_time))
    results.append(page_footer)
    return Response(results)

def append_mandcomp_set(results, wordlist, title, expand):
    results.append("""<h4>{} ({} Words)
<a class="arrowlink" title="Download Pleco Flashcards" href="/flash?card=pleco&mandcomp={}">&dArr;</a>
</h4>""".format(title, len(mc_words[wordlist]), wordlist))
    separator = "<br />" if expand == "yes" else chinese_comma_sep
    frequency_order_word_link_hskcolour(results, mc_words[wordlist], separator, expand)
