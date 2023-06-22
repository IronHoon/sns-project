import { Column } from 'components/layouts/Column';
import styled from 'styled-components/native';
import { COLOR } from 'constants/COLOR';
import React, { useMemo } from 'react';
import Room from 'types/chats/rooms/Room';
import AuthUtil from 'utils/AuthUtil';
import DateUtil from 'utils/DateUtil';
import { t } from 'i18next';
import { useAtomValue } from 'jotai';
import friendListAtom from 'stores/friendListAtom';
import userAtom from 'stores/userAtom';

const TitleText = styled.Text<{ fontSize: number }>`
  font-size: ${({ fontSize }) => fontSize};
  font-weight: bold;
  color: ${({ theme }) => (theme.dark ? COLOR.WHITE : COLOR.BLACK)};
  width: 150px;
  text-overflow: ellipsis;
`;
const LastAtText = styled.Text<{ fontSize: number }>`
  font-size: ${({ fontSize }) => fontSize - 4};
  color: #bbbbbb;
  margin-top: 1px;
  width: 165px;
`;
const CountText = styled.Text`
  font-size: 15px;
  font-weight: bold;
  color: ${COLOR.PRIMARY};
`;

type ChatRoomTitleProp = {
  roomState: Room;
};

function ChatRoomTitle({ roomState }: ChatRoomTitleProp) {
  const myUserId = AuthUtil.getUserId();
  const targetUser = roomState?.joined_users?.filter((user) => user.id !== myUserId)?.[0];
  const addedMeList = useAtomValue(friendListAtom);
  const isAddedMe = addedMeList?.includes(targetUser?.id);
  const user = useAtomValue(userAtom);

  const lastAt = useMemo(() => {
    if (roomState.type === 'chat') {
      const recent_login = targetUser?.user_setting?.sc_recent_login;
      if (recent_login === 'public' || (recent_login === 'friends' && isAddedMe))
        return DateUtil.timeForToday(targetUser?.last_active_at);
    }
    return '';
  }, [roomState]);

  let targetUserName;

  if (roomState.type === 'chat') {
    // LogUtil.error(`ChatRoomTitle messageDocs`, messageDocs);
    if (targetUser) {
      if (targetUser.uid.split('_').pop() === `deleted${targetUser.id}`) {
        targetUserName = `Deleted Account`;
      } else {
        targetUserName = `${targetUser?.first_name ?? ''} ${targetUser?.last_name ?? ''}`;
      }
    }
  }

  // LogUtil.info(`targetUserName:${targetUserName},roomState:`,roomState);
  return (
    <>
      {roomState.type === 'chat' && ( //1:1
        <Column>
          <TitleText fontSize={user?.setting.ct_text_size as number} numberOfLines={2}>
            {targetUserName}
          </TitleText>
          {lastAt !== '' && (
            <LastAtText numberOfLines={1} fontSize={user?.setting.ct_text_size as number}>
              {lastAt}
            </LastAtText>
          )}
        </Column>
      )}
      {roomState.type === 'group' && ( //group
        <Column>
          <TitleText fontSize={user?.setting.ct_text_size as number} numberOfLines={2}>
            Group Chat
            <CountText> {roomState?.joined_user_ids?.length}</CountText>
          </TitleText>
          {/* {lastAt !== '' && <LastAtText>{lastAt}</LastAtText>} */}
        </Column>
      )}
      {roomState.type === 'me' && ( //me
        <Column>
          <TitleText fontSize={user?.setting.ct_text_size as number} numberOfLines={2}>
            {t('chats-main.My Chatroom')}
          </TitleText>
        </Column>
      )}
    </>
  );
}

export default ChatRoomTitle;
