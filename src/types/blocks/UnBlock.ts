interface Block {
  id: number;
  user_id: number;
  target_id: number;
  type: string;
  created_at: Date;
  updated_at: Date;
}
interface UnBlock {
  blocklist: Block[];
  message: string;
}

export default UnBlock;
