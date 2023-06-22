import axios from 'axios';
import useSWR, {mutate} from 'swr';

function fetcher(url: string) {
    return axios.get(url).then(response => response.data);
}

export default function useFetch(url: string, useLog: boolean = false) {
    return useFetchWithType<any>(url, useLog);
}

export function useFetchWithType<ResponseType>(
    url: string,
    useLog: boolean = false,
) {
    useLog && console.log(`${url} request`, '');
    const swrResponse = useSWR<ResponseType>(url, fetcher);
    useLog && console.log(`${url} response : `, swrResponse);
    return swrResponse;
}

export function preload(url: string) {
    console.log('preload : ' + url);
    return mutate(url, fetcher(url));
}
