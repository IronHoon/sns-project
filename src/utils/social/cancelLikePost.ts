import { remove } from 'net/rest/api';
import { IDocs } from 'types/socials/likes/LikesList';

export const cancelLikePost = (docs: IDocs[], myId: number | undefined, callback: () => void) => {
  docs.find((likes) => {
    console.log('is_like:', likes.user_id);
    console.log('myId : ', myId);
    if (likes.user_id === myId) {
      console.log('myId : ', myId);
      remove(`/socials/likes/${likes._id}`)
        .then(() => {
          callback();
        })
        .catch((err) => console.warn('error!!!!', err.response));
    }
  });
};
