import { post } from 'net/rest/api';
import TaggedUserIds from 'types/socials/posts/TaggedUserIds';
import LogUtil from '../LogUtil';

export const uploadPost = (
  value: string,
  media: any[],
  latitude: number = 0,
  longitude: number = 0,
  taged_user_ids: TaggedUserIds[] = [],
  region: string = '',
  callback: () => void,
) => {
  LogUtil.info('upload media', media);
  post('/socials/posts', {
    type: 'post',
    contents: value,
    media: media,
    latitude: latitude,
    longitude: longitude,
    region: region,
    taged_user_ids,
  })
    .then(callback)
    .catch((err) => console.warn('error!!!!', err.response));
};
