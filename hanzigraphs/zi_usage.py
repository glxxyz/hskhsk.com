#!c:/python27/python
# -*- coding: utf-8 -*-

# Simple utility to analyse character usage based on a Skritter words file.
# Output is in Graphviz dotty format http://www.graphviz.org/
#
# Notes: Ignores lines with less than two tabs, to account for a problem with Skritter's export format.
#        Ignores other columns
#
# Usage: zi_usage.py in.txt out.txt
#
# Tested with Python 2.73 and Graphviz 2.28.0
#
# Alan Davies, August 2012, goat@fastmail.fm

# red1 red4   
# orangered orangered3
# yellow goldenrod1
# limegreen darkgreen
# mediumblue steelblue
# indigo slateblue


# set to True importing from Skritter, False importing HSK
fromskritter = False

# Ignore if less than this number of tabs per line
minSkritterTabsPerLine = 2

import sys, os, os.path, string, codecs, copy

# if len(sys.argv) != 3:
#     print >> sys.stderr, "Usage: zi_usage.py my_words.txt out.txt"
#     sys.exit(1)
    
# infilename = sys.argv[1]
# outfilename = sys.argv[2]
curHSKMinLevel = 6
curHSKMaxLevel = 6
showHSKColours = True
outputAllConnectedZi = True
outputPreviousConnections = True # False for HSK 5-6, otherwise True
eliminateNonWordZi = True
#outputexceptions = set(list(u"事实分人理心动无发力气不")) # level 6 exceptions
# outputexceptions = set(list(u"平明业合自对成发体理心人实不子")) # level 5 exceptions
outputexceptions = set([]) # other HSK levels
infilename = "C:\\Dropbox\\Alan\\Misc\\Made\\Chinese\\Skritter\HSK_Level_6_(New_HSK).csv"
outfilename = "C:\\Dropbox\\Alan\\Misc\\Made\\Chinese\\Skritter\HSK6-Level6only_v7.dot"
#infilename = "C:\\Dropbox\\Alan\\Misc\\Made\\Chinese\\Skritter\HSK_6_unit_test.csv"
#outfilename = "C:\\Dropbox\\Alan\\Misc\\Made\\Chinese\\Skritter\HSK6_unit_test.dot"
# infilename = "C:\\Dropbox\\Alan\\Misc\\Made\\Chinese\\Skritter\unit_test.txt"
# outfilename = "C:\\Dropbox\\Alan\\Misc\\Made\\Chinese\\Skritter\unit_test.dot"

def is_current_hsk_level(hsklevel):
    return ((hsklevel >= curHSKMinLevel) and (hsklevel <= curHSKMaxLevel))

def is_below_hsk_level(hsklevel):
    return (hsklevel <= curHSKMaxLevel)

def gethskstyle(hsklevel, isWord, wordlen):
    if isWord:
        if hsklevel == 1: wordstyle= u" [color=red{0}]\n"
        if hsklevel == 2: wordstyle= u" [color=green{0}]\n" 
        if hsklevel == 3: wordstyle= u" [color=dodgerblue{0}]\n" 
        if hsklevel == 4: wordstyle= u" [color=purple{0}]\n" 
        if hsklevel == 5: wordstyle= u" [color=saddlebrown{0}]\n" 
        if hsklevel == 6: wordstyle= u" [color=black{0}]\n" 
    else:
        if hsklevel == 1: wordstyle= u" [color=red style=dashed{0}]\n"
        if hsklevel == 2: wordstyle= u" [color=green style=dashed{0}]\n" 
        if hsklevel == 3: wordstyle= u" [color=dodgerblue style=dashed{0}]\n" 
        if hsklevel == 4: wordstyle= u" [color=purple style=dashed{0}]\n" 
        if hsklevel == 5: wordstyle= u" [color=saddlebrown style=dashed{0}]\n" 
        if hsklevel == 6: wordstyle= u" [color=black style=dashed{0}]\n"
    if wordlen == 1:
        shape = u" shape=circle"
    else:
        shape = u" shape=ellipse"
    return wordstyle.format(shape)
    
def get_word_style(word): 
    hsklevel = hsk[word]
    if True: # is_current_hsk_level(hsklevel):
        if showHSKColours:
            wordstyle = gethskstyle(hsklevel, word in words, len(list(word)))
        else:
            if word in words:
                wordstyle= u"\n"
            else:
                wordstyle= u" [color=grey]\n"
    else:
        wordstyle= u" [color=grey style=dotted]\n"
    return wordstyle

if os.path.exists(outfilename):
    print >> sys.stderr, "Error, {0} already exists".format(outfilename)
#     sys.exit(1)

infile = codecs.open(infilename, 'r', "utf-8")

