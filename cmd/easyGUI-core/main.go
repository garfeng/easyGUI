package main

import (
	"fmt"
	"github.com/garfeng/easyGUI/core/model"
	"github.com/garfeng/easyGUI/core/schema"
	"github.com/labstack/gommon/log"
)

type Args struct {
	Id   int    `json:"id"`
	Name string `json:"name"`
}

func main() {
	args := &Args{}
	err := schema.Parse(args, model.AppOptions{
		AppTitle: "Easy GUI Demo",
		Version:  "v0.0.1",
	})

	if err != nil {
		log.Error("fail to load args", err)
		return
	}

	fmt.Println(args)
}
