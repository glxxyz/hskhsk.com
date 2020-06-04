#!c:/python27/python
# -*- coding: utf-8 -*-

# ================
# hskgraph.py
# Version 0.06
# Simple script to generate a bunch of Gephi graphs from HSK and character compositon files.
# March 2013 Alan Davies alan.davies@ualberta.ca

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
    return sum(s) * 1.0 / len(s)
def variance(s):
    mu = mean(s)
    return mean(map(lambda x: (1.0 * x - mu)**2, s))
def stddev(s):
    return math.sqrt(variance(s))
def meanstddev(s):
    mu = sum(s) * 1.0 / len(s)
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

# http://code.activestate.com/recipes/578129-simple-linear-regression/
class SimpleLinearRegression:
    """ tool class as help for calculating a linear function """
    def __init__(self, data):
        """ initializes members with defaults """
        self.data = data   # list of (x,y) pairs
        self.a    = 0      # "a" of y = a + b*x
        self.b    = 0      # "b" of y = a + b*x
        self.r    = 0      # coefficient of correlation

    def run(self):
        """ calculates coefficient of correlation and
            the parameters for the linear function """
        sumX, sumY, sumXY, sumXX, sumYY = 0, 0, 0, 0, 0
        n = float(len(self.data))

        for x, y in self.data:
            sumX  += x
            sumY  += y
            sumXY += x*y
            sumXX += x*x
            sumYY += y*y

        denominator = math.sqrt((sumXX - 1/n * sumX**2)*(sumYY - 1/n * sumY**2))
        if denominator < EPSILON:
            return False

        # coefficient of correlation
        self.r  = (sumXY - 1/n * sumX * sumY)
        self.r /= denominator

        # is there no relationship between 'x' and 'y'?
        if abs(self.r) < EPSILON:
            return False

        # calculating 'a' and 'b' of y = a + b*x
        self.b  = sumXY - sumX * sumY / n
        self.b /= (sumXX - sumX**2 / n)

        self.a  = sumY - self.b * sumX
        self.a /= n
        return True

    def function(self, x):
        """ linear function (be aware of current
            coefficient of correlation """
        return self.a + self.b * x

    def __repr__(self):
        """ current linear function for print """
        return "y = f(x) = %(a)f + %(b)f*x" % self.__dict__


def linreg(X, Y):
    """Linear regression of y = ax + b Usage: real, real, real = linreg(list, list)"""
    if len(X) != len(Y):  raise ValueError, 'unequal length'
    N = len(X)
    Sx = Sy = Sxx = Syy = Sxy = 0.0
    zipped = zip(X, Y)
    for x, y in zipped:
        Sx += x
        Sy += y
        Sxx += x*x
        Syy += y*y
        Sxy += x*y
    det = Sxx * N - Sx * Sx
    a, b = (Sxy * N - Sy * Sx)/det, (Sxx * Sy - Sx * Sxy)/det
    meanerror = residual = 0.0
    for x, y in zipped:
        meanerror = meanerror + (y - Sy/N)**2
        residual = residual + (y - a * x - b)**2
    RR = 1 - residual/meanerror
    ss = residual / (N-2)
    Var_a, Var_b = ss * N / det, ss * Sxx / det
    print "y=ax+b"
    print "N= %d" % N
    print "a= %g \\pm t_{%d;\\alpha/2} %g" % (a, N-2, math.sqrt(Var_a))
    print "b= %g \\pm t_{%d;\\alpha/2} %g" % (b, N-2, math.sqrt(Var_b))
    print "R^2= %g" % RR
    print "s^2= %g" % ss
    return a, b, RR

# ================
# HSK Parsing

# examples are for parsing a two line level 1 file: "A    a1    aa    definition\nABC    abc1    abc    abcdef"
hsk_components = {} # {"A" : set(), "ABC" : set(["A", "B", "C"])}
hsk_level = {} # {"A" : 1, "B" : 1 , "C" : 1 , "ABC" : 1 }
hsk_pinyin = {} # {"A" : "aa", "ABC" : "abc"])}

