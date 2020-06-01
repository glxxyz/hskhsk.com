import html
import time
import urllib.parse

from flask import request

from common.dictionary import radical_frequency_index, cedict_definition, radical_freq, hsk_radical_level, cc_radicalof, \
    cedict_traditional
from common.frequency import max_frequency_index, char_frequency_index, word_frequency_index, char_freq
from common.hsk import hsk_chars, get_hsk_char_level


# There's always a 'misc' or 'util' somewhere... adding this one to avoid circular
# dependencies between main, hsk, frequency, radical, and dictionary data. Would be
# good to clean that up and remove it and find better homes for these things.


def query_radical_frequency_index(char):
    if char in radical_frequency_index:
        return radical_frequency_index[char]
    if char in hsk_chars:
        return max_frequency_index
    if char in cedict_definition:  # TODO: should be able to test if char is in any of the words in there too
        return max_frequency_index + 1
    return max_frequency_index + 2


def query_radical_freq(char):
    if char in radical_freq:
        return radical_freq[char]
    return 0


def get_hsk_radical_level(somehanzi):
    if somehanzi in hsk_radical_level:
        return hsk_radical_level[somehanzi]
    return 0


def query_char_frequency_index(char):
    if char in char_frequency_index:
        return char_frequency_index[char]
    if char in hsk_chars:
        return max_frequency_index
    if char in cedict_definition:  # TODO: should be able to test if char is in any of the words in there too
        return max_frequency_index + 1
    return max_frequency_index + 2


def query_word_frequency_index(word):
    if word in word_frequency_index:
        return word_frequency_index[word]
    if word in cedict_definition:
        return max_frequency_index
    return max_frequency_index + 1


def frequency_ordered_words(words):
    frequency_list = [(query_word_frequency_index(word), word) for word in words]
    frequency_list.sort()
    return [word for freq, word in frequency_list]


def frequency_ordered_chars(chars):
    frequency_list = [(query_word_frequency_index(char), char) for char in chars]
    frequency_list.sort()
    return [char for freq, char in frequency_list]


def init_radical_data():
    for char, freq in char_freq.items():
        if char in cc_radicalof:
            radical = cc_radicalof[char]
            if radical not in radical_freq:
                radical_freq[radical] = 0
            radical_freq[radical] += freq
            radical_level = get_hsk_char_level(radical)
            char_level_char = get_hsk_char_level(char)
            if char_level_char != 0 and char_level_char < radical_level:
                radical_level = char_level_char
            if ((radical in hsk_radical_level and radical_level < hsk_radical_level[radical] and radical_level != 0)
                    or (radical not in hsk_radical_level)):
                hsk_radical_level[radical] = radical_level
    frequency_order = [(freq, radical) for (radical, freq) in radical_freq.items()]
    frequency_order.sort()
    frequency_order.reverse()
    for i in range(len(frequency_order)):
        radical_frequency_index[frequency_order[i][1]] = i + 1


def identity(x):
    return x


def create_context(start_time, **args):
    args["generated_time"] = "{:1.6f}".format(time.time() - start_time)
    return args


def dictionary_link(hanzi):
    return "/cidian?q=" + urllib.parse.quote(html.escape(hanzi))


def truncated_definition(hanzi, max_length=80):
    found = None
    if hanzi in cedict_definition:
        found = cedict_definition[hanzi]
    elif hanzi in cedict_traditional:
        found = cedict_traditional[hanzi]
    definition = ""
    if found is not None:
        for d in cedict_definition[hanzi]:
            dstrip = d.strip("\r\n ,/")
            if len(dstrip) > 0:
                if len(definition) > 0:
                    definition += ", "
                definition += dstrip
                if len(definition) > max_length:
                    return definition[:max_length] + "..."
    return definition


# Try to get a parameter both from the request args and the form, allows both GET and POST to be used.
def get_parameter(key, default=""):
    value = request.args.get(key, default)
    if value == "" and key in request.form:
        value = request.form[key]
    return value


