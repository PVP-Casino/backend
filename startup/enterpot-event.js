const Web3 = require('web3');
const potAbi = require('../abis/jackpot.json');
const colors = require('colors');

const { insertEntries } = require('../models/potEntries');
const { getPotInfoBlock, updatePotInfoBlock } = require('../models/potInfo');

const { logError } = require('../utils/utils');
const { JACKPOT_EVENTS } = require('../utils/enums');
const { sendJackpotEvent } = require('../utils/events/event');
const { config } = require('../config');
const { averageBlockTime } = require('../constants');
require('dotenv').config();

const options = {
  keepalive: true,
  keepaliveInterval: 30000,
  maxReceivedFrameSize: 1833691,
  maxReceivedMessageSize: 1833691,
  reconnect: {
    auto: true,
    delay: 5000,
    onTimeout: false,
    maxAttempts: 5,
  },
};

const web3 = new Web3(config.rpcUrl, options);
let potContract = new web3.eth.Contract(potAbi, config.jackpotAddress);
const INFO_ENTERPOT_EVENT_BLOCK_NAME = process.env.INFO_ENTERPOT_EVENT_BLOCK_NAME;
const INFO_VALUE_COLUMN = process.env.INFO_VALUE_COLUMN;

async function getPastPotEntries(from, to) {
  try {
    const results = await potContract.getPastEvents('EnteredPot', {
      fromBlock: parseInt(from),
      toBlock: Math.min(parseInt(from) + 9000, to),
    });
    console.log({ results, from, to });
    if (results && results.length > 0) {
      storeEntries(results);
    }
    if (from + 9000 < to) {
      await getPastPotEntries(from + 9001, to);
    } else {
      console.log(colors.green('enterpot-event.js ~ Done getting entries'));
    }
  } catch (error) {
    logError('enterpot-event.js : Error in getPastPotEntries() function', error);
  }
}

// function getPotEntries() {
//   try {
//     _web3.eth.getBlockNumber().then((blockNumber) => {
//       const from = parseInt(blockNumber) - 15;
//       console.log(colors.magenta('Started listening for EnteredPot event'));
//       // const potContract = new web3.eth.Contract(potAbi, POT_ADDRESS);
//       potEntriesSubscription = potContract.events
//         .EnteredPot({ filter: {}, fromBlock: from }, function (error, result) {})
//         .on('data', (result_) => {
//           console.log('enterpot-event.js ~ getPotEntries ~ => ', result_);
//           storeTokenTransfer([result_]);
//           try {
//             getPrice();
//           } catch (error) {
//             logError('enterpot-event.js : Some error calling getPrice', error);
//           }
//         })
//         .on('error', (error) => {
//           if (error.code != 1006) {
//             logError('enterpot-event.js : Error Listening for EnteredPot event', error);
//           }
//           unsubscribe(potEntriesSubscription);
//           reconnectWebSocket();
//           setTimeout(() => {
//             getPotEntries();
//           }, AVG_BLOCK_TIME);
//         });
//     });
//   } catch (error) {
//     unsubscribe(potEntriesSubscription);
//     logError('enterpot-event.js : Error in getPotEntries() function', error);
//     setTimeout(() => {
//       getPotEntries();
//     }, AVG_BLOCK_TIME);
//   }
// }

function storeEntries(Entries) {
  try {
    if (Entries.length == 0) {
      return;
    }

    insertEntries(Entries, function (err, result) {
      if (err) {
        console.log(err);
      } else {
        console.log(colors.blue('entry succesful'));
        sendJackpotEvent({
          eventName: JACKPOT_EVENTS.EnteredPot,
          entries: Entries,
        });
      }
    });
  } catch (error) {
    logError('enterpot-event.js : Error in storeEntries', error);
  }
}

function updateBlock(block) {
  try {
    updatePotInfoBlock({ block, name: INFO_ENTERPOT_EVENT_BLOCK_NAME }, function (err, result) {
      if (err) {
        console.log(err);
      } else {
        console.log(colors.magenta('update enterpot_block succesful'));
      }
    });
  } catch (error) {
    logError('enterpot-event.js : Error in updateBlock', error);
  }
}

let running = false;
function start() {
  try {
    if (running) return;
    running = true;
    getPotInfoBlock({ name: INFO_ENTERPOT_EVENT_BLOCK_NAME }, function (err, result) {
      if (err) {
        console.log(err);
      } else {
        let sqlresult = result.rows;
        web3.eth.getBlockNumber().then((blockNumber) => {
          console.log({ blockNumber });
          const to = parseInt(blockNumber);
          console.log('getting event between: ', parseInt(sqlresult[0][INFO_VALUE_COLUMN]), ' and ', blockNumber);
          getPastPotEntries(parseInt(sqlresult[0][INFO_VALUE_COLUMN]) + 1, to).then(() => {
            updateBlock(to);
            running = false;
          });
        });
      }
    });
  } catch (error) {
    logError('enterpot-event.js : Error in start', error);
    running = false;
  }
}

const potEventStart = () => {
  try {
    start();
  } catch (error) {
    logError('enterpot-event.js : Error first time calling start', error);
  }

  setInterval(() => {
    try {
      start();
    } catch (error) {
      logError('enterpot-event.js : Error in interval calling start', error);
    }
  }, averageBlockTime);
};

module.exports = potEventStart;
