package pages

import (
	"html/template"
	"net/http"
	"time"
)

func IndexHandler(response http.ResponseWriter, request *http.Request, start time.Time) {
	if request.URL.Path != "/" {
		http.Redirect(response, request, "/", http.StatusFound)
		return
	}

	params := struct{}{}
	funcs := template.FuncMap{}
	if err := executeTemplate(response, start, "index.gohtml", params, funcs); err != nil {
		panic(err)
	}
}
