import User from 'types/auth/User';
import DateOrString from 'types/_common/DateOrString';
import Posts from './Posts';
import TaggedUserIds from './TaggedUserIds';
import BooleanOrNumber from 'types/_common/BooleanOrNumber';
export interface Media {
  type: string;
  url: string;
}

interface PostDetail {
  _id: string;
  user_id: number;
  taged_user_ids: TaggedUserIds[];
  contents: string;
  live_watching_user?: number;
  image: string[];
  hashtag: string[];
  video?: string;
  location: string;
  shared_post: Posts[];
  media: Media[];
  shared_post_id?: string;
  type: string;
  is_hidden_users: number[];
  status?: string;
  created_at: DateOrString;
  updated_at: DateOrString;
  deleted_at?: DateOrString;
  __v: boolean;
  is_like: BooleanOrNumber;
  likecount: number;
  commentcount: number;
  user: User;
  latitude: number;
  longitude: number;
  region: string;
}

export default PostDetail;
