import codecs
import os
import re

from common.pinyin import pinyin_numbers_to_tone_marks

# CC-CEDICT parsing for definitions, pinyin, traditional characters
cedict_traditional = {}
cedict_pinyintonemarks = {}
cedict_pinyintonenum = {}
toneless_pinyin = {}  # { "hao" : set([hanzi, ...])}
toned_pinyin = {}  # { "ha^o" : set([hanzi, ...])}
tonenum_pinyin = {}  # { "hao3" : set([hanzi, ...])}
cedict_definition = {}  # hanzi : [definitions]
english_words = {}  # { "test" : set([hanzi, ...])}
cedict_word_set = set()
variant_trad = {}  # { "h" : set(["H", ...])}
variant_simp = {}  # { "h" : set(["H", ...])}


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


ccedict_variant_regex = re.compile(r"(also written|variant of|written as) ([^ \[\],\.\(\)]+)")
ccedict_lineparse_regex = re.compile(r"^(\S+)\s+(\S+).*?\[(.*?)\] /(.*)")


def parse_ccedict(data_dir):
    infile = codecs.open(os.path.join(data_dir, "cedict_ts.u8"), 'r', "utf-8")
    for line in infile:
        if line[0] != "#":
            match = ccedict_lineparse_regex.search(line)
            if match is not None:
                trad = match.group(1)
                word = match.group(2)
                pinyin = match.group(3)
                definition = match.group(4)
                add_dict_entry(word, trad, pinyin, definition)


remove_tone_regex = re.compile(r"[012345]")
find_english_regex = re.compile(r"[A-Za-z]+")


def add_dict_entry(word, trad, pinyinorig, definition):
    if word != "":
        cedict_word_set.add(word)
        pinyin = pinyinorig.replace(" ", "")
        if pinyin != "":
            pinyin_no_tones = remove_tone_regex.sub("", pinyinorig).lower()
            pinyin_tones = pinyin_numbers_to_tone_marks(pinyin)
            if len(pinyin_no_tones) > 0:
                if pinyin_no_tones not in toneless_pinyin:
                    toneless_pinyin[pinyin_no_tones] = set()
                toneless_pinyin[pinyin_no_tones].add(word)
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
        for e in find_english_regex.findall(definition):
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
            for varmatchobj in ccedict_variant_regex.finditer(definition):
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
invalid_unicode_regex = re.compile(r"[^\u0000-\uD7FF\uE000-\uFFFF]", re.UNICODE)


# radicals, require HSK so parsed elsewhere
ignore_invalid_unicode = False
radical_freq = {}
radical_frequency_index = {}
hsk_radical_level = {}  # {"A" : 1, "B" : 1 , "C" : 1}

# character components
cc_components = {}  # {"H" : set(["|", "-"])}
cc_composes = {}  # {"-" : set(["H"]), "|" : set(["H"])}
cc_radicals = {}  # {"|" : set(["H"])}
cc_radicalof = {}  # {"H" : "|"}
cc_strokes = {}  # {"H" : 3}


def parse_cc_file(data_dir):
    # parse wikimedia composition file
    infile = codecs.open(os.path.join(data_dir, "ChineseCharacterDecomposition.txt"), 'r', "utf-8")
    for line in infile:
        if ignore_invalid_unicode and invalid_unicode_regex.search(line) is not None:
            print("Ignoring line with invalid Unicode: ", line)
            continue
        splitted = line.strip("\r\n").replace('\ufeff', "").split("\t")
        if len(splitted) == 12:
            zi = splitted[1]
            strokes = splitted[2]
            first = splitted[4]
            second = splitted[7]
            radical = splitted[11]
            for char in first + second:
                if char != "" and char != zi and char != "*":
                    if zi not in cc_components:
                        cc_components[zi] = set()
                    cc_components[zi].add(char)
                    if char not in cc_composes:
                        cc_composes[char] = set()
                    cc_composes[char].add(zi)
            if radical == "*":
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
