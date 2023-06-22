import { remove } from 'net/rest/api';

export const cancelFollow = (followerId: number, callBack: () => void) => {
  remove(`/socials/follows/${followerId}`)
    .then(callBack)
    .catch((err) => console.warn('error!!!!', err.response));
};