def query_hsk_level(somebit, hskmin=1, hskmax=6):
    if somebit in hsk_level:
        level = hsk_level[somebit]
        if level < hskmin or level > hskmax:
            level = 0
    else:
        level = 0
    return level

def query_hsk_pinyin(somebit):
    if somebit in hsk_pinyin:
        return hsk_pinyin[somebit]
    if somebit in cedict_pinyin: # also check for pinyin in CCEDICT
        parsed = pinyin_numbers_to_tone_marks(cedict_pinyin[somebit])
        hsk_pinyin[somebit] = parsed # cache for next time
        print "CCEDICT pinyin fallback:", somebit, parsed
        return parsed
    print "No pinyin found:", somebit
    return ""

# parse newer 2012 HSK format 
def parse_hsk_file(infilename, hsklevel):
    infile = codecs.open(infilename, 'r', "utf-8")
    for line in infile:
        splitted = line.strip().split("\t")
        if len(splitted) >= 4:
            word = unicodedata.normalize("NFKC", splitted[0].strip()).replace(u'\ufeff',"")
            pinyin = splitted[3].strip()
            if word != "":
                for somebit in list(word) + [word]:
                    if somebit in hsk_level:
                        hsk_level[somebit] = min(hsk_level[somebit], hsklevel)
                    else:
                        hsk_level[somebit] = hsklevel
                if len(word) > 1:
                    hsk_components[word] = set(list(word))
                else:
                    hsk_components[word] = set()
                if word not in hsk_pinyin:
                    hsk_pinyin[word] = pinyin

# ================
# Character Composition Parsing

# examples are for parsing a three line file: "口口 *\n丨丨 *\n中口丨丨"
cc_components = {} # {"中" : set(["口", "丨"])}
cc_radicalof = {} # {"中" : "丨"}

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

# ================
# Frequency parsing

word_freq = {} # {"AB" : 1234, ...}
char_freq = {} # {"A" : 1234, ...}

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

def query_word_freq_direct(somebit):
    if somebit in word_freq:
        return word_freq[somebit]
    if somebit in char_freq:
        return char_freq[somebit]
    return 0;

def query_word_freq(somebit):
    if somebit not in word_freq:
        # find the minimum value for each possible split, and take the maximum
        # of all those values
        freq = max([min([query_word_freq_direct(word) for word in splitlist]) for splitlist in all_potential_splits(somebit)])
        if freq == 0:
            # print "frequency not found:", somebit, [ord(bit[0]) for bit in somebit]
            pass
        else:
            pass
            # print "faked frequency of", somebit, ord(somebit[0]), "as", freq
        word_freq[somebit] = freq
    return word_freq[somebit]

# parse SUBTLEX word frequency
def parse_word_freq_file(infilename):
    infile = codecs.open(infilename, 'r', "utf-8")
    for line in infile:
        splitted = line.strip().split("\t")
        if len(splitted) == 7:
            word = unicodedata.normalize("NFKC", splitted[0].strip()).replace(u'\ufeff',"")
            freq = float(splitted[1].strip())
            if word != "" and freq > 0:
                word_freq[word] = freq

# parse SUBTLEX char frequency
def parse_char_freq_file(infilename):
    infile = codecs.open(infilename, 'r', "utf-8")
    for line in infile:
        splitted = line.strip().split("\t")
        if len(splitted) == 7:
            char = unicodedata.normalize("NFKC", splitted[0].strip()).replace(u'\ufeff',"")
            freq = float(splitted[1].strip())
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
            freq = float(splitted[1].strip())
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
# CCEDICT parsing for fallback tones

cedict_pinyin = {}

ccedict_lineparse = re.compile(u"^(\S+)\s.*?\[(.*?)\]")
def parse_ccedict_for_tones(infilename):
    infile = codecs.open(infilename, 'r', "utf-8")
    for line in infile:
        if line[0] != "#":
            match = ccedict_lineparse.search(line)
            if match is not None:
                word = match.group(1)
                pinyin = match.group(2)
                cedict_pinyin[word] = pinyin

