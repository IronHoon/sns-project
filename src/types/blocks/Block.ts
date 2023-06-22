import User from '../auth/User';

interface Friend {
  id: number;
  user_id: number;
  friend_id: number;
  block: number;
  custom_name?: string;
  is_favorite: number;
  is_mute: number;
  created_at: Date;
  updated_at: Date;
  user: User;
}

interface Block {
  blockData: {
    id: number;
    user_id: number;
    target_id: number;
    type?: string;
    created_at: Date;
    updated_at: Date;
  };
  friendList: Friend[];
  message: string;
}

export default Block;
