const WebSocket = require("ws");

const srv = new WebSocket.Server({
  port: 5000
});

const channels = {};

srv.on("connection", (socket, request) => {
  if (!channels[request.url]) channels[request.url] = [];
  channels[request.url].push(socket);

  socket.on("message", message => {
    channels[request.url].forEach(client => {
      if (client !== socket && client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  });
});
