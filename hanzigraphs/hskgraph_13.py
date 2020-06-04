#!c:/python27/python
# -*- coding: utf-8 -*-

# ================
# hskgraph.py
# Version 0.13
# Simple script to generate a bunch of Gephi graphs from HSK and character compositon files.
# April 2013 Alan Davies alan@hskhsk.com

from xml.etree.ElementTree import Element, SubElement, ElementTree
import codecs, time, re, unicodedata, math, os, os.path, random

# ===============
# math helper functions

# from http://stackoverflow.com/questions/809362/cumulative-normal-distribution-in-python
def normcdf(x, mu, sigma):
    t = 1.0 * x - mu;
    y = 0.5*math.erfc(-t/(sigma*math.sqrt(2.0)));
    y = max(0.0, min(1.0, y))
    return y
def normpdf(x, mu, sigma):
    u = (1.0 * x - mu)/abs(sigma)
    y = (1/(math.sqrt(2*math.pi)*abs(sigma)))*math.exp(-u*u/2)
    return y

# from http://www.johndcook.com/python_phi_inverse.html
def rational_approximation(t):
    # Abramowitz and Stegun formula 26.2.23.
    # The absolute value of the error should be less than 4.5 e-4.
    c = [2.515517, 0.802853, 0.010328]
    d = [1.432788, 0.189269, 0.001308]
    numerator = (c[2]*t + c[1])*t + c[0]
    denominator = ((d[2]*t + d[1])*t + d[0])*t + 1.0
    return t - numerator / denominator
def normsinv(p):
    assert p > 0.0 and p < 1
    # See article above for explanation of this section.
    if p < 0.5:
        # F^-1(p) = - G^-1(p)
        return -rational_approximation( math.sqrt(-2.0*math.log(p)) )
    else:
        # F^-1(p) = G^-1(1-p)
        return rational_approximation( math.sqrt(-2.0*math.log(1.0-p)) )
def norminv(p, mu, sigma):
    return normsinv(p) * sigma + mu 

# from http://www.calebmadrigal.com/standard-deviation-in-python/
def mean(s):
    return float(sum(s))/ len(s)
def variance(s):
    mu = mean(s)
    return mean(map(lambda x: (1.0 * x - mu)**2, s))
def stddev(s):
    return math.sqrt(variance(s))
def meanstddev(s):
    mu = float(sum(s))/ len(s)
    var = mean(map(lambda x: (1.0 * x - mu)**2, s))
    return (mu, math.sqrt(var))

def winsorize(data, percent):
    datacopy = [d for d in data]
    if len(data) < 1 / (1-percent):
        return datacopy
    datacopy.sort()
    lowbound = int(len(data) * (0.5 - percent/2))
    highbound = int(len(data) * (0.5 + percent/2))
    lowval = datacopy[lowbound]
    highval = datacopy[highbound]
    return [min(max(d, lowval), highval) for d in data]

# ================
# HSK Parsing

# examples are for parsing a two line level 1 file: "A    a1    aa    definition\nABC    abc1    abc    abcdef"
hsk_components = {} # {"A" : set(), "ABC" : set(["A", "B", "C"])}
hsk_word_level = {} # {"A" : 1, "ABC" : 1 }
hsk_char_level = {} # {"A" : 1, "B" : 1 , "C" : 1}
hsk_pinyin = {} # {"A" : "aa", "ABC" : "abc"])}
hsk_trad_char = {} # {"国" : "國", ...)}
hskwords = {} # {1 : set("A", "ABC"), ...}

def query_hsk_word_level(somehanzi, hskmin=1, hskmax=6):
    level = 0
    if somehanzi in hsk_word_level:
        level = hsk_word_level[somehanzi]
    if level < hskmin or level > hskmax:
        level = 0
    return level

def query_hsk_char_level(somehanzi, hskmin=1, hskmax=6):
    level = 0
    if somehanzi in hsk_char_level:
        level = hsk_char_level[somehanzi]
    if level < hskmin or level > hskmax:
        level = 0
    return level

def query_pinyin(somehanzi):
    if somehanzi in hsk_pinyin:
        return hsk_pinyin[somehanzi]
    if somehanzi in cedict_pinyin: # also check for pinyin in CCEDICT
        parsed = pinyin_numbers_to_tone_marks(cedict_pinyin[somehanzi].lower())
        hsk_pinyin[somehanzi] = parsed # cache for next time
        # print "CCEDICT pinyin fallback:", somehanzi, parsed
        return parsed
    print "No pinyin found:", somehanzi
    hsk_pinyin[somehanzi] = ""
    return ""

def query_trad(somehanzi):
    if somehanzi in hsk_trad_char:
        return hsk_trad_char[somehanzi]
    if somehanzi in cedict_trad: # also check for trad in CCEDICT
        return cedict_trad[somehanzi]
    print "Traditional character not found:", somehanzi
    if len(somehanzi) == 1:
        return somehanzi
    return "".join([query_trad(s) for s in somehanzi])

# parse newer 2012 HSK format 
def parse_hsk_file(infilename, hsklevel):
    hskwords[hsklevel] = set()
    infile = codecs.open(infilename, 'r', "utf-8")
    for line in infile:
        splitted = line.strip().split("\t")
        if len(splitted) >= 4:
            word = unicodedata.normalize("NFKC", splitted[0].strip()).replace(u'\ufeff',"")
            trad = unicodedata.normalize("NFKC", splitted[1].strip()).replace(u'\ufeff',"")
            pinyin = splitted[3].strip()
            if word != "":
                hskwords[hsklevel].add(word)
                if word in hsk_word_level:
                    hsk_word_level[word] = min(hsk_word_level[word], hsklevel)
                else:
                    hsk_word_level[word] = hsklevel
                for somehanzi in word:
                    if somehanzi in hsk_char_level:
                        hsk_char_level[somehanzi] = min(hsk_char_level[somehanzi], hsklevel)
                    else:
                        hsk_char_level[somehanzi] = hsklevel
                if len(word) > 1:
                    hsk_components[word] = set(list(word))
                else:
                    hsk_components[word] = set()
                if word not in hsk_pinyin:
                    hsk_pinyin[word] = pinyin
                for (s, t) in (zip(word, trad) + [(word, trad)]):
                    if s not in hsk_trad_char:
                        hsk_trad_char[s] = t

# ================
# Character Composition Parsing

# examples are for parsing a three line file: "口口 *\n丨丨 *\n中口丨丨"
cc_components = {} # {"中" : set(["口", "丨"])}
# cc_composes = {} # {"口" : set(["中"]), "丨" : set(["中"])}
cc_radicals = set() # set(["口", "丨"])
cc_strokes = {}

# need to filter out invalid chars e.g. 𠂉
invalid_unicode_re_pattern = re.compile(u'[^\u0000-\uD7FF\uE000-\uFFFF]', re.UNICODE)

def filter_using_re(unicode_string):
    # return re_pattern.sub(u'\uFFFD', unicode_string)
    return re_pattern.sub(u'a', unicode_string)

# parse DNW composition file
def parse_dnw_cc_file(infilename):
    infile = codecs.open(infilename, 'r', "utf-8")
    for line in infile:
        if invalid_unicode_re_pattern.search(line) != None:
            print "Ingoring line with invalid Unicode: ", line
            continue
        splitted = line.strip("\r\n").split(",")
        if len(splitted) == 2:
            zi = unicodedata.normalize("NFKC", splitted[0]).replace(u'\ufeff',"")
            parts = unicodedata.normalize("NFKC", splitted[1]).replace(u'\ufeff',"")
            for char in parts:
                if char != zi:
                    if zi not in cc_components:
                        cc_components[zi] = set()
                    cc_components[zi].add(char)

