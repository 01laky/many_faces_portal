import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { absoluteScopedUrl } from '../faceApiRouting';

/**
 * Shared SignalR hub construction (messenger, chat room, …) with JWT access token.
 */
export function buildAuthenticatedHubConnection(
  hubRelativePath: string,
  accessToken: string
): HubConnection {
  const hubUrl = absoluteScopedUrl(hubRelativePath);
  return new HubConnectionBuilder()
    .withUrl(hubUrl, { accessTokenFactory: () => accessToken })
    .withAutomaticReconnect()
    .build();
}
