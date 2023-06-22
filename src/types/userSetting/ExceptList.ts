interface ExceptList extends Array<Except> {}

interface Except {
  id: number;
  user_id: number;
  except_user_id: number;
  created_at: Date;
  updated_at: Date;
  exceptUser: {
    id: number;
    uid: string;
    email?: string;
    contact: string;
    first_name: string;
    last_name: string;
    profile_message: string;
    profile_image: string;
    profile_background: string;
    birth: Date;
    recently_used_at?: Date;
    video_able: boolean;
    call_able: boolean;
    remember_me_token?: string;
    official_account: boolean;
    created_at: Date;
    updated_at: Date;
    deleted_reason?: string;
    deleted_at?: Date;
  };
}

export default ExceptList;