ignore_invalid_unicode = False

# parse wikimedia composition file
def parse_cc_file(infilename):
    infile = codecs.open(infilename, 'r', "utf-8")
    for line in infile:
        if ignore_invalid_unicode and invalid_unicode_re_pattern.search(line) != None:
            print "Ingoring line with invalid Unicode: ", line
            continue
        splitted = line.strip("\r\n").replace(u'\ufeff',"").split("\t")
        if len(splitted) == 12:
            zi = splitted[1]
            strokes = splitted[2]
            first = splitted [4]
            second = splitted[7]
            radical = splitted [11]            
            if zi not in cc_components:
                cc_components[zi] = set()
            for char in first + second:
                if char != "" and char != zi and char != "*":
                    if zi == u"亻":
                        print u"cc_components 亻", char
                    cc_components[zi].add(char)
            if radical== "*":
                cc_radicals.add(zi)
            else:
                cc_radicals.add(radical)
            if zi not in cc_strokes:
                cc_strokes[zi] = strokes

# ================
# Frequency parsing

word_freq = {} # {"AB" : 1234, ...}
char_freq = {} # {"A" : 1234, ...}
word_freq_ordered = [] # [(1234, "AB"), ...] # sorted by descending frequency

# all_potential_splits("ABCD") returns:
# [['ABCD'], ['A', 'BCD'], ['A', 'B', 'CD'], ['A', 'B', 'C', 'D'], ['A', 'BC', 'D'], ['AB', 'CD'], ['AB', 'C', 'D'], ['ABC', 'D']]
def all_potential_splits(word):
    if len(word) == 1:
        return [[word]]
    splitfreqlists=[[word]]
    for index in range(1, len(word)):
        head = word[0:index]
        tail = word[index:]
        splitfreqlists = splitfreqlists + [[head] + sfl for sfl in all_potential_splits(tail)]
    return splitfreqlists

def query_word_freq_direct(somehanzi):
    if somehanzi in word_freq:
        return word_freq[somehanzi]
    if somehanzi in char_freq:
        return char_freq[somehanzi]
    return 0;

def query_word_freq(somehanzi):
    if somehanzi not in word_freq:
        # find the minimum value for each possible split, and take the maximum
        # of all those values
        freq = max([min([query_word_freq_direct(word) for word in splitlist]) for splitlist in all_potential_splits(somehanzi)])
        if freq == 0:
            # print "frequency not found:", somehanzi, [ord(hanzi[0]) for hanzi in somehanzi]
            pass
        else:
            pass
            # print "faked frequency of", somehanzi, ord(somehanzi[0]), "as", freq
        word_freq[somehanzi] = freq
    return word_freq[somehanzi]

# parse SUBTLEX word frequency
def parse_word_freq_file(infilename):
    infile = codecs.open(infilename, 'r', "utf-8")
    for line in infile:
        splitted = line.strip().split("\t")
        if len(splitted) == 7:
            word = unicodedata.normalize("NFKC", splitted[0].strip()).replace(u'\ufeff',"")
            freq = math.log(float(splitted[1].strip())+1)
            if word != "" and freq > 0:
                word_freq[word] = freq
    for word, freq in word_freq.iteritems():
        word_freq_ordered.append( (freq, word) )
    word_freq_ordered.sort()
    word_freq_ordered.reverse()

# parse SUBTLEX char frequency
def parse_char_freq_file(infilename):
    infile = codecs.open(infilename, 'r', "utf-8")
    for line in infile:
        splitted = line.strip().split("\t")
        if len(splitted) == 7:
            char = unicodedata.normalize("NFKC", splitted[0].strip()).replace(u'\ufeff',"")
            freq = math.log(float(splitted[1].strip())+1)
            if char != "" and freq > 0:
                char_freq[char] = freq

# parse DNW char frequency to fill in any missing chars
def parse_dnw_char_freq_file(infilename):
    dnw_char_freq = {} # {"A" : 1234, ...}
    infile = codecs.open(infilename, 'r', "utf-8")
    for line in infile:
        splitted = line.strip().split(",")
        if len(splitted) == 3:
            char = unicodedata.normalize("NFKC", splitted[0].strip()).replace(u'\ufeff',"")
            freq = math.log(float(splitted[1].strip())+1)
            if char != "" and freq > 0:
                dnw_char_freq[char] = freq
    dnw_freqs = dnw_char_freq.values()
    slx_freqs = char_freq.values()
    xs = []
    ys = []
    (dnw_mu, dnw_sigma) = meanstddev(winsorize(dnw_freqs, 0.9))
    (slx_mu, slx_sigma) = meanstddev(winsorize(slx_freqs, 0.9))
    for char, freq in dnw_char_freq.iteritems():
        if char not in char_freq:
            fitted_freq = max(slx_mu + slx_sigma * (freq - dnw_mu) / dnw_sigma, 0)
            char_freq[char] = fitted_freq
        
# ================
# CCEDICT parsing for fallback tones and traditional characters

cedict_trad = {}
cedict_pinyin = {u"么":"me5"} # provide some overrides

ccedict_lineparse = re.compile(u"^(\S+)\s+(\S+).*?\[(.*?)\]")
def parse_ccedict_for_tones(infilename):
    infile = codecs.open(infilename, 'r', "utf-8")
    for line in infile:
        if line[0] != "#":
            match = ccedict_lineparse.search(line)
            if match is not None:
                trad = match.group(1)
                word = match.group(2)
                pinyin = match.group(3)
                if word not in cedict_pinyin:
                    cedict_pinyin[word] = pinyin
                if word not in cedict_trad:
                    cedict_trad[word] = trad
                #if u"么" in word:
                #    print "cedict", word, trad, pinyin
                
    for (s, t) in cedict_trad.iteritems():
        if s not in cedict_trad:
            cedict_trad[s] = t

# ================
# Pinyin numbers to tone marks

pinyintones = [u"AĀÁĂÀA", u"aāáăàa", u"EĒÉĔÈE", u"eēéĕèe",
               u"OŌÓŎÒO", u"oōóŏòo", u"IĪÍĬÌI", u"iīíĭìi",
               u"UŪÚŬÙU", u"uūúŭùu", u"ÜǕǗǙǛÜ", u"üǖǘǚǜü"]
pyreplacements = [("u:", u"ü"), ("v", u"ü"), ("U:", u"Ü"), ("V", u"Ü")]
pinyinfindregex = re.compile(u"([A-Za-züÜ:]+)([1-5])")

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

# ================
# Graph Output

hskfreqcolour = {}
hskfreqcolour[0]=((229, 229, 229), (181, 181, 181)) # light/dark grey
hskfreqcolour[1]=((255, 183, 183), (248,  86,  86)) # light/dark red
hskfreqcolour[2]=((255, 219, 183), (255, 164,  72)) # light/dark orange
hskfreqcolour[3]=((255, 255, 170), (240, 240,   0)) # light/dark yellow
hskfreqcolour[4]=((193, 242, 181), (117, 217,  91)) # light/dark green
hskfreqcolour[5]=((173, 221, 247), ( 65, 167, 222)) # light/dark blue
hskfreqcolour[6]=((219,  68, 223), (219,  68, 223)) # light/dark violet

