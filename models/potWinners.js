var { executeQuery } = require('./db');
require('dotenv').config();

var { logError } = require('../utils/utils');

const POT_WINNERS_INFO_TABLE = process.env.POT_WINNERS_INFO_TABLE;
const POT_WINNERS_ROUND_COLUMN = process.env.POT_WINNERS_ROUND_COLUMN;
const POT_WINNERS_VALUE_COLUMN = process.env.POT_WINNERS_VALUE_COLUMN;
const POT_WINNERS_AMOUNT_COLUMN = process.env.POT_WINNERS_AMOUNT_COLUMN;
const POT_WINNERS_AMOUNT_WON_COLUMN = process.env.POT_WINNERS_AMOUNT_WON_COLUMN;
const POT_WINNERS_PARTICIPANTS_COLUMN = process.env.POT_WINNERS_PARTICIPANTS_COLUMN;
const POT_WINNERS_WINNER_COLUMN = process.env.POT_WINNERS_WINNER_COLUMN;
const POT_WINNERS_PLSP_BONUS_COLUMN = process.env.POT_WINNERS_PLSP_BONUS_COLUMN;
const POT_WINNERS_TX_COLUMN = process.env.POT_WINNERS_TX_COLUMN;
const POT_WINNERS_BLOCK_COLUMN = process.env.POT_WINNERS_BLOCK_COLUMN;

const P_PHASE_INITIAL_BONUS = process.env.P_PHASE_INITIAL_BONUS;
const P_PHASE_BONUS_DIVISION = process.env.P_PHASE_BONUS_DIVISION;
const P_PHASE_MAX_BONUS = process.env.P_PHASE_MAX_BONUS;

const REFERRAL_BONUS_PERCENTAGE = process.env.REFERRAL_BONUS_PERCENTAGE;
const REFERRAL_INFO_USERS_COLUMN = process.env.REFERRAL_INFO_USERS_COLUMN;

const REFERRALS_TABLE = process.env.REFERRALS_TABLE;
const REFERRALS_CODE_COLUMN = process.env.REFERRALS_CODE_COLUMN;
const REFERRALS_ADDRESS_COLUMN = process.env.REFERRALS_ADDRESS_COLUMN;

const JSON_TOTAL_PLSP_CLAIM_KEY = process.env.JSON_TOTAL_PLSP_CLAIM_KEY;

exports.insertWinners = async (winners, callback) => {
  var query =
    'INSERT IGNORE INTO `' +
    POT_WINNERS_INFO_TABLE +
    '` (`' +
    POT_WINNERS_ROUND_COLUMN +
    '`, `' +
    POT_WINNERS_VALUE_COLUMN +
    '`, `' +
    POT_WINNERS_AMOUNT_COLUMN +
    '`, `' +
    POT_WINNERS_AMOUNT_WON_COLUMN +
    '`, `' +
    POT_WINNERS_PARTICIPANTS_COLUMN +
    '`, `' +
    POT_WINNERS_WINNER_COLUMN +
    '`, `' +
    POT_WINNERS_TX_COLUMN +
    '`, `' +
    POT_WINNERS_BLOCK_COLUMN +
    '`) VALUES ';

  var values = '';
  for (let index = 0; index < winners.length; index++) {
    values +=
      " ('" +
      winners[index].returnValues.roundId +
      "', '" +
      winners[index].returnValues.total +
      "', '" +
      winners[index].returnValues.user +
      "', '" +
      winners[index].returnValues.reward;
    values +=
      "', '" +
      0 +
      "', '" +
      winners[index].returnValues.winner +
      "', '" +
      winners[index].transactionHash +
      "', '" +
      winners[index].blockNumber +
      "')" +
      (index + 1 < winners.length ? ', ' : '');
  }

  query += values;
  try {
    executeQuery(query, [], function (err, result) {
      if (err) {
        console.log('ERROR: in potWinners.js ~ insertWinners => ', err);
        logError(query, err);
        callback(err);
      } else {
        callback(null, result);
      }
    });
  } catch (error) {
    console.log('ERROR: in potWinner.js ~ insertWinners in DB connection => ', error);
    callback(error);
  }
};

