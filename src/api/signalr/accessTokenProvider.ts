/** Resolves the current JWT on each SignalR negotiate / reconnect (PSH1-C1). */
export type AccessTokenProvider = () => string | null;