# class Graph
# Simple container to clarify graph creation code
class Graph:
    def _get_node_size(self, word, hsklevel, isword):
        (mu, sigma) = hskfreqmusigma[0]
        return normcdf(query_word_freq(word), mu, sigma) * 0.2 + 1
    
    def _get_node_freq(self, word):
        (mu, sigma) = hskfreqmusigma[0]
        return normcdf(query_word_freq(word), mu, sigma)
    
    def _get_node_colour(self, word, hsklevel, isword):
        if isword:
            return self.get_node_freq_color(hsklevel, query_word_freq(word))
        # for non-words in a word graph, leave the colour as grey
        return self.get_node_freq_color(0, query_word_freq(word))    

    # super advanced frequency colouring algorithm
    def get_node_freq_color(self, hsklevel, freq):
        (mu, sigma) = hskfreqmusigma[hsklevel]
        ((minr, ming, minb), (maxr, maxg, maxb)) = hskfreqcolour[hsklevel]
        relfreq = normcdf(freq, mu, sigma)
        r = int(0.5 + minr + (maxr - minr) * relfreq)
        g = int(0.5 + ming + (maxg - ming) * relfreq)
        b = int(0.5 + minb + (maxb - minb) * relfreq)
        return (r, g, b)
            
    def add_node(self, hanzi, isword, hsklevel, position=None):
        self.add_node_detail(hanzi,
                             isword,
                             hsklevel,
                             self._get_node_colour(hanzi, hsklevel, isword),
                             self._get_node_size(hanzi, hsklevel, isword),
                             self._get_node_freq(hanzi),
                             position)

# Gephi graph output                
# members: gexf, nodes, edges
class GephiGraph(Graph):
    def __init__(self, desctext):
        # self.gexf = Element('gexf', {"xmlns":"http://www.gexf.net/1.2draft","version":"1.2"})
        self.gexf = Element('gexf', {"xmlns":"http://www.gexf.net/1.2draft", "xmlns:viz":"http://www.gexf.net/1.1draft/viz", "xmlns:xsi":"http://www.w3.org/2001/XMLSchema-instance", "xsi:schemaLocation":"http://www.gexf.net/1.2draft http://www.gexf.net/1.2draft/gexf.xsd", "version":"1.2"})
        meta = SubElement(self.gexf, "meta", {"lastmodifieddate":time.strftime("%Y-%m-%d")})
        creator = SubElement(meta, "creator")
        creator.text = "Alan Davies alan@hskhsk.com"
        description = SubElement(meta, "description")
        description.text = "HSK vocabulary graph " + desctext + u' - Generated: ' +  time.strftime("%Y-%m-%d %H:%M:%S UTC") + str(time.timezone / -3600)
        graph = SubElement(self.gexf, "graph", {"mode":"static","defaultedgetype":"directed"})
        attributes = SubElement(graph, "attributes",{"class":"node"})
        SubElement(attributes, "attribute", {"id":"0","title":"isword","type":"boolean"})
        SubElement(attributes, "attribute", {"id":"1","title":"hsklevel","type":"int"})
        SubElement(attributes, "attribute", {"id":"2","title":"freq","type":"float"})
        SubElement(attributes, "attribute", {"id":"3","title":"freqint","type":"int"})
        SubElement(attributes, "attribute", {"id":"4","title":"freqintreverse","type":"int"})
        self.nodes=SubElement(graph, "nodes")
        self.edges=SubElement(graph, "edges")

    def add_node_detail(self, hanzi, isword, hsklevel, (r, g, b), size, freq, position=None):
        node = SubElement(self.nodes, "node", {"id":hanzi, "label":hanzi})
        attvalues = SubElement(node, "attvalues")
        SubElement(attvalues, "attvalue", {"for":"0", "value":("true" if isword else "false")})
        SubElement(attvalues, "attvalue", {"for":"1", "value":str(hsklevel)})
        SubElement(attvalues, "attvalue", {"for":"2", "value":str(freq)})
        SubElement(attvalues, "attvalue", {"for":"3", "value":str(int(freq*100))})
        SubElement(attvalues, "attvalue", {"for":"4", "value":str(int((1-freq)*100))})
        SubElement(node, "viz:color", {"r": str(r), "g": str(g), "b": str(b), "a": "1.0"})
        SubElement(node, "viz:size", {"value" : str(size)})
        if position is not None:
            SubElement(node, "viz:position", {"x":str(position[0]), "y":str(position[1]), "z":"0.0"})
            
    def add_edge(self, identifer, source, target, weight=1.0):
        edge = SubElement(self.edges, "edge", {"id":identifer, "source":source, "target":target, "weight":str(weight)})

    def write(self, filename):
        tree = ElementTree(self.gexf)
        tree.write(filename, encoding="UTF-8", xml_declaration=True)

# Graphviz graph output                
# members: description, nodes, edges
class GraphvizGraph(Graph):
    def __init__(self, desctext):
        self.nodes=[]
        self.edges=[]
        self.description = desctext

    def add_node_detail(self, hanzi, isword, hsklevel, (r, g, b), size, freq, position=None):
        self.nodes.append(hanzi + ' [color="#{:02x}{:02x}{:02x}"];\n'.format(r, g, b) )
            
    def add_edge(self, identifier, source, target, weight=1.0):
        self.edges.append(source + " -- " + target + ' [weight={}];\n'.format( int(weight) ))

    def write(self, filename):
        outfile = codecs.open(filename, 'w', "utf-8")
        outfile.write(codecs.BOM_UTF8.decode("utf8")) # UTF Byte order mark
        outfile.write(u'// Alan Davies alan@hskhsk.com\n')
        outfile.write(u'// Graph: ' + self.description + '\n')
        outfile.write(u'// Generated: ' +  time.strftime("%Y-%m-%d %H:%M:%S UTC") + str(time.timezone / -3600) + "\n")
        outfile.write(u'graph G {\n\ngraph [overlap=false];\n')
        outfile.write(u'node [fontname="Arial Unicode MS" penwidth=1.3 fontsize=18 margin="0.02,0.02"];\n')
        outfile.write(u'edge [penwidth=1.3];\n\n')
        outfile.write(u'// Nodes\n\n')
        for node in self.nodes:
            outfile.write(node)
        outfile.write(u'\n// Edges\n\n')
        for edge in self.edges:
            outfile.write(edge)
        outfile.write(u"\n}\n")
        outfile.close()

# Graphviz graph output for leftright ranking               
# members: description, nodes, edges
class GraphvizGraphLR(Graph):
    def __init__(self, desctext):
        self.nodes=[]
        self.edges=[]
        self.description = desctext

    def add_node_detail(self, hanzi, isword, hsklevel, (r, g, b), size, freq, position=None):
        self.nodes.append(hanzi + ' [color="#{:02x}{:02x}{:02x}"];\n'.format(r, g, b) )
            
    def add_dnw_edge(self, source, target, targetmultichar):
        if targetmultichar:
            self.edges.append(source + " -> " + target + "[penwidth=4 arrowhead=none]\n")
        else:
            self.edges.append(source + " -> " + target + " [penwidth=6 style=tapered dir=back arrowtail=none]\n")

    def add_dnw_node(self, identifier, label, isradical, isword):
        if isword and isradical:
            self.nodes.append(identifier + u' [color="red" shape="box" margin="0.15,0.05" label="{}"]\n'.format(label))
        elif isword:
            self.nodes.append(identifier + u' [color="red" label="{}"]\n'.format(label))
        elif isradical:
            self.nodes.append(identifier + u' [color="black" shape="box" margin="0.15,0.05" label="{}"]\n'.format(label))
        else:
            self.nodes.append(identifier + u' [color="black" label="{}"]\n'.format(label))

    def write(self, filename):
        outfile = codecs.open(filename, 'w', "utf-8")
        outfile.write(codecs.BOM_UTF8.decode("utf8")) # UTF Byte order mark
        outfile.write(u'// Alan Davies alan@hskhsk.com\n')
        outfile.write(u'// Graph: ' + self.description + '\n')
        outfile.write(u'// Generated: ' +  time.strftime("%Y-%m-%d %H:%M:%S UTC") + str(time.timezone / -3600) + "\n")
        outfile.write(u'digraph G {\n\ngraph [overlap=false rankdir=LR]\n')
        outfile.write(u'node [fontname="Arial Unicode MS" penwidth=1.3 fontsize=18 margin="0.1,0.05"]\n')
        outfile.write(u'// Nodes\n\n')
        for node in self.nodes:
            if invalid_unicode_re_pattern.search(node) == None and node.find("?")==-1:
                outfile.write(node)
        outfile.write(u'\n// Edges\n\n')
        for edge in self.edges:
            if invalid_unicode_re_pattern.search(edge) == None and edge.find("?")==-1:
                outfile.write(edge)
        outfile.write(u"\n}\n")
        outfile.close()

