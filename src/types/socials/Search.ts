import Posts from 'types/socials/posts/Posts';
import Nullable from 'types/_common/Nullable';

interface IPostResult {
  docs: Partial<Posts>[];
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

export default IPostResult;
