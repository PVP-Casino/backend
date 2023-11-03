var { executeQuery } = require("./db");
require("dotenv").config();

var { logError } = require("../utils/utils");

const TOKEN_NAME_COLUMN = process.env.TOKEN_NAME_COLUMN;
const TOKENS_TABLE = process.env.TOKENS_TABLE;
const TOKEN_PRICE_COLUMN = process.env.TOKEN_PRICE_COLUMN;

exports.getTokenList = async (callback) => {
  var query =
    "SELECT `" +
    TOKEN_NAME_COLUMN +
    "` AS " +
    TOKEN_NAME_COLUMN +
    " FROM " +
    TOKENS_TABLE +
    " WHERE 1;";

  try {
    executeQuery(query, [], function (err, result) {
      if (err) {
        console.log("ERROR: in tokens.js ~ getTokenList => ", err);
        logError(query, err);
        callback(err);
      } else {
        callback(null, result);
      }
    });
  } catch (error) {
    console.log(
      "ERROR: in tokens.js ~ getTokenList in db connection => ",
      error
    );
    callback(error);
  }
};

exports.getAllTokenInfo = async (callback) => {
  var query = "SELECT * FROM  `" + TOKENS_TABLE + "` ;";
  try {
    executeQuery(query, [], function (err, result) {
      if (err) {
        console.log("ERROR: in tokens.js ~ getAllTokenInfo => ", err);
        callback(err);
      } else {
        callback(null, result);
      }
    });
  } catch (error) {
    console.log(
      "ERROR: in tokens.js ~ getAllTokenInfo in db connection => ",
      error
    );
    callback(error);
  }
};

exports.updatePrice = async (data, callback) => {
  var query =
    "UPDATE " +
    TOKENS_TABLE +
    " SET " +
    TOKEN_PRICE_COLUMN +
    "= ?" +
    " WHERE " +
    TOKEN_NAME_COLUMN +
    " = ?";

  var values = [data.tokenLatestPrice, data.tokenName];
  try {
    executeQuery(query, values, function (err, result) {
      if (err) {
        console.log("ERROR: in tokens.js ~ updateTokenPrice => ", err);
        logError(query, err);
        callback(err);
      } else {
        callback(null, result);
      }
    });
  } catch (error) {
    console.log(
      "ERROR: in tokens.js ~ updatePrice in db connection => ",
      error
    );
    callback(error);
  }
};
