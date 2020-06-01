import re, unicodedata

pinyintones = ["A\u0100\u00C1\u01CD\u00C0A", "a\u0101\u00E1\u01CE\u00E0a",
               "E\u0112\u00C9\u011A\u00C8E", "e\u0113\u00E9\u011B\u00E8e",
               "O\u014C\u00D3\u01D1\u00D2O", "o\u014D\u00F3\u01D2\u00F2o",
               "I\u012A\u00CD\u01CF\u00CCI", "i\u012B\u00ED\u01D0\u00ECi",
               "U\u016A\u00DA\u01D3\u00D9U", "u\u016B\u00FA\u01D4\u00F9u",
               "\u00DC\u01D5\u01D7\u01D9\u01DB\u00DC", "\u00FC\u01D6\u01D8\u01DA\u01DC\u00FC"]
pyreplacements = [("u:", "\u00FC"), ("v", "\u00FC"), ("U:", "\u00DC"), ("V", "\u00DC")]
pinyinfindregex = re.compile("([A-Za-z\u00FC\u00DC:]+)([1-5])")


def pinyin_numbers_to_tone_marks(inputstr):
    result = []
    nexthanzi = 0
    for match in pinyinfindregex.finditer(inputstr):
        if nexthanzi != match.start():
            result.append(inputstr[nexthanzi:match.start()])
        syllable = match.group(1)
        for fr, to in pyreplacements:
            syllable = syllable.replace(fr, to)
        tone = int(match.group(2))
        for tonetest in pinyintones:
            if tonetest[0] in syllable and not (tonetest[0].lower() == "i" and "iu" in syllable.lower()):
                syllable = syllable.replace(tonetest[0], tonetest[tone])
                break
        result.append(syllable)
        nexthanzi = match.end()
    if nexthanzi < len(inputstr):
        result.append(inputstr[nexthanzi:])
    return "".join(result)


# correct invalid pinyin tone marks
breve_to_caron = {
    "\u0103": "\u01CE",  # a breve -> a caron
    "\u0115": "\u011B",  # e breve -> e caron
    "\u014F": "\u01D2",  # o breve -> o caron
    "\u012D": "\u01D0",  # i breve -> i caron
    "\u016D": "\u01D4",  # u breve -> u caron
    "\u0102": "\u01CD",  # A breve -> A caron
    "\u0114": "\u011A",  # E breve -> E caron
    "\u014E": "\u01D1",  # O breve -> O caron
    "\u012C": "\u01CF",  # I breve -> I caron
    "\u016C": "\u01D3",  # U breve -> U caron
}


def fix_pinyin(pinyin):
    fixed_count = 0
    fixed_pinyin = []
    normalized = unicodedata.normalize("NFKC", pinyin)
    for c in normalized:
        if c in breve_to_caron:
            fixed_pinyin.append(breve_to_caron[c])
            fixed_count += 1
        else:
            fixed_pinyin.append(c)
    return "".join(fixed_pinyin), fixed_count