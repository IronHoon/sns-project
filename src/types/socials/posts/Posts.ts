import BooleanOrNumber from 'types/_common/BooleanOrNumber';
import DateOrString from 'types/_common/DateOrString';
import TaggedUserIds from './TaggedUserIds';

interface Posts {
  user_id: number;
  taged_user_ids: TaggedUserIds[];
  contents: string;
  live_watching_user: number;
  image: string[];
  hashtag: string[];
  video?: string;
  location: string;
  shared_post: Posts[];
  shared_post_id?: string; //TODO: 데이터 타입확인필요
  type: string;
  is_hidden_users: number[];
  status: string;
  created_At: DateOrString;
  updated_At: DateOrString;
  deleted_at?: DateOrString;
  _id: string;
  __v: boolean;
  is_Like: BooleanOrNumber;
  likecount: number;
  commentcount: number;
  latitude: number;
  longitude: number;
}

export default Posts;
