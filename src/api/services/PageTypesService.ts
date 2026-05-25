/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreatePageTypeModel } from '../models/CreatePageTypeModel';
import type { UpdatePageTypeModel } from '../models/UpdatePageTypeModel';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class PageTypesService {
	/**
	 * @returns any OK
	 * @throws ApiError
	 */
	public static getApiPageTypes(): CancelablePromise<any> {
		return __request(OpenAPI, {
			method: 'GET',
			url: '/api/PageTypes',
		});
	}
	/**
	 * @returns any OK
	 * @throws ApiError
	 */
	public static postApiPageTypes({
		requestBody,
	}: {
		requestBody?: CreatePageTypeModel;
	}): CancelablePromise<any> {
		return __request(OpenAPI, {
			method: 'POST',
			url: '/api/PageTypes',
			body: requestBody,
			mediaType: 'application/json',
		});
	}
	/**
	 * @returns any OK
	 * @throws ApiError
	 */
	public static getApiPageTypes1({ id }: { id: number }): CancelablePromise<any> {
		return __request(OpenAPI, {
			method: 'GET',
			url: '/api/PageTypes/{id}',
			path: {
				id: id,
			},
		});
	}
	/**
	 * @returns any OK
	 * @throws ApiError
	 */
	public static putApiPageTypes({
		id,
		requestBody,
	}: {
		id: number;
		requestBody?: UpdatePageTypeModel;
	}): CancelablePromise<any> {
		return __request(OpenAPI, {
			method: 'PUT',
			url: '/api/PageTypes/{id}',
			path: {
				id: id,
			},
			body: requestBody,
			mediaType: 'application/json',
		});
	}
	/**
	 * @returns any OK
	 * @throws ApiError
	 */
	public static deleteApiPageTypes({ id }: { id: number }): CancelablePromise<any> {
		return __request(OpenAPI, {
			method: 'DELETE',
			url: '/api/PageTypes/{id}',
			path: {
				id: id,
			},
		});
	}
}