# doesn't output orphan nodes that aren't in nodes list, doesn't recurse edges
# takes a list of edge maps
def build_word_graph(graphtype, filename, nodes, edgeslist, hskmin, hskmax):
    print "Build word graph " + filename
    outnodes = set()
    outedges = set()
    foundorphans = {}
    graph = graphtype(filename.split(".")[0])
    for node in nodes:
        if node not in outnodes:
            graph.add_node(node, True, query_hsk_word_level(node, hskmin, hskmax))
            outnodes.add(node)
        for edges, weight in edgeslist:
            if node in edges:
                for destnode in edges[node]:
                    if (destnode in nodes):
                        if destnode not in outnodes:
                            graph.add_node(destnode, destnode in nodes, query_hsk_word_level(destnode, hskmin, hskmax))
                            outnodes.add(destnode)
                        if (node, destnode) not in outedges:
                            graph.add_edge(node + "to" + destnode, node, destnode, weight)
                            outedges.add( (node, destnode) )
                    else:
                        # mark it as an orphan
                        if destnode not in foundorphans:
                            foundorphans[destnode] = set()
                        foundorphans[destnode].add((node, weight))

    for orphan in foundorphans:

        # print "orphan:", orphan
        # for o, w in foundorphans[orphan]:
        #     print "->", o

        orphanedges = set()
        for e, weight in edgeslist:
            if orphan in e:
                for edge in e[orphan]:
                    if edge in nodes:
                        orphanedges.add((edge, weight))
                        # print "orphanedges add", orphan, edge
        # output any nodes that were thought to be orphans, but which have 2 or more connections
        if len(orphanedges) + len(foundorphans[orphan]) >= 2:
            # print "outputting"
            if orphan not in outnodes:
                graph.add_node(orphan, False, query_hsk_word_level(orphan, hskmin, hskmax))
                outnodes.add(orphan)
            for destnode, weight in orphanedges:
                if (orphan, destnode) not in outedges:
                    graph.add_edge(orphan + "to" + destnode, orphan, destnode, weight)
                    outedges.add( (orphan, destnode) )
            for fromnode, weight in foundorphans[orphan]:
                if (fromnode, orphan) not in outedges:
                    graph.add_edge(fromnode + "to" + orphan, fromnode, orphan, weight)
                    outedges.add( (fromnode, orphan) )
                
    graph.write(filename)

# doesn't worry about orphans, traverses down tree of edges to leaves
def build_char_graph(graphtype, filename, nodes_in, edges, hskmin, hskmax):
    print "Build char graph " + filename
    outnodes = set()
    outedges = set()
    nodes = set(nodes_in) # make a copy so we can remove nodes as we iterate
    graph = graphtype(filename.split(".")[0])
    while len(nodes) > 0:
        node = nodes.pop()
        graph.add_node(node, True, query_hsk_char_level(node, hskmin, hskmax))
        outnodes.add(node)
        if node in edges:
            for destnode in edges[node]:
                # ensure this destnode is traversed
                if (destnode not in outnodes) and (destnode not in nodes):
                    nodes.add(destnode)
                # output the destnode    
                if (node, destnode) not in outedges:
                    graph.add_edge(node + "to" + destnode, node, destnode)
                    outedges.add( (node, destnode) )
    graph.write(filename)

# outputs a spiral with a single central node as the highest frequency word
def build_star_graph(graphtype, filename, nodes, query_hsk):
    sortednodes = [(query_word_freq(node), node) for node in nodes]
    sortednodes.sort()
    sortednodes.reverse()
    nodelist = [node for (freq, node) in sortednodes]
    root = nodelist[0]
    print "Build star graph " + filename + " with root " + root
    (mu, sigma) = hskfreqmusigma[0]
    graph = graphtype(filename.split(".")[0])
    for i in range(len(nodelist)):
        node = nodelist[i]
        dist = float(i)
        angle = float(i)
        x = dist * math.cos(angle)
        y = dist * math.sin(angle)
        graph.add_node(node, True, query_hsk(node), (x, y))
        #if node != root:
        #    graph.add_edge(node + "to" + root, node, root, normcdf(query_word_freq(node), mu, sigma)*2)
    graph.write(filename)


# Build legend
def build_legend_graph(graphtype, filename):
    print "Build legend graph " + filename
    graph = graphtype(filename.split(".")[0])
    graph.add_node_detail("Non-HSK", True, 0, hskfreqcolour[0][1], 1.0, 1.0)
    graph.add_node_detail("HSK 1", True,   1, hskfreqcolour[1][1], 1.0, 1.0)
    graph.add_node_detail("HSK 2", True,   2, hskfreqcolour[2][1], 1.0, 1.0)
    graph.add_node_detail("HSK 3", True,   2, hskfreqcolour[3][1], 1.0, 1.0)
    graph.add_node_detail("HSK 4", True,   2, hskfreqcolour[4][1], 1.0, 1.0)
    graph.add_node_detail("HSK 5", True,   2, hskfreqcolour[5][1], 1.0, 1.0)
    graph.add_node_detail("HSK 6", True,   2, hskfreqcolour[6][1], 1.0, 1.0)
    graph.add_edge("Nonto1", "Non-HSK", "HSK 1", 1.0)
    graph.add_edge("Nonto2", "Non-HSK", "HSK 2", 1.0)
    graph.add_edge("Nonto3", "Non-HSK", "HSK 3", 1.0)
    graph.add_edge("Nonto4", "Non-HSK", "HSK 4", 1.0)
    graph.add_edge("Nonto5", "Non-HSK", "HSK 5", 1.0)
    graph.add_edge("Nonto6", "Non-HSK", "HSK 6", 1.0)
    graph.add_edge("1to2", "HSK 2", "HSK 1", 1.0)
    graph.add_edge("2to3", "HSK 3", "HSK 2", 1.0)
    graph.add_edge("3to4", "HSK 4", "HSK 3", 1.0)
    graph.add_edge("4to5", "HSK 5", "HSK 4", 1.0)
    graph.add_edge("5to6", "HSK 6", "HSK 5", 1.0)
    graph.add_edge("6to1", "HSK 1", "HSK 6", 1.0)
    graph.write(filename)

# ================
# Add pinyin to hanzi SVG file, and convert to traditional

