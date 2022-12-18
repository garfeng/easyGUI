package model

import (
	"encoding/json"
	"io/ioutil"
)

const (
	FlagSchema  = "easygui-schema"
	FlagCfgPath = "easygui-cfgPath"
)

type AppInfo struct {
	Code       int        `json:"code"`
	Schema     string     `json:"schema"`
	AppOptions AppOptions `json:"appOptions"`
	Error      string     `json:"error"`
	Type       AppType    `json:"type"`
}

type AppType string

const (
	AppType_CfgFile AppType = "cfgFile"
	AppType_Cli     AppType = "cli"
)

type AppOptions struct {
	AppTitle string `json:"appTitle"`
	Version  string `json:"version"`

	ButtonSubmitText string `json:"submitButtonText"`
	ButtonSaveAsText string `json:"buttonSaveAsText"`
	ButtonLoadText   string `json:"buttonLoadText"`
}

type RecentData struct {
	RecentCfgFiles []string `json:"recentCfgFiles"`
}

type ExecResult struct {
	Stdout string `json:"stdout"`
	Stderr string `json:"stderr"`
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

func CmdFlagOf(name string) string {
	return "-" + name
}