# ================
# Pinyin numbers to tone marks

pinyintones = [u"AĀÁĂÀA", u"aāáăàa", u"EĒÉĔÈE", u"eēéĕèe",
               u"OŌÓŎÒO", u"oōóŏòo", u"IĪÍĬÌI", u"iīíĭìi",
               u"UŪÚŬÙU", u"uūúŭùu", u"ÜǕǗǙǛÜ", u"üǖǘǚǜü"]
pyreplacements = [("u:", u"ü"), ("v", u"ü"), ("U:", u"Ü"), ("V", u"Ü")]
pinyinfindregex = re.compile(u"([A-Za-züÜ:]+)([1-5])")

def pinyin_numbers_to_tone_marks(inputstr):
    result = []
    nextbit = 0
    for match in pinyinfindregex.finditer(inputstr):
        if nextbit != match.start():
            result.append(inputstr[nextbit:match.start()])
        syllable = match.group(1)
        for fr, to in pyreplacements:
            syllable = syllable.replace(fr, to) 
        tone = int(match.group(2))
        for tonetest in pinyintones:
            if tonetest[0] in syllable and not (tonetest[0].lower() == "i" and "iu" in syllable.lower()):
                syllable = syllable.replace(tonetest[0], tonetest[tone])
                break
        result.append(syllable)
        nextbit = match.end()
    if nextbit < len(inputstr):
        result.append(inputstr[nextbit:])
    return "".join(result)

# ================
# Graph Output

# class Graph
# Simple container to clarify graph creation code
# members: gexf, nodes, edges

class Graph:
    def __init__(self, desctext):
        # self.gexf = Element('gexf', {"xmlns":"http://www.gexf.net/1.2draft","version":"1.2"})
        self.gexf = Element('gexf', {"xmlns":"http://www.gexf.net/1.2draft", "xmlns:viz":"http://www.gexf.net/1.1draft/viz", "xmlns:xsi":"http://www.w3.org/2001/XMLSchema-instance", "xsi:schemaLocation":"http://www.gexf.net/1.2draft http://www.gexf.net/1.2draft/gexf.xsd", "version":"1.2"})
        meta = SubElement(self.gexf, "meta", {"lastmodifieddate":time.strftime("%Y-%m-%d")})
        creator = SubElement(meta, "creator")
        creator.text = "Alan Davies alan.davies@ualberta.ca"
        description = SubElement(meta, "description")
        description.text = "HSK vocabulary graph " + desctext
        graph = SubElement(self.gexf, "graph", {"mode":"static","defaultedgetype":"directed"})
        attributes = SubElement(graph, "attributes",{"class":"node"})
        SubElement(attributes, "attribute", {"id":"0","title":"isword","type":"boolean"})
        SubElement(attributes, "attribute", {"id":"1","title":"hsklevel","type":"int"})
        SubElement(attributes, "attribute", {"id":"2","title":"freq","type":"float"})
        SubElement(attributes, "attribute", {"id":"3","title":"freqint","type":"int"})
        SubElement(attributes, "attribute", {"id":"4","title":"freqintreverse","type":"int"})
        self.nodes=SubElement(graph, "nodes")
        self.edges=SubElement(graph, "edges")

    def _get_node_colour(self, word, hsklevel, isword):
        if isword:
            return get_node_freq_color(hsklevel, query_word_freq(word))
        # for non-words in a word graph, leave the colour as grey
        return get_node_freq_color(0, query_word_freq(word))
    
    def format_node_colour(self, (r, g, b)):
        return {"r": str(r), "g": str(g), "b": str(b), "a": "1.0"}
            
    def _get_node_size(self, word, hsklevel, isword):
        (mu, sigma) = hskfreqmusigma[0]
        return normcdf(query_word_freq(word), mu, sigma) * 0.2 + 1
    
    def _get_node_freq(self, word):
        (mu, sigma) = hskfreqmusigma[0]
        return normcdf(query_word_freq(word), mu, sigma)
        
    def format_node_size(self, size):
        return {"value" : str(size)}
        
    def add_node(self, identifier, isword, hsklevel, position=None):
        self.add_node_detail(identifier,
                             isword,
                             hsklevel,
                             self._get_node_colour(identifier, hsklevel, isword),
                             self._get_node_size(identifier, hsklevel, isword),
                             self._get_node_freq(identifier),
                             position)
        
    def add_node_detail(self, identifier, isword, hsklevel, colour, size, freq, position=None):
        node = SubElement(self.nodes, "node", {"id":identifier, "label":identifier})
        attvalues = SubElement(node, "attvalues")
        SubElement(attvalues, "attvalue", {"for":"0", "value":("true" if isword else "false")})
        SubElement(attvalues, "attvalue", {"for":"1", "value":str(hsklevel)})
        SubElement(attvalues, "attvalue", {"for":"2", "value":str(freq)})
        SubElement(attvalues, "attvalue", {"for":"3", "value":str(int(freq*100))})
        SubElement(attvalues, "attvalue", {"for":"4", "value":str(int((1-freq)*100))})
        SubElement(node, "viz:color", self.format_node_colour(colour))
        SubElement(node, "viz:size", self.format_node_size(size))
        if position is not None:
            SubElement(node, "viz:position", {"x":str(position[0]), "y":str(position[1]), "z":"0.0"})
            

    def add_edge(self, identifier, source, target, weight=1.0):
        edge = SubElement(self.edges, "edge", {"id":identifier, "source":source, "target":target, "weight":str(weight)})

    def write(self, filename):
        tree = ElementTree(self.gexf)
        tree.write(filename, encoding="UTF-8", xml_declaration=True)

