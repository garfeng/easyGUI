package main

import (
	"fmt"
	"github.com/garfeng/easyGUI/core/model"
	"github.com/garfeng/easyGUI/core/schema"
	"log"
)

type Args struct {
	Id   int    `json:"id" jsonschema:"title=UID,description=用户 ID(should be > 0),required"`
	Name string `json:"name" jsonschema:"title=用户名(Username),required"`
}

func main() {
	args := &Args{}
	err := schema.Parse(args, model.AppOptions{
		AppTitle:         "Easy GUI Demo",
		Version:          "v0.0.1",
		ButtonSubmitText: "运行(Run)",
		ButtonSaveAsText: "另存为(Save As)",
		ButtonLoadText:   "加载配置(Load)",
		RecentFileText:   "近期选项",
	})

	if err != nil {
		log.Fatal(err)
		return
	}

	fmt.Println("Add user", args.Id, args.Name)
}
