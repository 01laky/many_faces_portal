/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { LoginModel } from '../models/LoginModel';
import type { RegisterModel } from '../models/RegisterModel';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class AuthService {
	/**
	 * @returns any OK
	 * @throws ApiError
	 */
	public static postApiAuthRegister({
		requestBody,
	}: {
		requestBody?: RegisterModel;
	}): CancelablePromise<any> {
		return __request(OpenAPI, {
			method: 'POST',
			url: '/api/Auth/register',
			body: requestBody,
			mediaType: 'application/json',
		});
	}
	/**
	 * @returns any OK
	 * @throws ApiError
	 */
	public static postApiAuthLogin({
		requestBody,
	}: {
		requestBody?: LoginModel;
	}): CancelablePromise<any> {
		return __request(OpenAPI, {
			method: 'POST',
			url: '/api/Auth/login',
			body: requestBody,
			mediaType: 'application/json',
		});
	}
	/**
	 * @returns any OK
	 * @throws ApiError
	 */
	public static postApiAuthLogout(): CancelablePromise<any> {
		return __request(OpenAPI, {
			method: 'POST',
			url: '/api/Auth/logout',
		});
	}
}
