import axios from 'axios';
import type { AxiosInstance } from 'axios';
import { BasePath } from '../config';

const baseURL: string = `${BasePath}/api`;

export const axiosInstance: AxiosInstance = axios.create({
  baseURL,
  withCredentials: true,
});
