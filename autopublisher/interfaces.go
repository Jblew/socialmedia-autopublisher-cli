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

type Source interface {
	FetchNewsfeed() Newsfeed
}
