var { eventPool } = require('../../services/eventService');

exports.sendJackpotEvent = async (data) => {
  eventPool.fireJackpotEvent(data);
};

exports.sendLatestWinnerEvent = async (data) => {
  eventPool.fireLastestWinnerEvent(data);
};
