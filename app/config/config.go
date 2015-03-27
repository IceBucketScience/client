package config

import (
	"log"

	"github.com/kelseyhightower/envconfig"
)

type Configuration struct {
	ClientPath string `envconfig:"CLIENT_PATH"`
	BaseUrl    string `envconfig:"BASE_URL"`
	Port       string `envconfig:"PORT"`

	FbAppId     string `envconfig:"FB_APP_ID"`
	FbAppSecret string `envconfig:"FB_APP_SECRET"`
}

//TODO: Lift this into a shared package

func GetConfigVars() *Configuration {
	var config Configuration
	err := envconfig.Process("", &config)
	if err != nil {
		log.Panicln(err)
	}

	//TODO: checks for missing env variables

	return &config
}
