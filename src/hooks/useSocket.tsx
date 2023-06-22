import { useAtom } from 'jotai';
import chatStatusAtom, { ChatStatusField } from 'stores/chatStatusAtom';
import ChatSocketUtil from 'utils/chats/ChatSocketUtil';
import useForceUpdate from './useForceUpdate';

export type ChatStatusUpdateType = (field: ChatStatusField, value: any) => void;
export default function useSocket() {
  const { forceUpdate: forceUpdateForChatStatus } = useForceUpdate();
  const [chatStatus] = useAtom(chatStatusAtom);

  ChatSocketUtil.instance.chatStatus = chatStatus;
  ChatSocketUtil.instance.forceUpdateForChatStatus = forceUpdateForChatStatus;

  return {
    chatStatus,
    chatSocketUtil: ChatSocketUtil.instance,
    forceUpdateForChatStatus,
  };
}
