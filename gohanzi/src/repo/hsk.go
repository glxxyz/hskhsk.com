package repo

import (
	"encoding/csv"
	"os"
	"path"
)

func parseHskFiles(dataDir string) {
	// Reverse order so that the LevelToWords maps track the lowest found level
	parseHskFile(path.Join(dataDir, "HSK Official With Definitions 2012 L6.txt"), 6)
	parseHskFile(path.Join(dataDir, "HSK Official With Definitions 2012 L5.txt"), 5)
	parseHskFile(path.Join(dataDir, "HSK Official With Definitions 2012 L3.txt"), 3)
	parseHskFile(path.Join(dataDir, "HSK Official With Definitions 2012 L4.txt"), 4)
	parseHskFile(path.Join(dataDir, "HSK Official With Definitions 2012 L2.txt"), 2)
	parseHskFile(path.Join(dataDir, "HSK Official With Definitions 2012 L1.txt"), 1)
	HskLevelToWords, HskLevelToChars = buildHskLevelToLists(HskWordToLevel, HskCharToLevel)
	// parseHsk2010File(path.Join(dataDir, "New_HSK_2010.csv"))
	HskLevelToWords2010, HskLevelToChars2010 = buildHskLevelToLists(HskWordToLevel2010, HskCharToLevel2010)

}

var HskWordToLevel = map[string]int{}
var HskCharToLevel = map[rune]int{}
var HskLevelToWords = map[int]map[string]bool{}
var HskLevelToChars = map[int]map[rune]bool{}
var HskWordToLevel2010 = map[string]int{}
var HskCharToLevel2010 = map[rune]int{}
var HskLevelToWords2010 = map[int]map[string]bool{}
var HskLevelToChars2010 = map[int]map[rune]bool{}

func parseHskFile(fileName string, hskLevel int) {
	csvFile, err := os.Open(fileName)
	if err != nil {
		panic(err)
	}
	defer csvFile.Close()

	reader := csv.NewReader(csvFile)
	reader.Comma = '\t'
	reader.FieldsPerRecord = -1
	csvData, err := reader.ReadAll()
	if err != nil {
		panic(err)
	}

	for _, each := range csvData {
		simplified := each[0]
		// traditional := each[1]
		// pinyinNum := each[2]
		// pinyinToned := each[3]
		// definition := each[4]
		HskWordToLevel[simplified] = hskLevel
		for _, char := range simplified {
			HskCharToLevel[char] = hskLevel
		}
		// TODO addDictionaryEntry(simplified, traditional, pinyinNum, definition)
	}
}

func buildHskLevelToLists(wordToLevel map[string]int, charToLevel map[rune]int) (map[int]map[string]bool, map[int]map[rune]bool) {

	levelToWords := map[int]map[string]bool{}
	levelToChars := map[int]map[rune]bool{}
	for i:=1; i<=6; i++ {
		levelToWords[i] = map[string]bool{}
		levelToChars[i] = map[rune]bool{}
	}

	for word, level := range wordToLevel {
		levelToWords[level][word] = true
	}

	for char, level := range charToLevel {
		levelToChars[level][char] = true
	}

	// build sets of character/word ranges; e.g. words[13] is the
	// union of the words for HSK levels 1, 2, and 3.
	for i:=1; i<=5; i++ {
		for j := i + 1; j <= 6; j++ {
			index := i * 10 + j
			levelToWords[index] = map[string]bool{}
			levelToChars[index] = map[rune]bool{}
			for k := i; k <= j; k++ {
				for word, _ := range levelToWords[k] {
					levelToWords[index][word] = true
				}
				for char, _ := range levelToChars[k] {
					levelToChars[index][char] = true
				}
			}
		}
	}

	return levelToWords, levelToChars
}


