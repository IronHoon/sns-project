import User from 'types/auth/User';
import Nullable from 'types/_common/Nullable';

export interface IDocs {
  _id: string;
  post_id: string;
  user_id: number;
  __v: number;
  user_info: Partial<User>;
}

export interface LikesList {
  docs: IDocs[];
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
