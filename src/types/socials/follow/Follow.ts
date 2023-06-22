interface Follow {
  user_id: number;
  follower_id: number;
  connected: boolean;
  status: string;
  followed_at: Date;
  hidden: boolean;
}

export default Follow;
