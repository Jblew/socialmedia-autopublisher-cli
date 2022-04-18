package autopublisher

import (
	"io/ioutil"

	"gopkg.in/yaml.v2"
)

// Config
type Config struct {
	Source struct {
		Name string `yaml:"source" json:"source"`
	}
}

type SourceConfig struct {
	Name   string      `yaml:"name" json:"name"`
	Config interface{} `yaml:"config" json:"config"`
}

func (app App) LoadConfigFromFile(configPath string) (Config, error) {
	contents, err := ioutil.ReadFile(configPath)
	if err != nil {
		return Config{}, err
	}

	c := Config{}
	err = yaml.Unmarshal(contents, &c)
	return c, err
}
