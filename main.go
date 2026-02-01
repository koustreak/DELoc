package main

import (
	"log"

	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/options"
)

func main() {
	err := wails.Run(&options.App{
		Title:     "DELoc",
		Width:     1024,
		Height:    768,
		MinWidth:  800,
		MinHeight: 600,
	})
	if err != nil {
		log.Fatal(err)
	}
}
