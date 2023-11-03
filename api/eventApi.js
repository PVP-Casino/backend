var express = require('express');
var { addJackpotClient, addRouletteClient, addLatestWinnerClient, addFortuneClient } = require('../services/eventService');

const router = express.Router();

router.get('/jackpot', addJackpotClient);

router.get('/roulette', addRouletteClient);

router.get('/fortune', addFortuneClient);

router.get('/latest-winner', addLatestWinnerClient);

module.exports = router;