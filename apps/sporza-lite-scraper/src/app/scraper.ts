import { createHash } from 'crypto';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import pino from 'pino';
import * as puppeteer from 'puppeteer';

type Article = {
    title: string;
    intro: string;
    content: string;
}

const getArticles = async (): Promise<void> => {
    const logger = pino();

    logger.info("Scraping newest content...")

    const browser = await puppeteer.launch()
    const page = await browser.newPage()
    await page.goto('https://sporza.be/nl/pas-verschenen')

    const filteredHrefs = await page.$$eval('a', as => as.map(a => a.href)
        .filter(href => href.includes('2022') && !href.includes('bekijk') && !href.includes('categorie')))

    logger.info(`Found ${filteredHrefs.length} items`)

    let articles: Record<string, Article> = {}

    logger.info(`Retrieving cached items...`)
    if (existsSync('../../../sporza-lite-static/data/articles.json')) {
        const stringifiedArticles = readFileSync('../../../sporza-lite-static/data/articles.json', { encoding: 'utf8' })
        articles = JSON.parse(stringifiedArticles)
        logger.info("Found ${Object.values(articles).length} cached items")
    } else {
        logger.info("No cached items found")
    }

    logger.info("Visiting new found items and stripping it's text contents")
    let count = 1;
    for (const href of filteredHrefs) {
        logger.info(`Item ${count}: Fetching text contents...`)
        try {
            await page.goto(href, { waitUntil: 'networkidle0' })
            const title = await page.$eval('body > div > main > article > header > div.title', elem => elem.textContent)
            const intro = await page.$eval('body > div > main > article > section > div.vrt-article__intro', elem => elem.textContent)
            const content = await page.$eval('body > div > main > article > section > div.vrt-page__par', elem => elem.textContent)
            const article = { title: title.trim(), intro, content: content.includes('Gerelateerd') ? content.split('Gerelateerd')[0] : content }

            const hash = createHash('sha256');
            hash.update(title.trim());

            const key = hash.digest('hex')
            articles[key] = article
            logger.info(`Item ${count}: Success: ${article.title.slice(0, 12) + "..."}`)
            count++
        } catch (e) {
            logger.error(`Failed to fetch text contents: ${e}`)
            count++
        }
    }

    logger.info("Finishing session and writing contents to file")
    await page.close()
    await browser.close();

    try {
        writeFileSync('./apps/sporza-lite-static/data/articles.json', JSON.stringify(articles), { encoding: 'utf8' })
    } catch (e) {
        logger.error(`Error writing data to file: ${e}`)
    }
    logger.info(`Successfully wrote ${Object.values(articles).length} items`)
}

export default getArticles;
