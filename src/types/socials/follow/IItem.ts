import User from 'types/auth/User';

export interface IItem {
  id: number;
  user_id: number;
  follower_id: number;
  status: 'approve' | 'private';
  hidden: boolean;
  connected?: number;
  created_at?: Date;
  updated_at?: Date;
  follower?: Partial<User>;
  following?: Partial<User>;
}
