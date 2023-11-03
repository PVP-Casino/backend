const fs = require('fs');
const Tx = require('ethereumjs-tx').Transaction;
const Common = require('ethereumjs-common').default;
const colors = require('colors');
const mysql = require('mysql');
const potAbi = require('../abis/jackpot.json');

const { logError } = require('../utils/utils');
const { config } = require('../config');
const txConfig = Common.forCustomChain(
  'mainnet',
  {
    name: 'Zeta Testnet',
    networkId: 7001,
    chainId: 7001,
    url: config.rpcUrl,
  },
  'petersburg'
);

require('dotenv').config();
const Web3 = require('web3');
const web3 = new Web3(config.rpcUrl);
const POT_ADDRESS = config.jackpotAddress;
const ADMIN_PRIVATE = Buffer.from(process.env.PRIVATE_KEY, 'hex');
const ADMIN_ADDRESS = process.env.PUBLIC_ADDRESS;
const AVG_BLOCK_TIME = 5000;
const POT_DURATION = 120; // 2 min

var connection;
var calling = false,
  willCalculateWinner = false;

function handleDisconnect() {
  connection = mysql.createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    connectionLimit: process.env.MYSQL_MAX_CONNECTION,
    debug: false,
  });
}

var checkIfPotLiveContract, calculateWinnerContract;
var calculateWinnerTimeOut, willCalculateWinnerTimeOut;

function unsubscribe(subscription) {
  try {
    subscription.unsubscribe(function (error, success) {
      if (success) {
        console.log('Successfully unsubscribed');
      }
    });
  } catch (error) {}
}

function checkIfPotLive() {
  try {
    checkIfPotLiveContract = new web3.eth.Contract(potAbi, POT_ADDRESS);
    checkIfPotLiveContract.methods.roundLiveTime().call((err, roundLiveTime) => {
      if (!err) {
        try {
          console.log('The pot live time: ', roundLiveTime);
          if (parseInt(roundLiveTime) != 0) {
            var timeRemaining = POT_DURATION - (parseInt(Date.now() / 1000) - parseInt(roundLiveTime));
            console.log(colors.red('calling calculate winner in: ', timeRemaining));
            clearTimeout(willCalculateWinnerTimeOut);
            willCalculateWinnerTimeOut = setTimeout(() => {
              willCalculateWinner = true;
            }, (timeRemaining - 15) * 1000);
            clearTimeout(calculateWinnerTimeOut);
            calculateWinnerTimeOut = setTimeout(() => {
              calculateWinner();
            }, (timeRemaining - 2) * 1000);
            unsubscribe(checkIfPotLiveContract);
          } else {
            unsubscribe(checkIfPotLiveContract);
            return;
          }
        } catch (error) {
          unsubscribe(checkIfPotLiveContract);
          logError('Error calculting the time remaining', error);
        }
      } else {
        unsubscribe(checkIfPotLiveContract);
      }
    });
  } catch (error) {
    unsubscribe(checkIfPotLiveContract);
    logError('Error in check if PotLive', error);
  }
}

function calculateWinner() {
  if (!calling) {
    calling = true;
    try {
      console.log(POT_ADDRESS);
      calculateWinnerContract = new web3.eth.Contract(potAbi, POT_ADDRESS);
      web3.eth.getGasPrice(function (error, gasPrice) {
        console.log({ gasPrice });
        if (!error) {
          calculateWinnerContract.methods
            .calculateWinner()
            .estimateGas({ from: ADMIN_ADDRESS })
            .then(function (gasAmount) {
              console.log({ gasAmount });
              web3.eth
                .getTransactionCount(ADMIN_ADDRESS, (err, txCount) => {
                  const txObject = {
                    nonce: web3.utils.toHex(txCount),
                    gasLimit: web3.utils.toHex(parseInt(gasAmount * 1.2)), // Raise the gas limit to a much higher amount
                    gasPrice: web3.utils.toHex(parseInt(gasPrice)),
                    to: POT_ADDRESS,
                    data: calculateWinnerContract.methods.calculateWinner().encodeABI(),
                  };

                  console.log({ txObject });
                  const tx = new Tx(txObject, { common: txConfig });
                  tx.sign(ADMIN_PRIVATE);

                  const serializedTx = tx.serialize();
                  const raw = '0x' + serializedTx.toString('hex');

                  web3.eth
                    .sendSignedTransaction(raw)
                    .on('receipt', function (receipt) {})
                    .on('transactionHash', function (transHash) {
                      unsubscribe(calculateWinnerContract);
                      console.log(colors.green('calculateWinner succesfull: ', transHash));
                      setTimeout(() => {
                        calling = false;
                        willCalculateWinner = false;
                      }, AVG_BLOCK_TIME * 2);
                    })
                    .on('error', function (err) {
                      calling = false;
                      willCalculateWinner = false;
                      unsubscribe(calculateWinnerContract);
                      logError('Error in sending calculateWinner signed transaction', err);
                      checkIfPotLive();
                    });
                })
                .catch(function (error) {
                  unsubscribe(calculateWinnerContract);
                  calling = false;
                  willCalculateWinner = false;
                  logError('Error in getting transaction count', error);
                });
            })
            .catch(function (error) {
              calling = false;
              willCalculateWinner = false;
              unsubscribe(calculateWinnerContract);
              logError('Error estimating the gas cost ', error);
            });
        } else {
          calling = false;
          willCalculateWinner = false;
          unsubscribe(calculateWinnerContract);
          logError('Error in getting gas Price', error);
        }
      });
    } catch (error) {
      calling = false;
      willCalculateWinner = false;
      unsubscribe(calculateWinnerContract);
      logError('Error in calculateWinner()', error);
    }
  } else {
    unsubscribe(calculateWinnerContract);
    console.log('calculateWinner says already calling something');
    setTimeout(() => {
      calculateWinner();
    }, AVG_BLOCK_TIME / 10);
  }
}

handleDisconnect();

try {
  console.log(colors.magenta('attempting to checkIfPotLive()'));
  checkIfPotLive();
} catch (error) {
  logError('Error calling the first checkIfPotLive', error);
}

setInterval(() => {
  try {
    console.log(colors.magenta('attempting to checkIfPotLive()'));
    checkIfPotLive();
  } catch (error) {
    logError('Error in calling checkIfPotLive in intervals', error);
  }
}, (config.jackpotRoundTime / 2) * 1000);
