import User from 'types/auth/User';
import DateOrString from 'types/_common/DateOrString';
import Nullable from 'types/_common/Nullable';

interface Contact {
  id: number;
  user_id: number;
  friend_id: number;
  block?: boolean;
  custom_name: Nullable<string>;
  is_favorite?: number;
  is_mute?: number;
  created_at?: DateOrString;
  updated_at?: DateOrString;
  friend: User;
}

export default Contact;
