export type Action = { type: string };

export class App {
  channels: Record<string, Channel> = {};

  getChannel(name: string) {
    return (this.channels[name] ??= new Channel(name));
  }

  attemptDisposeChannel(name: string) {
    const channel = this.channels[name];
    if (!channel?.isEmpty()) {
      return;
    }
    delete this.channels[name];
  }
}

export class Client {
  stale: boolean;
  dispatch: (action: Action) => void;

  constructor(dispatch: (action: Action) => void) {
    this.stale = true;
    this.dispatch = dispatch;
  }
}

export class Channel {
  name: string;
  clients: Client[] = [];
  catchUpQueue: Action[] = [];
  isWaitingStateUpdateReply = false;

  constructor(name: string) {
    this.name = name;
  }

  createStateUpdateRequest() {
    return { type: "stateUpdateRequest" };
  }

  isStateUpdateRequest(action: Action) {
    return action.type === "stateUpdateRequest";
  }

  isStateUpdateReply(action: Action) {
    return action.type === "stateUpdateReply";
  }

  isEmpty() {
    return this.clients.length === 0;
  }

  addClient(client: Client) {
    if (this.isEmpty()) {
      client.stale = false;
    } else {
      this.requestStateUpdate();
    }
    this.clients.push(client);
    return client;
  }

  removeClient(client: Client) {
    this.clients = this.clients.filter((c) => c !== client);
    if (this.freshClients.length === 0 && this.staleClients.length > 0) {
      this.clients[0].stale = false;
    }
  }

  requestStateUpdate() {
    const freshClient = this.clients.find((client) => !client.stale);
    if (!freshClient) {
      throw new Error("Coudln't find a fresh client");
    }
    freshClient.dispatch(this.createStateUpdateRequest());
  }

  handleStateUpdateRequest(action: Action) {
    if (this.isWaitingStateUpdateReply) {
      return;
    }
    const recipients = this.freshClients.slice(0, 1);
    this.isWaitingStateUpdateReply = true;
    this.broadcast(action, recipients);
  }

  handleStateUpdateReply(action: Action) {
    const recipients = this.staleClients;
    recipients.forEach((client) => {
      client.stale = false;
    });
    this.isWaitingStateUpdateReply = false;
    this.broadcast(action, recipients);
    this.catchUpQueue.forEach((action) => {
      this.broadcast(action, recipients);
    });
    this.catchUpQueue = [];
  }

  handleAction(action: Action, sender: Client) {
    if (this.isStateUpdateRequest(action)) {
      this.handleStateUpdateRequest(action);
    } else if (this.isStateUpdateReply(action)) {
      this.handleStateUpdateReply(action);
    } else {
      const recipients = this.freshClients.filter(
        (client) => client !== sender
      );
      this.broadcast(action, recipients);
      if (!sender.stale && this.isWaitingStateUpdateReply) {
        this.catchUpQueue.push(action);
      }
    }
  }

  broadcast(action: Action, recipients: Client[]) {
    recipients.forEach((client) => {
      client.dispatch(action);
    });
  }

  get freshClients() {
    return this.clients.filter((client) => !client.stale);
  }

  get staleClients() {
    return this.clients.filter((client) => client.stale);
  }
}
