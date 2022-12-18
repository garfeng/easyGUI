package main

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"github.com/garfeng/easyGUI/core/model"
	"github.com/wailsapp/wails/v2/pkg/runtime"
	"io/ioutil"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
)

// App struct
type App struct {
	ctx context.Context

	AppInfo string
}

// NewApp creates a new App application struct
func NewApp() *App {
	app := &App{}
	appInfo, err := app.GetSchema()
	if err != nil {
		app.AppInfo = app.newErrorAppInfo(err)
		return app
	}

	app.AppInfo = appInfo
	return app
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
}

// Greet returns a greeting for the given name
func (a *App) Greet(name string) string {
	return fmt.Sprintf("Hello %s, It's show time!", name)
}

func (a *App) GetAppInfo() string {
	return a.AppInfo
}

func (a *App) GetCoreExeName() (string, error) {
	me := os.Args[0]

	myRoot, myAppName := filepath.Split(me)
	dir, err := os.Getwd()
	if err != nil {
		dir = myRoot
	}

	myAppNameExt := filepath.Ext(myAppName)
	var appCoreName string
	if myAppNameExt == "" {
		appCoreName = myAppName + "-core"
	} else {
		myAppNameOnlyIdx := strings.LastIndex(myAppName, myAppNameExt)
		appCoreName = myAppName[:myAppNameOnlyIdx] + "-core" + myAppNameExt
	}
	appCorePath := filepath.Join(dir, appCoreName)
	if a.IsExist(appCorePath) {
		return appCorePath, nil
	}

	w, _ := os.Open(dir)
	defer w.Close()
	names, _ := w.Readdirnames(-1)
	for _, v := range names {
		if strings.Contains(v, "-core") {
			return v, nil
		}
	}
	return "", errors.New("fail to find core app")
}

func (a *App) IsExist(name string) bool {
	w, err := os.Open(name)
	if err != nil {
		return false
	}
	w.Close()
	return true
}

func (a *App) RunExecCoreWithArgs(args ...string) model.ExecResult {
	result := model.ExecResult{}
	coreName, err := a.GetCoreExeName()
	if err != nil {
		result.Error = err.Error()
		return result
	}
	fmt.Println("coreName:", coreName)
	cmd := exec.Command(coreName, args...)
	HideExecWindows(cmd)

	stdout := bytes.NewBufferString("")
	stderr := bytes.NewBufferString("")
	cmd.Stdout = stdout
	cmd.Stderr = stderr

	err = cmd.Run()
	if err != nil {
		result.Error = err.Error()
		return result
	}

	result.Stdout = stdout.String()
	result.Stderr = stderr.String()
	return result
}

func (a *App) GetSchema() (string, error) {
	result := a.RunExecCoreWithArgs("-schema")
	if result.Error == "" {
		return result.Stdout, nil
	}
	return "", errors.New(result.Error)
}

func (a *App) RunExecCore(cfgName string, param string) model.ExecResult {
	err := a.SaveJSON(cfgName, param)
	if err != nil {
		return model.ExecResult{
			Stdout: "",
			Stderr: "",
			Error:  err.Error(),
		}
	}

	return a.RunExecCoreWithArgs("-c", cfgName)
}

func (a *App) SelectExistConfigFile(oldFilename string) (string, error) {
	root, name := filepath.Split(oldFilename)
	return runtime.OpenFileDialog(a.ctx, runtime.OpenDialogOptions{
		DefaultDirectory: root,
		DefaultFilename:  name,
		Title:            "Select Config File",
		Filters: []runtime.FileFilter{
			{
				DisplayName: "JSON",
				Pattern:     "*.json",
			},
		},
		ShowHiddenFiles:            false,
		CanCreateDirectories:       false,
		ResolvesAliases:            false,
		TreatPackagesAsDirectories: false,
	})
}

func (a *App) SelectSaveConfigFile(oldFilename string) (string, error) {
	root, name := filepath.Split(oldFilename)
	return runtime.SaveFileDialog(a.ctx, runtime.SaveDialogOptions{
		DefaultDirectory: root,
		DefaultFilename:  name,
		Title:            "Select Config File to Save",
		Filters: []runtime.FileFilter{
			{
				DisplayName: "JSON",
				Pattern:     "*.json",
			},
		},
		ShowHiddenFiles:            false,
		CanCreateDirectories:       false,
		TreatPackagesAsDirectories: false,
	})
}

func (a *App) LoadJSON(name string) (string, error) {
	buff, err := ioutil.ReadFile(name)
	if err != nil {
		return "", err
	}
	return string(buff), nil
}

func (a *App) SaveJSON(name string, data string) error {
	return ioutil.WriteFile(name, []byte(data), 0755)
}

func (a *App) newErrorAppInfo(err error) string {
	info := &model.AppInfo{
		Code:       -1,
		Schema:     "",
		AppOptions: model.AppOptions{},
		Error:      err.Error(),
	}
	buff, _ := json.MarshalIndent(info, "", "  ")
	return string(buff)
}

const (
	KRecentFile     = ".recent.json"
	KDefaultCfgFile = "tmpCfg.json"
)

func (a *App) LoadRecentData() model.RecentData {
	buff, err := ioutil.ReadFile(KRecentFile)
	if err != nil {
		return model.RecentData{RecentCfgFiles: []string{KDefaultCfgFile}}
	}

	res := model.RecentData{RecentCfgFiles: []string{}}
	json.Unmarshal(buff, &res)
	if len(res.RecentCfgFiles) == 0 {
		res.RecentCfgFiles = []string{KDefaultCfgFile}
	}
	return res
}

func (a *App) SaveRecentData(data model.RecentData) {
	model.SaveJSONObject(KRecentFile, data)
}
