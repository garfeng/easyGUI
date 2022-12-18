package schema

import (
	"encoding/json"
	"errors"
	"flag"
	"fmt"
	"github.com/garfeng/easyGUI/core/model"
	"github.com/iancoleman/orderedmap"
	"github.com/invopop/jsonschema"
	"github.com/urfave/cli/v2"
	"os"
	"strings"
)

func Parse(v interface{}, options model.AppOptions) error {
	isGetSchema := flag.Bool(model.FlagSchema, false, "schema flag")
	cfgPath := flag.String(model.FlagCfgPath, "", "config file")

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

func ParseCli(app *cli.App, options model.AppOptions) error {
	isGetSchema := false
	schemaFlags := []cli.Flag{
		&cli.BoolFlag{
			Name:        model.FlagSchema,
			Usage:       "print schema",
			Value:       false,
			Destination: &isGetSchema,
		},
	}
	originFlags := app.Flags
	app.Flags = append(schemaFlags, originFlags...)

	originAction := app.Action

	app.Action = func(context *cli.Context) error {
		if isGetSchema {
			appInfo := &model.AppInfo{
				AppOptions: options,
				Type:       model.AppType_Cli,
			}

			s, err := parseSchemaOfCliFlags(originFlags)
			if err != nil {
				appInfo.Code = -1
				appInfo.Error = err.Error()
			} else {
				appInfo.Schema = s
			}
			printObjectJSON(appInfo)
			os.Exit(0)
		}

		if originAction != nil {
			return originAction(context)
		}
		return nil
	}

	return nil
}

type cliFlag interface {
	String() string
	Names() []string
	IsRequired() bool
	GetDefaultText() string
}

type baseCliFlag struct {
	f        cliFlag
	Type     string
	ItemType string
	Format   string
}

func parseSchemaOfCliFlags(cliFlags []cli.Flag) (string, error) {
	res := &jsonschema.Schema{
		Properties: orderedmap.New(),
		Type:       "object",
		Required:   []string{},
	}
	if res.Required == nil {
	}

	for _, v := range cliFlags {
		key, property, required, err := parseOneCliFlag(v)
		if err != nil {
			return "", err
		} else {
			res.Properties.Set(key, property)
			if required {
				res.Required = append(res.Required, key)
			}
		}
	}
	buff, err := res.MarshalJSON()
	if err != nil {
		return "", err
	}
	return string(buff), nil
}

func parseOneCliFlag(f cli.Flag) (key string, property *jsonschema.Schema, required bool, err error) {
	v := detectTypeOfCliFlag(f)
	if v == nil {
		err = errors.New("invalid cli.Flag")
		return
	}
	names := v.f.Names()
	key = names[0]
	required = v.f.IsRequired()
	description := v.f.String()
	descriptions := strings.Split(description, "\t")
	if len(descriptions) == 2 {
		description = descriptions[1]
	}

	property = &jsonschema.Schema{
		Title:       key,
		Type:        v.Type,
		Description: description,
		Format:      v.Format,
	}
	if v.Type == "array" {
		property.Items = &jsonschema.Schema{
			Type: v.ItemType,
		}
	}

	return
}

func detectTypeOfCliFlag(f cli.Flag) *baseCliFlag {
	var v cliFlag
	b := &baseCliFlag{}

	switch f.(type) {
	case *cli.Float64SliceFlag:
		v = f.(*cli.Float64SliceFlag)
		b.Type = "number"
	case *cli.GenericFlag:
		v = f.(*cli.GenericFlag)
		b.Type = "string"
	case *cli.Int64SliceFlag:
		v = f.(*cli.Int64SliceFlag)
		b.Type = "array"
		b.ItemType = "integer"
	case *cli.IntSliceFlag:
		v = f.(*cli.IntSliceFlag)
		b.Type = "array"
		b.ItemType = "integer"
	case *cli.PathFlag:
		v = f.(*cli.PathFlag)
		b.Type = "string"
	case *cli.StringSliceFlag:
		v = f.(*cli.StringSliceFlag)
		b.Type = "array"
		b.ItemType = "string"
	case *cli.TimestampFlag:
		v = f.(*cli.TimestampFlag)
		b.Type = "string"
		b.Format = "date-time"
	case *cli.Uint64SliceFlag:
		v = f.(*cli.Uint64SliceFlag)
		b.Type = "integer"
	case *cli.UintSliceFlag:
		v = f.(*cli.UintSliceFlag)
		b.Type = "array"
		b.ItemType = "integer"
	case *cli.BoolFlag:
		v = f.(*cli.BoolFlag)
		b.Type = "boolean"
	case *cli.Float64Flag:
		v = f.(*cli.Float64Flag)
		b.Type = "number"
	case *cli.IntFlag:
		v = f.(*cli.IntFlag)
		b.Type = "integer"
	case *cli.Int64Flag:
		v = f.(*cli.Int64Flag)
		b.Type = "integer"
	case *cli.StringFlag:
		v = f.(*cli.StringFlag)
		b.Type = "string"
	case *cli.DurationFlag:
		v = f.(*cli.DurationFlag)
		b.Type = "string"
	case *cli.UintFlag:
		v = f.(*cli.UintFlag)
		b.Type = "integer"
	case *cli.Uint64Flag:
		v = f.(*cli.Uint64Flag)
		b.Type = "integer"
	}
	if v == nil {
		return nil
	}
	b.f = v
	return b
}

func printSchema(v interface{}, options model.AppOptions) {
	s, err := getSchema(v)
	appInfo := &model.AppInfo{
		AppOptions: options,
		Type:       model.AppType_CfgFile,
	}
	if err != nil {
		appInfo.Code = -1
		appInfo.Error = err.Error()
		printObjectJSON(appInfo)
		return
	}
	appInfo.Schema = s
	printObjectJSON(appInfo)
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
