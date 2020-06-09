package repo

type Homophone struct {
	Pinyin  string
	Members []HomophoneMember
}

type HomophoneMember struct {
	Hanzi          string
	HskLevel       int
	Definition     string
}

func BuildHomophones(numChars int, matchTones bool, hskOnly bool) []Homophone {
	return nil
}
