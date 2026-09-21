package main

import (
	"context"
	"embed"
	"log"

	"deloc/src/bindings"
	"deloc/src/states"
	"deloc/src/system"

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
	// Initialize persistent bbolt store
	stateStore, err := states.NewStore()
	if err != nil {
		log.Printf("Warning: failed to initialize state store: %v", err)
	} else {
		defer stateStore.Close()
	}

	// Initialize enterprise-grade system monitor
	sysMonitor := system.NewManager()
	appService := bindings.NewService(stateStore)

	err = wails.Run(&options.App{
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
			appService.Startup(ctx)
			// Start the background monitoring loop
			sysMonitor.Start(ctx)
		},
		Bind: []interface{}{
			appService,
		},
	})
	if err != nil {
		log.Fatal(err)
	}
}
