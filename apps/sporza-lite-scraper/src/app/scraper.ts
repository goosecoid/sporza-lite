import * as puppeteer from 'puppeteer';
import { createHash } from 'crypto';
import { writeFileSync, readFileSync, existsSync } from 'fs';

type Article = {
    title: string;
    intro: string;
    content: string;
}

const getArticles = async (): Promise<void> => {
    const browser = await puppeteer.launch()
    const page = await browser.newPage()
    await page.goto('https://sporza.be/nl/pas-verschenen')

    const filteredHrefs = await page.$$eval('a', as => as.map(a => a.href)
        .filter(href => href.includes('2022') && !href.includes('bekijk') && !href.includes('categorie')))

    let articles: Record<string, Article> = {}

    if (existsSync('../../../sporza-lite-static/data/articles.json')) {
        const stringifiedArticles = readFileSync('../../../sporza-lite-static/data/articles.json', { encoding: 'utf8' })
        articles = JSON.parse(stringifiedArticles)
    }

    for (const href of filteredHrefs) {
        await page.goto(href, { waitUntil: 'networkidle0' })
        const title = await page.$eval('body > div > main > article > header > div.title', elem => elem.textContent)
        const intro = await page.$eval('body > div > main > article > section > div.vrt-article__intro', elem => elem.textContent)
        const content = await page.$eval('body > div > main > article > section > div.vrt-page__par', elem => elem.textContent)
        const article = { title: title.trim(), intro, content: content.includes('Gerelateerd') ? content.split('Gerelateerd')[0] : content }

        const hash = createHash('sha256');
        hash.update(title.trim());

        const key = hash.digest('hex')
        articles[key] = article
    }

    await page.close()
    await browser.close();

    writeFileSync('../../../sporza-lite-static/data/articles.json', JSON.stringify(articles), { encoding: 'utf8' })
}

export default getArticles;
