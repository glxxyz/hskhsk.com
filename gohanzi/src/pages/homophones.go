package pages

import (
	"fmt"
	"github.com/glxxyz/hskhsk.com/gohanzi/repo"
	"html/template"
	"net/http"
	"strconv"
	"strings"
	"time"
)

type HomophonesParams struct {
	Expand     bool
	NumChars   int
	MatchTones bool
	HskOnly    bool
	Homophones []repo.Homophone
}

func HomophonesHandler(response http.ResponseWriter, request *http.Request, start time.Time) {
	params := HomophonesParams{
		Expand:     request.FormValue("Expand") == "yes",
		NumChars:   formValueInt(request, "chars", 2),
		MatchTones: request.FormValue("tones") == "yes",
		HskOnly:    request.FormValue("hsk") == "yes",
	}
	funcs := template.FuncMap{
		"homophonesLink": homophonesLink(params),
		"dictionaryLink" : dictionaryLink,
		"pinyinSearchLink" : pinyinSearchLink(params),
	}
	params.Homophones = repo.BuildHomophones(params.NumChars, params.MatchTones, params.HskOnly)
	if err := executeTemplate(response, start, "homophones.gohtml", params, funcs); err != nil {
		panic(err)
	}
}

func homophonesLink(params HomophonesParams) func(change string) string {
	return func(change string) string {
		expand := params.Expand
		numChars := params.NumChars
		hskOnly := params.HskOnly
		matchTones := params.MatchTones
		switch change {
		case "1", "2", "3", "4", "5", "6", "7", "8", "9":
			numChars, _ = strconv.Atoi(change)
		case "invertExpand":
			expand = !expand
		case "invertTones":
			matchTones = !matchTones
		case "invertHsk":
			hskOnly = !hskOnly
		}
		request, err := http.NewRequest("GET", "/homophones", nil)
		if err != nil {
			panic(err)
		}
		query := request.URL.Query()
		query.Add("chars", fmt.Sprintf("%v", numChars))
		if expand {
			query.Add("expand", "yes")
		}
		if matchTones {
			query.Add("tones", "yes")
		}
		if hskOnly {
			query.Add("hsk", "yes")
		}
		request.URL.RawQuery = query.Encode()
		return request.URL.String()
	}
}

func pinyinSearchLink(params HomophonesParams) func(pinyin string) string {
	return func(pinyin string) string {
		request, err := http.NewRequest("GET", "/search", nil)
		if err != nil {
			panic(err)
		}
		query := request.URL.Query()
		query.Add("format", "regex")
		if params.MatchTones {
			query.Add("pinyin", pinyin)
		} else {
			query.Add("pinyin", strings.Replace(pinyin, " ", "\\d?", -1))
		}
		if params.HskOnly {
			query.Add("hsk1", "t")
			query.Add("hsk2", "t")
			query.Add("hsk3", "t")
			query.Add("hsk4", "t")
			query.Add("hsk5", "t")
			query.Add("hsk6", "t")
		}
		request.URL.RawQuery = query.Encode()
		return request.URL.String()
	}
}