def add_pinyin_to_svg(infilename):
    print "Add pinyin to " + infilename
    infile = codecs.open(infilename, 'r', "utf-8")
    svgfile = infile.read()

    textblobs = []
    for result in re.findall(r'<text(.*?font-size=")(.*?)(".*?y=")(.*?)(".*?>)(.*?)</text>', svgfile, re.DOTALL):
        fontsizeint = int(float(result[1]) * 3/4 + 0.5)
        fontsize = str(fontsizeint)
        yval = str(float(result[3]) + fontsizeint)
        pinyin = query_pinyin(result[5].strip())
        if pinyin != "":
            textblob = "        <text" + result[0]
            textblob += fontsize + result[2] + yval + result[4] + "\n        " + pinyin
            textblob += "\n       </text>\n"
            textblobs.append(textblob)
    
    svgidx = svgfile.find("</svg>")
    if svgidx > 0:
        outfilename = infilename.replace(".", "_pinyin.")
        outfile = codecs.open(outfilename, 'w', "utf-8")
        # outfile.write(codecs.BOM_UTF8.decode("utf8")) # UTF Byte order mark
        outfile.write(svgfile[:svgidx])
        outfile.write('    <g id="pinyin-labels">\n')
        for textblob in textblobs:
            outfile.write(textblob)
        outfile.write('    </g>\n</svg>')
        outfile.close()

def convert_simp_to_trad_svg(infilename):
    print "Convert to traditional:" + infilename
    infile = codecs.open(infilename, 'r', "utf-8")
    svgfile = infile.read()

    nodestart=svgfile.find('<g id="node-labels">')
    if nodestart > 0:
        textstart = nodestart + len('<g id="node-labels">')
        textend = svgfile.find("</g>", textstart)
        if textstart > 0:
            text = svgfile[textstart:textend]
            textblobs = []
            for result in re.findall(r'(.*?<text.*?>)(.*?)(</text>)', text, re.DOTALL):
                simp = result[1].strip()
                trad = query_trad(simp)
                textblobs.append( result[0] )
                textblobs.append( result[1].replace(simp, trad) )
                textblobs.append( result[2] )
                # print "replace", simp, "with", trad
            outfilename = infilename.replace(".", "_trad.")
            outfile = codecs.open(outfilename, 'w', "utf-8")
            # outfile.write(codecs.BOM_UTF8.decode("utf8")) # UTF Byte order mark
            outfile.write(svgfile[:textstart])
            for textblob in textblobs:
                outfile.write(textblob)
            outfile.write(svgfile[textend:])
            outfile.close()
            return
    print "failed to convert " + infilename

# ================
# HSK Word List Calculations
def calculate_optimum_hsk_order(hsklevel, filename):
    print "Calculate HSK optimum order: " + filename
    candidates = [ (query_word_freq(word), word) for word in hskwords[hsklevel] ]
    candidates.sort()
    candidates.reverse()
    words = [word for (freq, word) in candidates]
    for word in [w for w in words]:
        for component in hsk_components[word]:
            if component in hskwords[hsklevel]:
                compindex = words.index(component)
                wordindex = words.index(word)
                if compindex > wordindex:
                    print u"moving {} in front of {}".format(component, word)
                    del(words[compindex])
                    words.insert(wordindex, component)
    outfile = codecs.open(filename, 'w', "utf-8")                
    for word in words:
        outfile.write(word + "\n")
    outfile.close()
        
def calculate_opt_hsk_add_other(hsklevel, filename):
    print "Calculate HSK optimum order with additions: " + filename
    candidates = [ (query_word_freq(word), word) for word in hskwords[hsklevel] ]
    candidates.sort()
    candidates.reverse()
    words = [word for (freq, word) in candidates]
    for word in [w for w in words]:
        wordindex = words.index(word)
        for component in hsk_components[word]:
            if component in words:
                compindex = words.index(component)
                if compindex > wordindex:
                    print u"moving {} in front of {}".format(component, word)
                    del(words[compindex])
                    words.insert(wordindex, component)
            elif hsklevel < 6 and component in hskwords[hsklevel * 10 + 6]:
                print u"inserting {} (HSK {}) in front of {}".format(component, query_hsk_word_level(component), word)
                words.insert(wordindex, component)
    outfile = codecs.open(filename, 'w', "utf-8")                
    for word in words:
        outfile.write(word + "\n")
    outfile.close()
        
def calculate_hsk_extra_things(hsklevel, filename):
    print "Calculate HSK Extra: " + filename
    begincount = 0
    endcount = 0
    for i in range(1, hsklevel+1):
        begincount = endcount
        if i == 7:
            endcount += 3000
        else:
            endcount += len(hskwords[i])
    candidates = word_freq_ordered[begincount:endcount]
    found = []
    for (freq, word) in candidates:
        level = query_hsk_word_level(word)
        if level == 0 or level > hsklevel:
            found.append( (level, freq, word) )
    found.sort()
    found.reverse()
    outfile = codecs.open(filename, 'w', "utf-8")                
    for (level, freq, word) in found:
        outfile.write(str(level) + "\t" + word + "\t" + str() + "\n")
    outfile.close()

def calculate_hsk_freq_adjust(filename):
    print "Calculate words that should be ignored from total Freq when calculating HSK: " + filename
    outfile = codecs.open(filename, 'w', "utf-8")                
    for word, freq in word_freq.iteritems():
        if word not in hsk_word_level:
            word_is_in_hsk_really = True
            for char in word:
                if char not in hsk_char_level:
                    word_is_in_hsk_really = False
                    break
            if word_is_in_hsk_really:
                outfile.write(word + "\t" + str(int(math.e**freq + 0.5)) + "\n")
    outfile.close()        
                    

# ================
# Initialisation

random.seed()

print "Parse HSK files"
parse_hsk_file("data/HSK Official With Definitions 2012 L1.txt", 1)
parse_hsk_file("data/HSK Official With Definitions 2012 L2.txt", 2)
parse_hsk_file("data/HSK Official With Definitions 2012 L3.txt", 3)
parse_hsk_file("data/HSK Official With Definitions 2012 L4.txt", 4)
parse_hsk_file("data/HSK Official With Definitions 2012 L5.txt", 5)
parse_hsk_file("data/HSK Official With Definitions 2012 L6.txt", 6)

print "Parse Character Composition"
# parse_dnw_cc_file("data/DNW-decomp.txt")
parse_cc_file("data/ChineseCharacterDecomposition.txt")

print "Parse Word Frequencies"
parse_word_freq_file("data/SUBTLEX-CH-WF.txt")
parse_char_freq_file("data/SUBTLEX-CH-CHR.txt")
parse_dnw_char_freq_file("data/DNW-UForder.txt")

print "Parse CCEDICT for extra tones"
parse_ccedict_for_tones("data/cedict_ts.u8")

print "Process Into Sets"

# build a list of characters from the words lists
hskchars = {}
for i in range(1, 7):
    hskchars[i] = set()
    for word in hskwords[i]:
        for char in word:
            hskchars[i].add(char)

# build lists of character/word ranges; e.g. hskwords[13] is the
# union of the words for HSK levels 1, 2, and 3.
for i in range(1, 6):
    for j in range (i+1, 7):
        hskwords[i*10 + j] = hskwords[i]
        hskchars[i*10 + j] = hskchars[i]
        for k in range (i+1, j+1):
            hskwords[i*10 + j] = hskwords[i*10 + j].union(hskwords[k])
            hskchars[i*10 + j] = hskchars[i*10 + j].union(hskchars[k])

# =========
# Some simple stats
print "Calculate frequency means and standard deviations"

hskfreqmusigma = {}
hskfreqmusigma[0] = meanstddev([query_word_freq(word) for word in word_freq])
hskfreqmusigma[1] = meanstddev([query_word_freq(word) for word in hskwords[1]])
hskfreqmusigma[2] = meanstddev([query_word_freq(word) for word in hskwords[2]])
hskfreqmusigma[3] = meanstddev([query_word_freq(word) for word in hskwords[3]])
hskfreqmusigma[4] = meanstddev([query_word_freq(word) for word in hskwords[4]])
hskfreqmusigma[5] = meanstddev([query_word_freq(word) for word in hskwords[5]])
hskfreqmusigma[6] = meanstddev([query_word_freq(word) for word in hskwords[6]])

