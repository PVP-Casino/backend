var {
  getWinAmount,
  getActRefUserResult,
  getPlspClaimed,
  getPlspBonus,
  getpphaseWC,
  getWinners,
  getWinnerData,
  getParticipationPhaseInfo,
  getPotWinInfo,
  getPotWinInfoToday,
  getHighestWon,
  getHighestWonToday,
  getMinChance,
  getMinChanceToday,
} = require('../models/potWinners');
var { getAllTokenInfo } = require('../models/tokens');
var { getEntries, getLossData, getPotGameCount, getEntryInfo, getEntryInfoToday } = require('../models/potEntries');
require('dotenv').config();
var { logError, generateRefLink } = require('../utils/utils');
const Web3 = require('web3');
const { config } = require('../config');

const RPC_PROVIDER = config.rpcUrl;
const web3 = new Web3(RPC_PROVIDER);

const ERROR_FILE = process.env.INDEX_ERROR_FILE;

const JSON_WINSCOUNT_KEY = process.env.JSON_WINSCOUNT_KEY;
const JSON_WINSUSD_KEY = process.env.JSON_WINSUSD_KEY;
const JSON_ACT_REF_USER_KEY = process.env.JSON_ACT_REF_USER_KEY;
const JSON_REF_EARNINGS_KEY = process.env.JSON_REF_EARNINGS_KEY;
const JSON_REF_CODE_KEY = process.env.JSON_REF_CODE_KEY;
const JSON_TOTAL_PLSP_CLAIM_KEY = process.env.JSON_TOTAL_PLSP_CLAIM_KEY;
const JSON_USER_PLSP_CLAIM_KEY = process.env.JSON_USER_PLSP_CLAIM_KEY;
const JSON_TOKENS_KEY = process.env.JSON_TOKENS_KEY;
const JSON_POTENTRIES_KEY = process.env.JSON_POTENTRIES_KEY;
const JSON_POTWINNER_KEY = process.env.JSON_POTWINNER_KEY;

const REFERRAL_INFO_TABLE = process.env.REFERRAL_INFO_TABLE;
const REFERRAL_INFO_ADDRESS_COLUMN = process.env.REFERRAL_INFO_ADDRESS_COLUMN;
const REFERRAL_INFO_CODE_COLUMN = process.env.REFERRAL_INFO_CODE_COLUMN;
const REFERRAL_INFO_USERS_COLUMN = process.env.REFERRAL_INFO_USERS_COLUMN;
const REFERRAL_INFO_EARNINGS_COLUMN = process.env.REFERRAL_INFO_EARNINGS_COLUMN;

const POT_WINNERS_AMOUNT_WON_COLUMN = process.env.POT_WINNERS_AMOUNT_WON_COLUMN;
const POT_WINNERS_WINNER_COLUMN = process.env.POT_WINNERS_WINNER_COLUMN;
const POT_WINNERS_PLSP_BONUS_COLUMN = process.env.POT_WINNERS_PLSP_BONUS_COLUMN;
const POT_WINNERS_INFO_TABLE = process.env.POT_WINNERS_INFO_TABLE;
const POT_WINNERS_ROUND_COLUMN = process.env.POT_WINNERS_ROUND_COLUMN;

exports.getPotInfo = (req, res) => {
  try {
    getPlspClaimed(function (err, result) {
      if (err) {
        res.json({
          error: 'There was an error1',
          result: {
            [JSON_TOTAL_PLSP_CLAIM_KEY]: 0,
          },
        });
        res.end();
        logError('Error in getPlspClaimed', err);
      } else {
        const sqlresult = result.rows;
        getAllTokenInfo(function (err, result1) {
          if (err) {
            res.json({
              error: 'There was an error11',
              result: {
                [JSON_TOTAL_PLSP_CLAIM_KEY]: 0,
              },
            });
            res.end();
            logError('Error in getAllTokenInfo', err);
          } else {
            const sqlresult_ = result1.rows;
            getPlspBonus(function (err, result2) {
              if (err) {
                res.json({
                  error: 'There was an error11',
                  result: {
                    [JSON_TOTAL_PLSP_CLAIM_KEY]: 0,
                  },
                });
                res.end();
                logError('Error in getPlspBonus', err);
              } else {
                const _sqlresult_ = result2.rows;
                getpphaseWC(function (err, result3) {
                  if (err) {
                    res.json({
                      error: 'There was an error11',
                      result: {
                        [JSON_TOTAL_PLSP_CLAIM_KEY]: 0,
                      },
                    });
                    res.end();
                    logError('Error in getpphaseWC', err);
                  } else {
                    const _sql4result_ = result3.rows;
                    res.json({
                      [JSON_TOTAL_PLSP_CLAIM_KEY]: sqlresult[0]
                        ? sqlresult[0][JSON_TOTAL_PLSP_CLAIM_KEY] + _sqlresult_[0][POT_WINNERS_PLSP_BONUS_COLUMN]
                        : 0,
                      bnbp_bonus: _sqlresult_[0][POT_WINNERS_PLSP_BONUS_COLUMN],
                      pphase_UW: _sql4result_[0]['pphaseWC'],
                      [JSON_TOKENS_KEY]: sqlresult_,
                      ['time_']: new Date(),
                    });
                    res.end();
                  }
                });
              }
            });
          }
        });
      }
    });
  } catch (error) {
    try {
      logError('Warning occured in /pot endpoint', error);
      res.end();
    } catch (error) {}
  }
};

