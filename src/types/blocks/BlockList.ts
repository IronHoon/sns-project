import User from 'types/auth/User';

interface Block {
  id: number;
  user_id: number;
  target_id: number;
  type: string;
  created_at: Date;
  updated_at: Date;
  target: User;
}

interface BlockList {
  blocklist: Block[];
  message: string;
}

export default BlockList;
