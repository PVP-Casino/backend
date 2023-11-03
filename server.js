const express = require('express');
const app = express();

var cors = require('cors');
var https = require('https');
var http = require('http');
var fs = require('fs');
require('dotenv').config();

const cluster = require('cluster');
const v8 = require('v8');

app.use(express.static(__dirname + '/static', { dotfiles: 'allow' }));

app.use(cors()); //for preflight request

app.use(cors({ origin: `*` }));

// --------- Api Routes ------------------- //
const eventApi = require('./api/eventApi');
const potApi = require('./api/jackpotApi');

app.use('/events', eventApi);
app.use('/pot', potApi);

// --------- Main Modules ----------------- //
// enterpot-event.js
const potEventStart = require('./startup/enterpot-event');
// winner.js
const winnerStart = require('./startup/winner.js');

// Heap memory check
if (cluster.isMaster) {
  cluster.fork();
  cluster.on('exit', (deadWorker, code, signal) => {
    // Restart the worker
    let worker = cluster.fork();

    // Note the process IDs
    let newPID = worker.process.pid;
    let oldPID = deadWorker.process.pid;

    // Log the event
    console.log('worker ' + oldPID + ' died.');
    console.log('worker ' + newPID + ' born.');
  });
} else {
  // worker
  const initialStats = v8.getHeapStatistics();

  const totalHeapSizeThreshold = (initialStats.heap_size_limit * 85) / 100;
  console.log('totalHeapSizeThreshold: ' + totalHeapSizeThreshold);

  let detectHeapOverflow = () => {
    let stats = v8.getHeapStatistics();
    console.log('total_heap_size: ' + stats.total_heap_size);

    if (stats.total_heap_size > totalHeapSizeThreshold) {
      process.exit();
    }
  };
  setInterval(detectHeapOverflow, 1000);

  // ----- here goes the main logic ------------ //

  // ** for live server ** //
  // https
  //   .createServer(
  //     {
  //       key: fs.readFileSync('/etc/letsencrypt/live/db.bnbpot.io/privkey.pem'),
  //       cert: fs.readFileSync('/etc/letsencrypt/live/db.bnbpot.io/fullchain.pem'),
  //       ca: fs.readFileSync('/etc/letsencrypt/live/db.bnbpot.io/chain.pem'),
  //     },
  //     app
  //   )
  //   .listen(443, function () {
  //     console.log(`Server listening on ${443}`);
  //   });
  // ---------------------- //

  // ** for local server ** //
  http.createServer(app).listen(80, function () {
    console.log('Server is listening on 80 port');
  });
  // ---------------------- //

  // Jackpot : start enterpot-event.js
  potEventStart();
  // Jackpot : start winner.js
  winnerStart();
}