exports.getEntries = (req, res) => {
  try {
    const start = isNaN(req.params[0].split('/')[0]) ? '1' : req.params[0].split('/')[0];
    const stop = isNaN(req.params[0].split('/')[1]) ? '10' : req.params[0].split('/')[1];

    getEntries({ start: start.length === 0 ? 0 : start, stop }, function (err, result) {
      if (err) {
        res.json({
          error: 'There was an error getting pot entries',
          result: {},
        });
        res.end();
        logError('Error in getEntries', err);
      } else {
        const potEntries = result.rows;
        res.json({
          [JSON_POTENTRIES_KEY]: potEntries,
        });
        res.end();
      }
    });
  } catch (error) {
    try {
      logError('Warning occured in /pot/entries endpoint', error);
      res.end();
    } catch (error) {}
  }
};

exports.getWinners = (req, res) => {
  try {
    const start = isNaN(req.params[0].split('/')[0]) ? '1' : req.params[0].split('/')[0];
    const stop = isNaN(req.params[0].split('/')[1]) ? '10' : req.params[0].split('/')[1];
    getWinners({ start: start.length === 0 ? 0 : start, stop }, function (err, result) {
      if (err) {
        res.json({
          error: 'There was an error getting pot winners',
          result: {},
        });
        res.end();
        logError('Error in getWinners', err);
      } else {
        const potWinners = result.rows;
        res.json({
          [JSON_POTWINNER_KEY]: potWinners,
        });
        res.end();
      }
    });
  } catch (error) {
    try {
      logError('Warning occured in /pot/winners endpoint', error);
      res.end();
    } catch (error) {}
  }
};

exports.getWinnerDataForLeaderboard = (req, res) => {
  try {
    getWinnerData(function (err, result) {
      if (err) {
        res.json({
          error: 'There was an error getting winner leaderboard',
          result: {},
        });
        res.end();
        logError('Error in getWinnerData', err);
      } else {
        const winnerleaderboard = result.rows;
        res.json({
          winners: winnerleaderboard,
        });
        res.end();
      }
    });
  } catch (error) {
    try {
      logError('Warning occured in /pot/winner_ endpoint', error);
      res.end();
    } catch (error) {}
  }
};

exports.getLosersDataForLeaderboard = (req, res) => {
  try {
    getLossData(function (err, result) {
      if (err) {
        res.json({
          error: 'There was an error getting loss leaderboard',
          result: {},
        });
        res.end();
        logError('Error in getLossData', err);
      } else {
        const loserleaderboard = result.rows;
        res.json({
          plays: loserleaderboard,
        });
        res.end();
      }
    });
  } catch (error) {
    try {
      logError('Warning occured in /pot/plays endpoint', error);
      res.end();
    } catch (error) {}
  }
};

exports.getGameCount = (req, res) => {
  try {
    getPotGameCount(function (err, result) {
      if (err) {
        res.json({
          error: 'There was an error getting gamecount leaderboard',
          result: {},
        });
        res.end();
        logError('Error in getPotGameCount', err);
      } else {
        const gamecount = result.rows;
        res.json({
          gamecount: gamecount,
        });
        res.end();
      }
    });
  } catch (error) {
    try {
      logError('Warning occured in /pot/gamecount endpoint', error);
      res.end();
    } catch (error) {}
  }
};

exports.getParticipationPhaseInfo = (req, res) => {
  try {
    getParticipationPhaseInfo(function (err, result) {
      if (err) {
        res.json({
          error: 'There was an error getting pphase',
          result: {},
        });
        res.end();
        logError('Error in getParticipationPhaseInfo', err);
      } else {
        const pPhase = result.rows;
        for (let index = 0; index < pPhase.length; index++) {
          pPhase[index].row = index;
        }
        res.json({
          pphase: pPhase,
        });
        res.end();
      }
    });
  } catch (error) {
    try {
      logError('Warning occured in /pot/pphase endpoint', error);
      res.end();
    } catch (error) {}
  }
};

