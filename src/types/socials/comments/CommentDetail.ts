import User from 'types/auth/User';
import Comments from './Comments';
interface CommentsDetail extends Comments {
  user_info: User;
}

export default CommentsDetail;
