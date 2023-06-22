import User from 'types/auth/User';
import PostDetail from '../posts/PostDetail';
import TaggedUserIds from '../posts/TaggedUserIds';

interface Post {
  _id: string;
  user_id: number;
  taged_user_ids: TaggedUserIds[];
  contents: string;
  image: string[];
  video: string;
  shared_post?: PostDetail;
  shared_post_id: string;
  type: string;
  is_hidden_users: number[];
  status: string;
  created_at: string;
  updated_at: string;
  deleted_at: string;
  media: any[];
  __v: boolean;
  is_like: boolean;
  likecount: number;
  commentcount: number;
  user: User;
  latitude: number;
  longitude: number;
  region?: string;
}

export default Post;
