package data

import (
	"encoding/json"
	"io/ioutil"
)

type ExecStatus struct {
	Code   int    `json:"code"`
	Schema string `json:"schema"`
	Error  string `json:"error"`
}

func LoadJSONObject(name string, v interface{}) error {
	buff, err := ioutil.ReadFile(name)
	if err != nil {
		return err
	}
	return json.Unmarshal(buff, v)
}

func SaveJSONObject(name string, v interface{}) error {
	buff, err := json.MarshalIndent(v, "", "  ")
	if err != nil {
		return err
	}
	return ioutil.WriteFile(name, buff, 0755)
}
