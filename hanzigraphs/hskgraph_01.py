#!c:/python27/python
# -*- coding: utf-8 -*-

# ================
# hskgraph.py
# Versin 0.1
# Simple script to generate a bunch of Gephi graphs from HSK and character compositon files.
# March 2013 Alan Davies alan.davies@ualberta.ca

from xml.etree.ElementTree import Element, SubElement, ElementTree
import codecs, time, re

# ================
# HSK Parsing

# examples are for parsing a two line file: "A 1\nABC 1"
hsk_components = {} # {"A" : set(), "ABC" : set(["A", "B", "C"])}
hsk_level = {} # {"A" : 1, "B" : 1 , "C" : 1 , "ABC" : 1 }

def query_hsk_level(somebit):
    if somebit in hsk_level:
        return hsk_level[somebit]
    return 0

# parse file
def parse_hsk_file():
    infilename = "hsk_level_6_(New_HSK).csv"
    infile = codecs.open(infilename, 'r', "utf-8")
    for line in infile:
        splitted = line.split(",")
        if len(splitted) > 1:
            hsklevel = int(splitted[0].strip())
            word = splitted[1].strip()
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

# ================
# Character Composition Parsing

# examples are for parsing a three line file: "口口 *\n丨丨 *\n中口丨丨"
cc_components = {} # {"中" : set(["口", "丨"])}
cc_radicalof = {} # {"中" : "丨"}
cc_radicals = set() # set(["口", "丨"])

# need to filter out invalid chars e.g. 𠂉
invalid_unicode_re_pattern = re.compile(u'[^\u0000-\uD7FF\uE000-\uFFFF]', re.UNICODE)

def filter_using_re(unicode_string):
    # return re_pattern.sub(u'\uFFFD', unicode_string)
    return re_pattern.sub(u'a', unicode_string)

def parse_cc_file():
    infilename = "ChineseCharacterDecomposition.txt"
    infile = codecs.open(infilename, 'r', "utf-8")
    for line in infile:
        if invalid_unicode_re_pattern.search(line) != None:
            print "Ingoring line with invalid Unicode: ", line
            continue
        splitted = line.strip("\r\n").split("\t")
        if len(splitted) == 12:
            zi = splitted[1]
            first = splitted [4]
            second = splitted[7]
            radical = splitted [11]            
            if zi not in cc_components:
                cc_components[zi] = set()
            for char in first + second:
                if char != "" and char != zi and char != "*":
                    cc_components[zi].add(char)
            if radical== "*":
                cc_radicals.add(zi)
                cc_radicalof[zi] = zi
            else:
                cc_radicalof[zi] = radical

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
        SubElement(attributes, "attribute", {"id":"0","title":"isradical","type":"boolean"})
        SubElement(attributes, "attribute", {"id":"1","title":"isword","type":"boolean"})
        SubElement(attributes, "attribute", {"id":"2","title":"hsklevel","type":"int"})
        self.nodes=SubElement(graph, "nodes")
        self.edges=SubElement(graph, "edges")

    def _get_node_colour(self, hsklevel, isradical, isword):
        if isword:
            if hsklevel == 1:
                return {"r": "255", "g": "0", "b": "0", "a": "0.7"} # red
            elif hsklevel == 2:
                return {"r": "239", "g": "173", "b": "66", "a": "0.7"} # orange
            elif hsklevel == 3:
                return {"r": "255", "g": "255", "b": "0", "a": "0.7"} # yellow
            elif hsklevel == 4:
                return {"r": "0", "g": "255", "b": "64", "a": "0.7"} # green
            elif hsklevel == 5:
                return {"r": "0", "g": "128", "b": "255", "a": "0.7"} # blue
            elif hsklevel == 6:
                return {"r": "128", "g": "0", "b": "255", "a": "0.7"} # violet
        return {"r": "192", "g": "192", "b": "192", "a": "0.7"} # grey
            
    def _get_node_size(self, hsklevel, isradical, isword):
        if isword:
            return {"value": "20"}
        return {"value": "20"}

    def _get_node_shape(self, hsklevel, isradical, isword):
        if isradical:
            return {"value": "diamond"}
        return {"value": "disc"}
    
    def add_node(self, identifier, isword):
        isradical = identifier in cc_radicals
        hsklevel = query_hsk_level(identifier)
        node = SubElement(self.nodes, "node", {"id":identifier, "label":identifier})
        attvalues = SubElement(node, "attvalues")
        SubElement(attvalues, "attvalue", {"for":"0", "value":("true" if isradical else "false")})
        SubElement(attvalues, "attvalue", {"for":"1", "value":("true" if isword else "false")})
        SubElement(attvalues, "attvalue", {"for":"2", "value":str(hsklevel)})
        SubElement(node, "viz:color", self._get_node_colour(hsklevel, isradical, isword))
        SubElement(node, "viz:size", self._get_node_size(hsklevel, isradical, isword))
        SubElement(node, "viz:shape", self._get_node_shape(hsklevel, isradical, isword))

    def add_edge(self, identifier, source, target):
        edge = SubElement(self.edges, "edge", {"id":identifier, "source":source, "target":target})

    def write(self, filename):
        tree = ElementTree(self.gexf)
        tree.write(filename, encoding="UTF-8", xml_declaration=True)