# doesn't output orphan nodes that aren't in nodes list, doesn't recurse edges
# takes a list of edge maps
def build_word_graph(filename, nodes, edgeslist, hskmin, hskmax):
    print "Build word graph " + filename
    outnodes = set()
    outedges = set()
    foundorphans = {}
    graph = Graph(filename.split(".")[0])
    for node in nodes:
        if node not in outnodes:
            graph.add_node(node, True, query_hsk_level(node, hskmin, hskmax))
            outnodes.add(node)
        for edges, weight in edgeslist:
            if node in edges:
                for destnode in edges[node]:
                    if (destnode in nodes):
                        if destnode not in outnodes:
                            graph.add_node(destnode, destnode in nodes, query_hsk_level(destnode, hskmin, hskmax))
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
        orphanedges = set()
        for e, weight in edgeslist:
            if orphan in e:
                for edge in e[orphan]:
                    if edge in nodes:
                        orphanedges.add((edge, weight))
        # output any nodes that were thought to be orphans, but which have 2 or more connections
        if len(orphanedges) + len(foundorphans[orphan]) >= 2:
            if orphan not in outnodes:
                graph.add_node(orphan, False, query_hsk_level(orphan, hskmin, hskmax))
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
def build_char_graph(filename, nodes_in, edges, hskmin, hskmax):
    print "Build char graph " + filename
    outnodes = set()
    outedges = set()
    nodes = set(nodes_in) # make a copy so we can remove nodes as we iterate
    graph = Graph(filename.split(".")[0])
    while len(nodes) > 0:
        node = nodes.pop()
        graph.add_node(node, True, query_hsk_level(node, hskmin, hskmax))
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


def highest_freq_node(nodes):
    winner = ""
    freq = 0;
    for node in nodes:
        compare = query_word_freq(node)
        if compare > freq:
            freq = compare
            winner = node
    return (winner, freq)
        
def lowest_freq_node(nodes):
    winner = ""
    freq = word_freq_total;
    for node in nodes:
        compare = query_word_freq(node)
        if compare < freq:
            freq = compare
            winner = node
    return (winner, freq)