# examples are for parsing a two line file: "A\nABC"
chars = {} # {"A" : True, "B" : True, "C" : True}
words = {}  # {"A" : ["ABC"], "ABC" : []}
graph = {} # {"A" : set(["ABC"]), "B" : set(["ABC"]), "C" : set(["ABC"]), "ABC" : set(["A", "B", "C"]) }
potential_matches = {} # {"A" : ["A", "ABC"], "AB" : ["ABC"], "B" : ["ABC"] ... }
hsk = {} # {"A" : 1, "ABC" : 1 }

def add_hsk(word, hsklevel, isWord):
    if (word not in hsk):
        # 1. new word: add it
        hsk[word] = hsklevel
    elif isWord and (word in words):
        # 2. already a word, adding as a word: add if it lowers level
        if (hsk[word] > hsklevel):
            hsk[word] = hsklevel
    elif isWord:
        # 3. not yet a word, adding as a word: add it at current level
        hsk[word] = hsklevel        
    elif (word not in words):
        # 4. not yet a word, not adding as a word: add if it lowers level
        if (hsk[word] > hsklevel):
            hsk[word] = hsklevel
    else:
        # 5. not adding as a word, already a word: do nothing
        pass

# build words, chars, and potential matches
def build_words(word, word_chars, hsklevel):
    add_hsk(word, hsklevel, True)
    if word not in words:
        words[word] = []
    for i in range(0, len(word_chars)):
        for j in range(i+1, len(word_chars)+1):
            subword_chars = word_chars[i:j]
            subword = "".join(subword_chars)
            if subword not in potential_matches:
                potential_matches[subword] = []
            if word not in potential_matches[subword]:
                potential_matches[subword].append(word) 
            if j-i == 1:
                chars[subword] = True
                add_hsk(subword, hsklevel, False)
                if subword not in graph:
                    graph[subword] = set()
                graph[subword].add(word)
                if word not in graph:
                    graph[word] = set()
                graph[word].add(subword)

if fromskritter:
    for line in infile:
        cleanline = line.replace("\n","")
        if string.count(cleanline, "\t") >= minSkritterTabsPerLine:
            tabindex = string.find(cleanline, "\t")
            if tabindex != -1:
                cleanline = cleanline[0:tabindex].strip()
        else:
            cleanline = ""
        if cleanline != "":
            charlist = list(cleanline)
            if charlist[0] == codecs.BOM_UTF8.decode("utf8"):
                charlist = charlist[1:]
                cleanline = "".join(charlist)
            build_words(cleanline, charlist, 0)
else:
    # assume HSK input
    for line in infile:
        splitted = line.split(",")
        if len(splitted) > 1:
            hsklevel = int(splitted[0].strip())
            word = splitted[1].strip()
            if word != "":
                charlist = list(word)
                build_words(word, charlist, hsklevel)

# fill in word matches                
for word in words:
    if word in potential_matches:
        for match in potential_matches[word]:
            if match != word and match in words:
                words[word].append(match)
                if match not in graph:
                    graph[match] = set()
                graph[match].add(word)
                if word not in graph:
                    graph[word] = set()
                graph[word].add(match)
        
outfile = codecs.open(outfilename, 'w', "utf-8")
outfile.write(codecs.BOM_UTF8.decode("utf8")) # UTF Byte order mark
outfile.write(u'graph G {\n\ngraph [overlap=false];\nnode [fontname="SimSun" penwidth=1.3 fontsize=18 margin=0.02,0.02];\nedge [penwidth=1.3]\n\n')

### output words
##if True:
##    outfile.write(u"// All Words imported\n\n")
##    for word in words:
##        outfile.write(word + u"\n");
##
### output missing characters
##if True:
##    outfile.write(u"\n// Missing Characters\n\n")
##    for char in chars:
##        if char not in words:
##            outfile.write(char + u" [color=grey]\n");
##            
### output all matching edges
##if True:
##    outfile.write(u"\n// Edges\n\n")      
##    for word in words:
##        for match in words[word]:
##            outfile.write(word + u" -> " + match + u"\n");
##
### output missing char edges
##if True:
##    outfile.write(u"\n// Missing Char Edges\n\n")      
##    for char in chars:
##        if char not in words and char in potential_matches:
##            for match in potential_matches[char]:
##                if match != char and match in words:
##                    outfile.write(char + u" -> " + match + u" [color=grey]\n");

