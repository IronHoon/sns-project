import React from 'react';
import { Image } from 'react-native';
import DateUtil from '../../../../utils/DateUtil';
import styled from 'styled-components/native';
import { COLOR } from '../../../../constants/COLOR';
import LogUtil from '../../../../utils/LogUtil';

const TimeStampContainer = styled.View<{ justify: string }>`
  align-items: ${({ justify }) => justify};
  margin-bottom: 3px;
`;

const UnreadCount = styled.Text`
  color: ${COLOR.PRIMARY};
  font-size: 11px;
  margin-bottom: 1px;
`;

const TimeStamp = styled.Text`
  color: ${COLOR.DARK_GRAY};
  font-size: 11px;
`;

const TimeStampBubble = ({ isMe, unreadCount, createdAt }: { isMe; unreadCount: number | null; createdAt }) => {
  return (
    <TimeStampContainer justify={isMe ? 'flex-end' : 'flex-start'}>
      {(unreadCount ?? -1) >= 0 ? (
        <UnreadCount>{unreadCount ? unreadCount : ''}</UnreadCount>
      ) : (
        <Image source={require('assets/triangle-arrow-left-10.png')} style={{ width: 10, height: 10 }} />
      )}
      <TimeStamp>{DateUtil.getTime(createdAt)}</TimeStamp>
    </TimeStampContainer>
  );
};

export default React.memo(TimeStampBubble);
