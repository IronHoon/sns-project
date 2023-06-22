import { remove } from 'net/rest/api';

export const deleteComment = (commentId: string, callback: () => void) => {
  remove(`/socials/comments/${commentId}`)
    .then(callback)
    .catch((err) => console.warn('error!!!!', err.response));
};
