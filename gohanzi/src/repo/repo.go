package repo

import (
	"log"
	"sync"
)

var initDone = false
var initLock sync.Mutex

func EnsureResourcesLoaded() {
	if initDone {
		return
	}

	log.Print("Acquiring resource mutex")
	initLock.Lock()
	defer initLock.Unlock()

	if initDone {
		log.Print("Resources were loaded by another request")

	}

	log.Print("Loading resources")
	var dataDir = "data/"
	parseHskFiles(dataDir)
	// parseMandarinCompanionFiles(dataDir)
	// parseWordFrequencyFile(dataDir)
	// parseCharFrequencyFile(dataDir)
	// parseCeDict(dataDir)
	// parseCharacterCompositionFile(dataDir)
	// initRadical_Data()
	initDone = true
	log.Print("Resources loaded")
}
