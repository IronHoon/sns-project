import axios from 'axios';
import useSWR, { mutate } from 'swr';
import LogUtil from 'utils/LogUtil';

function fetcher(url: string) {
  return axios.get(url).then((response) => response.data);
}

export default function useFetch(url: string, useLog: boolean = false) {
  return useFetchWithType<any>(url, useLog);
}

export function useFetchWithType<ResponseType>(url: string, useLog: boolean = false) {
  useLog && LogUtil.info(`${url} request`, '');
  const swrResponse = useSWR<ResponseType>(url, fetcher);
  useLog && LogUtil.info(`${url} response : `, swrResponse);
  return swrResponse;
}

export function preload(url: string) {
  LogUtil.info('preload : ' + url);
  return mutate(url, fetcher(url));
}
