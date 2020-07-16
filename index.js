const fetch = require('./fetch');

console.log("Waiting 10 seconds for startup to complete...")
setTimeout(() => fetch.fetch(), 10000);