def build_graph(filename, nodes, edges, orphans):
    print "Beginning build graph " + filename
    outnodes = set()
    outedges = set()
    foundorphans = {}
    includedorphans = set()
    graph = Graph(filename.split(".")[0])
    for node in nodes:
        if node not in outnodes:
            graph.add_node(node, True)
            outnodes.add(node)
        if node in edges:
            for edge in edges[node]:

                # handle nodes that were previously thought to be orphans
                if edge in foundorphans:
                    othernode = foundorphans[edge]
                    del foundorphans[edge]
                    includedorphans.add(edge)
                    if othernode not in outnodes:
                        graph.add_node(othernode, True)
                        outnodes.add(othernode)
                    if (othernode, edge) not in outedges:
                        graph.add_edge(othernode + "to" + edge, othernode, edge)
                        outedges.add( (othernode, edge) )
                # output the node and edge    
                if (orphans == True) or (edge in nodes) or (edge in includedorphans):
                    if edge not in outnodes:
                        graph.add_node(edge, edge in nodes)
                        outnodes.add(edge)
                    if (node, edge) not in outedges:
                        graph.add_edge(node + "to" + edge, node, edge)
                        outedges.add( (node, edge) )
                else:
                    # mark it as an orphan
                    foundorphans[edge] = node
    graph.write(filename)
                
# ================
# Process Into Lists

print "HSK Parsing"
parse_hsk_file()
print "Character Composition Parsing"
parse_cc_file()

print "Process Into Lists"
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
hsk23words = hsk2words.union(hsk3words)
hsk24words = hsk2words.union(hsk3words, hsk4words)
hsk25words = hsk2words.union(hsk3words, hsk4words, hsk5words)
hsk26words = hsk2words.union(hsk3words, hsk4words, hsk5words, hsk6words)
hsk34words = hsk3words.union(hsk4words)
hsk35words = hsk3words.union(hsk4words, hsk5words)
hsk36words = hsk3words.union(hsk4words, hsk5words, hsk6words)
hsk45words = hsk4words.union(hsk5words)
hsk46words = hsk4words.union(hsk5words, hsk6words)
hsk56words = hsk5words.union(hsk6words)

hsk12chars = hsk1chars.union(hsk2chars)
hsk13chars = hsk1chars.union(hsk2words, hsk3chars)
hsk14chars = hsk1chars.union(hsk2words, hsk3chars, hsk4chars)
hsk15chars = hsk1chars.union(hsk2words, hsk3chars, hsk4chars, hsk5chars)
hsk16chars = hsk1chars.union(hsk2words, hsk3chars, hsk4chars, hsk5chars, hsk6chars)
hsk23chars = hsk2chars.union(hsk3chars)
hsk24chars = hsk2chars.union(hsk3chars, hsk4chars)
hsk25chars = hsk2chars.union(hsk3chars, hsk4chars, hsk5chars)
hsk26chars = hsk2chars.union(hsk3chars, hsk4chars, hsk5chars, hsk6chars)
hsk34chars = hsk3chars.union(hsk4chars)
hsk35chars = hsk3chars.union(hsk4chars, hsk5chars)
hsk36chars = hsk3chars.union(hsk4chars, hsk5chars, hsk6chars)
hsk45chars = hsk4chars.union(hsk5chars)
hsk46chars = hsk4chars.union(hsk5chars, hsk6chars)
hsk56chars = hsk5chars.union(hsk6chars)


