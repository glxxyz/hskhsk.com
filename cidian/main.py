# coding: utf-8
# https://hskhsk.pythonanywhere.com
# Alan Davies alan@hskhsk.com
import sys
import threading
import time

from flask import Flask, render_template

from pages.cidian import cidian_page
from pages.deprecated import frequency_order_word_link, frequency_order_char_link
from pages.flashcards import flashcards_download
from pages.mandarin_comp import mandarin_companion_page

from pages.vocab_analysis import vocab_analysis_page
from pages.sets import sets_page
from pages.vocab_diff import vocab_diff_page
from pages.radicals import radicals_page
from pages.homophones import homophones_page
from pages.search import search_page
from common.util import create_context, get_parameter
from init import init_resources
from common.hsk import hsk_words, hsk_chars, hsk_words_2010, hsk_chars_2010
from common.pinyin import fix_pinyin
from pages.vocab_list import list_page_words1000, list_page_chars1000, hsk_vocabulary_page

app = Flask(__name__)


@app.route('/', methods=['GET', 'POST'])
@app.route('/hsk', methods=['GET', 'POST'])
def handle_root():
    start_time = time.time()
    context = create_context(start_time)
    return render_template("root.html", **context)


@app.route('/pinyinfix', methods=['GET', 'POST'])
def handle_pinyinfix():
    start_time = time.time()
    pinyin = get_parameter("pinyin", "")
    if len(pinyin) > 100000:
        context = create_context(
            start_time,
            error="Sorry, that text is too big; It will consume too much server CPU time to process. " \
                  "You can try reaching out to alan@hskhsk.com or set this script up on your own dedicated server."
        )
        return render_template("error.html", **context)
    fixed, fixed_count = fix_pinyin(pinyin)
    context = create_context(
        start_time,
        pinyin=pinyin,
        fixed=fixed,
        fixed_count=fixed_count
    )
    return render_template("pinyinfix.html", **context)


@app.route('/homophones', methods=['GET', 'POST'])
def handle_homophones():
    start_time = time.time()
    num_chars = int(get_parameter("chars", "2"))
    expand = get_parameter("expand", "no") == "yes"
    match_tones = get_parameter("tones", "no") == "yes"
    hsk_only = get_parameter("hsk", "no") == "yes"
    init_resources()
    return homophones_page(expand, hsk_only, match_tones, num_chars, start_time)


@app.route('/radicals', methods=['GET', 'POST'])
def handle_radicals():
    start_time = time.time()
    init_resources()
    expand = get_parameter("expand")
    hsk_level = int(get_parameter("hsk", 0))  # 1, 2, .. 6 but can be two levels e.g. 12, 14 etc.
    return radicals_page(expand, hsk_level, start_time)


@app.route('/mandcomp', methods=['GET', 'POST'])
def handle_mandcomp():
    start_time = time.time()
    init_resources()
    expand = get_parameter("expand")
    return mandarin_companion_page(start_time, expand)


@app.route('/dict', methods=['GET', 'POST'])
def handle_dict():
    return handle_cidian()


@app.route('/cidian', methods=['GET', 'POST'])
def handle_cidian():
    start_time = time.time()
    init_resources()
    results = []
    query = get_parameter("q")
    expand = get_parameter("expand")
    return cidian_page(expand, query, results, start_time)


@app.route('/search', methods=['GET', 'POST'])
def handle_search():
    start_time = time.time()
    init_resources()
    return search_page(start_time)


@app.route('/flash', methods=['GET', 'POST'])
def handle_flashcards():
    init_resources()
    return flashcards_download()


@app.route('/hskwords', methods=['GET', 'POST'])
@app.route('/hskwords2012', methods=['GET', 'POST'])
@app.route('/hskwords2013', methods=['GET', 'POST'])
@app.route('/hskwords2014', methods=['GET', 'POST'])
@app.route('/hskwords2015', methods=['GET', 'POST'])
@app.route('/hskwords2016', methods=['GET', 'POST'])
@app.route('/hskwords2017', methods=['GET', 'POST'])
@app.route('/hskwords2018', methods=['GET', 'POST'])
@app.route('/hskwords2019', methods=['GET', 'POST'])
@app.route('/hskwords2020', methods=['GET', 'POST'])
def handle_hskwords():
    init_resources()
    extralink = ""
    expand = get_parameter("expand")
    return hsk_vocabulary_page(
        "/hskwords",
        "HSK Words for 2012-2020",
        extralink,
        "words",
        "/hskchars",
        "characters",
        hsk_words,
        frequency_order_word_link,
        expand)


