package model

import (
	"encoding/json"
	"io/ioutil"
)

type AppInfo struct {
	Code       int        `json:"code"`
	Schema     string     `json:"schema"`
	AppOptions AppOptions `json:"appOptions"`
	Error      string     `json:"error"`
}

type AppOptions struct {
	AppTitle string `json:"appTitle"`
	Version  string `json:"version"`
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
