var { executeQuery } = require("./db");
require("dotenv").config();

var { logError } = require("../utils/utils");

const INFO_ENTERPOT_EVENT_BLOCK_NAME =
  process.env.INFO_ENTERPOT_EVENT_BLOCK_NAME;
const INFO_TABLE = process.env.INFO_TABLE;
const INFO_NAME_COLUMN = process.env.INFO_NAME_COLUMN;
const INFO_VALUE_COLUMN = process.env.INFO_VALUE_COLUMN;

exports.updatePotInfoBlock = async (data, callback) => {
  var query =
    "UPDATE " +
    INFO_TABLE +
    " SET " +
    INFO_VALUE_COLUMN +
    " = ? " +
    " WHERE " +
    INFO_NAME_COLUMN +
    " = ?";

  try {
    executeQuery(query, [data.block, data.name], function (err, result) {
      if (err) {
        console.log("ERROR: in potInfo.js ~ updatePotInfoBlock => ", err);
        logError(query, err);
        callback(err);
      } else {
        callback(null, result);
      }
    });
  } catch (error) {
    console.log("ERROR: in potInfo.js ~ updatePotInfoBlock in db connection => ", error);
    callback(error);
  }
};

exports.getPotInfoBlock = async (data, callback) => {
  var query =
    "SELECT " +
    INFO_VALUE_COLUMN +
    " FROM " +
    INFO_TABLE +
    " WHERE " +
    INFO_NAME_COLUMN +
    " = ? ";

  try {
    executeQuery(query, [data.name], function (err, result) {
      if (err) {
        console.log("ERROR: in potInfo.js ~ getEnterpotBlock => ", err);
        logError(query, err);
        callback(err);
      } else {
        callback(null, result);
      }
    });
  } catch (error) {
    console.log("ERROR: in potInfo.js ~ getPotInfoBlock db connection => ", error);
    callback(error);
  }
};