@app.route('/hskwords2010', methods=['GET', 'POST'])
@app.route('/hskwords2011', methods=['GET', 'POST'])
def handle_hskwords2010():
    init_resources()
    expand = get_parameter("expand")
    return hsk_vocabulary_page(
        "/hskwords2010",
        "HSK Words for 2010 (outdated)",
        ' <a href="/hskwords">HSK Words for 2012-2020</a>',
        "words",
        "/hskchars2010",
        "characters",
        hsk_words_2010,
        frequency_order_word_link,
        expand)


@app.route('/hskchars', methods=['GET', 'POST'])
@app.route('/hskchars2012', methods=['GET', 'POST'])
@app.route('/hskchars2013', methods=['GET', 'POST'])
@app.route('/hskchars2014', methods=['GET', 'POST'])
@app.route('/hskchars2015', methods=['GET', 'POST'])
@app.route('/hskchars2016', methods=['GET', 'POST'])
@app.route('/hskchars2017', methods=['GET', 'POST'])
@app.route('/hskchars2018', methods=['GET', 'POST'])
@app.route('/hskchars2019', methods=['GET', 'POST'])
@app.route('/hskchars2020', methods=['GET', 'POST'])
def handle_hskchars():
    init_resources()
    extralink = ""
    expand = get_parameter("expand")
    return hsk_vocabulary_page(
        "/hskchars",
        "HSK Characters for 2012-2020",
        extralink,
        "characters",
        "/hskwords",
        "words",
        hsk_chars,
        frequency_order_char_link,
        expand)


@app.route('/hskchars2010', methods=['GET', 'POST'])
@app.route('/hskchars2011', methods=['GET', 'POST'])
def handle_hskchars2010():
    init_resources()
    expand = get_parameter("expand")
    return hsk_vocabulary_page(
        '/hskchars2010',
        "HSK Characters for 2010 (outdated)",
        '<a href="/hskchars">HSK Characters 2012-2020</a>',
        "characters",
        "/hskwords2010",
        "words",
        hsk_chars_2010,
        frequency_order_char_link,
        expand)


@app.route('/words1000', methods=['GET', 'POST'])
def handle_words1000():
    start_time = time.time()
    init_resources()
    expand = get_parameter("expand")
    return list_page_words1000(expand, start_time)


@app.route('/chars1000', methods=['GET', 'POST'])
def handle_chars1000():
    start_time = time.time()
    init_resources()
    expand = get_parameter("expand")
    return list_page_chars1000(expand, start_time)


@app.route('/hskwords20102012', methods=['GET', 'POST'])
@app.route('/hskwords20102013', methods=['GET', 'POST'])
@app.route('/hskwords20102014', methods=['GET', 'POST'])
@app.route('/hskwords20102015', methods=['GET', 'POST'])
@app.route('/hskwords20102016', methods=['GET', 'POST'])
@app.route('/hskwords20102017', methods=['GET', 'POST'])
@app.route('/hskwords20102018', methods=['GET', 'POST'])
@app.route('/hskwords20102019', methods=['GET', 'POST'])
@app.route('/hskwords20102020', methods=['GET', 'POST'])
def handle_hskwords20102012():
    return vocab_diff_page(
        "/hskwords2010",
        "/hskwords2020",
        "/hskwords20102020",
        "words",
        "/hskchars20102020",
        "characters",
        hsk_words_2010,
        hsk_words,
        frequency_order_word_link)


@app.route('/hskchars20102012', methods=['GET', 'POST'])
@app.route('/hskchars20102013', methods=['GET', 'POST'])
@app.route('/hskchars20102014', methods=['GET', 'POST'])
@app.route('/hskchars20102015', methods=['GET', 'POST'])
@app.route('/hskchars20102016', methods=['GET', 'POST'])
@app.route('/hskchars20102017', methods=['GET', 'POST'])
@app.route('/hskchars20102018', methods=['GET', 'POST'])
@app.route('/hskchars20102019', methods=['GET', 'POST'])
@app.route('/hskchars20102020', methods=['GET', 'POST'])
def handle_hskchars20102012():
    return vocab_diff_page(
        "/hskchars2010",
        "/hskchars2020",
        "/hskchars20102020",
        "characters",
        "/hskwords20102020",
        "words",
        hsk_chars_2010,
        hsk_chars,
        frequency_order_char_link)


@app.route('/hanzi', methods=['GET', 'POST'])
def handle_hanzi():
    start_time = time.time()
    expand = get_parameter("expand")
    return vocab_analysis_page(expand, start_time)


