/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { OAuth2RegisterModel } from '../models/OAuth2RegisterModel';
import type { OAuth2TokenRequest } from '../models/OAuth2TokenRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class OAuth2Service {
	/**
	 * @returns any OK
	 * @throws ApiError
	 */
	public static postApiOauth2Token({
		requestBody,
	}: {
		requestBody?: OAuth2TokenRequest;
	}): CancelablePromise<any> {
		return __request(OpenAPI, {
			method: 'POST',
			url: '/api/oauth2/token',
			body: requestBody,
			mediaType: 'application/json',
		});
	}
	/**
	 * @returns any OK
	 * @throws ApiError
	 */
	public static postApiOauth2Register({
		requestBody,
	}: {
		requestBody?: OAuth2RegisterModel;
	}): CancelablePromise<any> {
		return __request(OpenAPI, {
			method: 'POST',
			url: '/api/oauth2/register',
			body: requestBody,
			mediaType: 'application/json',
		});
	}
}
