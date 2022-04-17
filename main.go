package main

import (
	"log"
	"os"

	"github.com/Jblew/socialmedia-autopublisher-cli/autopublisher"
	"github.com/urfave/cli/v2"
)

var verbose bool = false

func main() {
	cliApp := &cli.App{
		Name:  "publish",
		Usage: "publishes to a socialmedia feed",
		Action: func(c *cli.Context) error {
			configFile := c.Args().Get(0)
			config, err := autopublisher.LoadConfigFromFile(configFile)
			if err != nil {
				return err
			}
			autopublisherApp := autopublisher.NewApp(config)
			return autopublisherApp.Publish()
		},
	}

	err := cliApp.Run(os.Args)
	if err != nil {
		log.Fatal(err)
	}
}
