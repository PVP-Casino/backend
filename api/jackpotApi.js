var express = require('express');
var {
  getPotInfo,
  getEntries,
  getWinners,
  getWinnerDataForLeaderboard,
  getLosersDataForLeaderboard,
  getGameCount,
  getPotStats,
} = require('../services/jackpotService');

const router = express.Router();

router.get('/', getPotInfo);

//api endpoint for getting leaderboard winners
router.get('/winner_', getWinnerDataForLeaderboard);

//api endpoint for getting leaderboard losers
router.get('/plays', getLosersDataForLeaderboard);

//api endpoint for getting game play
router.get('/gamecount', getGameCount);

//api endpoint for getting pot stat
router.get('/stats', getPotStats);

router.post('/entries/*', getEntries);

router.post('/winners/*', getWinners);

module.exports = router;
