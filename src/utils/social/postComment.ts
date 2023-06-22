import { post } from 'net/rest/api';

export const postComment = (
  postId: string,
  contents: string,
  myId: number = 0,
  callback: () => void,
  groupId?: number,
) => {
  post('/socials/comments', {
    post_id: postId,
    contents,
    post_user_id: myId,
    group: groupId ? groupId : 0,
  })
    .then(callback)
    .catch((err) => console.warn('error!!!!', err.response));
};
