import codecs
import os
import unicodedata

from common.dictionary import cedict_definition, add_dict_entry

hsk_word_level = {}  # {"A" : 1, "ABC" : 1 }
hsk_char_level = {}  # {"A" : 1, "B" : 1 , "C" : 1}
hsk_words = {}  # {1 : set("A", "ABC"), ...}
hsk_chars = {}
hsk_words_2010 = {}  # {1 : set("A", "ABC"), ...}
hsk_chars_2010 = {}


def get_hsk_level(hanzi):
    if hanzi in hsk_word_level:
        return hsk_word_level[hanzi]
    elif hanzi in hsk_char_level:
        return hsk_char_level[hanzi]
    return 0


def get_hsk_word_level(hanzi):
    if hanzi in hsk_word_level:
        return hsk_word_level[hanzi]
    return 0


def get_hsk_char_level(hanzi):
    if hanzi in hsk_char_level:
        return hsk_char_level[hanzi]
    return 0


def get_hsk_word_level_negative_notfound(hanzi):
    if hanzi in hsk_word_level:
        return hsk_word_level[hanzi]
    elif hanzi in cedict_definition:
        return 0
    return -1


def get_hsk_char_level_negative_notfound(hanzi):
    if hanzi in hsk_char_level:
        return hsk_char_level[hanzi]
    elif hanzi in cedict_definition:
        return 0
    return -1


def do_hsk_parsing(directory):
    parse_hsk_file(os.path.join(directory, "HSK Official With Definitions 2012 L1.txt"), 1)
    parse_hsk_file(os.path.join(directory, "HSK Official With Definitions 2012 L2.txt"), 2)
    parse_hsk_file(os.path.join(directory, "HSK Official With Definitions 2012 L3.txt"), 3)
    parse_hsk_file(os.path.join(directory, "HSK Official With Definitions 2012 L4.txt"), 4)
    parse_hsk_file(os.path.join(directory, "HSK Official With Definitions 2012 L5.txt"), 5)
    parse_hsk_file(os.path.join(directory, "HSK Official With Definitions 2012 L6.txt"), 6)
    build_hsk_extralists(hsk_words, hsk_chars)
    parse_hsk_2010_file(os.path.join(directory, "New_HSK_2010.csv"))
    build_hsk_extralists(hsk_words_2010, hsk_chars_2010)


# parse newer 2012 HSK format
def parse_hsk_file(in_file_name, hsklevel):
    hsk_words[hsklevel] = set()
    infile = codecs.open(in_file_name, 'r', "utf-8")
    for line in infile:
        splitted = line.strip().split("\t")
        if len(splitted) >= 4:
            word = unicodedata.normalize("NFKC", splitted[0].strip()).replace('\ufeff', "")
            if word != "":
                hsk_words[hsklevel].add(word)
                if word in hsk_word_level:
                    hsk_word_level[word] = min(hsk_word_level[word], hsklevel)
                else:
                    hsk_word_level[word] = hsklevel
                for somehanzi in word:
                    if somehanzi in hsk_char_level:
                        hsk_char_level[somehanzi] = min(hsk_char_level[somehanzi], hsklevel)
                    else:
                        hsk_char_level[somehanzi] = hsklevel
                trad = splitted[1].strip()
                pinyin = splitted[2].strip()
                definition = splitted[4].strip()
                add_dict_entry(word, trad, pinyin, definition)
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
        for j in range(i + 1, 7):
            words[i * 10 + j] = words[i]
            chars[i * 10 + j] = chars[i]
            for k in range(i + 1, j + 1):
                words[i * 10 + j] = words[i * 10 + j].union(words[k])
                chars[i * 10 + j] = chars[i * 10 + j].union(chars[k])


def parse_hsk_2010_file(in_file_name):
    infile = codecs.open(in_file_name, 'r', "utf-8")
    hsk_words_2010[1] = set()
    hsk_words_2010[2] = set()
    hsk_words_2010[3] = set()
    hsk_words_2010[4] = set()
    hsk_words_2010[5] = set()
    hsk_words_2010[6] = set()
    for line in infile:
        splitted = line.split(",")
        if len(splitted) > 1:
            hsklevel = int(splitted[0].strip().replace('\ufeff', ""))
            word = unicodedata.normalize("NFKC", splitted[1].strip()).replace('\ufeff', "")
            if word != "":
                hsk_words_2010[hsklevel].add(word)
    infile.close()