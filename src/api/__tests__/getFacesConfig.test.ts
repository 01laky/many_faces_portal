/**
 * getFacesConfig.test.ts - Tests for getFacesConfig function
 * 
 * Tests verify that faces configuration is correctly fetched from backend API.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import axios from 'axios';
import { getFacesConfig } from '../config/getFacesConfig';
import type { FacesConfigResponse, FaceConfig, PageConfig } from '../types/facesConfig';
import { env } from '../../config/env';
import { logger } from '../../utils/logger';

// Mock axios
vi.mock('axios');
const mockedAxios = vi.mocked(axios);

// Mock logger
vi.mock('../../utils/logger', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock env
vi.mock('../../config/env', () => ({
  env: {
    apiUrl: 'http://localhost:8000',
  },
}));

describe('getFacesConfig', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const mockFacesConfig: FacesConfigResponse = [
    {
      index: 'public',
      id: 1,
      title: 'Public',
      description: 'Public face',
      color: '#007bff',
      isPublic: true,
      pages: [
        {
          index: 0,
          id: 1,
          name: 'Home',
          description: null,
          path: '/home',
          pageType: {
            index: 'home',
            id: 1,
          },
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: null,
          routeTranslations: [],
        },
        {
          index: 1,
          id: 2,
          name: 'Login',
          description: null,
          path: '/login',
          pageType: {
            index: 'static',
            id: 2,
          },
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: null,
          routeTranslations: [],
        },
      ],
    },
    {
      index: 'basic',
      id: 2,
      title: 'Basic',
      description: 'Basic face',
      color: '#28a745',
      isPublic: false,
      pages: [
        {
          index: 0,
          id: 3,
          name: 'Home',
          path: '/home',
          pageType: {
            index: 'home',
            id: 1,
          },
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: null,
          routeTranslations: [],
        },
      ],
    },
  ];

  it('should fetch faces config successfully', async () => {
    // Arrange
    mockedAxios.get.mockResolvedValueOnce({
      data: mockFacesConfig,
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {},
    });

    // Act
    const result = await getFacesConfig();

    // Assert
    expect(mockedAxios.get).toHaveBeenCalledWith(`${env.apiUrl}/api/faces/config`);
    expect(result).toEqual(mockFacesConfig);
    expect(result).toHaveLength(2);
    expect(result[0].index).toBe('public');
    expect(result[0].pages).toHaveLength(2);
  });

  it('should log info when config is loaded successfully', async () => {
    // Arrange
    mockedAxios.get.mockResolvedValueOnce({
      data: mockFacesConfig,
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {},
    });

    // Act
    await getFacesConfig();

    // Assert
    expect(logger.info).toHaveBeenCalledWith('Faces config loaded', {
      faceCount: 2,
      totalPages: 3,
    });
  });

  it('should throw error when API request fails', async () => {
    // Arrange
    const error = new Error('Network error');
    mockedAxios.get.mockRejectedValueOnce(error);

    // Act & Assert
    await expect(getFacesConfig()).rejects.toThrow('Network error');
    expect(logger.error).toHaveBeenCalledWith('Failed to fetch faces config', { error });
  });

  it('should return empty array when API returns null data', async () => {
    // Arrange
    mockedAxios.get.mockResolvedValueOnce({
      data: null,
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {},
    });

    // Act
    const result = await getFacesConfig();

    // Assert - should handle null gracefully and return empty array
    expect(result).toEqual([]);
    expect(result).toHaveLength(0);
  });

  it('should return empty array when no faces exist', async () => {
    // Arrange
    mockedAxios.get.mockResolvedValueOnce({
      data: [],
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {},
    });

    // Act
    const result = await getFacesConfig();

    // Assert
    expect(result).toEqual([]);
    expect(result).toHaveLength(0);
  });

  it('should correctly parse faces with all required fields', async () => {
    // Arrange
    mockedAxios.get.mockResolvedValueOnce({
      data: mockFacesConfig,
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {},
    });

    // Act
    const result = await getFacesConfig();

    // Assert
    const face = result[0];
    expect(face).toHaveProperty('index');
    expect(face).toHaveProperty('id');
    expect(face).toHaveProperty('title');
    expect(face).toHaveProperty('description');
    expect(face).toHaveProperty('color');
    expect(face).toHaveProperty('pages');
  });

  it('should correctly parse pages with all required fields', async () => {
    // Arrange
    mockedAxios.get.mockResolvedValueOnce({
      data: mockFacesConfig,
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {},
    });

    // Act
    const result = await getFacesConfig();

    // Assert
    const page = result[0].pages[0];
    expect(page).toHaveProperty('index');
    expect(page).toHaveProperty('id');
    expect(page).toHaveProperty('name');
    expect(page).toHaveProperty('path');
    expect(page).toHaveProperty('pageType');
    expect(page).toHaveProperty('createdAt');
    expect(page.pageType).toHaveProperty('index');
    expect(page.pageType).toHaveProperty('id');
  });

  it('should handle faces with empty pages array', async () => {
    // Arrange
    const faceWithoutPages: FacesConfigResponse = [
      {
        index: 'empty',
        id: 999,
        title: 'Empty Face',
        description: null,
        color: null,
        isPublic: true,
        pages: [],
      },
    ];

    mockedAxios.get.mockResolvedValueOnce({
      data: faceWithoutPages,
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {},
    });

    // Act
    const result = await getFacesConfig();

    // Assert
    expect(result[0].pages).toEqual([]);
    expect(result[0].pages).toHaveLength(0);
  });

  it('should calculate total pages count correctly in log', async () => {
    // Arrange
    mockedAxios.get.mockResolvedValueOnce({
      data: mockFacesConfig,
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {},
    });

    // Act
    await getFacesConfig();

    // Assert
    expect(logger.info).toHaveBeenCalledWith('Faces config loaded', {
      faceCount: 2,
      totalPages: 3, // 2 pages in first face + 1 page in second face
    });
  });
});
