import getArticles from './app/scraper'

getArticles().then(() => console.log("Process terminated. Exiting...\n"))
