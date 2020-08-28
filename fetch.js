const puppeteer = require('puppeteer');
//const fs = require('fs');
const { formatValue } = require('./helper');

module.exports.fetch = async (profile) => {
  await sleep(1000);
  const name = profile._name;
  const system = profile._system;

  console.log(`Running fetch for ${name}...`);
  console.log('Launching browser...');

  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    console.log('Navigating to page...');

    const page = await browser.newPage();

    await page.goto(
      `https://playoverwatch.com/en-us/career/${system}/${name}/`,
      {
        waitUntil: 'networkidle0',
      }
    );

    const NO_PROFILE = await page.evaluate(() => {
      const profileNotFound = document.querySelector('section > div > h1');
      if (profileNotFound) {
        return true;
      }
      return false;
    });

    if (await NO_PROFILE) {
      throw new Error(`No profile found for ${name} on system ${system}.`);
    }

    console.log('Getting heroes...');

    const HEROES = await page.evaluate(() =>
      Array.from(
        document.querySelectorAll('select[data-group-id="stats"] > option'),
        (option) => option.innerText
      )
    );

    console.log('Getting stats...');

    const HERO_STATS = await page.evaluate(() => {
      let characterStats = [];

      const STAT_DIVS = Array.from(
        document.querySelectorAll('div[data-group-id="stats"]'),
        (div) => div.childNodes
      );
      for (let i = 0; i < STAT_DIVS.length; i++) {
        let fields = {};
        STAT_DIVS[i].forEach((stat) => {
          stat
            .querySelectorAll('div > div > table > tbody > tr')
            .forEach((row) => {
              const key = row.cells[0].innerText.replace(/ /g, '\\ ');
              const value = row.cells[1].innerText;
              fields[key] = value;
            });
        });

        characterStats.push({
          measurement: '',
          tags: { character: '', playType: '', system: '' },
          fields,
        });
      }
      return characterStats;
    });

    let playType = 'QUICK\\ PLAY';

    console.log('Closing browser...');

    await browser.close();

    console.log('Formatting data...');

    for (let i = 0; i < HERO_STATS.length; i++) {
      let hero = HEROES[i];
      if (i > 0 && hero === 'ALL HEROES') {
        playType = 'COMPETITIVE\\ PLAY';
      }
      HERO_STATS[i].measurement = name;
      HERO_STATS[i].tags.character = hero.replace(/ /g, '\\ ');
      HERO_STATS[i].tags.playType = playType;
      HERO_STATS[i].tags.system = system;

      Object.keys(HERO_STATS[i].fields).map(
        (key) =>
          (HERO_STATS[i].fields[key] = formatValue(HERO_STATS[i].fields[key]))
      );
    }

    /*     fs.writeFile('./data.json', JSON.stringify(HERO_STATS), (err) =>
      console.log(err)
    ); */

    profile.stats = HERO_STATS;

    return;
  } catch (error) {
    await browser.close();
    if (error.message.includes('No profile')) {
      profile.noProfile = true;
      profile.stats = null;
      console.log(error.message);
      return;
    }
    return;
  }
};

function sleep(ms) {
  return new Promise((resolve) => {
    console.log(`Waiting ${ms / 1000} second(s) for project to load...`);
    setTimeout(resolve, ms);
  });
}
