import User from 'types/auth/User';
import DateOrString from 'types/_common/DateOrString';
import Nullable from 'types/_common/Nullable';

type TActivityTypes = 'like' | 'comment' | 'follow' | 'tag';

export interface IActivityDocs {
  _id: string;
  user_id: number;
  type: TActivityTypes;
  target_user_id: number;
  target_id: string;
  read: boolean;
  created_at: DateOrString;
  __v: number;
  user_info: Partial<User>;
}

export interface IActivities {
  docs: IActivityDocs[];
  totalDocs: number;
  limit: number;
  totalPages: number;
  page: number;
  pagingCounter: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
  prevPage: Nullable<number>;
  nextPage: Nullable<number>;
}
