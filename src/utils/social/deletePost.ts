import { remove } from 'net/rest/api';

export const deletePost = (postId: string, callback: () => void) => {
  remove(`/socials/posts/${postId}`)
    .then(callback)
    .catch((err) => console.warn('error!!!!', err.response));
};
