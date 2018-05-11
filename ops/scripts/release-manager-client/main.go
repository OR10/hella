package main

import (
	apiclient "api/client/version_semantic"
	"api/models"
	"fmt"
	"github.com/go-openapi/runtime"
	httptransport "github.com/go-openapi/runtime/client"
	"github.com/go-openapi/strfmt"
	"gopkg.in/yaml.v2"
	"io/ioutil"
	"log"
	"os"
	"os/exec"
	"regexp"
	"strings"
)

type relmConfig struct {
	ProjectUUID string `yaml:"project_uuid"`
	Major       uint32 `yaml:"major"`
	Minor       uint32 `yaml:"minor"`
	Docker      struct {
		Images []string `yaml:"images"`
	} `yaml:"docker"`
}

func runShellUnsafe(cmd string) ([]byte, error) {
	out, err := exec.Command("bash", "-c", cmd).CombinedOutput()

	return out, err
}

func runShell(cmd string) []byte {
	log.Printf("Run bash command: %s", cmd)
	out, err := exec.Command("bash", "-c", cmd).CombinedOutput()
	log.Printf("Output begin: \r\n %s\r\nOutput end", out)

	if err != nil {
		log.Fatal(err.Error())
		panic(err)
	}
	return out
}

func pushToGit(version string) {
	log.Println("=========================================")
	log.Printf("pushing tag %s", version)
	log.Println("=========================================")
	runShellUnsafe(fmt.Sprintf("git tag -d %s", version))

	runShellUnsafe(fmt.Sprintf("git push origin :refs/tags/%s", version))

	runShell(fmt.Sprintf("git tag %s", version))

	runShell(fmt.Sprintf("git push origin tag %s", version))

	log.Println("=========================================")
	log.Printf("pushing tag %s Done", version)
	log.Println("=========================================")
}

func pushToDockerHub(version string, config relmConfig) {
	log.Println("=========================================")
	log.Printf("pushing version %s to hub.docker.com started", version)
	log.Println("=========================================")

	for _, defaultImgName := range config.Docker.Images {
		var re = regexp.MustCompile(`:\w.+`)
		imgToPush := string(re.ReplaceAll([]byte(defaultImgName), []byte("")))

		runShell(fmt.Sprintf("docker tag %s %s:%s", defaultImgName, imgToPush, version))
		runShell(fmt.Sprintf("docker push %s:%s", imgToPush, version))
	}

	log.Println("\r\n\r\n=========================================")
	log.Printf("pushing version %s to hub.docker.com done", version)
	log.Println("=========================================\r\n\r\n")
}

func getRelmConfig() relmConfig {
	data, err := ioutil.ReadFile(".release-manager.yml")
	if err != nil {
		fmt.Print(err)
		panic(err)
	}

	config := relmConfig{}
	err = yaml.Unmarshal([]byte(data), &config)
	if err != nil {
		log.Fatalf("error: %v", err)
		panic(err)
	}

	fmt.Printf("%v", config)

	return config
}

func main() {

	config := getRelmConfig()

	// create the transport
	transport := httptransport.New("localhost", "", nil)
	transport.Producers["application/release-manager.v1+json"] = runtime.JSONProducer()
	transport.Consumers["application/release-manager.v1+json"] = runtime.JSONConsumer()

	// create the API client, with the transport
	client := apiclient.New(transport, strfmt.Default)

	params := apiclient.NewSemverGenerateParamsWithTimeout(10000000000)
	params.ProjectUUID = strfmt.UUID(config.ProjectUUID)

	//branchName := strings.TrimSpace(string(runShell("git branch | grep \\* | cut -d\" \" -f2")))
	branchName := strings.Replace(os.Getenv("GIT_BRANCH"), "origin/", "",1)
	params.Body = &models.SemverGenerateParams{
		Branch: branchName,
		Major:  config.Major,
		Minor:  config.Minor,
	}

	// make the request to get all items
	resp, err := client.SemverGenerate(params)
	if err != nil {
		log.Fatal(err)
		panic(err)
	}

	fmt.Printf("%#v\n", resp.Payload)

	for _, version := range resp.Payload.All {
		pushToGit(version)
		pushToDockerHub(version, config)
	}
}