# outputs a tree graph by frequency (not currently used)
def add_tree_graph_branch(graph, root, rest, numbranches):
    for i in range(numbranches):
        nextbranch = rest[i::numbranches]
        if len(nextbranch):
            leaf = nextbranch[0]
            graph.add_node(leaf, True, query_hsk_level(leaf))
            graph.add_edge(root + "to" + leaf, root, leaf)        
            add_tree_graph_branch(graph, leaf, nextbranch[1:], max(numbranches-1, 2))

def build_tree_graph(filename, nodes, initialbranches):
    sortednodes = [(query_word_freq(node), node) for node in nodes]
    sortednodes.sort()
    sortednodes.reverse()
    nodelist = [node for (freq, node) in sortednodes]
    root = nodelist[0]
    print "Build tree graph " + filename + " with root " + root
    graph = Graph(filename.split(".")[0])
    graph.add_node(root, True, query_hsk_level(root))
    add_tree_graph_branch(graph, root, nodelist[1:], initialbranches)
    graph.write(filename)
        
# outputs a star shape with a single central node as the highest frequency word
def build_star_graph_old(filename, nodes):
    root = highest_freq_node(nodes)[0]
    print "Build star graph " + filename + " with root " + root
    (mu, sigma) = hskfreqmusigma[0]
    graph = Graph(filename.split(".")[0])
    for node in nodes:
        graph.add_node(node, True, query_hsk_level(node))
        if node != root:
            graph.add_edge(node + "to" + root, node, root, normcdf(query_word_freq(node), mu, sigma)*2)
    graph.write(filename)

def build_star_graph(filename, nodes):
    root = highest_freq_node(nodes)[0]
    print "Build star graph " + filename + " with root " + root
    (mu, sigma) = hskfreqmusigma[0]
    graph = Graph(filename.split(".")[0])
    for node in nodes:
        dist = (1-normcdf(query_word_freq(node), mu, sigma)) * 100
        angle = random.uniform(0, 2 * math.pi)
        x = dist * math.cos(angle)
        y = dist * math.sin(angle)
        graph.add_node(node, True, query_hsk_level(node), (x, y))
        if node != root:
            graph.add_edge(node + "to" + root, node, root, normcdf(query_word_freq(node), mu, sigma)*2)
    graph.write(filename)

# Build legend
def build_legend_graph(filename):
    print "Build legend graph " + filename
    graph = Graph(filename.split(".")[0])
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

# ============
# super advanced frequency colouring algorithm

hskfreqcolour = {}
hskfreqcolour[0]=((229, 229, 229), (181, 181, 181)) # light/dark grey
hskfreqcolour[1]=((255, 183, 183), (248,  86,  86)) # light/dark red
hskfreqcolour[2]=((255, 219, 183), (255, 164,  72)) # light/dark orange
hskfreqcolour[3]=((255, 255, 170), (240, 240,   0)) # light/dark yellow
hskfreqcolour[4]=((193, 242, 181), (117, 217,  91)) # light/dark green
hskfreqcolour[5]=((173, 221, 247), ( 65, 167, 222)) # light/dark blue
hskfreqcolour[6]=((219,  68, 223), (219,  68, 223)) # light/dark violet

def get_node_freq_color(hsklevel, freq):
    (mu, sigma) = hskfreqmusigma[hsklevel]
    ((minr, ming, minb), (maxr, maxg, maxb)) = hskfreqcolour[hsklevel]
    relfreq = normcdf(freq, mu, sigma)
    r = int(0.5 + minr + (maxr - minr) * relfreq)
    g = int(0.5 + ming + (maxg - ming) * relfreq)
    b = int(0.5 + minb + (maxb - minb) * relfreq)
    return (r, g, b)
        
# ================
# Add pinyin to hanzi SVG file

