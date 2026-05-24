import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { absoluteScopedUrl } from '../faceApiRouting';
import type { AccessTokenProvider } from './accessTokenProvider';

/**
 * Shared SignalR hub construction (messenger, chat room, …) with JWT access token.
 * Accepts a provider so negotiate/reconnect reads the latest token (PSH1-C1).
 */
export function buildAuthenticatedHubConnection(
  hubRelativePath: string,
  accessTokenProvider: AccessTokenProvider | string
): HubConnection {
  const factory: AccessTokenProvider =
    typeof accessTokenProvider === 'function'
      ? accessTokenProvider
      : () => accessTokenProvider;

  const hubUrl = absoluteScopedUrl(hubRelativePath);
  return new HubConnectionBuilder()
    .withUrl(hubUrl, { accessTokenFactory: () => factory() ?? '' })
    .withAutomaticReconnect()
    .build();
}
