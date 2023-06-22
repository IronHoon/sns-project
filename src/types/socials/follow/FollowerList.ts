import { IItem } from 'types/socials/follow/IItem';

export interface FollowerList {
  items: IItem[];
  meta: {
    totalItems: number;
    itemCount: number;
    itemsPerPage: number;
    totalPages: number;
    currentPage: number;
  };
}
