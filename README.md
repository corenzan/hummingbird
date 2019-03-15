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

### Terms of Service

By using this service you've accepted our [Terms of Use](TOS.md).

### Disclaimer

Last updated: March 15, 2019.

The information contained on https://ws.crz.li server (the "Service") is for general information purposes only.

ws.crz.li assumes no responsibility for errors or omissions in the contents on the Service.

In no event shall ws.crz.li be liable for any special, direct, indirect, consequential, or incidental damages or any damages whatsoever, whether in an action of contract, negligence or other tort, arising out of or in connection with the use of the Service or the contents of the Service. ws.crz.li reserves the right to make additions, deletions, or modification to the contents on the Service at any time without prior notice.

ws.crz.li does not warrant that the server is free of viruses or other harmful components.

### License

The MIT License © 2019 Corenzan.
