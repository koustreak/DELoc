package main

import (
	"context"
	"embed"
	"log"

	"deloc/internal/system"

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
	// Initialize enterprise-grade system monitor
	sysMonitor := system.NewManager()

	err := wails.Run(&options.App{
		Title:            "DELoc",
		Width:            1280,
		Height:           800,
		MinWidth:         800,
		MinHeight:        600,
		Frameless:        true,
		WindowStartState: options.Normal,
		AssetServer: &assetserver.Options{
			Assets: assets,
		},
		Linux: &linux.Options{
			Icon:        icon,
			ProgramName: "deloc",
		},
		OnStartup: func(ctx context.Context) {
			// Start the background monitoring loop
			sysMonitor.Start(ctx)
		},
	})
	if err != nil {
		log.Fatal(err)
	}
}
