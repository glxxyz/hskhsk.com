import os
import threading

from common.dictionary import parse_ccedict, parse_cc_file
from common.frequency import parse_word_frequency_file, parse_char_frequency_file
from common.hsk import do_hsk_parsing
from common.mandarin_comp_parse import do_mc_parsing
from common.util import init_radical_data

data_dir = "data/"
init_lock = threading.Lock()
init_done = False


def init_resources():
    global init_done
    # test outside the lock to avoid locking if possible
    if init_done:
        return
    with init_lock:
        # test a second time within the lock to avoid a race condition
        if init_done:
            return
        do_hsk_parsing(data_dir)
        do_mc_parsing(data_dir)
        parse_word_frequency_file(data_dir)
        parse_char_frequency_file(data_dir)
        parse_ccedict(data_dir)
        parse_cc_file(data_dir)
        init_radical_data()
        init_done = True
        print("Initialisation done!")