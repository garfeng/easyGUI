package main

import (
	"fmt"
	"github.com/garfeng/easyGUI/core/model"
	"github.com/garfeng/easyGUI/core/schema"
	"github.com/urfave/cli/v2"
	"log"
	"os"
)

func main() {
	foo := false
	id := 0
	name := ""

	app := &cli.App{
		Flags: []cli.Flag{
			&cli.BoolFlag{
				Name:        "foo",
				Usage:       "foo greeting",
				Destination: &foo,
			},
			&cli.IntFlag{
				Name:        "id",
				Usage:       "UserId",
				Destination: &id,
			},
			&cli.StringFlag{
				Name:        "Name",
				Destination: &name,
			},
		},
		Action: func(context *cli.Context) error {
			fmt.Println("Greet", foo, id, name)
			return nil
		},
	}

	err := schema.ParseCli(app, model.AppOptions{
		AppTitle:         "Cli GUI Demo",
		Version:          "v0.0.1",
		ButtonSubmitText: "Run",
		ButtonSaveAsText: "Save As",
		ButtonLoadText:   "Load",
	})
	if err != nil {
		log.Fatal(err)
	}

	if err := app.Run(os.Args); err != nil {
		log.Fatal(err)
	}
}
