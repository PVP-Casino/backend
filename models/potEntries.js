var { executeQuery } = require('./db');
require('dotenv').config();

var { logError } = require('../utils/utils');

const POTENTRIES_INFO_TABLE = process.env.POTENTRIES_INFO_TABLE;
const POTENTRIES_COUNT_COLUMN = process.env.POTENTRIES_COUNT_COLUMN;
const POTENTRIES_ADDRESS_COLUMN = process.env.POTENTRIES_ADDRESS_COLUMN;
const POTENTRIES_TOKEN_COLUMN = process.env.POTENTRIES_TOKEN_COLUMN;
const POTENTRIES_VALUE_COLUMN = process.env.POTENTRIES_VALUE_COLUMN;
const POTENTRIES_USD_VALUE_COLUMN = process.env.POTENTRIES_USD_VALUE_COLUMN;
const POTENTRIES_ROUND_COLUMN = process.env.POTENTRIES_ROUND_COLUMN;
const POTENTRIES_BLOCK_COLUMN = process.env.POTENTRIES_BLOCK_COLUMN;
const POTENTRIES_TX_COLUMN = process.env.POTENTRIES_TX_COLUMN;

exports.insertEntries = async (Entries, callback) => {
  var query =
    'INSERT IGNORE INTO `' +
    POTENTRIES_INFO_TABLE +
    '` (`' +
    POTENTRIES_COUNT_COLUMN +
    '`, `' +
    POTENTRIES_ADDRESS_COLUMN +
    '`, `' +
    POTENTRIES_TOKEN_COLUMN +
    '`, `' +
    POTENTRIES_VALUE_COLUMN +
    '`, `' +
    POTENTRIES_USD_VALUE_COLUMN +
    '`, `' +
    POTENTRIES_ROUND_COLUMN +
    '`, `' +
    POTENTRIES_BLOCK_COLUMN +
    '`, `' +
    POTENTRIES_TX_COLUMN +
    '`) VALUES ';

  var values = '';
  for (let index = 0; index < Entries.length; index++) {
    values +=
      " ('" +
      Entries[index].returnValues.entryId +
      "', '" +
      Entries[index].returnValues.player +
      "', '" +
      'ZTP' +
      "', '" +
      Entries[index].returnValues.amount;
    values +=
      "', '" +
      Entries[index].returnValues.amount +
      "', '" +
      Entries[index].returnValues.roundId +
      "', '" +
      Entries[index].blockNumber +
      "', '" +
      Entries[index].transactionHash +
      "')" +
      (index + 1 < Entries.length ? ', ' : '');
  }

  query += values;
  try {
    executeQuery(query, [], function (err, result) {
      if (err) {
        console.log('ERROR: in potEntries.js ~ insertEntry => ', err);
        logError(query, err);
        callback(err);
      } else {
        console.log('potEntries.js ~ insertEntry successfuly done!!', values);
        callback(null, result);
      }
    });
  } catch (error) {
    console.log('ERROR: in potEntries.js ~ insertEntry DB connection => ', error);
    callback(error);
  }
};

exports.getEntries = (data, callback) => {
  var query =
    'SELECT * FROM ' +
    POTENTRIES_INFO_TABLE +
    ' WHERE ' +
    POTENTRIES_ROUND_COLUMN +
    ' BETWEEN ? AND ?' +
    ' ORDER BY  ' +
    POTENTRIES_COUNT_COLUMN +
    ' ASC';

  try {
    executeQuery(query, [data.start, data.stop], function (err, result) {
      if (err) {
        console.log('ERROR: in potEntries.js ~ getEntries => ', err);
        callback(err);
      } else {
        callback(null, result);
      }
    });
  } catch (error) {
    console.log('ERROR: in potEntries.js ~ getEntries DB connection => ', error);
    callback(error);
  }
};

exports.getLossData = (callback) => {
  var query =
    'SELECT DISTINCT(address) AS address, SUM(usdvalue)/1000000000000000000 AS amount, COUNT(DISTINCT(round)) AS roundsplayed FROM `potentries` GROUP BY address ORDER BY address DESC limit 50000;';

  try {
    executeQuery(query, [], function (err, result) {
      if (err) {
        console.log('ERROR: in potEntries.js ~ getLossData => ', err);
        callback(err);
      } else {
        callback(null, result);
      }
    });
  } catch (error) {
    console.log('ERROR: in potEntries.js ~ getLossData DB connection => ', error);
    callback(error);
  }
};

exports.getPotGameCount = (callback) => {
  var query =
    'SELECT DISTINCT(address) AS address, COUNT(DISTINCT(round)) AS roundsplayed FROM `potentries` GROUP BY address ORDER BY address DESC limit 50000;';

  try {
    executeQuery(query, [], function (err, result) {
      if (err) {
        console.log('ERROR: in potEntries.js ~ getPotGameCount => ', err);
        callback(err);
      } else {
        callback(null, result);
      }
    });
  } catch (error) {
    console.log('ERROR: in potEntries.js ~ getPotGameCount DB connection => ', error);
    callback(error);
  }
};

exports.getEntryInfo = (callback) => {
  var query =
    'SELECT COUNT(DISTINCT `potentries`.address) AS uniqueWallet, SUM(`potentries`.`usdvalue`)/1000000000000000000 AS totalEntry FROM `potentries` WHERE 1';

  try {
    executeQuery(query, [], function (err, result) {
      if (err) {
        console.log('ERROR: in potEntries.js ~ getEntryInfo => ', err);
        callback(err);
      } else {
        callback(null, result);
      }
    });
  } catch (error) {
    console.log('ERROR: in potEntries.js ~ getEntryInfo DB connection => ', error);
    callback(error);
  }
};

exports.getEntryInfoToday = (callback) => {
  var query =
    "SELECT COUNT(DISTINCT `potentries`.address) AS uniqueWallet, SUM(`potentries`.`usdvalue`)/1000000000000000000 AS totalEntry FROM `potentries` WHERE block > (SELECT `value` FROM pot_info WHERE `name`='today')";

  try {
    executeQuery(query, [], function (err, result) {
      if (err) {
        console.log('ERROR: in potEntries.js ~ getEntryInfoToday => ', err);
        callback(err);
      } else {
        callback(null, result);
      }
    });
  } catch (error) {
    console.log('ERROR: in potEntries.js ~ getEntryInfoToday DB connection => ', error);
    callback(error);
  }
};
