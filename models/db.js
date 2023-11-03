var mysql = require('mysql');
require('dotenv').config();

const dbConf = {
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  connectionLimit: process.env.MYSQL_MAX_CONNECTION,
  debug: false,
};

const pool = mysql.createPool(dbConf);

exports.executeQuery = function (query, values = [], callback) {
  pool.getConnection(function (err, connection) {
    if (err) {
      throw err;
    }
    connection.query(query, values, function (err, rows) {
      connection.release();
      if (!err) {
        callback(null, { rows: rows });
      } else {
        callback(err);
      }
    });
    // connection.on("error", function (err) {
    //   connection.release();
    //   throw err;
    // });
  });
};
