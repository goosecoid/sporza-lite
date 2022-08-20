package main

import (
	"encoding/json"
	"fmt"
	"os"
	"strings"
	"sync"
	"time"

	"github.com/gocolly/colly/v2"
)

type Article struct {
	Title   string `json:"title"`
	Intro   string `json:"intro"`
	Content string `json:"content"`
}

func fetchLinks() {

	var mtx sync.Mutex

	count := 1
	articles := make([]Article, 100)

	c := colly.NewCollector(
		colly.AllowedDomains("sporza.be"),
		colly.MaxDepth(1),
	)

	c.Limit(&colly.LimitRule{
		Delay:       1 * time.Second,
		RandomDelay: 1 * time.Second,
	})

	c.OnHTML("article[id=main-content]", func(e *colly.HTMLElement) {
		var article Article
		article.Title = strings.TrimSpace(e.ChildText(".vrt-article__header"))
		article.Intro = strings.TrimSpace(e.ChildText(".vrt-article__intro"))
		article.Content = strings.TrimSpace(e.ChildText(".parbase"))
		if article.Title != "" || article.Content != "" || article.Intro != "" {
			articles = append(articles, article)
		}
	})

	c.OnHTML("li.sc-articleteasers__item > a", func(e *colly.HTMLElement) {
		link := e.Attr("href")
		if strings.Contains(link, "2022/08") {
			c.Visit(e.Attr("href"))
		}
	})

	c.OnResponse(func(r *colly.Response) {
		fmt.Printf("%d: Visiting: %s\n", count, r.Request.URL)
		count++
		if count == 101 {
			mtx.Lock()
			raw, err := json.MarshalIndent(articles, "", "")
			if err != nil {
				panic(err)
			}
			file, err := os.OpenFile("articles.json", os.O_RDWR|os.O_CREATE|os.O_TRUNC, 0755)
			if err != nil {
				panic(err)
			}
			_, err = file.Write(raw)
			if err != nil {
				panic(err)
			}
			defer file.Close()
			mtx.Unlock()
			os.Exit(0)
		}
	})

	c.Visit("https://sporza.be/nl/pas-verschenen/")
}

func main() {
	fetchLinks()
}
