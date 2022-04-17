package autopublisher

import (
	"io/ioutil"

	"gopkg.in/yaml.v2"
)

// Config
type Config struct {
	BibPath     string `yaml:"bibPath"`
	OutlineFile string `yaml:"outlinePath"`
	OutFile     string `yaml:"outPath"`
}

func LoadConfigFromFile(configPath string) (Config, error) {
	contents, err := ioutil.ReadFile(configPath)
	if err != nil {
		return Config{}, err
	}

	c := Config{}
	err = yaml.Unmarshal(contents, &c)
	return c, err
}
