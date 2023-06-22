interface TaggedUserIds {
  id: number;
  uid: string;
  email: string;
  first_name: string;
  last_name: string;
  profile_background?: string;
  profile_message?: string;
  birth?: string;
  last_active_at?: string;
  video_able: number;
  call_able: number;
  contact: string;
  official_account: number;
  profile_image?: string;
  remember_me_token?: string;
  created_at: Date;
  updated_at: Date;
}

export default TaggedUserIds;
