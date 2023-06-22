import { patch } from 'net/rest/api';
import TaggedUserIds from 'types/socials/posts/TaggedUserIds';
import { Media } from '../../types/socials/posts/PostDetail';

export const editPost = (
  value: string,
  media: Media[],
  latitude: number = 0,
  longitude: number = 0,
  taged_user_ids: TaggedUserIds[] = [],
  region: string,
  callback: () => void,
  id: string,
) => {
  console.log('수정');
  patch(`/socials/posts/${id}`, {
    contents: value,
    media: media,
    latitude,
    longitude,
    taged_user_ids,
    region,
  })
    .then(() => {
      callback();
    })
    .catch((err) => console.warn('error!!!!', err.response));
};
