const { fetch } = require('./fetch');
const Influxdb = require('influxdb-v2');
const config = require('./config.json');
const Profile = require('./Profile');
require('dotenv').config({ path: `.env.${process.env.NODE_ENV}` });

const influx = new Influxdb({
  host: process.env.DB_HOST,
  token: process.env.DB_TOKEN,
  port: process.env.DB_PORT || 9999,
  protocol: 'http',
});

const ORG = config.org;
const BUCKET = config.bucket;
let profileArray = [];

//map profiles from config file to array of profiles;
config.profiles.map((profile) => {
  const name = profile.name;
  profile.systems.map((system) => {
    const profileObject = new Profile({ name, system });
    profileArray.push(profileObject);
  });
});

//wrap fetch in function so that Promise.all can be used.
profileArray.map((profile) => {
  profile.fetch = () => fetch(profile);
});

//Promise.all triggers fetch operation and waits until they all resolve. Fetch always resolves, never rejects.
Promise.all(profileArray.map((profile) => profile.fetch())).then((res) => {
  const STATS = [];
  //if stats isn't null, then add to constant STATS
  profileArray.map((profile) => {
    if (profile.stats) {
      STATS.push(...profile.stats);
    }
  });

  console.log('Writing to database...');

  influx
    .write(
      {
        org: ORG,
        bucket: BUCKET,
      },
      STATS
    )
    .catch((error) => {
      console.error(error.message);
      console.log('Write to database FAILED!');
      process.exit(1);
    });
});

process.on('exit', (code) => {
  return console.log(`Exiting with code ${code}.`);
});
