from flask import make_response

from common.dictionary import cedict_traditional, cedict_pinyintonemarks, cedict_definition
from pages.search import processadvancedsearch
from common.util import get_parameter


def flashcards_download():
    searchformat = get_parameter("format", "wildcard")
    hsk1 = "checked" if get_parameter("hsk1") else ""
    hsk2 = "checked" if get_parameter("hsk2") else ""
    hsk3 = "checked" if get_parameter("hsk3") else ""
    hsk4 = "checked" if get_parameter("hsk4") else ""
    hsk5 = "checked" if get_parameter("hsk5") else ""
    hsk6 = "checked" if get_parameter("hsk6") else ""
    mandcomp = int(get_parameter("mandcomp")) if get_parameter("mandcomp") else ""
    expand = get_parameter("expand")
    pinyin = get_parameter("pinyin")
    hanzi = get_parameter("hanzi")
    component = get_parameter("component")
    compound = get_parameter("compound")
    minlength = int(get_parameter("min", "1"))
    maxlength = int(get_parameter("max", "4"))
    fileformat = get_parameter("card", "pleco")
    sort = get_parameter("sort", "freq")
    resultset = processadvancedsearch(searchformat,
                                      sort,
                                      pinyin,
                                      hanzi,
                                      component,
                                      compound,
                                      minlength,
                                      maxlength,
                                      hsk1,
                                      hsk2,
                                      hsk3,
                                      hsk4,
                                      hsk5,
                                      hsk6,
                                      mandcomp,
                                      expand)
    if len(resultset):
        results = flashcard_list(resultset, fileformat)
        response = make_response("\r\n".join(results))
        response.headers['Content-Disposition'] = 'attachment; filename=' + "hskhsk-" + fileformat + "-flascards.txt"
        return response
    else:
        return "No Results Found"


def flashcard_list(resultset, fileformat):
    results = []
    for word in resultset:
        line = []
        trad = cedict_traditional[word][0] if word in cedict_traditional else ""
        toned = ", ".join(set(cedict_pinyintonemarks[word])) if word in cedict_pinyintonemarks else ""
        numbered = toned  # TODO: keep or generate numbered pinyin...
        definition = get_dictionary_entry(word)
        if fileformat == "sticky":
            line.append(word)
            line.append(trad)
            line.append(numbered)
            line.append(toned)
            line.append(definition)
        else:
            if len(trad):
                line.append(word + "[" + trad + "]")
            else:
                line.append(word)
            line.append(toned)
            line.append(definition)
        results.append("\t".join(line))
    return results


def get_dictionary_entry(word):
    results = []
    if word in cedict_definition:
        definition = ""
        for d in cedict_definition[word]:
            dstrip = d.strip("\r\n ,/")
            if len(dstrip):
                if len(definition):
                    definition += ", "
                definition += dstrip
        results.append(definition)
    return ", ".join(results)