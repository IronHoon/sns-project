import Block from 'types/blocks/Block';
import Contact from 'types/contacts/Contact';
import Follow from 'types/socials/follow/Follow';
import BooleanOrNumber from 'types/_common/BooleanOrNumber';
import DateOrString from 'types/_common/DateOrString';
import Nullable from 'types/_common/Nullable';

interface Setting {
  id: number;
  user_id: number;
  language: string;
  nt_preview: boolean;
  nt_group_chat: boolean;
  nt_inapp_noti: number;
  nt_inapp_sound: number;
  nt_inapp_vibrate: number;
  nt_disturb: number;
  nt_disturb_begin: DateOrString;
  nt_disturb_end: DateOrString;
  nt_market: boolean;
  nt_email: boolean;
  nt_sns_likes: boolean;
  nt_sns_comment: boolean;
  nt_sns_tag: boolean;
  nt_sns_followers: boolean;
  nt_sns_live: boolean;
  nt_sns_live_target: string;
  nt_sns_live_invitation: boolean;
  sc_recent_login: 'public' | 'friends' | 'private';
  sc_profile_photo: 'public' | 'friends' | 'private';
  sc_group_call: 'public' | 'friends' | 'private';
  sc_passcode_auth: boolean;
  sc_birthday_bound: boolean;
  sc_add_automatically: boolean;
  sc_biometric_auth: boolean;
  sc_sns_account: 'public' | 'private';
  sc_sns_post: 'public' | 'friends' | 'private';
  sc_sns_live: 'public' | 'friends' | 'private';
  sc_sns_tag: 'public' | 'friends' | 'private';
  ct_active_chat: boolean;
  ct_word_suggestion: number;
  ct_chat_theme: string;
  ct_background_type: string;
  ct_background: string;
  ct_text_size: number;
  created_at: DateOrString;
  updated_at: DateOrString;
  sc_voice_call: 'public' | 'friends' | 'private';
  sc_video_call: 'public' | 'friends' | 'private';
  sc_birthday: 'public' | 'friends' | 'private';
  sc_show_full_birthday: number;
}

interface User {
  id: number; //id: 2,
  uid: string; //uid: "admin11",
  email: Nullable<string>;
  contact: string;
  first_name: string;
  last_name: string;
  profile_message: Nullable<string>;
  profile_image: string;
  profile_background: Nullable<string>;
  birth: Nullable<string>;
  recently_used_at?: Nullable<string>;
  video_able: BooleanOrNumber;
  call_able: BooleanOrNumber;
  remember_me_token?: Nullable<string>;
  official_account: BooleanOrNumber;
  created_at: DateOrString;
  updated_at: DateOrString;
  deleted_reason?: Nullable<string>;
  deleted_at?: Nullable<DateOrString>;
  friend?: Contact;
  following?: Follow;
  follower?: Follow;
  block?: Block;
  last_active_at: string;
  sync_contact_at: string;
  qrcode?: string;
  setting: Setting;
  is_friend?: boolean;
  is_block?: boolean;
  sc_profile_photo?: string;
  user_setting?: Setting;
}

export default User;
