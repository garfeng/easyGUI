package schema

import (
	"encoding/json"
	"flag"
	"fmt"
	"github.com/garfeng/easyGUI/core/data"
	"github.com/invopop/jsonschema"
	"os"
)

var (
	isGetSchema = flag.Bool("schema", false, "schema flag")
	cfgPath     = flag.String("c", "config.json", "config file")
)

func Parse(v interface{}) error {
	flag.Parse()
	if *isGetSchema {
		printSchema(v)
		os.Exit(0)
	}

	return data.LoadJSONObject(*cfgPath, v)
}

func printSchema(v interface{}) {
	s, err := getSchema(v)
	status := &data.ExecStatus{}
	if err != nil {
		status.Code = -1
		status.Error = err.Error()
		printObjectJSON(status)
		return
	}
	status.Schema = s
	printObjectJSON(status)
}

func getSchema(v interface{}) (string, error) {
	vSchema := jsonschema.Reflect(v)
	vSchema.Version = ""
	buff, err := vSchema.MarshalJSON()
	if err != nil {
		return "", err
	}
	return string(buff), nil
}

func printObjectJSON(e interface{}) {
	buff, _ := json.MarshalIndent(e, "", "  ")
	fmt.Println(string(buff))
}
