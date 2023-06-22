import { post } from 'net/rest/api';

export const followBack = (followerId: number, callBack: () => void) => {
  post('/socials/follows', {
    follower_id: followerId,
  })
    .then(callBack)
    .catch((err) => console.warn('error!!!!', err.response));
};
