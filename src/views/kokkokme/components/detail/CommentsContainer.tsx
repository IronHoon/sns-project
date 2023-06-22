import React, { useCallback, useEffect, useState } from 'react';

import Comments from 'types/socials/comments/Comments';
import Comment from 'views/kokkokme/components/detail/Comment';
import { useFocusEffect } from '@react-navigation/native';
import { FlatList } from 'react-native';

interface Props {
  data: Comments[];
  onSuccessReq: () => void;
  commentMutate: () => void;
  postMutate: () => void;
  handle: () => void;
}

const CommentsContainer = ({ postMutate, commentMutate, data, onSuccessReq, handle }: Props) => {
  const [commentId, setCommentId] = useState<string>('');

  return data.map((comment) => (
    <Comment
      commentId={commentId}
      setCommentId={setCommentId}
      key={comment._id}
      postMutate={postMutate}
      commentMutate={commentMutate}
      data={comment}
      onSuccessReq={onSuccessReq}
    />
  ));
};

export default CommentsContainer;
