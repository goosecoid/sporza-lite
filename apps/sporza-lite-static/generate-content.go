package main

import (
	"bufio"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"os"
	"time"
)

type Article struct {
	Title   string `json:"title"`
	Intro   string `json:"intro"`
	Content string `json:"content"`
}

func main() {
	if _, err := os.Stat("data/articles.json"); errors.Is(err, os.ErrNotExist) {
		log.Println("No content in the /data folder to generate pages with. Aborting")
	} else {
		log.Println("Content found! Initializing content generating process")
	}
	log.Println("Reading file contents...")
	data, err := os.ReadFile("data/articles.json")
	if err != nil {
		log.Fatalf("Error while reading the file contents: %v", err)
	}
	if valid := json.Valid(data); !valid {
		log.Fatalf("JSON data is corrupted or invalid")
	}
	log.Println("Parsing JSON")
	var articles map[string]Article
	err = json.Unmarshal(data, &articles)
	if err != nil {
		log.Fatalf("Error while parsing JSON: %v", err)
	}
	log.Println("Generating html files")
	count := 1
	for key, article := range articles {
		log.Printf("Creating and writing file (%d/%d)", count, len(articles))
		frontMatter := []string{
			"---",
			fmt.Sprintf(`title: '%s'`, article.Title),
			fmt.Sprintf("date: %s", time.Now().UTC().String()),
			"draft: true", fmt.Sprintf("key: %s", key),
			"---",
		}
		file, err := os.OpenFile(fmt.Sprintf("content/posts/%s.html", key), os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0644)
		if err != nil {
			log.Fatalf("Error creating file: %v", err)
		}
		writer := bufio.NewWriter(file)
		for _, string := range frontMatter {
			_, err := writer.WriteString(string + "\n")
			if err != nil {
				log.Fatalf("Error writing to file %v", err)
			}
		}
		writer.Flush()
		file.Close()
		log.Println("File created successfully")
		count++
	}
	log.Println("Finished")
}
