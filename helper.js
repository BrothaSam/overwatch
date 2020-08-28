const moment = require('moment');

module.exports.formatValue = (value) => {
  if (value.includes(':')) {
    return moment.duration(value).asSeconds();
  } else if (value.includes('%')) {
    return value.replace('%', '') / 100;
  } else {
    return Number(value);
  }
};
