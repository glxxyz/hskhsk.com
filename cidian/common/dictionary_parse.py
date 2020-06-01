import re

from common.dictionary import cedict_definition
from common.frequency import word_freq, char_freq, query_word_freq, part_of_multichar_word
from common.hsk import get_hsk_word_level, get_hsk_char_level

chinese_comma = "\uFF0C"
chinese_comma_sep = "\uFF0C<wbr />"


def parse_comma_sep(hanzi, notes, allownonhanzi, expand, definition_link_function):
    hsk_word_count = {0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0}
    hsk_char_count = {0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0}
    words = set()
    chars = set()
    ignore_words = set()
    ignore_chars = set()
    unknown_words = set()
    unknown_chars = set()
    cleanhanzi = re.sub(r"[,;\|\t\r\n " + chinese_comma + "]+", " ", hanzi)
    for word in cleanhanzi.split():
        if allownonhanzi or len([c for c in word if not char_is_ok(c)]) == 0:
            words.add(word)
            hsk_word_count[get_hsk_word_level(word)] += 1
            if (not allownonhanzi) and word not in word_freq:
                unknown_words.add(word)
        else:
            ignore_words.add(word)
        for char in word:
            if allownonhanzi or char_is_ok(char):
                chars.add(char)
                hsk_char_count[get_hsk_char_level(char)] += 1
                if (not allownonhanzi) and char not in char_freq:
                    unknown_chars.add(char)
            else:
                ignore_chars.add(char)

    if len(ignore_words):
        notes.append(
            "Ignored words: " + ", ".join([definition_link_function(h, "none", expand) for h in ignore_words]))
    if len(ignore_chars):
        notes.append(
            "Ignored characters: " + ", ".join([definition_link_function(h, "none", expand) for h in ignore_chars]))
    if len(unknown_words):
        notes.append(
            "Unknown words: " + ", ".join([definition_link_function(h, "none", expand) for h in unknown_words]))
    if len(unknown_chars):
        notes.append(
            "Unknown characters: " + ", ".join([definition_link_function(h, "none", expand) for h in unknown_chars]))
    return words, chars, hsk_word_count, hsk_char_count


def parse_block(hanzi, notes, expand, definition_link_function):
    hsk_word_count = {0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0}
    hsk_char_count = {0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0}
    words = set()
    chars = set()
    ignore_chars = set()
    unknown_chars = set()
    tokenised = mostlikelywordsallchars(hanzi, expand, definition_link_function, notes)
    for ishanzi, text in tokenised:
        if ishanzi:
            for char in text:
                chars.add(char)
                hsk_char_count[get_hsk_char_level(char)] += 1
                if char not in char_freq:
                    unknown_chars.add(char)
            words.add(text)
            hsk_word_count[get_hsk_word_level(text)] += 1
        else:
            ignore_chars.add(text)
    if len(ignore_chars):
        notes.append(
            "Ignored characters: " + ", ".join([definition_link_function(h, "none", expand) for h in ignore_chars]))
    if len(unknown_chars):
        notes.append(
            "Unknown characters: " + ", ".join([definition_link_function(h, "none", expand) for h in unknown_chars]))
    return words, chars, hsk_word_count, hsk_char_count


# more advanced version of 'parse_block'
def parse_list(hanzi, notes, allownonhanzi, expand, definition_link_function):
    hsk_word_count = {0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0}
    hsk_char_count = {0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0}
    words = set()
    chars = set()
    ignore_words = set()
    ignore_chars = set()
    unknown_words = set()
    unknown_chars = set()
    for line in hanzi.split("\n"):
        chunks = line.split()
        if len(chunks):
            word = chunks[0]
            if allownonhanzi or len([c for c in word if not char_is_ok(c)]) == 0:
                words.add(word)
                hsk_word_count[get_hsk_word_level(word)] += 1
                if (not allownonhanzi) and word not in word_freq:
                    unknown_words.add(word)
            else:
                ignore_words.add(word)
            for char in word:
                if allownonhanzi or char_is_ok(char):
                    chars.add(char)
                    hsk_char_count[get_hsk_char_level(char)] += 1
                    if (not allownonhanzi) and char not in char_freq:
                        unknown_chars.add(char)
                else:
                    ignore_chars.add(char)

    if len(ignore_words):
        notes.append(
            "Ignored words: " + ", ".join([definition_link_function(h, "none", expand) for h in ignore_words]))
    if len(ignore_chars):
        notes.append(
            "Ignored characters: " + ", ".join([definition_link_function(h, "none", expand) for h in ignore_chars]))
    if len(unknown_words):
        notes.append(
            "Unknown words: " + ", ".join([definition_link_function(h, "none", expand) for h in unknown_words]))
    if len(unknown_chars):
        notes.append(
            "Unknown characters: " + ", ".join([definition_link_function(h, "none", expand) for h in unknown_chars]))
    return words, chars, hsk_word_count, hsk_char_count


