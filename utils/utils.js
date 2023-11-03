const date = require("date-and-time");
require("dotenv").config();
const fs = require("fs");
const path = require("path");

const ERROR_FILE = 'logs.error';

exports.logError = (info, error) => {
  var scriptName = path.basename(ERROR_FILE);
  var logStream = fs.createWriteStream(scriptName, { flags: "a" });
  logStream.write(
    date.format(new Date(Date.now()), "YYYY/MM/DD HH:mm:ss") + "\n"
  );
  logStream.write(info + "\n");
  logStream.write(error + "\n");
  logStream.end("\n");
};

exports.logErrorWithFile = (filename, error) => {
  var scriptName = path.basename(filename);
  const logStream = fs.createWriteStream(scriptName, { flags: "a" });
  logStream.write(
    date.format(new Date(Date.now()), "YYYY/MM/DD HH:mm:ss") + "\n"
  );
  logStream.write(error + "\n");
  logStream.end("\n");
}

exports.generateRefLink = (length = 5) => {
  var result = "";
  var characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}
