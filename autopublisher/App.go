package autopublisher

type App struct {
	plugins []Plugin
	config  Config
	source  *Source
}

func NewApp(plugins []Plugin) App {
	return App{plugins: plugins}
}