def add_pinyin_to_svg(infilename):
    print "Add pinyin to " + infilename
    infile = codecs.open(infilename, 'r', "utf-8")
    svgfile = infile.read()

    textblobs = []
    for result in re.findall(r'<text(.*?font-size=")(.*?)(".*?y=")(.*?)(".*?>)(.*?)</text>', svgfile, re.DOTALL):
        fontsizeint = int(float(result[1]) * 3/4 + 0.5)
        fontsize = str(fontsizeint)
        yval = str(float(result[3]) + fontsizeint)
        pinyin = query_hsk_pinyin(result[5].strip())
        if pinyin != "":
            textblob = "        <text" + result[0]
            textblob += fontsize + result[2] + yval + result[4] + "\n        " + pinyin
            textblob += "\n       </text>\n"
            textblobs.append(textblob)
    
    svgidx = svgfile.find("</svg>")
    if svgidx > 0:
        outfilename = infilename.replace(".", "_pinyin.")
        outfile = codecs.open(outfilename, 'w', "utf-8")
        outfile.write(codecs.BOM_UTF8.decode("utf8")) # UTF Byte order mark
        outfile.write(svgfile[:svgidx])
        outfile.write('    <g id="pinyin-labels">\n')
        for textblob in textblobs:
            outfile.write(textblob)
        outfile.write('    </g>\n</svg>')
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
parse_dnw_cc_file("data/DNW-decomp.txt")

print "Parse Word Frequencies"
parse_word_freq_file("data/SUBTLEX-CH-WF.txt")
parse_char_freq_file("data/SUBTLEX-CH-CHR.txt")
parse_dnw_char_freq_file("data/DNW-UForder.txt")

print "Parse CCEDICT for extra tones"
parse_ccedict_for_tones("data/cedict_ts.u8")

print "Process Into Sets"
hsk1words = set([word for word in hsk_components if query_hsk_level(word) == 1])
hsk2words = set([word for word in hsk_components if query_hsk_level(word) == 2])
hsk3words = set([word for word in hsk_components if query_hsk_level(word) == 3])
hsk4words = set([word for word in hsk_components if query_hsk_level(word) == 4])
hsk5words = set([word for word in hsk_components if query_hsk_level(word) == 5])
hsk6words = set([word for word in hsk_components if query_hsk_level(word) == 6])

hsk1chars = set([char for char in hsk_level if len(char) == 1 and query_hsk_level(char) == 1])
hsk2chars = set([char for char in hsk_level if len(char) == 1 and query_hsk_level(char) == 2])
hsk3chars = set([char for char in hsk_level if len(char) == 1 and query_hsk_level(char) == 3])
hsk4chars = set([char for char in hsk_level if len(char) == 1 and query_hsk_level(char) == 4])
hsk5chars = set([char for char in hsk_level if len(char) == 1 and query_hsk_level(char) == 5])
hsk6chars = set([char for char in hsk_level if len(char) == 1 and query_hsk_level(char) == 6])

hsk12words = hsk1words.union(hsk2words)
hsk13words = hsk1words.union(hsk2words, hsk3words)
hsk14words = hsk1words.union(hsk2words, hsk3words, hsk4words)
hsk15words = hsk1words.union(hsk2words, hsk3words, hsk4words, hsk5words)
hsk16words = hsk1words.union(hsk2words, hsk3words, hsk4words, hsk5words, hsk6words)
hsk46words = hsk4words.union(hsk5words, hsk6words)

hsk12chars = hsk1chars.union(hsk2chars)
hsk13chars = hsk1chars.union(hsk2words, hsk3chars)
hsk14chars = hsk1chars.union(hsk2words, hsk3chars, hsk4chars)
hsk15chars = hsk1chars.union(hsk2words, hsk3chars, hsk4chars, hsk5chars)
hsk16chars = hsk1chars.union(hsk2words, hsk3chars, hsk4chars, hsk5chars, hsk6chars)
hsk46chars = hsk4chars.union(hsk5chars, hsk6chars)

# =========
# Some simple stats
print "Calculate frequency means and standard deviations"