exports.getWinAmount = async (data, callback) => {
  // Get the amunt of amountwon plus plspbonus

  var query =
    'SELECT count(*) AS count, SUM(' +
    POT_WINNERS_PLSP_BONUS_COLUMN +
    ') AS ' +
    POT_WINNERS_PLSP_BONUS_COLUMN +
    ',  SUM(' +
    POT_WINNERS_AMOUNT_WON_COLUMN +
    ') AS ' +
    POT_WINNERS_AMOUNT_WON_COLUMN +
    ' FROM `' +
    POT_WINNERS_INFO_TABLE +
    '` WHERE ' +
    POT_WINNERS_WINNER_COLUMN +
    ' LIKE ?';

  try {
    executeQuery(query, [data.address], function (err, result) {
      if (err) {
        console.log('ERROR: in potWinners.js ~ getWinAmount => ', err);
        logError(query, err);
        callback(err);
      } else {
        callback(null, result);
      }
    });
  } catch (error) {
    console.log('ERROR: in potWinner.js ~ insertWinners in DB connection => ', error);
    callback(error);
  }
};

exports.getActRefUserResult = async (data, callback) => {
  var query =
    'SELECT SUM(' +
    POT_WINNERS_PLSP_BONUS_COLUMN +
    ') * ' +
    REFERRAL_BONUS_PERCENTAGE +
    'AS ' +
    POT_WINNERS_PLSP_BONUS_COLUMN +
    ', COUNT(DISTINCT ' +
    POT_WINNERS_WINNER_COLUMN +
    ') AS ' +
    REFERRAL_INFO_USERS_COLUMN +
    ' FROM  ' +
    POT_WINNERS_INFO_TABLE +
    ' WHERE ' +
    POT_WINNERS_WINNER_COLUMN +
    ' IN(SELECT ' +
    REFERRALS_ADDRESS_COLUMN +
    ' FROM ' +
    REFERRALS_TABLE +
    ' WHERE ' +
    REFERRALS_CODE_COLUMN +
    ' LIKE ?)';

  try {
    executeQuery(query, [data.code], function (err, result) {
      if (err) {
        console.log('ERROR: in potWinners.js ~ getActRefUserResult => ', err);
        callback(err);
      } else {
        callback(null, result);
      }
    });
  } catch (error) {
    console.log('ERROR: in potWinner.js ~ getActRefUserResult in DB connection => ', error);
    callback(error);
  }
};

exports.getPlspBonus = async (callback) => {
  var query =
    'SELECT SUM(' +
    POT_WINNERS_PLSP_BONUS_COLUMN +
    ') * ' +
    REFERRAL_BONUS_PERCENTAGE +
    'AS ' +
    POT_WINNERS_PLSP_BONUS_COLUMN +
    ' FROM  ' +
    POT_WINNERS_INFO_TABLE +
    ' WHERE ' +
    POT_WINNERS_WINNER_COLUMN +
    ' IN(SELECT ' +
    REFERRALS_ADDRESS_COLUMN +
    ' FROM ' +
    REFERRALS_TABLE +
    ' WHERE 1 ) ';

  try {
    executeQuery(query, [], function (err, result) {
      if (err) {
        console.log('ERROR: in potWinners.js ~ getPlspBonus => ', err);
        callback(err);
      } else {
        callback(null, result);
      }
    });
  } catch (error) {
    console.log('ERROR: in potWinner.js ~ getPlspBonus in DB connection => ', error);
    callback(error);
  }
};

