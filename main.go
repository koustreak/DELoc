package main

import (
	"embed"
	"log"

	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
	"github.com/wailsapp/wails/v2/pkg/options/linux"
)

//go:embed all:ui/dist
var assets embed.FS

//go:embed build/appicon.png
var icon []byte

func main() {
	err := wails.Run(&options.App{
		Title:     "DELoc",
		Width:     1024,
		Height:    768,
		MinWidth:  800,
		MinHeight: 600,
		AssetServer: &assetserver.Options{
			Assets: assets,
		},
		Linux: &linux.Options{
			Icon:        icon,
			ProgramName: "deloc",
		},
	})
	if err != nil {
		log.Fatal(err)
	}
}
