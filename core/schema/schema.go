package schema

import (
	"encoding/json"
	"errors"
	"flag"
	"fmt"
	"github.com/garfeng/easyGUI/core/model"
	"github.com/invopop/jsonschema"
	"os"
)

var (
	isGetSchema = flag.Bool("schema", false, "schema flag")
	cfgPath     = flag.String("c", "", "config file")
)

func Parse(v interface{}, options model.AppOptions) error {
	flag.Parse()
	if *isGetSchema {
		printSchema(v, options)
		os.Exit(0)
		return nil
	}
	if (*cfgPath) == "" {
		return errors.New("no config file defined")
	}
	return model.LoadJSONObject(*cfgPath, v)
}

func printSchema(v interface{}, options model.AppOptions) {
	s, err := getSchema(v)
	status := &model.AppInfo{
		AppOptions: options,
	}
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