def determine_frequency_score(split):
    score = 0
    for s in split:
        if s in word_freq:
            score += query_word_freq(s) * len(s) ** 3
        else:
            score -= 1000000000
    return score


def all_possible_splits(hanzi):
    if len(hanzi) == 0:
        return [[]]
    if len(hanzi) == 1:
        return [[hanzi]]
    splits = []
    for i in range(len(hanzi), 0, -1):
        test = hanzi[:i]
        if len(test) == 1 or test in word_freq:
            testsplits = all_possible_splits(hanzi[i:])
            for t in testsplits:
                splits.append([test] + t)
    return splits


def determine_best_split(hanzi, notes, expand, definition_link_function):
    allsplits = all_possible_splits(hanzi)
    max_freq = 0
    max_split = []
    for split in allsplits:
        frequency_score = determine_frequency_score(split)
        if frequency_score > max_freq:
            max_freq = frequency_score
            max_split = split
    if notes is not None:
        # firstslice, lastslice = sliceoffallsame(allsplits)
        if sum([1 if max(list(map(len, s))) > 1 else 0 for s in allsplits]) > 1:
            note = "Ambiguous words detected. Chose split: " + "|".join(
                [definition_link_function(h, "none", expand) for h in max_split]) + ". Words not chosen: "
            words_out = set()
            for split in allsplits:
                words_out = words_out | set(split)
            words_out = words_out - set(max_split)
            note += ", ".join([definition_link_function(h, "none", expand) for h in words_out])
            notes.append(note)
    return max_split


def sliceoffallsame(lists):
    minlen = min(list(map(len, lists)))
    different = False
    for first in range(0, minlen):
        for i in range(0, len(lists) - 1):
            if lists[i][first] != lists[i + 1][first]:
                different = True
                break
        if different:
            break
    different = False
    for last in range(-1, -1 * minlen, -1):
        for i in range(0, len(lists) - 1):
            if lists[i][last] != lists[i + 1][last]:
                different = True
                break
        if different:
            break
    if different:
        last += 1
    if last == 0:
        last = None
    return first, last


def mostlikelywordsallchars(hanzi, expand, definition_link_function, notes=None):
    rawtokens = []
    startofchunk = 0
    for i in range(0, len(hanzi)):
        # big optimisation; break at boundaries of characters that cannot be part of a word
        if (not hanzi[i] in part_of_multichar_word) or (not char_is_ok(hanzi[i])):
            if startofchunk < i:
                rawtokens.append((True, hanzi[startofchunk:i]))
            rawtokens.append((char_is_ok(hanzi[i]), hanzi[i]))
            startofchunk = i + 1
    if startofchunk < len(hanzi):
        rawtokens.append((True, hanzi[startofchunk:len(hanzi)]))
    tokens = []
    for ishanzi, hanzi in rawtokens:
        if ishanzi:
            split = determine_best_split(hanzi, notes, expand, definition_link_function)
            for s in split:
                tokens.append((True, s))
        else:
            tokens.append((ishanzi, hanzi))
    return tokens


def allvalidwords(hanzi):
    rawtokens = []
    startofchunk = 0
    for i in range(0, len(hanzi)):
        # big optimisation; break at boundaries of characters that cannot be part of a word
        if (not hanzi[i] in part_of_multichar_word) or (not char_is_ok(hanzi[i])):
            if startofchunk < i:
                rawtokens.append(hanzi[startofchunk:i])
            elif char_is_ok(hanzi[i]):
                rawtokens.append(hanzi[i])
            startofchunk = i + 1
    if startofchunk < len(hanzi):
        rawtokens.append(hanzi[startofchunk:len(hanzi)])
    tokens = []
    for possible in rawtokens:
        for i in range(0, len(possible)):
            for j in range(1, len(possible) + 1):
                candidate = possible[i:j]
                if candidate in cedict_definition:
                    tokens.append(candidate)
    return tokens


def char_is_ok(char):
    if ord(char) < 128:
        return False  # ignore ASCII
    if 0x2000 <= ord(char) <= 0x206F:
        return False  # ignore General punctuation
    if 0x3000 <= ord(char) <= 0x303F:
        return False  # ignore Chinese punctuation
    if 0xFF00 <= ord(char) <= 0xFFEF:
        return False  # ignore full width and half width forms
    return True

