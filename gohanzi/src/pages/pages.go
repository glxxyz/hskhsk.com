package pages

import (
	"github.com/glxxyz/hskhsk.com/gohanzi/repo"
	"html/template"
	"log"
	"net/http"
	"strconv"
	"time"
)

func Handler(handler func(response http.ResponseWriter, request *http.Request, start time.Time)) func(http.ResponseWriter, *http.Request) {
	return func(response http.ResponseWriter, request *http.Request) {
		repo.EnsureResourcesLoaded()
		start := time.Now()
		log.Printf("Handling request: %v", request.URL.Path)
		handler(response, request, start)
	}
}

func executeTemplate(response http.ResponseWriter, start time.Time, name string, params interface{}, funcs template.FuncMap) error {
	funcs["generatedTime"] = func() float64 {
		return time.Now().Sub(start).Seconds()
	}
	tmpl := template.New(name).Funcs(funcs)
	template.Must(tmpl.ParseFiles("templates/banner.gohtml", "templates/header.gohtml", "templates/footer.gohtml", "templates/" + name))
	return tmpl.Execute(response, params)
}

func formValueInt(request *http.Request, key string, defaultValue int) int {
	value := request.FormValue(key)
	if value == "" {
		return defaultValue
	}
	parsed, err := strconv.Atoi(value)
	if err != nil {
		panic(err)
	}
	return parsed
}

func dictionaryLink(hanzi string) string {
	request, err := http.NewRequest("GET", "/cidian", nil)
	if err != nil {
		panic(err)
	}
	query := request.URL.Query()
	query.Add("q", hanzi)
	request.URL.RawQuery = query.Encode()
	return request.URL.String()
}
