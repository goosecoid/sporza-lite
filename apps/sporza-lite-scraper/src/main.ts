import getArticles from './app/scraper'

getArticles()
    .finally(() => console.log("\nDone !"))
