const Web3 = require('web3');
const jackpotAbi = require('../abis/jackpot.json');
const colors = require('colors');
const { config } = require('../config');
const { getPotInfoBlock, updatePotInfoBlock } = require('../models/potInfo');
const { insertWinners } = require('../models/potWinners');

const { JACKPOT_EVENTS } = require('../utils/enums');
const { logError } = require('../utils/utils');

const { sendJackpotEvent } = require('../utils/events/event');
const { averageBlockTime } = require('../constants');
require('dotenv').config();

// const WSS_PROVIDER = process.env.WSS_PROVIDER;
// const POT_ADDRESS = process.env.POT_CONTRACT_ADDRESS;
// const options = {
//   keepalive: true,
//   keepaliveInterval: 30000,
//   maxReceivedFrameSize: 1833691,
//   maxReceivedMessageSize: 1833691,
//   reconnect: {
//     auto: true,
//     delay: 5000,
//     onTimeout: false,
//     maxAttempts: 5,
//   },
// };
// let web3 = new Web3(WSS_PROVIDER, options);

const web3 = new Web3(config.rpcUrl);
let potContract = new web3.eth.Contract(jackpotAbi, config.jackpotAddress);
let calculateWinnerSubscription;

const INFO_WINNER_EVENT_BLOCK_NAME = process.env.INFO_WINNER_EVENT_BLOCK_NAME;
const INFO_VALUE_COLUMN = process.env.INFO_VALUE_COLUMN;

async function getPastPotWinners(from, to) {
  console.log(colors.blue('Winner.js ~ Getting winners from: ' + from + '    to: ' + parseInt(parseInt(from) + 9000)));
  try {
    const results = await potContract.getPastEvents('CalculateWinner', {
      fromBlock: from,
      toBlock: Math.min(parseInt(from) + 9000, to),
    });

    if (results && results.length > 0) {
      console.log({ winners: results });
      storeWinners(results);
    }

    if (from + 9000 < to) {
      await getPastPotWinners(from + 9001, to);
    } else {
      console.log(colors.green('Winner.js ~ Done getting winners'));
    }
  } catch (error) {
    logError('winner.js : Error in getPastPotWinners() function', error);
  }
}

// function getPotWinners() {
//   try {
//     _web3.eth.getBlockNumber().then((blockNumber) => {
//       const from = parseInt(blockNumber) - 15;
//       console.log(colors.magenta('Winner.js ~ Started listening for calculate winner event'));
//       calculateWinnerSubscription = potContract.events
//         .CalculateWinner({ filter: {}, fromBlock: from }, function (error, result) {})
//         .on('data', (result_) => {
//           storeWinners([result_]);
//         })
//         .on('error', (error) => {
//           if (error.code != 1006) {
//             logError('winner.js : Error Listening for calculatewinner event', error);
//           }
//           unsubscribe(calculateWinnerSubscription);
//           reconnectWebSocket();
//           setTimeout(() => {
//             getPotWinners();
//           }, AVG_BLOCK_TIME);
//         });
//     });
//   } catch (error) {
//     logError('winner.js : Error in getPotWinners() function', error);
//     setTimeout(() => {
//       getPotWinners();
//     }, AVG_BLOCK_TIME);
//   }
// }

function storeWinners(winners) {
  try {
    if (winners.length == 0) {
      return;
    }

    insertWinners(winners, function (err, result) {
      if (err) {
        console.log(err);
      } else {
        console.log(colors.blue('Winner.js ~ insertWinners succesful'));
        sendJackpotEvent({
          eventName: JACKPOT_EVENTS.InsertWinner,
          winners,
        });
      }
    });
  } catch (error) {
    logError('winner.js : Error in storeWinners', error);
  }
}

function updateBlock(block) {
  try {
    updatePotInfoBlock({ block, name: INFO_WINNER_EVENT_BLOCK_NAME }, function (err, result) {
      if (err) {
        console.log(err);
        logError(sql, err);
      } else {
        console.log(colors.magenta('Winner.js ~ update winner_block succesful'));
      }
    });
  } catch (error) {
    logError('winner.js : Error in updateBlock', error);
  }
}

let running = false;

function start() {
  try {
    if (running) return;
    running = true;

    getPotInfoBlock({ name: INFO_WINNER_EVENT_BLOCK_NAME }, function (err, result) {
      if (err) {
        console.log(err);
      } else {
        let sqlresult = result.rows;
        web3.eth.getBlockNumber().then((blockNumber) => {
          const to = parseInt(blockNumber);
          console.log('Winner.js ~ getting event between: ', parseInt(sqlresult[0][INFO_VALUE_COLUMN]), ' and ', to);
          getPastPotWinners(parseInt(sqlresult[0][INFO_VALUE_COLUMN]), to).then(() => {
            updateBlock(to);
            running = false;
          });
        });
      }
    });
  } catch (error) {
    logError('winner.js : Error in start', error);
    running = false;
  }
}

function winnerStart() {
  try {
    start();
  } catch (error) {
    logError('winner.js : Error first time calling start', error);
  }

  setInterval(() => {
    try {
      start();
    } catch (error) {
      logError('winner.js : Error in interval calling start', error);
    }
  }, averageBlockTime);
}

module.exports = winnerStart;
