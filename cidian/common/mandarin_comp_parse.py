import codecs
import unicodedata

# ================
# Mandarin Companion Wordlists

mc_words = {}  # # {1 : set("A", "ABC"), ...}


def do_mc_parsing(data_dir):
    parse_mc_file(data_dir + "MandarinCompanion1_secret_garden.txt", 1)
    parse_mc_file(data_dir + "MandarinCompanion2_sherlock_holmes.txt", 2)
    parse_mc_file(data_dir + "MandarinCompanion3_monkeys_paw.txt", 3)
    parse_mc_file(data_dir + "MandarinCompanion4_country_of_the_blind.txt", 4)
    parse_mc_file(data_dir + "MandarinCompanion5_sixty_year_dream.txt", 5)
    build_mc_extralists()


def parse_mc_file(in_file_name, mc_level):
    mc_words[mc_level] = set()
    infile = codecs.open(in_file_name, 'r', "utf-8")
    for line in infile:
        word = unicodedata.normalize("NFKC", line.strip()).replace('\ufeff', "")
        if word != "":
            mc_words[mc_level].add(word)
    infile.close()


def build_mc_extralists():
    # Words that appear any list
    mc_words[100] = mc_words[1] | mc_words[2] | mc_words[3] | mc_words[4] | mc_words[5]

    # words that appear only in individual lists
    mc_words[201] = mc_words[1] - mc_words[2] - mc_words[3] - mc_words[4] - mc_words[5]
    mc_words[202] = mc_words[2] - mc_words[1] - mc_words[3] - mc_words[4] - mc_words[5]
    mc_words[203] = mc_words[3] - mc_words[1] - mc_words[2] - mc_words[4] - mc_words[5]
    mc_words[204] = mc_words[4] - mc_words[1] - mc_words[2] - mc_words[3] - mc_words[5]
    mc_words[205] = mc_words[5] - mc_words[1] - mc_words[2] - mc_words[3] - mc_words[4]

    # Words that appear in only 1 list
    mc_words[101] = mc_words[201] | mc_words[202] | mc_words[203] | mc_words[204] | mc_words[205]

    # Words that appear in any 2 lists
    mc_words[102] = (((mc_words[1] & mc_words[2]) - mc_words[3] - mc_words[4] - mc_words[5])
                     | ((mc_words[1] & mc_words[3]) - mc_words[2] - mc_words[4] - mc_words[5])
                     | ((mc_words[1] & mc_words[4]) - mc_words[2] - mc_words[3] - mc_words[5])
                     | ((mc_words[1] & mc_words[5]) - mc_words[2] - mc_words[3] - mc_words[4])
                     | ((mc_words[2] & mc_words[3]) - mc_words[1] - mc_words[4] - mc_words[5])
                     | ((mc_words[2] & mc_words[4]) - mc_words[1] - mc_words[3] - mc_words[5])
                     | ((mc_words[2] & mc_words[5]) - mc_words[1] - mc_words[3] - mc_words[4])
                     | ((mc_words[3] & mc_words[4]) - mc_words[1] - mc_words[2] - mc_words[5])
                     | ((mc_words[3] & mc_words[5]) - mc_words[1] - mc_words[2] - mc_words[4])
                     | ((mc_words[4] & mc_words[5]) - mc_words[1] - mc_words[2] - mc_words[3]))

    # Words that appear in any 3 lists
    mc_words[103] = (((mc_words[3] & mc_words[4] & mc_words[5]) - mc_words[1] - mc_words[2])
                     | ((mc_words[2] & mc_words[4] & mc_words[5]) - mc_words[1] - mc_words[3])
                     | ((mc_words[2] & mc_words[3] & mc_words[5]) - mc_words[1] - mc_words[4])
                     | ((mc_words[2] & mc_words[3] & mc_words[4]) - mc_words[1] - mc_words[5])
                     | ((mc_words[1] & mc_words[4] & mc_words[5]) - mc_words[2] - mc_words[3])
                     | ((mc_words[1] & mc_words[3] & mc_words[5]) - mc_words[2] - mc_words[4])
                     | ((mc_words[1] & mc_words[3] & mc_words[4]) - mc_words[2] - mc_words[5])
                     | ((mc_words[1] & mc_words[2] & mc_words[5]) - mc_words[3] - mc_words[4])
                     | ((mc_words[1] & mc_words[2] & mc_words[4]) - mc_words[3] - mc_words[5])
                     | ((mc_words[1] & mc_words[2] & mc_words[3]) - mc_words[4] - mc_words[5]))

    # Words that appear in any 4 lists
    mc_words[104] = (((mc_words[1] & mc_words[2] & mc_words[3] & mc_words[4]) - mc_words[5])
                     | ((mc_words[1] & mc_words[2] & mc_words[3] & mc_words[5]) - mc_words[4])
                     | ((mc_words[1] & mc_words[2] & mc_words[4] & mc_words[5]) - mc_words[3])
                     | ((mc_words[1] & mc_words[3] & mc_words[4] & mc_words[5]) - mc_words[2])
                     | ((mc_words[2] & mc_words[3] & mc_words[4] & mc_words[5]) - mc_words[1]))

    # Words that appear every list
    mc_words[105] = mc_words[1] & mc_words[2] & mc_words[3] & mc_words[4] & mc_words[5]

    # words that are added onto the core vocabulary
    mc_words[301] = mc_words[1] - mc_words[105]
    mc_words[302] = mc_words[2] - mc_words[105]
    mc_words[303] = mc_words[3] - mc_words[105]
    mc_words[304] = mc_words[4] - mc_words[105]
    mc_words[305] = mc_words[5] - mc_words[105]