exports.getPotStats = (req, res) => {
  try {
    getPotWinInfo(function (err, result) {
      if (err) {
        res.json({
          error: 'There was an error getting pot stats',
          result: {},
        });
        res.end();
        logError('Error in getPotWinInfo', err);
      } else {
        const sql_pot_winnersResult = result.rows;
        getPotWinInfoToday(function (err, result1) {
          if (err) {
            res.json({
              error: 'There was an error getting pot stats',
              result: {},
            });
            res.end();
            logError('Error in getPotWinInfoToday', err);
          } else {
            const sql_pot_winners_dResult = result1.rows;
            getEntryInfo(function (err, result2) {
              if (err) {
                res.json({
                  error: 'There was an error getting pot stats',
                  result: {},
                });
                res.end();
                logError('Error in getEntryInfo', err);
              } else {
                const sql_potentriesResult = result2.rows;
                getEntryInfoToday(function (err, result3) {
                  if (err) {
                    res.json({
                      error: 'There was an error getting pot stats',
                      result: {},
                    });
                    res.end();
                    logError('Error in getEntryInfoToday', err);
                  } else {
                    const sql_potentries_dResult = result3.rows;
                    getHighestWon(function (err, result4) {
                      if (err) {
                        res.json({
                          error: 'There was an error getting pot stats',
                          result: {},
                        });
                        res.end();
                        logError('Error in getHighestWon', err);
                      } else {
                        const sql_highestWonResult = result4.rows;
                        getHighestWonToday(function (err, result5) {
                          if (err) {
                            res.json({
                              error: 'There was an error getting pot stats',
                              result: {},
                            });
                            res.end();
                            logError('Error in getHighestWonToday', err);
                          } else {
                            const sql_highestWon_dResult = result5.rows;
                            getMinChance(function (err, result6) {
                              if (err) {
                                res.json({
                                  error: 'There was an error getting pot stats',
                                  result: {},
                                });
                                res.end();
                                logError('Error in getMinChance', err);
                              } else {
                                const sql_minChanceResult = result6.rows;
                                getMinChanceToday(function (err, result7) {
                                  if (err) {
                                    res.json({
                                      error: 'There was an error getting pot stats',
                                      result: {},
                                    });
                                    res.end();
                                    logError('Error in getMinChanceToday', err);
                                  } else {
                                    const sql_minChance_dResult = result7.rows;
                                    console.log({
                                      highestSingleWin: sql_highestWonResult[0],
                                      luckiestWinner: sql_minChanceResult[0],
                                      totalFees: sql_pot_winnersResult[0]['totalFees'],
                                      highestSingleWin_d: sql_highestWon_dResult[0],
                                      luckiestWinner_d: sql_minChance_dResult[0],
                                      totalFees_d: sql_pot_winners_dResult[0]['totalFees'],
                                      uniqueWallet: sql_potentriesResult[0]['uniqueWallet'],
                                      totalVolume: sql_potentriesResult[0]['totalEntry'],
                                      uniqueWallet_d: sql_potentries_dResult[0]['uniqueWallet'],
                                      totalVolume_d: sql_potentries_dResult[0]['totalEntry'],
                                      mostused_token: 'BNBP',
                                      mostused_token_d: 'BNBP',
                                    });
                                    res.json({
                                      highestSingleWin: sql_highestWonResult[0],
                                      luckiestWinner: sql_minChanceResult[0],
                                      totalFees: sql_pot_winnersResult[0]['totalFees'],
                                      highestSingleWin_d: sql_highestWon_dResult[0],
                                      luckiestWinner_d: sql_minChance_dResult[0],
                                      totalFees_d: sql_pot_winners_dResult[0]['totalFees'],
                                      uniqueWallet: sql_potentriesResult[0]['uniqueWallet'],
                                      totalVolume: sql_potentriesResult[0]['totalEntry'],
                                      uniqueWallet_d: sql_potentries_dResult[0]['uniqueWallet'],
                                      totalVolume_d: sql_potentries_dResult[0]['totalEntry'],
                                      mostused_token: 'BNBP',
                                      mostused_token_d: 'BNBP',
                                    });
                                    res.end();
                                  }
                                });
                              }
                            });
                          }
                        });
                      }
                    });
                  }
                });
              }
            });
          }
        });
      }
    });
  } catch (error) {
    try {
      logError('Warning occured in /pot/stats endpoint', error);
      res.end();
    } catch (error) {}
  }
};
