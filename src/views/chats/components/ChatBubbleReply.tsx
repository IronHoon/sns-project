import { t } from 'i18next';
import { useAtomValue } from 'jotai';
import React, { useCallback, useMemo } from 'react';
import { Text } from 'react-native';
import userAtom from 'stores/userAtom';
import Message from 'types/chats/rooms/messages/Message';

type ChatBubbleReplyProp = { reply_message: Message; style? };
const ChatBubbleReply = ({ reply_message, style }: ChatBubbleReplyProp) => {
  const myUser = useAtomValue(userAtom);
  const reply_text = useMemo(() => {
    if (reply_message?.type === 'image') {
      return `[ ${t('chats-main.Photo')} ]`;
    }
    if (reply_message?.type === 'video') {
      return `[ ${t('chats-main.Video')} ]`;
    }
    if (reply_message?.type === 'record') {
      return `[ ${t('chats-main.Record')} ]`;
    }
    if (reply_message?.type === 'file') {
      return `[ ${t('chats-main.File')} ]`;
    }
    if (reply_message?.type === 'contact') {
      return `[ ${t('chats-main.Contact')} ]`;
    }
    if (reply_message?.type === 'location') {
      return `[ ${t('chats-main.Location')} ]`;
    }
    if (reply_message?.type === 'system') {
      return `[ ${t('chats-main.System')} ]`;
    }
    return reply_message?.content;
  }, [reply_message]);

  const userName = `${reply_message?.user?.first_name ?? ''} ${reply_message?.user?.last_name ?? ''}`;
  const sender = myUser?.id === reply_message?.user?.id ? t('chats-main.me') : userName;

  return (
    <>
      <Text style={[style, { fontWeight: '500', fontSize: 15 }]}>{`${t('chats-main.Reply to')} ${sender}`}</Text>
      <Text style={style} numberOfLines={1}>
        {reply_text}
      </Text>
    </>
  );
};

export default ChatBubbleReply;
