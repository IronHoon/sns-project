import axios, { AxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-community/async-storage';
import LogUtil from 'utils/LogUtil';
import Nullable from 'types/_common/Nullable';

function handleError(error: any, errorHandler: ((error: any) => void) | undefined) {
  if (errorHandler) {
    errorHandler(error);
  } else {
    throw error;
  }
}

export async function get<ResponseType>(
  url: string,
  config: Nullable<AxiosRequestConfig> = null,
  errorHandler?: (error: any) => void,
  useLog: boolean = false,
) {
  try {
    useLog && LogUtil.info(`[get]${url} request`, '');
    const response = await axios.get(url, config ?? undefined);
    useLog && LogUtil.info(`[get]${url} response : `, response.data);
    return response.data as ResponseType;
  } catch (error: any) {
    handleError(error, errorHandler);
  }
}

export async function post<ResponseType, ParamType>(
  url: string,
  params: ParamType,
  config: Nullable<AxiosRequestConfig> = null,
  errorHandler?: (error: any) => void,
  useLog: boolean = false,
) {
  try {
    useLog && LogUtil.info(`[post]${url} request params`, params);
    const response = await axios.post(url, params, config ?? undefined);
    useLog && LogUtil.info(`[post]${url} response : `, response.data);
    return response.data as ResponseType;
  } catch (error: any) {
    handleError(error, errorHandler);
  }
}

export async function patch<ResponseType, ParamType>(
  url: string,
  params: ParamType,
  config: Nullable<AxiosRequestConfig> = null,
  errorHandler?: (error: any) => void,
  useLog: boolean = false,
) {
  try {
    useLog && LogUtil.info(`[patch]${url} request params`, params);
    const response = await axios.patch(url, params, config ?? undefined);
    useLog && LogUtil.info(`[patch]${url} response : `, response.data);
    return response.data as ResponseType;
  } catch (error: any) {
    handleError(error, errorHandler);
  }
}

export async function put<ResponseType, ParamType>(
  url: string,
  params: ParamType,
  config: Nullable<AxiosRequestConfig> = null,
  errorHandler?: (error: any) => void,
  useLog: boolean = false,
) {
  try {
    useLog && LogUtil.info(`[put]${url} request params`, params);
    const response = await axios.put(url, params, config ?? undefined);
    useLog && LogUtil.info(`[put]${url} response : `, response.data);
    return response.data as ResponseType;
  } catch (error: any) {
    handleError(error, errorHandler);
  }
}

export async function remove<ResponseType>(
  url: string,
  config: Nullable<AxiosRequestConfig> = null,
  errorHandler?: (error: any) => void,
  useLog: boolean = false,
) {
  try {
    useLog && LogUtil.info(`[remove]${url} request`, '');
    const response = await axios.delete(url, config ?? undefined);
    useLog && LogUtil.info(`[remove]${url} response : `, response.data);
    return response.data as ResponseType;
  } catch (error: any) {
    handleError(error, errorHandler);
  }
}

export async function rememberToken(token: string) {
  LogUtil.info('rememberToken token', token);
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  await AsyncStorage.setItem('token', token);
}

export function getToken() {
  return (axios.defaults.headers.common['Authorization'] ?? '').toString().split(' ')?.[1];
}

export function removeToken() {
  LogUtil.info('removeToken token', axios.defaults.headers.common['Authorization']);
  delete axios.defaults.headers.common['Authorization'];
  AsyncStorage.removeItem('token');
}
