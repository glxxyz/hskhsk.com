import codecs
import os
import unicodedata

subtlex_word_set = set()
word_freq = {}  # {"AB" : 1234, ...}
word_frequency_index = {}  # {"AB" : 1, ...}
word_frequency_ordered = []  # [(1234, "AB"), ...] # sorted by descending frequency
part_of_multichar_word = set()  # a set of characters that make up multi-character words
char_componentof = {}  # {"A" : set(["AB", ...]}
char_freq = {}  # {"A" : 6789, ...}
char_frequency_index = {}  # {"A" : 1, ...}
char_frequency_ordered = []  # [(1234, "A"), ...] # sorted by descending frequency
max_frequency_index = 999999


# don't check the dictionary, we want the actual frequency
def query_word_freq(somehanzi):
    if somehanzi in word_freq:
        return word_freq[somehanzi]
    return 0


# don't check the dictionary, we want the actual frequency
def query_char_freq(char):
    if char in char_freq:
        return char_freq[char]
    return 0


# parse SUBTLEX word frequency
def parse_word_frequency_file(data_dir):
    infile = codecs.open(os.path.join(data_dir, "SUBTLEX-CH-WF.txt"), 'r', "utf-8")
    frequency_index = 1
    for line in infile:
        splitted = line.strip().split("\t")
        if len(splitted) == 7:
            word = unicodedata.normalize("NFKC", splitted[0].strip()).replace('\ufeff', "")
            freq = int(splitted[1].strip())
            if word != "" and freq > 0:
                subtlex_word_set.add(word)
                word_freq[word] = freq
                word_frequency_index[word] = frequency_index
                frequency_index += 1
                for char in word:
                    part_of_multichar_word.add(char)
                    if char not in char_componentof:
                        char_componentof[char] = set()
                    char_componentof[char].add(word)
    for word, freq in word_freq.items():
        word_frequency_ordered.append((freq, word))
    word_frequency_ordered.sort()
    word_frequency_ordered.reverse()
    infile.close()


# parse SUBTLEX char frequency
def parse_char_frequency_file(data_dir):
    infile = codecs.open(os.path.join(data_dir, "SUBTLEX-CH-CHR.txt"), 'r', "utf-8")
    frequency_index = 1
    for line in infile:
        splitted = line.strip().split("\t")
        if len(splitted) == 7:
            char = unicodedata.normalize("NFKC", splitted[0].strip()).replace('\ufeff', "")
            freq = int(splitted[1].strip())
            if char != "" and freq > 0:
                char_freq[char] = freq
                char_frequency_index[char] = frequency_index
                frequency_index += 1
    for char, freq in char_freq.items():
        char_frequency_ordered.append((freq, char))
    char_frequency_ordered.sort()
    char_frequency_ordered.reverse()
    infile.close()
