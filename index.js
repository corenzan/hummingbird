const WebSocket = require("ws");

const channels = {};

function getChannel(path) {
  if (path in channels) {
    return channels[path];
  }
  const channel = [];
  channels[path] = channel;
  console.log(new Date(), "channel created", path);
  const timer = setInterval(() => {
    let shouldDeleteChannel = true;
    channel.forEach(client => {
      if (client.keepAlive === false) {
        client.terminate();
      } else {
        client.keepAlive = shouldDeleteChannel = false;
        client.ping(function() {});
      }
    });
    if (shouldDeleteChannel) {
      console.log(new Date(), "channel deleted", path);
      delete channels[path];
      clearInterval(timer);
    }
  }, 10 * 1000);
  return channel;
}

function getRemoteAddress(request) {
  return;
}

const server = new WebSocket.Server({
  port: process.env.PORT || 5000
});

server.on("connection", (client, request) => {
  const url = new URL("http://localhost" + request.url);
  const channel = getChannel(url.pathname);
  channel.push(client);

  client.remoteAddress =
    "x-forwarded-for" in request.headers
      ? request.headers["x-forwarded-for"].split(/\s*,\s*/)[0]
      : request.connection.remoteAddress;

  const remoteAddr = console.log(
    new Date(),
    "client connected",
    client.remoteAddress,
    url.pathname
  );

  client.on("pong", () => {
    client.keepAlive = true;
  });

  client.on("close", code => {
    console.log(
      new Date(),
      "client disconnected",
      client.remoteAddress,
      url.pathname
    );
  });

  client.on("message", message => {
    console.log(
      new Date(),
      "message",
      client.remoteAddress,
      url.pathname,
      message.length
    );

    channel.forEach(c => {
      if (c !== client && c.readyState === WebSocket.OPEN) {
        c.send(message);
      }
    });
  });
});
