# Overwatch
## Overview
Overwatch is a scraping tool to pull player data for the game Overwatch and persist in an InfluxDB instance for time series analysis. Overwatch does not have an API available, and other user built APIs do not have a time series option. This tool will allow a player to analyze their personal and/or team's data over time to determine what strategies are (or aren't) working. Example profile page to be scraped: https://playoverwatch.com/en-us/career/pc/SneakyTurtle-1146956/. Data is broken down by player, character, field, play type and system. Compare players against eachother, your performance by character, or even cross system to find where you should be playing! 

---

## Setup
1. Create a config.json file in the root project directory based on the example provided in config.json.example. 
2. See Influx documentation to get a DB instance set up:   https://docs.influxdata.com/influxdb/v2.0/.
3. Create a .env file in the root project direcotry based on the example provided in .env.example and the host, port, and token of the Influx DB you set up in step 2.
4. Start the server and watch your data come in! Run ad-hoc queries or make custom dashboards for easy analysis!

---

## Example Queries

### Damage done of one character for one player on PC in both play types.
![Alt text](/resources/example-1.PNG?raw=true)

### Damage done of multiple characters for one player on PC in both play types.
![Alt text](/resources/example-2.PNG?raw=true)