exports.getpphaseWC = async (callback) => {
  var query =
    'SELECT COUNT(DISTINCT winner) AS pphaseWC FROM(SELECT`winner` FROM pot_winners AS address union select address from referrals  AS address) t;';

  try {
    executeQuery(query, [], function (err, result) {
      if (err) {
        console.log('ERROR: in potWinners.js ~ getpphaseWC => ', err);
        callback(err);
      } else {
        callback(null, result);
      }
    });
  } catch (error) {
    console.log('ERROR: in potWinner.js ~ getpphaseWC in DB connection => ', error);
    callback(error);
  }
};

exports.getPlspClaimed = async (callback) => {
  var query =
    'SELECT SUM(' +
    POT_WINNERS_PLSP_BONUS_COLUMN +
    ') AS ' +
    JSON_TOTAL_PLSP_CLAIM_KEY +
    ' FROM  `' +
    POT_WINNERS_INFO_TABLE +
    '` ;';

  try {
    executeQuery(query, [], function (err, result) {
      if (err) {
        console.log('ERROR: in potWinners.js ~ getPlspClaimed => ', err);
        callback(err);
      } else {
        callback(null, result);
      }
    });
  } catch (error) {
    console.log('ERROR: in potWinner.js ~ getPlspClaimed in DB connection => ', error);
    callback(error);
  }
};

exports.getWinners = async (data, callback) => {
  var query =
    'SELECT * FROM ' +
    POT_WINNERS_INFO_TABLE +
    ' WHERE ' +
    POT_WINNERS_ROUND_COLUMN +
    ' BETWEEN ? AND ?' +
    ' ORDER BY  ' +
    POT_WINNERS_ROUND_COLUMN +
    ' ASC';

  try {
    executeQuery(query, [data.start, data.stop], function (err, result) {
      if (err) {
        console.log('ERROR: in potWinners.js ~ getWinners => ', err);
        callback(err);
      } else {
        callback(null, result);
      }
    });
  } catch (error) {
    console.log('ERROR: in potWinner.js ~ getWinners in DB connection => ', error);
    callback(error);
  }
};

exports.getWinnerData = async (callback) => {
  var query =
    'SELECT DISTINCT(winner) AS winner, SUM(amountwon)/1000000000000000000 AS amountwon, SUM(value)/1000000000000000000 - SUM(amountwon)/1000000000000000000 as fees FROM `pot_winners` WHERE 1 GROUP BY winner ORDER BY winner DESC limit 50000;';

  try {
    executeQuery(query, [], function (err, result) {
      if (err) {
        console.log('ERROR: in potWinners.js ~ getWinnerData => ', err);
        callback(err);
      } else {
        callback(null, result);
      }
    });
  } catch (error) {
    console.log('ERROR: in potWinner.js ~ getWinnerData in DB connection => ', error);
    callback(error);
  }
};

// highestWon, minChance, totalFees
exports.getPotWinInfo = async (callback) => {
  var query =
    'SELECT MAX(`pot_winners`.amountwon)/1000000000000000000 AS highestWon, MIN(`pot_winners`.`amount`/`pot_winners`.`amountWon`) AS minChance , SUM(`pot_winners`.`value` - `pot_winners`.`amountWon`)/1000000000000000000 AS totalFees  FROM `pot_winners` WHERE 1';

  try {
    executeQuery(query, [], function (err, result) {
      if (err) {
        console.log('ERROR: in potWinners.js ~ getPotWinInfo => ', err);
        callback(err);
      } else {
        callback(null, result);
      }
    });
  } catch (error) {
    console.log('ERROR: in potWinner.js ~ getPotWinInfo in DB connection => ', error);
    callback(error);
  }
};

// highestWon, minChance, totalFees For Today
exports.getPotWinInfoToday = async (callback) => {
  var query =
    "SELECT MAX(`pot_winners`.amountwon)/1000000000000000000 AS highestWon, MIN(`pot_winners`.`amount`/`pot_winners`.`amountWon`) AS minChance , SUM(`pot_winners`.`value` - `pot_winners`.`amountWon`)/1000000000000000000 AS totalFees FROM `pot_winners` WHERE block > (SELECT `value` FROM pot_info WHERE `name`='today')";

  try {
    executeQuery(query, [], function (err, result) {
      if (err) {
        console.log('ERROR: in potWinners.js ~ getPotWinInfoToday => ', err);
        callback(err);
      } else {
        callback(null, result);
      }
    });
  } catch (error) {
    console.log('ERROR: in potWinner.js ~ getPotWinInfoToday in DB connection => ', error);
    callback(error);
  }
};