# ================
# Main

version_suffix="_v13"

if False:
    # must be called before any other graphs etc. to avoid any additions being made to the word_freq map
    calculate_hsk_freq_adjust("txt/HSK_Freq_adjust" + version_suffix + ".txt")


def buildgraphs(graphtype, prev, ext):
    try:
        os.makedirs(os.path.dirname(prev))
    except:
        pass
    # output HSK Word graphs
    build_word_graph(graphtype, prev + "HSK1_words" + ext,   hskwords[1],  [(hsk_components, 1.0)], 1, 1)
    build_word_graph(graphtype, prev + "HSK2_words" + ext,   hskwords[2],  [(hsk_components, 1.0)], 2, 2)
    build_word_graph(graphtype, prev + "HSK3_words" + ext,   hskwords[3],  [(hsk_components, 1.0)], 3, 3)
    build_word_graph(graphtype, prev + "HSK4_words" + ext,   hskwords[4],  [(hsk_components, 1.0)], 4, 4)
    build_word_graph(graphtype, prev + "HSK5_words" + ext,   hskwords[5],  [(hsk_components, 1.0)], 5, 5)
    build_word_graph(graphtype, prev + "HSK6_words" + ext,   hskwords[6],  [(hsk_components, 1.0)], 6, 6)
    build_word_graph(graphtype, prev + "HSK1-2_words" + ext, hskwords[12], [(hsk_components, 1.0)], 1, 2)
    build_word_graph(graphtype, prev + "HSK1-3_words" + ext, hskwords[13], [(hsk_components, 1.0)], 1, 3)
    build_word_graph(graphtype, prev + "HSK1-4_words" + ext, hskwords[14], [(hsk_components, 1.0)], 1, 4)
    build_word_graph(graphtype, prev + "HSK1-5_words" + ext, hskwords[15], [(hsk_components, 1.0)], 1, 5)
    build_word_graph(graphtype, prev + "HSK1-6_words" + ext, hskwords[16], [(hsk_components, 1.0)], 1, 6)
    build_word_graph(graphtype, prev + "HSK4-6_words" + ext, hskwords[46], [(hsk_components, 1.0)], 4, 6)
    # output HSK Character graphs
    build_char_graph(graphtype, prev + "HSK1_chars" + ext,   hskchars[1],  cc_components, 1, 1)
    build_char_graph(graphtype, prev + "HSK2_chars" + ext,   hskchars[2],  cc_components, 2, 2)
    build_char_graph(graphtype, prev + "HSK3_chars" + ext,   hskchars[3],  cc_components, 3, 3)
    build_char_graph(graphtype, prev + "HSK4_chars" + ext,   hskchars[4],  cc_components, 4, 4)
    build_char_graph(graphtype, prev + "HSK5_chars" + ext,   hskchars[5],  cc_components, 5, 5)
    build_char_graph(graphtype, prev + "HSK6_chars" + ext,   hskchars[6],  cc_components, 6, 6)
    build_char_graph(graphtype, prev + "HSK1-2_chars" + ext, hskchars[12], cc_components, 1, 2)
    build_char_graph(graphtype, prev + "HSK1-3_chars" + ext, hskchars[13], cc_components, 1, 3)
    build_char_graph(graphtype, prev + "HSK1-4_chars" + ext, hskchars[14], cc_components, 1, 4)
    build_char_graph(graphtype, prev + "HSK1-5_chars" + ext, hskchars[15], cc_components, 1, 5)
    build_char_graph(graphtype, prev + "HSK1-6_chars" + ext, hskchars[16], cc_components, 1, 6)
    build_char_graph(graphtype, prev + "HSK4-6_chars" + ext, hskchars[46], cc_components, 4, 6)
    # output HSK Word & Character graphs
    word_char_graph_edges = [(hsk_components, 2.0), (cc_components, 1.0)]
    build_word_graph(graphtype, prev + "HSK1_wordchar" + ext,   hskwords[1],  word_char_graph_edges, 1, 1)
    build_word_graph(graphtype, prev + "HSK2_wordchar" + ext,   hskwords[2],  word_char_graph_edges, 2, 2)
    build_word_graph(graphtype, prev + "HSK3_wordchar" + ext,   hskwords[3],  word_char_graph_edges, 3, 3)
    build_word_graph(graphtype, prev + "HSK4_wordchar" + ext,   hskwords[4],  word_char_graph_edges, 4, 4)
    build_word_graph(graphtype, prev + "HSK5_wordchar" + ext,   hskwords[5],  word_char_graph_edges, 5, 5)
    build_word_graph(graphtype, prev + "HSK6_wordchar" + ext,   hskwords[6],  word_char_graph_edges, 6, 6)
    build_word_graph(graphtype, prev + "HSK1-2_wordchar" + ext, hskwords[12], word_char_graph_edges, 1, 2)
    build_word_graph(graphtype, prev + "HSK1-3_wordchar" + ext, hskwords[13], word_char_graph_edges, 1, 3)
    build_word_graph(graphtype, prev + "HSK1-4_wordchar" + ext, hskwords[14], word_char_graph_edges, 1, 4)
    build_word_graph(graphtype, prev + "HSK1-5_wordchar" + ext, hskwords[15], word_char_graph_edges, 1, 5)
    build_word_graph(graphtype, prev + "HSK1-6_wordchar" + ext, hskwords[16], word_char_graph_edges, 1, 6)
    # output word star graphs
    build_star_graph(graphtype, prev + "HSK1_wordstar" + ext,   hskwords[1],  query_hsk_word_level)
    build_star_graph(graphtype, prev + "HSK2_wordstar" + ext,   hskwords[2],  query_hsk_word_level)
    build_star_graph(graphtype, prev + "HSK3_wordstar" + ext,   hskwords[3],  query_hsk_word_level)
    build_star_graph(graphtype, prev + "HSK4_wordstar" + ext,   hskwords[4],  query_hsk_word_level)
    build_star_graph(graphtype, prev + "HSK5_wordstar" + ext,   hskwords[5],  query_hsk_word_level)
    build_star_graph(graphtype, prev + "HSK6_wordstar" + ext,   hskwords[6],  query_hsk_word_level)
    build_star_graph(graphtype, prev + "HSK1-2_wordstar" + ext, hskwords[12], query_hsk_word_level)
    build_star_graph(graphtype, prev + "HSK1-3_wordstar" + ext, hskwords[13], query_hsk_word_level)
    build_star_graph(graphtype, prev + "HSK1-4_wordstar" + ext, hskwords[14], query_hsk_word_level)
    build_star_graph(graphtype, prev + "HSK1-5_wordstar" + ext, hskwords[15], query_hsk_word_level)
    build_star_graph(graphtype, prev + "HSK1-6_wordstar" + ext, hskwords[16], query_hsk_word_level)
    build_star_graph(graphtype, prev + "HSK4-6_wordstar" + ext, hskwords[46], query_hsk_word_level)
    # output char star graphs
    build_star_graph(graphtype, prev + "HSK1_charstar" + ext,   hskchars[1],  query_hsk_char_level)
    build_star_graph(graphtype, prev + "HSK2_charstar" + ext,   hskchars[2],  query_hsk_char_level)
    build_star_graph(graphtype, prev + "HSK3_charstar" + ext,   hskchars[3],  query_hsk_char_level)
    build_star_graph(graphtype, prev + "HSK4_charstar" + ext,   hskchars[4],  query_hsk_char_level)
    build_star_graph(graphtype, prev + "HSK5_charstar" + ext,   hskchars[5],  query_hsk_char_level)
    build_star_graph(graphtype, prev + "HSK6_charstar" + ext,   hskchars[6],  query_hsk_char_level)
    build_star_graph(graphtype, prev + "HSK1-2_charstar" + ext, hskchars[12], query_hsk_char_level)
    build_star_graph(graphtype, prev + "HSK1-3_charstar" + ext, hskchars[13], query_hsk_char_level)
    build_star_graph(graphtype, prev + "HSK1-4_charstar" + ext, hskchars[14], query_hsk_char_level)
    build_star_graph(graphtype, prev + "HSK1-5_charstar" + ext, hskchars[15], query_hsk_char_level)
    build_star_graph(graphtype, prev + "HSK1-6_charstar" + ext, hskchars[16], query_hsk_char_level)
    build_star_graph(graphtype, prev + "HSK4-6_charstar" + ext, hskchars[46], query_hsk_char_level)
    # output a re-usable legend
    build_legend_graph(graphtype, prev + "legend" + ext)

