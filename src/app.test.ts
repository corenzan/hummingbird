import { App, Channel, Client } from "./app";

describe("Client", () => {
  test("dispatch", () => {
    const dispatch = jest.fn();
    const action = { type: "test" };
    const client = new Client(dispatch);
    client.dispatch(action);
    expect(dispatch).toHaveBeenCalledWith(action);
  });
});

describe("Channel", () => {
  test("freshClients, staleClients", () => {
    const channel = new Channel("test");
    channel.clients = [new Client(jest.fn()), new Client(jest.fn())];
    channel.clients[0].stale = false;
    expect(channel.freshClients).toEqual([channel.clients[0]]);
    expect(channel.staleClients).toEqual([channel.clients[1]]);
  });

  test("addClient, removeClient", () => {
    const channel = new Channel("test");
    const a = new Client(jest.fn());
    const b = new Client(jest.fn());

    // When the first client connects it should be promoted to fresh.
    channel.addClient(a);
    expect(channel.clients).toEqual([a]);
    expect(a.stale).toBe(false);

    // When a second client connects it should remain stale but
    // we need to request a state update from the fresh client.
    channel.addClient(b);
    expect(channel.clients).toEqual([a, b]);
    expect(b.stale).toBe(true);
    expect(a.dispatch).toHaveBeenCalledWith(channel.createStateUpdateRequest());

    // When the last fresh client disconnects a stale client should be promoted to fresh.
    channel.removeClient(a);
    expect(channel.clients).toEqual([b]);
    expect(b.stale).toBe(false);
  });

  test("handleAction", () => {
    const channel = new Channel("test");
    channel.clients = [new Client(jest.fn()), new Client(jest.fn())];
    channel.clients[0].stale = false;
    const action = { type: "test" };
    const stateUpdateReq = { type: "stateUpdateRequest" };
    const stateUpdateReply = { type: "stateUpdateReply" };

    // If we get an action from the fresh client and there isn't a fresh client to receive it we bail.
    channel.handleAction(action, channel.clients[0]);
    expect(channel.clients[0].dispatch).not.toHaveBeenCalled();
    expect(channel.clients[1].dispatch).not.toHaveBeenCalled();

    // If we get an action from the stale client the fresh client should get it.
    channel.handleAction(action, channel.clients[1]);
    expect(channel.clients[0].dispatch).toHaveBeenCalledWith(action);

    // If we get a state update request a fresh client
    // should get it and the channel be put on waiting.
    channel.handleAction(stateUpdateReq, channel.clients[0]);
    expect(channel.clients[0].dispatch).toHaveBeenCalledWith(stateUpdateReq);
    expect(channel.clients[1].dispatch).not.toHaveBeenCalledWith(
      stateUpdateReq
    );
    expect(channel.isWaitingStateUpdateReply).toBe(true);

    // If we get a state update reply the stale client should get it, the
    // fresh client should not and channel should be not longer on waiting.
    channel.handleAction(stateUpdateReply, channel.clients[0]);
    expect(channel.clients[0].dispatch).not.toHaveBeenCalledWith(
      stateUpdateReply
    );
    expect(channel.clients[1].dispatch).toHaveBeenCalledWith(stateUpdateReply);
    expect(channel.clients[1].stale).toBe(false);
    expect(channel.isWaitingStateUpdateReply).toBe(false);
  });

  test("broadcast", () => {
    const channel = new Channel("test");
    channel.clients = [new Client(jest.fn()), new Client(jest.fn())];
    const action = { type: "test" };

    // When we broadcast all recipients should get the action.
    channel.broadcast(action, channel.clients);
    channel.clients.forEach((c) =>
      expect(c.dispatch).toHaveBeenCalledWith(action)
    );
  });
});

describe("App", () => {
  test("getChannel", () => {
    const app = new App();

    // If the channel doesn't exist, it should be created.
    const channel = app.getChannel("test");
    expect(channel.name).toBe("test");

    // If the channel already exists, it should be retrieved.
    expect(app.getChannel("test")).toBe(channel);
  });

  test("attemptDisposeChannel", () => {
    const app = new App();

    // We cannot dispose a channel that doesn't exist.
    expect(() => app.attemptDisposeChannel("test")).not.toThrow();

    // We cannot dispose a channel that has clients.
    const channel = app.getChannel("test");
    channel.clients.push({} as Client);
    app.attemptDisposeChannel("test");
    expect(app.channels).toHaveProperty(channel.name, channel);

    // A disposed channel should be removed the channel list.
    channel.clients = [];
    expect(() => app.attemptDisposeChannel("test")).not.toThrow();
    expect(app.channels).not.toHaveProperty("test");
  });
});