hskfreqmusigma = {}
hskfreqmusigma[0] = meanstddev([query_word_freq(word) for word in word_freq])
hskfreqmusigma[1] = meanstddev([query_word_freq(word) for word in hsk1words])
hskfreqmusigma[2] = meanstddev([query_word_freq(word) for word in hsk2words])
hskfreqmusigma[3] = meanstddev([query_word_freq(word) for word in hsk3words])
hskfreqmusigma[4] = meanstddev([query_word_freq(word) for word in hsk4words])
hskfreqmusigma[5] = meanstddev([query_word_freq(word) for word in hsk5words])
hskfreqmusigma[6] = meanstddev([query_word_freq(word) for word in hsk6words])

# ================
# Main

prev = "gexf/"
ext = "_v07.gexf"

try:
    os.makedirs(os.path.dirname(prev))
except:
    pass


# output HSK Word graphs
if True:
    build_word_graph(prev + "HSK1_words" + ext,   hsk1words,  [(hsk_components, 1.0)], 1, 1)
    build_word_graph(prev + "HSK2_words" + ext,   hsk2words,  [(hsk_components, 1.0)], 2, 2)
    build_word_graph(prev + "HSK3_words" + ext,   hsk3words,  [(hsk_components, 1.0)], 3, 3)
    build_word_graph(prev + "HSK4_words" + ext,   hsk4words,  [(hsk_components, 1.0)], 4, 4)
    build_word_graph(prev + "HSK5_words" + ext,   hsk5words,  [(hsk_components, 1.0)], 5, 5)
    build_word_graph(prev + "HSK6_words" + ext,   hsk6words,  [(hsk_components, 1.0)], 6, 6)
    build_word_graph(prev + "HSK1-2_words" + ext, hsk12words, [(hsk_components, 1.0)], 1, 2)
    build_word_graph(prev + "HSK1-3_words" + ext, hsk13words, [(hsk_components, 1.0)], 1, 3)
    build_word_graph(prev + "HSK1-4_words" + ext, hsk14words, [(hsk_components, 1.0)], 1, 4)
    build_word_graph(prev + "HSK1-5_words" + ext, hsk15words, [(hsk_components, 1.0)], 1, 5)
    build_word_graph(prev + "HSK1-6_words" + ext, hsk16words, [(hsk_components, 1.0)], 1, 6)
    build_word_graph(prev + "HSK4-6_words" + ext, hsk46words, [(hsk_components, 1.0)], 4, 6)

# output HSK Character graphs
if True:
    build_char_graph(prev + "HSK1_chars" + ext,   hsk1chars,  cc_components, 1, 1)
    build_char_graph(prev + "HSK2_chars" + ext,   hsk2chars,  cc_components, 2, 2)
    build_char_graph(prev + "HSK3_chars" + ext,   hsk3chars,  cc_components, 3, 3)
    build_char_graph(prev + "HSK4_chars" + ext,   hsk4chars,  cc_components, 4, 4)
    build_char_graph(prev + "HSK5_chars" + ext,   hsk5chars,  cc_components, 5, 5)
    build_char_graph(prev + "HSK6_chars" + ext,   hsk6chars,  cc_components, 6, 6)
    build_char_graph(prev + "HSK1-2_chars" + ext, hsk12chars, cc_components, 1, 2)
    build_char_graph(prev + "HSK1-3_chars" + ext, hsk13chars, cc_components, 1, 3)
    build_char_graph(prev + "HSK1-4_chars" + ext, hsk14chars, cc_components, 1, 4)
    build_char_graph(prev + "HSK1-5_chars" + ext, hsk15chars, cc_components, 1, 5)
    build_char_graph(prev + "HSK1-6_chars" + ext, hsk16chars, cc_components, 1, 6)
    build_char_graph(prev + "HSK4-6_chars" + ext, hsk46chars, cc_components, 4, 6)

