var { EventEmitter } = require('events');
const eventEmitter = new EventEmitter();

const fireJackpotEvent = (event) => {
  eventEmitter.emit('dataForJackpot', event);
};

const subscribeForJackpot = (listener) => {
  eventEmitter.on('dataForJackpot', (evt) => listener(evt));
};

let jackpotClients = [];

exports.addJackpotClient = (req, res) => {
  const headers = {
    'Content-Type': 'text/event-stream',
    Connection: 'keep-alive',
    'Cache-Control': 'no-cache',
  };
  const data = `data: welcome\n\n`;
  const clientId = Date.now();
  const newClient = { id: clientId, res };

  jackpotClients.push(newClient);

  res.writeHead(200, headers);
  res.write(data);
  req.on('close', () => {
    console.log(`${clientId} Connection closed`);
    jackpotClients = jackpotClients.filter((client) => client.id !== clientId);
  });
};

subscribeForJackpot((event) => {
  jackpotClients.forEach(({ res }) => {
    res.write(`data: ${JSON.stringify(event)}\n\n`);
  });
});

const fireRouletteEvent = (event) => {
  eventEmitter.emit('dataForRoulette', event);
};

const subscribeForRoulette = (listener) => {
  eventEmitter.on('dataForRoulette', (evt) => listener(evt));
};

let clientsForRoulette = [];

exports.addRouletteClient = (req, res) => {
  const headers = {
    'Content-Type': 'text/event-stream',
    Connection: 'keep-alive',
    'Cache-Control': 'no-cache',
  };
  const data = `data: welcome\n\n`;
  const clientId = Date.now();
  const newClient = { id: clientId, res };

  clientsForRoulette.push(newClient);

  req.socket.setTimeout(0);

  res.writeHead(200, headers);
  res.write(data);

  req.on('close', () => {
    console.log(`${clientId} Connection closed`);
    clientsForRoulette = clientsForRoulette.filter((client) => client.id !== clientId);
    res.end();
  });
};

subscribeForRoulette((event) => {
  clientsForRoulette.forEach(({ res }) => {
    res.write(`data: ${JSON.stringify(event)}\n\n`);
  });
});

const fireLastestWinnerEvent = (event) => {
  eventEmitter.emit('dataForLatestWinner', event);
};

const subscribeForLatestWinner = (listener) => {
  eventEmitter.on('dataForLatestWinner', (evt) => listener(evt));
};

let lastestWinnerClients = [];

exports.addLatestWinnerClient = (req, res) => {
  const headers = {
    'Content-Type': 'text/event-stream',
    Connection: 'keep-alive',
    'Cache-Control': 'no-cache',
  };
  const data = `data: welcome\n\n`;
  const clientId = Date.now();
  const newClient = { id: clientId, res };

  lastestWinnerClients.push(newClient);

  res.writeHead(200, headers);
  res.write(data);
  req.on('close', () => {
    console.log(`${clientId} Connection closed`);
    lastestWinnerClients = lastestWinnerClients.filter((client) => client.id !== clientId);
  });
};

subscribeForLatestWinner((event) => {
  lastestWinnerClients.forEach(({ res }) => {
    res.write(`data: ${JSON.stringify(event)}\n\n`);
  });
});

// --------- Event for FortuneWheel ----------------- //

const fireFortuneEvent = (event) => {
  eventEmitter.emit('dataForFortune', event);
};

const subscribeForFortune = (listener) => {
  eventEmitter.on('dataForFortune', (evt) => listener(evt));
};

let clientsForFortune = [];

exports.addFortuneClient = (req, res) => {
  const headers = {
    'Content-Type': 'text/event-stream',
    Connection: 'keep-alive',
    'Cache-Control': 'no-cache',
  };
  const data = `data: welcome\n\n`;
  const clientId = Date.now();
  const newClient = { id: clientId, res };

  clientsForFortune.push(newClient);

  req.socket.setTimeout(0);

  res.writeHead(200, headers);
  res.write(data);

  req.on('close', () => {
    console.log(`${clientId} Connection closed`);
    clientsForFortune = clientsForFortune.filter((client) => client.id !== clientId);
    res.end();
  });
};

subscribeForFortune((event) => {
  clientsForFortune.forEach(({ res }) => {
    res.write(`data: ${JSON.stringify(event)}\n\n`);
  });
});

setInterval(() => {
  clientsForRoulette.forEach(client => {
      client.res.write(`data: keep connection alive\n\n`);
  });

  clientsForFortune.forEach(client => {
      client.res.write(`data: keep connection alive\n\n`);
  });
}, 60 * 1000);

exports.eventPool = Object.freeze({
  fireJackpotEvent,
  fireRouletteEvent,
  fireFortuneEvent,
  fireLastestWinnerEvent,
});