# buildgraphs(GephiGraph, "gexf/", version_suffix + ".gexf")
# buildgraphs(GraphvizGraph, "graphviz/", version_suffix + ".dot")

# add pinyin to previously created SVG file
if False:
    add_pinyin_to_svg("svg/HSK1_chars_v09.svg")
    add_pinyin_to_svg("svg/HSK1_words_v09.svg")
    add_pinyin_to_svg("svg/HSK1-2_words_v09.svg")
    add_pinyin_to_svg("svg/HSK1-3_words_v09.svg")
    add_pinyin_to_svg("svg/HSK1-4_words_v09.svg")
    add_pinyin_to_svg("svg/HSK1-6_wordstar_v09.svg")

# convert previously created SVG file to traditional
if False:
    convert_simp_to_trad_svg("svg/HSK1_chars_v09.svg")
    convert_simp_to_trad_svg("svg/HSK1_words_v09.svg")
    convert_simp_to_trad_svg("svg/HSK1-2_words_v09.svg")
    convert_simp_to_trad_svg("svg/HSK1-3_words_v09.svg")
    convert_simp_to_trad_svg("svg/HSK1-4_words_v09.svg")
    convert_simp_to_trad_svg("svg/HSK1-6_wordstar_v09.svg")
    
    convert_simp_to_trad_svg("svg/HSK1_chars_v09_pinyin.svg")
    convert_simp_to_trad_svg("svg/HSK1_words_v09_pinyin.svg")
    convert_simp_to_trad_svg("svg/HSK1-2_words_v09_pinyin.svg")
    convert_simp_to_trad_svg("svg/HSK1-3_words_v09_pinyin.svg")
    convert_simp_to_trad_svg("svg/HSK1-4_words_v09_pinyin.svg")
    convert_simp_to_trad_svg("svg/HSK1-6_wordstar_v09_pinyin.svg")

# output a frequency and HSK level list, for analysis in Excel etc.
if False:
    for word in hsk_components:
        print query_hsk_word_level(word), word, (word)
        query_word_freq(word)

if False:
    try:
        os.makedirs(os.path.dirname("txt/"))
    except:
        pass
    calculate_optimum_hsk_order(1, "txt/HSK_1_optimised" + version_suffix + ".txt")
    calculate_optimum_hsk_order(2, "txt/HSK_2_optimised" + version_suffix + ".txt")
    calculate_optimum_hsk_order(3, "txt/HSK_3_optimised" + version_suffix + ".txt")
    calculate_optimum_hsk_order(4, "txt/HSK_4_optimised" + version_suffix + ".txt")
    calculate_optimum_hsk_order(5, "txt/HSK_5_optimised" + version_suffix + ".txt")
    calculate_optimum_hsk_order(6, "txt/HSK_6_optimised" + version_suffix + ".txt")
    calculate_opt_hsk_add_other(1, "txt/HSK_1_optim_add" + version_suffix + ".txt")
    calculate_opt_hsk_add_other(2, "txt/HSK_2_optim_add" + version_suffix + ".txt")
    calculate_opt_hsk_add_other(3, "txt/HSK_3_optim_add" + version_suffix + ".txt")
    calculate_opt_hsk_add_other(4, "txt/HSK_4_optim_add" + version_suffix + ".txt")
    calculate_opt_hsk_add_other(5, "txt/HSK_5_optim_add" + version_suffix + ".txt")
    calculate_opt_hsk_add_other(6, "txt/HSK_6_optim_add" + version_suffix + ".txt")
    calculate_hsk_extra_things(1, "txt/HSK_1_Extra" + version_suffix + ".txt")
    calculate_hsk_extra_things(2, "txt/HSK_2_Extra" + version_suffix + ".txt")
    calculate_hsk_extra_things(3, "txt/HSK_3_Extra" + version_suffix + ".txt")
    calculate_hsk_extra_things(4, "txt/HSK_4_Extra" + version_suffix + ".txt")
    calculate_hsk_extra_things(5, "txt/HSK_5_Extra" + version_suffix + ".txt")
    calculate_hsk_extra_things(6, "txt/HSK_6_Extra" + version_suffix + ".txt")
    calculate_hsk_extra_things(7, "txt/HSK_7_Extra" + version_suffix + ".txt")


dnw_subcomponents_alllevels = {} # {"ABC" : set(["A, "B", "C"])}
dnw_supercomponents_alllevels = {} # {"A" : set(["ABC"]), "B" : set(["ABC"]), "C" : set(["ABC"])}
dnw_subcomponents = {} # {"ABC" : set(["A, "B", "C"])}
dnw_supercomponents = {} # {"A" : set(["ABC"]), "B" : set(["ABC"]), "C" : set(["ABC"])}
dnw_weight = {} # {"ABC" : 1.0, "A" : 2.0, "B" : 1.0, "C" : 3.0 }
dnw_learning_cost  = {} # {"ABC" : 4, "A" : 1, "B" : 1, "C" : 1 }
dnw_learned = set()

def dnw_add_sub_super_components_sets(hanzi):
    if hanzi not in dnw_subcomponents:
        dnw_subcomponents[hanzi] = set()
    if hanzi not in dnw_supercomponents:
        dnw_supercomponents[hanzi] = set()
    if hanzi not in dnw_subcomponents_alllevels:
        dnw_subcomponents_alllevels[hanzi] = set()
    if hanzi not in dnw_supercomponents_alllevels:
        dnw_supercomponents_alllevels[hanzi] = set()

def dnw_add_char_components(char):
    if char in cc_components:
        for component in cc_components[char]:
            if component not in dnw_learned:
                dnw_add_sub_super_components_sets(component)
                dnw_subcomponents[char].add(component)
                dnw_supercomponents[component].add(char)
                dnw_subcomponents_alllevels[char].add(component)
                dnw_supercomponents_alllevels[component].add(char)
                dnw_add_char_components(component)

def calculate_dnw_learning_cost(hanzi):
    dnw_learning_cost[hanzi] = 1 + sum([query_dnw_learning_cost(component) for component in dnw_subcomponents[hanzi]])

def query_dnw_learning_cost(hanzi):
    if hanzi not in dnw_learning_cost:
        calculate_dnw_learning_cost(hanzi)
    return dnw_learning_cost[hanzi]
    
def calculate_dnw_weight(words, hanzi):
    if len(dnw_supercomponents[hanzi])==0:
        dnw_weight[hanzi] = math.e**query_word_freq(hanzi) / query_dnw_learning_cost(hanzi)
    else:
