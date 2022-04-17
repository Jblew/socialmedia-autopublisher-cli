package sourcewordpress

import (
	"fmt"

	"github.com/Jblew/socialmedia-autopublisher-cli/autopublisher"
)

type source struct {
	config Config
}

func (source *source) FetchNewsfeed() (autopublisher.Newsfeed, error) {
	return autopublisher.Newsfeed{}, fmt.Errorf(("Not implemented yet"))
}

var _checkImplementsSource autopublisher.Source = &source{}
