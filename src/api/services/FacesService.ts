/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreateFaceModel } from '../models/CreateFaceModel';
import type { UpdateFaceModel } from '../models/UpdateFaceModel';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class FacesService {
	/**
	 * @returns any OK
	 * @throws ApiError
	 */
	public static getApiFaces(): CancelablePromise<any> {
		return __request(OpenAPI, {
			method: 'GET',
			url: '/api/Faces',
		});
	}
	/**
	 * @returns any OK
	 * @throws ApiError
	 */
	public static postApiFaces({
		requestBody,
	}: {
		requestBody?: CreateFaceModel;
	}): CancelablePromise<any> {
		return __request(OpenAPI, {
			method: 'POST',
			url: '/api/Faces',
			body: requestBody,
			mediaType: 'application/json',
		});
	}
	/**
	 * @returns any OK
	 * @throws ApiError
	 */
	public static getApiFaces1({ id }: { id: number }): CancelablePromise<any> {
		return __request(OpenAPI, {
			method: 'GET',
			url: '/api/Faces/{id}',
			path: {
				id: id,
			},
		});
	}
	/**
	 * @returns any OK
	 * @throws ApiError
	 */
	public static putApiFaces({
		id,
		requestBody,
	}: {
		id: number;
		requestBody?: UpdateFaceModel;
	}): CancelablePromise<any> {
		return __request(OpenAPI, {
			method: 'PUT',
			url: '/api/Faces/{id}',
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
	public static deleteApiFaces({ id }: { id: number }): CancelablePromise<any> {
		return __request(OpenAPI, {
			method: 'DELETE',
			url: '/api/Faces/{id}',
			path: {
				id: id,
			},
		});
	}
}
