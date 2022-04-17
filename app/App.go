package app

type App struct {
	config Config
}

func NewApp(config Config) App {
	return App{config: config}
}
