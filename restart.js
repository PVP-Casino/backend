var cron = require('node-cron');

const date = require('date-and-time');
const { exec } = require('child_process');
var options = {
  scheduled: false,
};

function restartCalculateWinner() {
  exec('pm2 restart calculate_winner', (err, stdout, stderr) => {
    if (err) {
      logRestart('calculate_winner', err);
    } else {
    }
  });
}

function restartTokens() {
  exec('pm2 restart tokens', (err, stdout, stderr) => {
    if (err) {
      logRestart('tokens', err);
    } else {
    }
  });
}

function restartBurn() {
  exec('pm2 restart burn', (err, stdout, stderr) => {
    if (err) {
      logRestart('burn', err);
    } else {
    }
  });
}

function restartLottery() {
  exec('pm2 restart lottery', (err, stdout, stderr) => {
    if (err) {
      logRestart('lottery', err);
    } else {
    }
  });
}

// function restartRouletteMonitor() {
//   exec('pm2 restart roulette', (err, stdout, stderr) => {
//     if (err) {
//       logRestart('roulette monitor', err);
//     }
//   });
// }

// function restartFortuneMonitor() {
//   exec('pm2 restart fortune', (err, stdout, stderr) => {
//     if (err) {
//       logRestart('fortune monitor', err);
//     }
//   });
// }

// function restartAirdrop() {
//     exec('pm2 restart airdrop', (err, stdout, stderr) => {
//         if (err) {
//             logRestart("airdrop", err)
//         } else {
//         }
//     });
// }

setInterval(() => {
  try {
    restartCalculateWinner();
  } catch (error) {}
}, 7200000);

setInterval(() => {
  try {
    restartTokens();
  } catch (error) {}
}, 1800000);

setInterval(() => {
  try {
    restartBurn();
  } catch (error) {}
}, 3600000 * 12);

setInterval(() => {
  try {
    restartLottery();
  } catch (error) {}
}, 3600000);

// setInterval(() => {
//   try {
//     restartRouletteMonitor();
//   } catch (error) {}
// }, 3600000);

// setInterval(() => {
//   try {
//     restartFortuneMonitor();
//   } catch (error) {}
// }, 3600000);

// setInterval(() => {
//     try {
//         restartAirdrop()
//     } catch (error) {
//     }
// }, (86400000 * 10));

function logRestart(info, error) {
  var path = require('path');
  var scriptName = path.basename('RESTART.error');
  var fs = require('fs');
  var logStream = fs.createWriteStream(scriptName, { flags: 'a' });
  logStream.write(date.format(new Date(Date.now()), 'YYYY/MM/DD HH:mm:ss') + '\n');
  logStream.write(info + '\n');
  logStream.write(error + '\n');
  logStream.end('\n');
}