exports.getHighestWon = async (callback) => {
  var query =
    'SELECT * FROM `pot_winners` WHERE `pot_winners`.amountwon = (SELECT MAX(`pot_winners`.amountwon) FROM `pot_winners`)';

  try {
    executeQuery(query, [], function (err, result) {
      if (err) {
        console.log('ERROR: in potWinners.js ~ getHighestWon => ', err);
        callback(err);
      } else {
        callback(null, result);
      }
    });
  } catch (error) {
    console.log('ERROR: in potWinner.js ~ getHighestWon in DB connection => ', error);
    callback(error);
  }
};

exports.getHighestWonToday = async (callback) => {
  var query =
    "SELECT * FROM `pot_winners` WHERE `pot_winners`.amountwon = (SELECT MAX(`pot_winners`.amountwon) FROM `pot_winners` WHERE block > (SELECT `value` FROM pot_info WHERE `name`='today')) AND block > (SELECT `value` FROM pot_info WHERE `name`='today')";

  try {
    executeQuery(query, [], function (err, result) {
      if (err) {
        console.log('ERROR: in potWinners.js ~ getHighestWonToday => ', err);
        callback(err);
      } else {
        callback(null, result);
      }
    });
  } catch (error) {
    console.log('ERROR: in potWinner.js ~ getHighestWonToday in DB connection => ', error);
    callback(error);
  }
};

exports.getMinChance = async (callback) => {
  var query =
    'SELECT * FROM `pot_winners` WHERE (`pot_winners`.`amount`/`pot_winners`.`amountWon`) = (SELECT MIN(`pot_winners`.`amount`/`pot_winners`.`amountWon`) FROM `pot_winners`)';

  try {
    executeQuery(query, [], function (err, result) {
      if (err) {
        console.log('ERROR: in potWinners.js ~ getMinChance => ', err);
        callback(err);
      } else {
        callback(null, result);
      }
    });
  } catch (error) {
    console.log('ERROR: in potWinner.js ~ getMinChance in DB connection => ', error);
    callback(error);
  }
};

exports.getMinChanceToday = async (callback) => {
  var query =
    "SELECT * FROM `pot_winners` WHERE (`pot_winners`.`amount`/`pot_winners`.`amountWon`) = (SELECT MIN(`pot_winners`.`amount`/`pot_winners`.`amountWon`) FROM `pot_winners` WHERE block > (SELECT `value` FROM pot_info WHERE `name`='today')) AND block > (SELECT `value` FROM pot_info WHERE `name`='today')";

  try {
    executeQuery(query, [], function (err, result) {
      if (err) {
        console.log('ERROR: in potWinners.js ~ getMinChanceToday => ', err);
        callback(err);
      } else {
        callback(null, result);
      }
    });
  } catch (error) {
    console.log('ERROR: in potWinner.js ~ getMinChanceToday in DB connection => ', error);
    callback(error);
  }
};

exports.getLatestJackpotWinner = async (callback) => {
  var query = `SELECT * FROM ${POT_WINNERS_INFO_TABLE} ORDER BY ${POT_WINNERS_ROUND_COLUMN} DESC LIMIT 1`;

  try {
    executeQuery(query, [], function (err, result) {
      if (err) {
        console.log('ERROR: in potWinners.js ~ getLatestJackpotWinner => ', err);
        callback(err);
      } else {
        callback(null, result);
      }
    });
  } catch (error) {
    console.log('ERROR: in potWinner.js ~ getLatestJackpotWinner in DB connection => ', error);
    callback(error);
  }
};
