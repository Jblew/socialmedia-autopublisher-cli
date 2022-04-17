package autopublisher

import "time"

type Newsfeed struct {
	News []Article
}

type Article struct {
	Title  string
	Date   time.Time
	Fields map[string]interface{}
}

type Plugin interface {
	GetName() string
	GetEmptyConfig() interface{}
}

type PluginSource interface {
	Plugin
	NewSource(config interface{}) (Source, error)
}

type Source interface {
	FetchNewsfeed() (Newsfeed, error)
}
