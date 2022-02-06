# Hummingbird

> Action broadcaster for easy multiplayer web applications.

## About

Hummingbird is both an open-source software and a live service that allows web applications based on state reducing and action dispatch to relay actions to other clients.

## Protocol

Hummingbird uses [WebSocket](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket) to exchange messages between client and server. When the upgrade request is made, the pathname (e.g. `/my/channel` in `wws://hummingbird.crz.li/my/channel`) is used as channel and incoming messages are relayed to other clients connected on the same channel, like a broadcasting system, but it has a few extra steps to make state synchronization easier. Clients are flagged as either fresh or stale. Fresh clients are free to exchange messages but stale clients will require a _state update_ from a fresh client before receiving any other messages. Also, all exchanged messages are expected to be JSON encoded objects with a `type` field.

![Schema of the protocol](protocol.webp)

It's important to notice that there are limitations with this approach. See [pitfalls](#pitfalls) below.

## Usage

No setup is required. Simply open a new connection and you're good to go. Below is a minimum functional example using React.

```js
function App() {
  // ...
}
```

[See it in action](https://codesandbox.com).

### Pitfalls

- Actions dispatched by a stale client will be relayed to other fresh clients even before a state reconciliation has happened.
- The client is responsible for state reconciliation upon getting a state update.
- State updates are client authoritative, i.e. there's no security.

## Legal

### Terms of use

By using the service you agree that you will behave lawfully good.

### License

Apache-2.0 © 2022 Arthur Corenzan.
