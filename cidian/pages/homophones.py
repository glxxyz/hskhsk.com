import urllib.parse

from flask import render_template

from common.dictionary import tonenum_pinyin, toneless_pinyin, variant_simp
from common.hsk import hsk_words, get_hsk_level
from common.pinyin import pinyin_numbers_to_tone_marks
from common.util import create_context, identity, frequency_ordered_words, dictionary_link, truncated_definition


def homophones_page(expand, hsk_only, match_tones, num_chars, start_time):
    homophones = build_homophones(num_chars, match_tones, hsk_only)
    context = create_context(
        start_time,
        num_chars=num_chars,
        expand=expand,
        match_tones=match_tones,
        hsk_only=hsk_only,
        homophones=homophones,
        link_1=homophones_link(1, expand, match_tones, hsk_only),
        link_2=homophones_link(2, expand, match_tones, hsk_only),
        link_3=homophones_link(3, expand, match_tones, hsk_only),
        link_4=homophones_link(4, expand, match_tones, hsk_only),
        link_5=homophones_link(5, expand, match_tones, hsk_only),
        link_6=homophones_link(6, expand, match_tones, hsk_only),
        link_7=homophones_link(7, expand, match_tones, hsk_only),
        link_8=homophones_link(8, expand, match_tones, hsk_only),
        link_9=homophones_link(9, expand, match_tones, hsk_only),
        link_expand=homophones_link(num_chars, not expand, match_tones, hsk_only),
        link_match_tones=homophones_link(num_chars, expand, not match_tones, hsk_only),
        link_hsk_only=homophones_link(num_chars, expand, match_tones, not hsk_only)
    )
    return render_template("homophones.html", **context)


def build_homophones(num_chars, match_tones, hsk_only):
    if match_tones:
        pinyin_map = tonenum_pinyin
        convert_pinyin = pinyin_numbers_to_tone_marks
    else:
        pinyin_map = toneless_pinyin
        convert_pinyin = identity
    candidates = []  # ["pinyin", ... ]
    for pinyin, hanzi_set in pinyin_map.items():
        if len(hanzi_set) >= 2:
            candidate_hanzi = next(iter(hanzi_set))
            if len(candidate_hanzi) == num_chars:
                candidates.append(pinyin)
    candidates.sort()
    homophones = []
    for pinyin in candidates:
        non_variants = set()
        for word in pinyin_map[pinyin]:
            if word not in variant_simp or len(variant_simp[word] & non_variants) == 0:
                if not hsk_only or word in hsk_words[16]:
                    non_variants.add(word)
        if len(non_variants) >= 2:
            homophones.append({
                "pinyin": convert_pinyin(pinyin),
                "members": homophone_group_members(non_variants)
            })
    return homophones


def homophone_group_members(words):
    return [homophone_group_member(word) for word in frequency_ordered_words(words)]


def homophone_group_member(hanzi):
    return {
        "hanzi": hanzi,
        "dictionary_link": dictionary_link(hanzi),
        "definition": truncated_definition(hanzi),
        "hsk_level": get_hsk_level(hanzi)
    }


def homophones_link(num_chars, expand, match_tones, hsk_only):
    parameters = {}
    if num_chars != 2:
        parameters["chars"] = num_chars
    if expand:
        parameters["expand"] = "yes"
    if match_tones:
        parameters["tones"] = "yes"
    if hsk_only:
        parameters["hsk"] = "yes"
    if len(parameters) == 0:
        return "/homophones"
    return "/homophones?" + urllib.parse.urlencode(parameters)