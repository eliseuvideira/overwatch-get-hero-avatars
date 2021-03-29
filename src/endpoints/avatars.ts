import { endpoint } from '@ev-fns/endpoint';
import fs from 'fs';
import path from 'path';
import puppeteer from 'puppeteer';

const downloadImage = async (
  browser: puppeteer.Browser,
  url: { name: string; url: string },
) => {
  const filename = path.join(
    __dirname,
    '..',
    '..',
    'avatars',
    path.basename(url.name) + path.extname(url.url),
  );

  const page = await browser.newPage();

  page.setRequestInterception(true);

  page.on('request', (request) => {
    request.continue();
  });

  page.on('response', async (response) => {
    const responseUrl = await response.url();

    if (responseUrl === url.url) {
      const buffer = await response.buffer();

      await fs.promises.writeFile(filename, buffer);
    }
  });

  await page.goto(url.url);

  await page.close();

  return { name: url.name, filename };
};

export const avatarsPost = endpoint(async (req, res) => {
  const browser = await puppeteer.launch({
    headless: !!+(process.env.HEADLESS || 0),
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
    ],
  });

  try {
    const pages = await browser.pages();
    const page = pages[0];

    await page.goto('https://playoverwatch.com/en-us/heroes/ana/');

    await page.waitForSelector('.hero-portrait-image');

    const urls = await page.evaluate(() => {
      const portraits = Array.from(document.querySelectorAll('.hero-portrait'));

      const items = portraits.map((el) => ({
        label: el.querySelector('.hero-portrait-label') as HTMLSpanElement,
        portrait: el.querySelector('.hero-portrait-image') as HTMLDivElement,
      }));

      const getUrl = (str = '') => str.replace(/^url\("(.*)"\)$/, '$1');

      return items.map((item) => ({
        name: item.label.textContent || '',
        url: getUrl(item.portrait.style.backgroundImage),
      }));
    });

    const items = await Promise.all(
      urls.map((url) => downloadImage(browser, url)),
    );

    res.status(200).json(items);
  } finally {
    await browser.close();
  }
});