# output HSK Word & Character graphs
if True:
    word_char_graph_edges = [(hsk_components, 2.0), (cc_components, 1.0)]
    build_word_graph(prev + "HSK1_wordchar" + ext,   hsk1words,  word_char_graph_edges, 1, 1)
    build_word_graph(prev + "HSK2_wordchar" + ext,   hsk2words,  word_char_graph_edges, 2, 2)
    build_word_graph(prev + "HSK3_wordchar" + ext,   hsk3words,  word_char_graph_edges, 3, 3)
    build_word_graph(prev + "HSK4_wordchar" + ext,   hsk4words,  word_char_graph_edges, 4, 4)
    build_word_graph(prev + "HSK5_wordchar" + ext,   hsk5words,  word_char_graph_edges, 5, 5)
    build_word_graph(prev + "HSK6_wordchar" + ext,   hsk6words,  word_char_graph_edges, 6, 6)
    build_word_graph(prev + "HSK1-2_wordchar" + ext, hsk12words, word_char_graph_edges, 1, 2)
    build_word_graph(prev + "HSK1-3_wordchar" + ext, hsk13words, word_char_graph_edges, 1, 3)
    build_word_graph(prev + "HSK1-4_wordchar" + ext, hsk14words, word_char_graph_edges, 1, 4)
    build_word_graph(prev + "HSK1-5_wordchar" + ext, hsk15words, word_char_graph_edges, 1, 5)
    build_word_graph(prev + "HSK1-6_wordchar" + ext, hsk16words, word_char_graph_edges, 1, 6)

# output word star graphs
if True:
    build_star_graph(prev + "HSK1_wordstar" + ext,   hsk1words)
    build_star_graph(prev + "HSK2_wordstar" + ext,   hsk2words)
    build_star_graph(prev + "HSK3_wordstar" + ext,   hsk3words)
    build_star_graph(prev + "HSK4_wordstar" + ext,   hsk4words)
    build_star_graph(prev + "HSK5_wordstar" + ext,   hsk5words)
    build_star_graph(prev + "HSK6_wordstar" + ext,   hsk6words)
    build_star_graph(prev + "HSK1-2_wordstar" + ext, hsk12words)
    build_star_graph(prev + "HSK1-3_wordstar" + ext, hsk13words)
    build_star_graph(prev + "HSK1-4_wordstar" + ext, hsk14words)
    build_star_graph(prev + "HSK1-5_wordstar" + ext, hsk15words)
    build_star_graph(prev + "HSK1-6_wordstar" + ext, hsk16words)
    build_star_graph(prev + "HSK4-6_wordstar" + ext, hsk46words)

# output char star graphs
if True:
    build_star_graph(prev + "HSK1_charstar" + ext,   hsk1chars)
    build_star_graph(prev + "HSK2_charstar" + ext,   hsk2chars)
    build_star_graph(prev + "HSK3_charstar" + ext,   hsk3chars)
    build_star_graph(prev + "HSK4_charstar" + ext,   hsk4chars)
    build_star_graph(prev + "HSK5_charstar" + ext,   hsk5chars)
    build_star_graph(prev + "HSK6_charstar" + ext,   hsk6chars)
    build_star_graph(prev + "HSK1-2_charstar" + ext, hsk12chars)
    build_star_graph(prev + "HSK1-3_charstar" + ext, hsk13chars)
    build_star_graph(prev + "HSK1-4_charstar" + ext, hsk14chars)
    build_star_graph(prev + "HSK1-5_charstar" + ext, hsk15chars)
    build_star_graph(prev + "HSK1-6_charstar" + ext, hsk16chars)
    build_star_graph(prev + "HSK4-6_charstar" + ext, hsk46chars)

# output a re-usable legend
if True:
    build_legend_graph(prev + "legend" + ext)

# add pinyin to previously created SVG file
if False:
    add_pinyin_to_svg("HSK1-6Star_v04c.svg")
    add_pinyin_to_svg("HSK1-3Star_v04c.svg")
    add_pinyin_to_svg("HSK1-6_charstar_v05.svg")
    
# output a frequency and HSK level list, for analysis in Excel etc.
if False:
    for word in hsk_components:
        print query_hsk_level(word), word, (word)
        query_word_freq(word)

print "Finished!"

