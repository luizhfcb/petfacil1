import { API_URL } from '../config';
import { createApiClient } from './apiClient';

export { ApiError } from './apiClient';
export const api = createApiClient(API_URL);