#        maxval = max([query_dnw_weight(words, component) for component in dnw_supercomponents[hanzi]])
#        sumval = sum([query_dnw_weight(words, component) for component in dnw_supercomponents[hanzi]])
#        print hanzi, "max", maxval, "sum", sumval
        dnw_weight[hanzi] = 1.001 * sum([query_dnw_weight(words, component) for component in dnw_supercomponents[hanzi]])

def query_dnw_weight(words, hanzi):
    if hanzi not in dnw_weight:
        calculate_dnw_weight(words, hanzi)
    return dnw_weight[hanzi]

def update_supercomponent_learning_cost(words, hanzi):
    calculate_dnw_learning_cost(hanzi)
    for component in dnw_supercomponents[hanzi]:
        update_supercomponent_learning_cost(words, component)
    if len(dnw_supercomponents[hanzi]) == 0:
        update_subcomponent_weights(words, hanzi)

def update_subcomponent_weights(words, hanzi):
    calculate_dnw_weight(words, hanzi)
    for component in dnw_subcomponents[hanzi]:
        update_subcomponent_weights(words, component)
    
def update_weights(words, hanzi):
    del dnw_weight[hanzi]
    supercomponents = dnw_supercomponents[hanzi]
    del dnw_supercomponents[hanzi]
    # print "update_weights", hanzi, len(dnw_subcomponents[hanzi])
    assert(len(dnw_subcomponents[hanzi]) == 0) # should have no subcomponents
    del dnw_subcomponents[hanzi]
    for component in supercomponents:
        dnw_subcomponents[component].remove(hanzi)
    for component in supercomponents:
        update_supercomponent_learning_cost(words, component)
    
def dnw_init():
    dnw_subcomponents.clear()
    dnw_subcomponents_alllevels.clear()
    dnw_supercomponents_alllevels.clear()
    dnw_supercomponents.clear()
    dnw_weight.clear()
    dnw_learning_cost.clear()
    dnw_learned.clear()

def dnw_set_up(words):
    dnw_subcomponents.clear()
    dnw_supercomponents.clear()
    # dnw_subcomponents_alllevels.clear() note: don't reset dnw_subcomponents_alllevels!
    # dnw_supercomponents_alllevels.clear() note: don't reset dnw_supercomponents_alllevels!
    dnw_weight.clear()
    dnw_learning_cost.clear()
    # dnw_learned.clear() note: don't reset dnw_learned!
    for word in words:
        dnw_add_sub_super_components_sets(word)
        for char in word:
            if char != word:
                dnw_add_sub_super_components_sets(char)
                dnw_subcomponents[word].add(char)
                dnw_supercomponents[char].add(word)
                dnw_subcomponents_alllevels[word].add(char)
                dnw_supercomponents_alllevels[char].add(word)
            dnw_add_char_components(char)
    for word in dnw_subcomponents:
        query_dnw_weight(words, word)


def add_dnw_graph_subnodes(graph, words, hanzi, output_nodes, output_edges):
    for component in dnw_subcomponents_alllevels[hanzi]:
        if component in cc_radicals:
            graph.add_dnw_node("node"+hanzi+"radical"+component, component + "\\n" + query_pinyin(component), component in cc_radicals, component in words)
            graph.add_dnw_edge("node"+hanzi+"radical"+component, "node"+hanzi, len(hanzi) > 1)
        else:
            add_dnw_graph_subnodes(graph, words, component, output_nodes, output_edges)
            if component not in output_nodes:
                graph.add_dnw_node("node" + component, component + "\\n" + query_pinyin(component), component in cc_radicals, component in words)
                output_nodes.add(component)
            if component + "to" + hanzi not in output_edges:
                graph.add_dnw_edge("node"+component, "node"+hanzi, len(hanzi) > 1)
                output_edges.add(component+"to"+hanzi)
    if hanzi not in output_nodes:
        graph.add_dnw_node("node" + hanzi, hanzi + "\\n" + query_pinyin(hanzi), hanzi in cc_radicals, hanzi in words)
        output_nodes.add(hanzi)
            
def add_dnw_graph_supernodes(graph, words, hanzi, output_nodes, output_edges):
    if hanzi not in output_nodes:
        graph.add_dnw_node("node" + hanzi, hanzi + "\\n" + query_pinyin(hanzi), hanzi in cc_radicals, hanzi in words)
        output_nodes.add(hanzi)
    for component in dnw_supercomponents_alllevels[hanzi]:
        if (hanzi + "to" + component) not in output_edges:
            graph.add_dnw_edge("node" + hanzi, "node" + component, len(component) > 1)
            output_edges.add(hanzi + "to" + component)
        add_dnw_graph_supernodes(graph, words, component, output_nodes, output_edges)

def dnw_analysis(compfilename, wordsfilename, dotfilename, words):
    print "DNW Analysis " + dotfilename
    compfile = codecs.open(compfilename, 'w', "utf-8")                
    wordsfile = codecs.open(wordsfilename, 'w', "utf-8")
    graph = GraphvizGraphLR(dotfilename.split(".")[0])
    dnw_set_up(words)
    node_order = []
    while len(dnw_weight) > 0:
        maxweight = 0
        maxhanzi = ""
        for hanzi, weight in dnw_weight.iteritems():
            if weight > maxweight:
                maxweight = weight
                maxhanzi = hanzi
        compfile.write(maxhanzi + "\n")
        if maxhanzi in words:
            wordsfile.write(maxhanzi + "\n")
        print maxhanzi, int(maxweight), int(math.e**query_word_freq(maxhanzi)),  int(query_dnw_learning_cost(maxhanzi))
        update_weights(words, maxhanzi)
        node_order.append(maxhanzi)
        dnw_learned.add(hanzi)
    output_nodes = set()
    output_edges = set()
    for hanzi in words:
        add_dnw_graph_subnodes(graph, words, hanzi, output_nodes, output_edges)
        add_dnw_graph_supernodes(graph, words, hanzi, output_nodes, output_edges)
    graph.write(dotfilename)
    compfile.close()        
    wordsfile.close()    

if True:
    t_ext = version_suffix + ".txt"
    d_ext = version_suffix + ".dot"
    try:
        os.makedirs(os.path.dirname("dnw/"))
    except:
        pass
    dnw_init()
    dnw_analysis("dnw/dnw_comp_hsk1" + t_ext, "dnw/dnw_words_hsk1" + t_ext, "dnw/dnw_hsk1" + d_ext, hskwords[1])
    # dnw_analysis("dnw/dnw_comp_hsk2" + t_ext, "dnw/dnw_words_hsk2" + t_ext, "dnw/dnw_hsk2" + d_ext, hskwords[2])
    # dnw_analysis("dnw/dnw_comp_hsk3" + t_ext, "dnw/dnw_words_hsk3" + t_ext, "dnw/dnw_hsk3" + d_ext, hskwords[3])
    # dnw_analysis("dnw/dnw_comp_hsk4" + t_ext, "dnw/dnw_words_hsk4" + t_ext, "dnw/dnw_hsk4" + d_ext, hskwords[4])
    # dnw_analysis("dnw/dnw_comp_hsk5" + t_ext, "dnw/dnw_words_hsk5" + t_ext, "dnw/dnw_hsk5" + d_ext, hskwords[5])
    # dnw_analysis("dnw/dnw_comp_hsk6" + t_ext, "dnw/dnw_words_hsk6" + t_ext, "dnw/dnw_hsk6" + d_ext, hskwords[6])

print "Finished!"
