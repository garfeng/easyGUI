package main

import (
	"bytes"
	"context"
	"fmt"
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
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{}
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

func (a *App) GetExecCore() string {
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

	return filepath.Join(dir, appCoreName)
}

func (a *App) RunExecCoreWithArgs(args ...string) (string, error) {
	coreName := a.GetExecCore()
	cmd := exec.Command(coreName, args...)
	HideExecWindows(cmd)

	w := bytes.NewBufferString("")
	cmd.Stdout = w

	err := cmd.Run()
	if err != nil {
		return "", err
	}

	return w.String(), nil
}

func (a *App) GetSchema() (string, error) {
	return a.RunExecCoreWithArgs("-schema")
}

func (a *App) RunExecCore(cfgName string, param string) (string, error) {
	err := a.SaveJSON(cfgName, param)
	if err != nil {
		return "", err
	}

	return a.RunExecCoreWithArgs("-c", cfgName)
}

func (a *App) SelectExistConfigFile(oldFilename string) (string, error) {
	return runtime.OpenFileDialog(a.ctx, runtime.OpenDialogOptions{
		DefaultDirectory: "",
		DefaultFilename:  oldFilename,
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
	return runtime.SaveFileDialog(a.ctx, runtime.SaveDialogOptions{
		DefaultDirectory: "",
		DefaultFilename:  oldFilename,
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
