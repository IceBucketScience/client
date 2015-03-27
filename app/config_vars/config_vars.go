package configVars

type Configuration struct {
	ClientPath string `envconfig:"CLIENT_PATH"`
	BaseUrl    string `envconfig:"BASE_URL"`
	Port       string `envconfig:"PORT"`

	FbAppId     string `envconfig:"FB_APP_ID"`
	FbAppSecret string `envconfig:"FB_APP_SECRET"`
}
