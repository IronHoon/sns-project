import { post } from 'net/rest/api';

export const likePost = (postId: string, userId: number, callback: () => void) => {
  post('/socials/likes', {
    post_id: postId,
    post_user_id: userId,
  })
    .then(callback)
    .catch((err) => console.warn('error!!!!', err.response));
};
