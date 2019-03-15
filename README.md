# ws.crz.li

> Public WebSocket server with broadcasting.

## About

[ws.crz.li](https://ws.crz.li) is a public WebSocket server with automatic broadcasting based on channels. Channels are derived from the request path. i.e. A message to `wss://ws.crz.li/my/channel` is relayed to every other client connected to the channel `/my/channel`.

## Usage

There's no setup, registration, or configuration required beforehand. Simply instantiate a new [WebSocket](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket) object and you're good to go.

Client 1:

```js
const ws = new WebSocket("wss://ws.crz.li/my/channel");
ws.onopen = event => ws.send("Ahoy!");
```

Client 2:

```js
const ws = new WebSocket("wss://ws.crz.li/my/channel");
ws.onmessage = message => console.log(message); // Ahoy!
```

## Legal

The MIT License © 2019 Corenzan.
