import User from 'types/auth/User';
import DateOrString from 'types/_common/DateOrString';

interface Comments {
  post_id: string;
  user_id: number;
  contents: string;
  depth: number;
  group: number;
  group_order: number;
  is_hidden_users: number[];
  created_at: DateOrString;
  deleted_at?: DateOrString;
  _id: string;
  __v: boolean;
  user: Partial<User>;
}

export default Comments;