# ================
# Main

ext = "_v01.gexf"

build_graph("hsk1words" + ext,    hsk1words,  hsk_components, orphans=False)
build_graph("hsk2words" + ext,    hsk2words,  hsk_components, orphans=False)
build_graph("hsk3words" + ext,    hsk3words,  hsk_components, orphans=False)
build_graph("hsk4words" + ext,    hsk4words,  hsk_components, orphans=False)
build_graph("hsk5words" + ext,    hsk5words,  hsk_components, orphans=False)
build_graph("hsk6words" + ext,    hsk6words,  hsk_components, orphans=False)
build_graph("hskwords1to2" + ext, hsk12words, hsk_components, orphans=False)
build_graph("hskwords1to3" + ext, hsk13words, hsk_components, orphans=False)
build_graph("hskwords1to4" + ext, hsk14words, hsk_components, orphans=False)
build_graph("hskwords1to5" + ext, hsk15words, hsk_components, orphans=False)
build_graph("hskwords1to6" + ext, hsk16words, hsk_components, orphans=False)
build_graph("hskwords2to3" + ext, hsk23words, hsk_components, orphans=False)
build_graph("hskwords2to4" + ext, hsk24words, hsk_components, orphans=False)
build_graph("hskwords2to5" + ext, hsk25words, hsk_components, orphans=False)
build_graph("hskwords2to6" + ext, hsk26words, hsk_components, orphans=False)
build_graph("hskwords3to4" + ext, hsk34words, hsk_components, orphans=False)
build_graph("hskwords3to5" + ext, hsk35words, hsk_components, orphans=False)
build_graph("hskwords3to6" + ext, hsk36words, hsk_components, orphans=False)
build_graph("hskwords4to5" + ext, hsk45words, hsk_components, orphans=False)
build_graph("hskwords4to6" + ext, hsk46words, hsk_components, orphans=False)
build_graph("hskwords5to6" + ext, hsk56words, hsk_components, orphans=False)

build_graph("hsk1chars" + ext,    hsk1chars,  cc_components, orphans=True)
build_graph("hsk1chars" + ext,    hsk1chars,  cc_components, orphans=True)
build_graph("hsk2chars" + ext,    hsk2chars,  cc_components, orphans=True)
build_graph("hsk3chars" + ext,    hsk3chars,  cc_components, orphans=True)
build_graph("hsk4chars" + ext,    hsk4chars,  cc_components, orphans=True)
build_graph("hsk5chars" + ext,    hsk5chars,  cc_components, orphans=True)
build_graph("hsk6chars" + ext,    hsk6chars,  cc_components, orphans=True)
build_graph("hskchars1to2" + ext, hsk12chars, cc_components, orphans=True)
build_graph("hskchars1to3" + ext, hsk13chars, cc_components, orphans=True)
build_graph("hskchars1to4" + ext, hsk14chars, cc_components, orphans=True)
build_graph("hskchars1to5" + ext, hsk15chars, cc_components, orphans=True)
build_graph("hskchars1to6" + ext, hsk16chars, cc_components, orphans=True)
build_graph("hskchars2to3" + ext, hsk23chars, cc_components, orphans=True)
build_graph("hskchars2to4" + ext, hsk24chars, cc_components, orphans=True)
build_graph("hskchars2to5" + ext, hsk25chars, cc_components, orphans=True)
build_graph("hskchars2to6" + ext, hsk26chars, cc_components, orphans=True)
build_graph("hskchars3to4" + ext, hsk34chars, cc_components, orphans=True)
build_graph("hskchars3to5" + ext, hsk35chars, cc_components, orphans=True)
build_graph("hskchars3to6" + ext, hsk36chars, cc_components, orphans=True)
build_graph("hskchars4to5" + ext, hsk45chars, cc_components, orphans=True)
build_graph("hskchars4to6" + ext, hsk46chars, cc_components, orphans=True)
build_graph("hskchars5to6" + ext, hsk56chars, cc_components, orphans=True)

print "Finished!"
