package sourcewordpress

import (
	"fmt"

	"github.com/Jblew/socialmedia-autopublisher-cli/autopublisher"
)

type SourceWordpressPlugin struct {
}

func (plugin *SourceWordpressPlugin) GetName() string {
	return "wordpress"
}

func (plugin *SourceWordpressPlugin) GetEmptyConfig() interface{} {
	return Config{}
}

func (plugin *SourceWordpressPlugin) NewSource(config interface{}) (autopublisher.Source, error) {
	configTyped, ok := config.(Config)
	if !ok {
		return &source{}, fmt.Errorf("Wrong config type for SourceWordpressPlugin")
	}
	return &source{config: configTyped}, nil
}

var _checkImplementsPlugin autopublisher.Plugin = &SourceWordpressPlugin{}
var _checkImplementsPluginSource autopublisher.PluginSource = &SourceWordpressPlugin{}
