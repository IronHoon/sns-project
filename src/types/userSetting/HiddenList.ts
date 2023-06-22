import User from 'types/auth/User';

interface HiddenList {
  items: Item[];
  meta: {
    totalItems: number;
    itemCount: number;
    itemsPerPage: number;
    totalPages: number;
    currentPage: number;
  };
}

interface Item {
  id: number;
  user_id: number;
  follower_id: number;
  status: string;
  hidden: boolean;
  created_at?: Date;
  updated_at: Date;
  hidden_user: User;
}

export default HiddenList;