@app.route('/sets', methods=['GET', 'POST'])
def handle_sets():
    start_time = time.time()
    expand = get_parameter("expand")
    output_one_per_line_checked = "checked" if get_parameter("outputformat") == "oneperline" else ""
    output_comma_sep_checked = "checked" if get_parameter("outputformat") == "commasep" else ""
    output_tab_sep_checked = "checked" if get_parameter("outputformat") == "tabsep" else ""
    output_space_sep_checked = "checked" if get_parameter("outputformat") == "spacesep" else ""
    if output_one_per_line_checked == "" and output_comma_sep_checked == "" and output_space_sep_checked == "":
        output_one_per_line_checked = "checked"
    one_per_line_checked_a = ""
    block_checked_a = "checked" if get_parameter("formatA") == "block" else ""
    comma_sep_checked_a = "checked" if get_parameter("formatA") == "commasep" else ""
    if block_checked_a == "" and comma_sep_checked_a == "":
        one_per_line_checked_a = "checked"
    one_per_line_checked_b = ""
    block_checked_b = "checked" if get_parameter("formatB") == "block" else ""
    comma_sep_checked_b = "checked" if get_parameter("formatB") == "commasep" else ""
    if block_checked_b == "" and comma_sep_checked_b == "":
        one_per_line_checked_b = "checked"
    hanzi_a = get_parameter("hanziA", "")
    hanzi_b = get_parameter("hanziB", "")
    if (block_checked_a and len(hanzi_a) > 10000) or (block_checked_b and len(hanzi_b) > 10000):
        return "Sorry, that text is too big; It will consume too much server CPU time to process." \
               "If you want to set up this script on a dedicated server you can find the source" \
               "at https://github.com/glxxyz/hskhsk.com/tree/main/cidian"

    return sets_page(block_checked_a, block_checked_b, comma_sep_checked_a, comma_sep_checked_b, expand, hanzi_a,
                     hanzi_b, one_per_line_checked_a, one_per_line_checked_b, output_comma_sep_checked,
                     output_one_per_line_checked, output_space_sep_checked, output_tab_sep_checked, start_time)


global_varnames = """
cedict_traditional
cedict_pinyintonemarks
cedict_pinyintonenum
toneless_pinyin
toned_pinyin
tonenum_pinyin
cedict_definition
english_words
cedict_word_set
variant_trad
variant_simp
radical_freq
radical_frequency_index
hsk_radical_level
cc_components
cc_composes
cc_radicals
cc_radicalof
cc_strokes
subtlex_word_set
word_freq
word_frequency_index
word_frequency_ordered
part_of_multichar_word
char_componentof
char_freq
char_frequency_index
char_frequency_ordered
mc_words""".split()

def get_size(obj, seen=None):
    """Recursively finds size of objects"""
    size = sys.getsizeof(obj)
    if seen is None:
        seen = set()
    obj_id = id(obj)
    if obj_id in seen:
        return 0
    # Important mark as seen *before* entering recursion to gracefully handle
    # self-referential objects
    seen.add(obj_id)
    if isinstance(obj, dict):
        size += sum([get_size(v, seen) for v in obj.values()])
        size += sum([get_size(k, seen) for k in obj.keys()])
    elif hasattr(obj, '__dict__'):
        size += get_size(obj.__dict__, seen)
    elif hasattr(obj, '__iter__') and not isinstance(obj, (str, bytes, bytearray)):
        size += sum([get_size(i, seen) for i in obj])
    return size

from common.dictionary import *
from common.frequency import *
from common.mandarin_comp_parse import *

@app.route('/profile', methods=['GET', 'POST'])
def handle_profile():
    variables = [(get_size(eval(name)), name) for name in global_varnames]
    variables.sort(reverse=True)
    total_str = "Total: {}<br /><br />\n".format(sum(v[0] for v in variables))
    return total_str + "<br />\n".join("{}: {}".format(v[1], v[0]) for v in variables)


threading.Thread(target=lambda: init_resources).start()


if __name__ == '__main__':
    # This is used when running locally only. When deploying to Google App
    # Engine, a webserver process such as Gunicorn will serve the app. This
    # can be configured by adding an `entrypoint` to app.yaml.
    # Flask's development server will automatically serve static files in
    # the "static" directory. See:
    # http://flask.pocoo.org/docs/1.0/quickstart/#static-files. Once deployed,
    # App Engine itself will serve those files as configured in app.yaml.
    app.run(host='127.0.0.1', port=8080, debug=True)
# [START gae_python37_render_template]
