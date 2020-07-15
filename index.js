const puppeteer = require("puppeteer");
fs = require("fs");
(async (event) => {
  const browser = await puppeteer.launch();

  try {
    const page = await browser.newPage();
    await page.goto(
      `https://playoverwatch.com/en-us/career/pc/SneakyTurtle-1146956/`,
      { waitUntil: "networkidle0" }
    );

    const HEROES = await page.evaluate(() =>
      Array.from(
        document.querySelectorAll('select[data-group-id="stats"] > option'),
        (option) => option.innerText
      )
    );

    const HERO_STATS = await page.evaluate(() => {
      let characterStats = [];

      const STAT_DIVS = Array.from(
        document.querySelectorAll('div[data-group-id="stats"]'),
        (div) => div.childNodes
      );
      for (let i = 0; i < STAT_DIVS.length; i++) {
        let stats = {};
        STAT_DIVS[i].forEach((stat) => {
          stat
            .querySelectorAll("div > div > table > tbody > tr")
            .forEach((row) => {
              stats[row.cells[0].innerText] = row.cells[1].innerText;
            });
        });
        characterStats.push({
          character: "",
          playType: "",
          stats,
        });
      }
      return characterStats;
    });

    let playType = "QUICK PLAY";

    await browser.close();

    for (let i = 0; i < HERO_STATS.length; i++) {
      let hero = HEROES[i];
      if (i > 0 && hero === "ALL HEROES") {
        playType = "COMPETITIVE PLAY";
      }

      HERO_STATS[i].character = hero;
      HERO_STATS[i].playType = playType;
    }

    fs.writeFile("./data.json", JSON.stringify(HERO_STATS), (err) =>
      console.log(err)
    );
  } catch (error) {
    console.log(error);
    await browser.close();
  }
})();