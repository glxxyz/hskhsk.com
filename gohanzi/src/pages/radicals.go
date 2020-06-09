package pages

import (
	"html/template"
	"net/http"
	"time"
)

func RadicalsHandler(response http.ResponseWriter, request *http.Request, start time.Time) {
	params := struct{}{}
	funcs := template.FuncMap{}
	if err := executeTemplate(response, start, "radicals.gohtml", params, funcs); err != nil {
		panic(err)
	}
}