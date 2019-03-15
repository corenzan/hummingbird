#!/usr/bin/env node

const WebSocket = require("ws");

const channels = {};

function noop() {}

function log(action, ...params) {
  console.log(new Date(), action, ...params);
}

function healthMonitor(channel) {
  for (let i = 0; i < channel.clients.length; i++) {
    const client = channel.clients[i];

    if (client.keepAlive === false) {
      client.terminate();
      channel.clients.splice(i, 1);
    } else {
      client.keepAlive = false;
      client.ping(noop);
    }
  }

  if (channel.clients.length === 0) {
    clearInterval(channel.timer);
    delete channels[channel.key];
    log("channel deleted", channel.key);
  }
}

function getChannel(key) {
  if (key in channels) {
    return channels[key];
  }

  const channel = {
    key,
    timer: setInterval(() => healthMonitor(channel), 30 * 1000),
    clients: []
  };
  channels[key] = channel;

  log("channel created", key);

  return channel;
}

function broadcast(message, channel, sender) {
  for (let i = 0; i < channel.clients.length; i++) {
    const client = channel.clients[i];
    if (client !== sender && client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  }
}

const server = new WebSocket.Server({
  port: process.env.PORT || 5000
});

server.on("connection", (client, request) => {
  const url = new URL("http://localhost" + request.url);
  const channel = getChannel(url.pathname);
  channel.clients.push(client);

  client.remoteAddress =
    "x-forwarded-for" in request.headers
      ? request.headers["x-forwarded-for"].split(/\s*,\s*/)[0]
      : request.connection.remoteAddress;

  log("client connected", url.pathname, client.remoteAddress);

  client.on("pong", () => {
    client.keepAlive = true;
  });

  client.on("close", (code, reason) => {
    log(
      "client disconnected",
      url.pathname,
      client.remoteAddress,
      code,
      reason
    );
  });

  client.on("message", message => {
    log(
      "message received",
      url.pathname,
      client.remoteAddress,
      `${message.length} bytes`
    );

    broadcast(message, channel, client);
  });
});