if True:
    edgesoutput = set()
    nodesoutput = set()
    
    def build_tuple(word, match):
        if len(word) < len(match):
            return (word, match)
        return (match, word)

    def connections_at_cur_level(word):
        conn = 0
        for match in graph[word]:
            if match != word and is_current_hsk_level(hsk[match]):
                conn = conn + 1
        return conn

    def output_word(word, recurse):
        for match in graph[word]:
            if (    (word != match)
                and (    is_below_hsk_level(hsk[match])
                     or (outputAllConnectedZi and len(list(match))==1)) # output lower matches but always output connected zi (chars)
                and (build_tuple(word, match) not in edgesoutput)):
                
                if (not is_current_hsk_level(hsk[word])) and (not is_current_hsk_level(hsk[match])) and (match not in nodesoutput):
                    # don't output a connection between nodes for previous HSK levels, unless both nodes are already there
                    continue
                                
                outputmatch = True
                outputword = True
                
                if (not is_current_hsk_level(hsk[match])) and ((connections_at_cur_level(match) == 1) or ((not outputPreviousConnections) and (match not in outputexceptions))):
                    # don't output dotted orphans
                    outputmatch = False

                if (not is_current_hsk_level(hsk[word])) and ((connections_at_cur_level(word) == 1) or ((not outputPreviousConnections) and (word not in outputexceptions))):
                    # don't output dotted orphans
                    outputword = False
                    
                if (eliminateNonWordZi and (match not in words) and (connections_at_cur_level(match) == 1)):
                    # don't output dotted orphans
                    outputmatch = False

                matchstyle = get_word_style(match)
                wordstyle = get_word_style(word)
                if outputmatch and outputword:
                    if len(word) < len(match):
                        outfile.write(word + u" -- " + match + wordstyle)
                    else:
                        outfile.write(match + u" -- " + word + matchstyle)
                    edgesoutput.add(build_tuple(word, match))
                if outputword and word not in nodesoutput:
                    outfile.write(word + wordstyle)
                    nodesoutput.add(word)
                if outputmatch and match not in nodesoutput:
                    outfile.write(match + matchstyle)
                    nodesoutput.add(match)
                if recurse and outputmatch:
                    output_word(match, False)

    for word in words: # was: for word in hsk:
        if is_current_hsk_level(hsk[word]):
            output_word(word, recurse=True)
 
    if showHSKColours:
        outfile.write(u"HSK1 -- HSK2" + gethskstyle(1, True, 0))
        outfile.write(u"HSK2 -- HSK3" + gethskstyle(2, True, 0))
        outfile.write(u"HSK3 -- HSK4" + gethskstyle(3, True, 0))
        outfile.write(u"HSK4 -- HSK5" + gethskstyle(4, True, 0))
        outfile.write(u"HSK5 -- HSK6" + gethskstyle(5, True, 0))
        outfile.write(u"HSK1" + gethskstyle(1, True, 4))
        outfile.write(u"HSK2" + gethskstyle(2, True, 4))
        outfile.write(u"HSK3" + gethskstyle(3, True, 4))
        outfile.write(u"HSK4" + gethskstyle(4, True, 4))
        outfile.write(u"HSK5" + gethskstyle(5, True, 4))
        outfile.write(u"HSK6" + gethskstyle(6, True, 4))
    
outfile.write(u"\n}\n")
outfile.close()

##wordtoset = {} # {"A" : 1, "ABC" : 1}
##settoword = {} # {1 : set(["A", "ABC"])}
##count = 1
##
##def add_to_set(word, curset):
##    wordtoset[word] = curset
##    if curset not in settoword:
##        settoword[curset] = set()
##    settoword[curset].add(word)
##        
##def remap_set(oldset, curset):
##    for remap in settoword[oldset]:
##        add_to_set(remap, curset)
##    del settoword[oldset]
##    
##for node in graph:
##    curset = 0
##    if node in wordtoset:
##        curset = wordtoset[node]
##    else:
##        for neighbour in graph[node]:
##            if neighbour in wordtoset:
##                curset = wordtoset[neighbour]
##                break
##        if curset == 0:
##            curset = count
##            count = count + 1
##        add_to_set(node, curset) 
##    for neighbour in graph[node]:
##        if neighbour in wordtoset:
##            if wordtoset[neighbour] != curset:
##                remap_set(wordtoset[neighbour], curset)
##        else:
##            add_to_set(neighbour, curset) 
##
## for x in nodesoutput:
##    if len(graph[x]) > 8:
##        print x, len(graph[x])
## 
## y = []
## for curset in settoword:
##     y.append(len(settoword[curset]))
## print y

##charcounts = {}
##for word in hsk:
##    if is_current_hsk_level(hsk[word]):
##        for char in list(word):
##            if not is_current_hsk_level(hsk[char]):
##                if char not in charcounts:
##                    charcounts[char] = 1
##                else:
##                    charcounts[char] = charcounts[char] + 1
##for char in charcounts:
##    if charcounts[char] > 8:
##        print char, charcounts[char]

## print u"北", connections_at_cur_level(u"北")
