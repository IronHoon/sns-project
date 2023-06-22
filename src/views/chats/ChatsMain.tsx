// import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
// import NavbarLayout from 'components/layouts/NavbarLayout';
// import TitleHeader from 'components/molecules/TitleHeader';
// import IconButton from 'components/atoms/MIconButton';
// import Tail from 'assets/tail.svg';
// import styled, { ThemeContext } from 'styled-components/native';
// import { COLOR } from 'constants/COLOR';
// import NoChatRoom from './components/NoChatRoom';
// import { useFocusEffect, useNavigation } from '@react-navigation/native';
// import { MainNavigationProp } from 'navigations/MainNavigator';
// import ChatListItem from './components/ChatListItem';
// import ArchiveIcon from 'assets/ic-archive.svg';
// import { SwipeListView } from 'react-native-swipe-list-view';
// import ChatRoomQuickActions from './components/ChatRoomQuickActions';
// import { ModalBase } from 'components/modal';
// import { Column } from 'components/layouts/Column';
// import { Row } from 'components/layouts/Row';
// import { LoadingModal } from 'react-native-loading-modal';
// import {
//   ActivityIndicator,
//   Dimensions,
//   Platform,
//   TouchableOpacity,
//   TouchableWithoutFeedback,
//   View,
// } from 'react-native';
// import BackHeader from 'components/molecules/BackHeader';
// import MainLayout from 'components/layouts/MainLayout';
// import Room, { OnRoomsType, roomSort } from 'types/chats/rooms/Room';
// import LogUtil from 'utils/LogUtil';
// import ChatSocketUtil from 'utils/chats/ChatSocketUtil';
// import Nullable from 'types/_common/Nullable';
// import ChatHttpUtil from 'utils/chats/ChatHttpUtil';
// import tw from 'twrnc';
// import { useTranslation } from 'react-i18next';
// import { MessageDocs } from 'types/chats/rooms/messages/Message';
// import PromiseUtil from 'utils/PromiseUtil';
// import useSocket from 'hooks/useSocket';
// import {
//   CancelLabel,
//   DeleteButton,
//   DeleteLabel,
//   Footer,
//   FooterButton,
//   FooterButtonLabel,
// } from '../../components/atoms/ChatComponent';
// import AsyncStorage from '@react-native-community/async-storage';
// import MySetting from 'MySetting';
// import { RootNatigation } from 'navigations/RootNavigation';
// import FirebaseMessageUtil from 'utils/chats/FirebaseMessageUtil';
// import CallManagerForAos from 'utils/calls/CallManagerForAos';
// import { useAtomValue } from 'jotai';
// import userAtom from 'stores/userAtom';
// import User from "../../types/auth/User";
//
// const ChatsMain = function () {
//   const { chatStatus, chatSocketUtil, forceUpdateForChatStatus } = useSocket();
//   // LogUtil.info('ChatsMain');
//
//   const { t } = useTranslation();
//   const themeContext = useContext(ThemeContext);
//   const me = useAtomValue(userAtom);
//   const navigation = useNavigation<MainNavigationProp>();
//   const [openId, setOpenId] = useState('');
//   const [isVisible, setIsVisible] = useState<boolean>(false);
//   const [deleteRoom, setDeleteRoom] = useState<Nullable<Room>>();
//   const [isEdit, setIsEdit] = useState<boolean>(false);
//   const [count, setCount] = useState(0);
//   const [loading, setLoading] = useState<boolean>(false);
//   const [isDeselect, setIsDeselect] = useState<boolean>(false);
//   const [onRoomsData, setOnRoomData] = useState<Nullable<OnRoomsType>>(null);
//   const [closeSwipe, setCloseSwipe] = useState<boolean>(false);
//   useEffect(() => {
//     if (MySetting.isAndroid) {
//       CallManagerForAos.openCallWhenAppIsOff();
//     }
//   }, []);
//
//   useFocusEffect(
//     useCallback(() => {
//       (async () => {
//         if (chatStatus.rooms) {
//           await AsyncStorage.setItem('rooms', JSON.stringify(chatStatus.rooms));
//           setOnRoomData(chatStatus.rooms);
//           return;
//         }
//
//         // LogUtil.info('ChatsMain setOnRoomData useEffect 5');
//         const rooms = await AsyncStorage.getItem('rooms');
//         // LogUtil.info('ChatsMain setOnRoomData useEffect 6');
//         rooms ? setOnRoomData(JSON.parse(rooms)) : setOnRoomData(null);
//         // LogUtil.info('ChatsMain setOnRoomData useEffect 7');
//       })();
//       // eslint-disable-next-line react-hooks/exhaustive-deps
//     }, [chatStatus.rooms]),
//   );
//   const archivedRoomList: Room[] = useMemo(() => onRoomsData?.archivedRooms ?? [], [onRoomsData?.archivedRooms]);
//   const fixedRoomList: Room[] = useMemo(
//     () => (onRoomsData?.unArchivedRooms ?? []).filter((room) => room.is_fixed).sort(roomSort),
//     [onRoomsData?.unArchivedRooms],
//   );
//   const unFixedRoomList: Room[] = useMemo(
//     () => (onRoomsData?.unArchivedRooms ?? []).filter((room) => !room.is_fixed).sort(roomSort),
//     [onRoomsData?.unArchivedRooms],
//   );
//   const unArchivedRoomList: Room[] = useMemo(
//     () => [...fixedRoomList, ...unFixedRoomList],
//     [fixedRoomList, unFixedRoomList],
//   );
//
//   const roomList: Room[] = useMemo(
//     () => [...archivedRoomList, ...unArchivedRoomList],
//     [archivedRoomList, unArchivedRoomList],
//   );
//   const [checkedRoomList, setCheckedRoomList] = useState<Room[]>([]);
//
//   const buttonList = [
//     {
//       icon: require('assets/ic-search.png'),
//       onClick: () => {
//         navigation.navigate('/chats/chats-search');
//       },
//     },
//     {
//       icon: require('assets/ic-add-chat.png'),
//       onClick: () => navigation.navigate('/chats/new-chat'),
//     },
//     {
//       icon: require('assets/ic_edit.png'),
//       onClick: () => unArchivedRoomList.length > 0 && setIsEdit(true),
//     },
//   ];
//
//   const extractItemKey = (item: Room): string => item._id;
//
//   const refreshRooms = useCallback(async (_chatSocketUtil: ChatSocketUtil) => {
//     await _chatSocketUtil.easy.getRooms('채팅목록');
//   }, []);
//   const onQuickActionPin = useCallback(
//     async (room: Room) => {
//       LogUtil.info('onQuickActionPin');
//       await ChatHttpUtil.requestPinRoom(room);
//       await refreshRooms(chatSocketUtil);
//     },
//     [chatSocketUtil, refreshRooms],
//   );
//
//   const onQuickActionMute = useCallback(
//     async (room: Room) => {
//       LogUtil.info('onQuickActionMute');
//       await ChatHttpUtil.requestMuteRoom(room);
//       await refreshRooms(chatSocketUtil);
//     },
//     [chatSocketUtil, refreshRooms],
//   );
//
//   const onQuickActionRead = useCallback(
//     async (room: Room) => {
//       LogUtil.info('onQuickActionRead');
//       await ChatHttpUtil.requestReadRoom(room);
//       await refreshRooms(chatSocketUtil);
//     },
//     [chatSocketUtil, refreshRooms],
//   );
//
//   const onQuickActionArchive = useCallback(
//     async (room: Room) => {
//       LogUtil.info('onArchive');
//       await ChatHttpUtil.requestArchiveRoom(room);
//       await refreshRooms(chatSocketUtil);
//     },
//     [chatSocketUtil, refreshRooms],
//   );
//
//   const onQuickActionExit = useCallback(
//     async (room: Room) => {
//       setDeleteRoom(room);
//       setIsVisible(true);
//       await refreshRooms(chatSocketUtil);
//     },
//     [chatSocketUtil, refreshRooms],
//   );
//
//   const handleDeselect = useCallback(() => {
//     setCount(0);
//     setIsDeselect(!isDeselect);
//   }, [isDeselect]);
//
//   const unReadRoomList = useMemo(() => roomList.filter((room) => room.unread_count > 0), [roomList]);
//   const unReadRoomCount = useMemo(() => unReadRoomList.length, [unReadRoomList.length]);
//   LogUtil.info(
//     'roomList',
//     roomList.filter((room) => room.unread_count > 0),
//   );
//
//   const checkedUnReadRoomList = useMemo(
//     () => (checkedRoomList ?? []).filter((room) => unReadRoomList.includes(room)),
//     [checkedRoomList, unReadRoomList],
//   );
//   const checkedUnReadRoomCount = useMemo(() => checkedUnReadRoomList.length, [checkedUnReadRoomList.length]);
//
//   const isRoomDataEmpty = useMemo(() => (roomList.length ?? 0) <= 0, [roomList.length]);
//   const isArchivedRoomDataEmpty = useMemo(() => (archivedRoomList?.length ?? 0) <= 0, [archivedRoomList?.length]);
//   const isAllRoomEmpty = useMemo(
//     () => isRoomDataEmpty && isArchivedRoomDataEmpty,
//     [isArchivedRoomDataEmpty, isRoomDataEmpty],
//   );
//
//   const [initPreloadMessagesOfRoom, setInitPreloadMessagesOfRoom] = useState(false);
//   const preloadMessagesOfRoom = useCallback(
//     async (_onRoomsData: OnRoomsType) => {
//       const promiseList: Promise<Nullable<MessageDocs>>[] = _onRoomsData.unArchivedRooms.map((room) =>
//         ChatHttpUtil.requestGetMessagesOfRoom(room._id),
//       );
//       new PromiseUtil()
//         .onlyFulfilled(promiseList)
//         .then((messageDocsList) => {
//           LogUtil.info('Promise all messageDocsList');
//           if (messageDocsList) {
//             const newMessageDocsByRoomId = {};
//             for (const messageDocs of messageDocsList.filter((_messageDocs) => (_messageDocs?.docs.length ?? 0) > 0)) {
//               newMessageDocsByRoomId[messageDocs!.room._id] = {
//                 messageDocs: messageDocs!,
//               };
//             }
//             chatStatus.messageDocsByRoomId = { ...chatStatus.messageDocsByRoomId, ...newMessageDocsByRoomId };
//             forceUpdateForChatStatus();
//           }
//         })
//         .catch((error) => {
//           LogUtil.info('Promise all messageDocsList error', error);
//         });
//     },
//     [chatStatus, forceUpdateForChatStatus],
//   );
//
//   if (onRoomsData && !initPreloadMessagesOfRoom) {
//     setInitPreloadMessagesOfRoom(true);
//     preloadMessagesOfRoom(onRoomsData).then(console.log);
//   }
//
//   const onPressMarkAsRead = useCallback(async () => {
//     if (checkedUnReadRoomCount > 0) {
//       LogUtil.info('onPressMarkAsRead checkedUnReadRoomList', checkedUnReadRoomList);
//
//       for (const checkedUnReadRoom of checkedUnReadRoomList) {
//         await ChatHttpUtil.requestReadRoom(checkedUnReadRoom);
//       }
//
//       setCheckedRoomList([]);
//       setCount(0);
//       await refreshRooms(chatSocketUtil);
//       setIsEdit(false);
//     }
//   }, [checkedUnReadRoomCount, checkedUnReadRoomList, refreshRooms, chatSocketUtil]);
//
//   const onPressReadAll = useCallback(async () => {
//     if (unReadRoomCount > 0) {
//       LogUtil.info('onPressReadAll unReadRoomList : ', unReadRoomList);
//       for (const unReadRoom of unReadRoomList) {
//         await ChatHttpUtil.requestReadRoom(unReadRoom);
//       }
//
//       setCheckedRoomList([]);
//       setCount(0);
//       await refreshRooms(chatSocketUtil);
//       setIsEdit(false);
//     }
//   }, [unReadRoomCount, unReadRoomList, refreshRooms, chatSocketUtil]);
//
//   const onLeaveChatRoom = useCallback(async () => {
//     setLoading(true);
//
//     try {
//       const room_ids: string[] = deleteRoom ? [deleteRoom._id] : checkedRoomList.map((checkedRoom) => checkedRoom._id);
//
//       if (room_ids.length > 0) {
//         try {
//           await ChatHttpUtil.requestLeaveRoom(room_ids);
//         } catch (e) {}
//       }
//
//       setDeleteRoom(null);
//       setCheckedRoomList([]);
//       setCount(0);
//
//       await refreshRooms(chatSocketUtil);
//       setIsEdit(false);
//       setIsVisible(false);
//     } catch (e) {
//     } finally {
//       setLoading(false);
//     }
//   }, [chatSocketUtil, checkedRoomList, deleteRoom, refreshRooms]);
//
//   useFocusEffect(
//     useCallback(() => {
//       ChatSocketUtil.instance.easy.join('ChatsMain');
//     }, []),
//   );
//
//   if (!onRoomsData) {
//     return (
//       <NavbarLayout>
//         <TitleHeader
//           title={t('chats-main.Chats')}
//           border={false}
//           justify={'flex-start'}
//           button={buttonList.map((button, i) => (
//             <IconButton key={i} themeColor={true} source={button.icon} onClick={() => button.onClick()} />
//           ))}
//         />
//
//         <View style={tw`flex-1 justify-center items-center`}>
//           <ActivityIndicator />
//         </View>
//       </NavbarLayout>
//     );
//   }
//
//
//   return (
//     <>
//       <LoadingModal modalVisible={loading} />
//       {isEdit ? (
//         <MainLayout>
//           <BackHeader
//             title={t('chats-main.Edit')}
//             onClick={() => {
//               setCount(0);
//               setIsEdit(false);
//             }}
//             button={[<DeselectButton key={0} count={count} handleDeselect={handleDeselect} />]}
//           />
//           {isAllRoomEmpty && <DescChatBubble />}
//           {isAllRoomEmpty ? (
//             <NoChatRoom />
//           ) : (
//             <Container>
//               {archivedRoomList.length !== 0 && (
//                 <ArchivedNav onPress={() => navigation.navigate('/chats/archive')}>
//                   <ArchiveIcon width={22} height={22} />
//                   <ArchivedLabel style={{ fontSize: me?.setting.ct_text_size }}>
//                     {t('chats-main.Archived Chats')}
//                   </ArchivedLabel>
//                   <Count style={{ fontSize: me?.setting.ct_text_size }}>{archivedRoomList.length}</Count>
//                 </ArchivedNav>
//               )}
//               <SwipeListView
//                 rightOpenValue={-280} //이동거리
//                 directionalDistanceChangeThreshold={2} //민감도가 높으면, 클릭이 잘됨.
//                 data={unArchivedRoomList}
//                 renderItem={(renderedItem, rowMap) => (
//                   <ChatListItem
//                     checkedRoomList={checkedRoomList}
//                     setCheckedRoomList={setCheckedRoomList}
//                     isDeselect={isDeselect}
//                     isEdit={isEdit}
//                     count={count}
//                     setCount={setCount}
//                     room={renderedItem.item}
//                     rowMap={rowMap}
//                     setOpenId={setOpenId}
//                     onClose={() => (openId ? rowMap[openId]?.closeRow() : undefined)}
//                   />
//                 )}
//                 keyExtractor={extractItemKey}
//                 disableRightSwipe={true}
//                 closeOnRowPress={true}
//               />
//               <Footer
//                 // eslint-disable-next-line react-native/no-inline-styles
//                 style={{
//                   justifyContent: 'center',
//                   alignItems: 'flex-end',
//                   shadowColor: COLOR.BLACK,
//                   shadowOpacity: 0.1,
//                   shadowOffset: {
//                     width: 0,
//                     height: -15,
//                   },
//                   shadowRadius: 10,
//                 }}
//               >
//                 <Row>
//                   {count === 0 ? (
//                     <FooterButton onPress={onPressReadAll}>
//                       <FooterButtonLabel selected={count === 0 && unReadRoomCount > 0}>
//                         {t('chats-main.Read All')}
//                       </FooterButtonLabel>
//                     </FooterButton>
//                   ) : (
//                     <FooterButton onPress={onPressMarkAsRead}>
//                       <FooterButtonLabel selected={checkedUnReadRoomCount > 0}>
//                         {t('chats-main.Mark as Read')}
//                       </FooterButtonLabel>
//                     </FooterButton>
//                   )}
//                   <FooterButton onPress={() => count !== 0 && setIsVisible(true)}>
//                     <FooterButtonLabel selected={count !== 0}>{t('chats-main.Leave')}</FooterButtonLabel>
//                   </FooterButton>
//                 </Row>
//               </Footer>
//             </Container>
//           )}
//           <ModalBase isVisible={isVisible} onBackdropPress={() => setIsVisible(false)} width={350}>
//             <Column justify="center" align="center">
//               <ModalTitle>{t('chats-main.Are you sure you want to leave the chat room?')}</ModalTitle>
//               <ModalText>
//                 {t(
//                   'chats-main.If you leave, all the conversation history will be deleted and this chatroom will be removed from the chat list',
//                 )}
//               </ModalText>
//               {/* eslint-disable-next-line react-native/no-inline-styles */}
//               <Row style={{ paddingTop: 15 }}>
//                 <CancelButton
//                   onPress={() => {
//                     setDeleteRoom(null);
//                     setIsVisible(false);
//                   }}
//                 >
//                   <CancelLabel>{t('chats-main.Cancel')}</CancelLabel>
//                 </CancelButton>
//                 {/* eslint-disable-next-line react-native/no-inline-styles */}
//                 <View style={{ padding: 10 }} />
//                 <DeleteButton onPress={onLeaveChatRoom}>
//                   <DeleteLabel>{t('chats-main.Delete')}</DeleteLabel>
//                 </DeleteButton>
//               </Row>
//             </Column>
//           </ModalBase>
//         </MainLayout>
//       ) : (
//         <NavbarLayout>
//           <TouchableWithoutFeedback onPress={() => setCloseSwipe(!closeSwipe)}>
//             <View style={{ flex: 1 }}>
//               <TitleHeader
//                 title={t('chats-main.Chats')}
//                 border={false}
//                 justify={'flex-start'}
//                 button={buttonList.map((button, i) => (
//                   <IconButton key={i} themeColor={true} source={button.icon} onClick={() => button.onClick()} />
//                 ))}
//               />
//               {isAllRoomEmpty && <DescChatBubble />}
//               {isAllRoomEmpty ? (
//                 <NoChatRoom />
//               ) : (
//                 <Container>
//                   {archivedRoomList.length !== 0 && (
//                     <ArchivedNav onPress={() => navigation.navigate('/chats/archive')}>
//                       <ArchiveIcon width={22} height={22} />
//                       <ArchivedLabel style={{ fontSize: me?.setting.ct_text_size }}>
//                         {t('chats-main.Archived Chats')}
//                       </ArchivedLabel>
//                       <Count style={{ fontSize: me?.setting.ct_text_size }}>{archivedRoomList.length}</Count>
//                     </ArchivedNav>
//                   )}
//                   <SwipeListView
//                     rightOpenValue={-280} //이동거리
//                     directionalDistanceChangeThreshold={2} //민감도
//                     data={unArchivedRoomList}
//                     renderItem={(item, rowMap) => (
//                       <ChatListItem
//                         room={item.item}
//                         rowMap={rowMap}
//                         setOpenId={setOpenId}
//                         closeSwipe={closeSwipe}
//                         onClose={() => (openId ? rowMap[openId]?.closeRow() : undefined)}
//                       />
//                     )}
//                     keyExtractor={extractItemKey}
//                     ListFooterComponent={<>{Platform.OS === 'android' && <AndroidPadding />}</>}
//                     renderHiddenItem={(item, rowMap) => (
//                       <ChatRoomQuickActions
//                         room={item.item}
//                         dark={themeContext.dark}
//                         onPin={onQuickActionPin}
//                         onMute={onQuickActionMute}
//                         onRead={onQuickActionRead}
//                         onArchive={onQuickActionArchive}
//                         onExit={onQuickActionExit}
//                         onClose={() => (openId ? rowMap[openId]?.closeRow() : undefined)}
//                       />
//                     )}
//                     disableRightSwipe={true}
//                     closeOnRowPress={true}
//                   />
//                 </Container>
//               )}
//             </View>
//           </TouchableWithoutFeedback>
//           <ModalBase isVisible={isVisible} onBackdropPress={() => setIsVisible(false)} width={350}>
//             <Column justify="center" align="center">
//               <ModalTitle>{t('chats-main.Are you sure you want to leave the chat room?')}</ModalTitle>
//               <ModalText>
//                 {t(
//                   'chats-main.If you leave, all the conversation history will be deleted and this chatroom will be removed from the chat list',
//                 )}
//               </ModalText>
//               {/* eslint-disable-next-line react-native/no-inline-styles */}
//               <Row style={{ paddingTop: 15 }}>
//                 <CancelButton
//                   onPress={() => {
//                     setDeleteRoom(null);
//                     setIsVisible(false);
//                   }}
//                 >
//                   <CancelLabel>{t('chats-main.Cancel')}</CancelLabel>
//                 </CancelButton>
//                 {/* eslint-disable-next-line react-native/no-inline-styles */}
//                 <View style={{ padding: 10 }} />
//                 <DeleteButton onPress={onLeaveChatRoom}>
//                   <DeleteLabel>{t('chats-main.Delete')}</DeleteLabel>
//                 </DeleteButton>
//               </Row>
//             </Column>
//           </ModalBase>
//         </NavbarLayout>
//       )}
//     </>
//   );
// };
//
// export default ChatsMain;
//
// const ChatBubbleContainer = styled.View`
//   width: 148px;
//   position: absolute;
//   top: 58px;
//   right: 53px;
// `;
// const MyChatBubble = styled.View`
//   border-radius: 15px;
//   background-color: ${COLOR.PRIMARY};
//   width: 148px;
//   justify-content: center;
//   align-items: center;
// `;
// const ChatText = styled.Text<{ themeFont: number }>`
//   color: ${COLOR.WHITE};
//   font-size: ${({ themeFont }) => themeFont - 3};
//   font-weight: 500;
//   padding: 8px;
// `;
// const ChatTail = styled(Tail)`
//   position: absolute;
//   top: -10px;
//   right: 15px;
// `;
// const Container = styled.View`
//   flex: 1;
// `;
// const ArchivedNav = styled.TouchableOpacity`
//   background-color: #f8f8f8;
//   flex-direction: row;
//   padding: 20px;
//   align-items: center;
// `;
// const ArchivedLabel = styled.Text`
//   margin-left: 15px;
//   color: ${COLOR.BLACK};
// `;
// const Count = styled.Text`
//   color: ${COLOR.PRIMARY};
//   font-weight: bold;
//   margin-left: 5px;
// `;
// const DeselectButtonLabel = styled.Text`
//   color: #999999;
//   margin-left: 5px;
// `;
// const ModalTitle = styled.Text`
//   color: black;
//   padding: 10px;
// `;
// const ModalText = styled.Text`
//   color: #999999;
//   padding: 10px;
//   text-align: center;
// `;
// const CancelButton = styled.TouchableOpacity`
//   background-color: #fff;
//   width: 100px;
//   height: 42px;
//   align-items: center;
//   justify-content: center;
//   border: 1px solid #ccc;
//   border-radius: 10px;
// `;
// const AndroidPadding = styled.View`
//   height: ${`${Dimensions.get('window').height / 17}px`};
// `;
//
// const DescChatBubble = () => {
//   const { t } = useTranslation();
//   const me = useAtomValue(userAtom);
//
//   return (
//     <ChatBubbleContainer>
//       <MyChatBubble>
//         <ChatText themeFont={me?.setting.ct_text_size as number}>{t('chats-main.Create new chat room')}</ChatText>
//       </MyChatBubble>
//       <ChatTail fill={COLOR.PRIMARY} style={{ transform: [{ rotate: '45deg' }] }} />
//     </ChatBubbleContainer>
//   );
// };
//
// const DeselectButton = ({ count, handleDeselect }) => {
//   const { t } = useTranslation();
//   const me = useAtomValue(userAtom);
//   return (
//     // eslint-disable-next-line react-native/no-inline-styles
//     <TouchableOpacity style={{ flexDirection: 'row', marginRight: 5 }} onPress={() => handleDeselect()}>
//       <Count style={{ fontSize: me?.setting.ct_text_size }}>{count}</Count>
//       <DeselectButtonLabel style={{ fontSize: me?.setting.ct_text_size }}>
//         {t('chats-main.Deselect')}
//       </DeselectButtonLabel>
//     </TouchableOpacity>
//   );
// };

import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import NavbarLayout from 'components/layouts/NavbarLayout';
import TitleHeader from 'components/molecules/TitleHeader';
import IconButton from 'components/atoms/MIconButton';
import Tail from 'assets/tail.svg';
import styled, { ThemeContext } from 'styled-components/native';
import { COLOR } from 'constants/COLOR';
import NoChatRoom from './components/NoChatRoom';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { MainNavigationProp } from 'navigations/MainNavigator';
import ChatListItem from './components/ChatListItem';
import ArchiveIcon from 'assets/ic-archive.svg';
import { SwipeListView } from 'react-native-swipe-list-view';
import ChatRoomQuickActions from './components/ChatRoomQuickActions';
import { ModalBase } from 'components/modal';
import { Column } from 'components/layouts/Column';
import { Row } from 'components/layouts/Row';
import { LoadingModal } from 'react-native-loading-modal';
import {
  ActivityIndicator,
  Dimensions,
  Platform,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import BackHeader from 'components/molecules/BackHeader';
import MainLayout from 'components/layouts/MainLayout';
import Room, { OnRoomsType, roomSort } from 'types/chats/rooms/Room';
import LogUtil from 'utils/LogUtil';
import ChatSocketUtil from 'utils/chats/ChatSocketUtil';
import Nullable from 'types/_common/Nullable';
import ChatHttpUtil from 'utils/chats/ChatHttpUtil';
import tw from 'twrnc';
import { useTranslation } from 'react-i18next';
import { MessageDocs } from 'types/chats/rooms/messages/Message';
import PromiseUtil from 'utils/PromiseUtil';
import useSocket from 'hooks/useSocket';
import {
  CancelLabel,
  DeleteButton,
  DeleteLabel,
  Footer,
  FooterButton,
  FooterButtonLabel,
} from '../../components/atoms/ChatComponent';
import AsyncStorage from '@react-native-community/async-storage';
import MySetting from 'MySetting';
import { RootNatigation } from 'navigations/RootNavigation';
import FirebaseMessageUtil from 'utils/chats/FirebaseMessageUtil';
import CallManagerForAos from 'utils/calls/CallManagerForAos';
import { useAtomValue } from 'jotai';
import userAtom from 'stores/userAtom';
import User from "../../types/auth/User";

const ChatsMain = function () {
  const { chatStatus, chatSocketUtil, forceUpdateForChatStatus } = useSocket();
  // LogUtil.info('ChatsMain');

  const { t } = useTranslation();
  const themeContext = useContext(ThemeContext);
  const me = useAtomValue(userAtom);
  const navigation = useNavigation<MainNavigationProp>();
  const [openId, setOpenId] = useState('');
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [deleteRoom, setDeleteRoom] = useState<Nullable<Room>>();
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [isDeselect, setIsDeselect] = useState<boolean>(false);
  const [onRoomsData, setOnRoomData] = useState<Nullable<OnRoomsType>>(null);
  const [closeSwipe, setCloseSwipe] = useState<boolean>(false);
  useEffect(() => {
    if (MySetting.isAndroid) {
      CallManagerForAos.openCallWhenAppIsOff();
    }
  }, []);

  useFocusEffect(
      useCallback(() => {
        (async () => {
          if (chatStatus.rooms) {
            await AsyncStorage.setItem('rooms', JSON.stringify(chatStatus.rooms));
            setOnRoomData(chatStatus.rooms);
            return;
          }

          // LogUtil.info('ChatsMain setOnRoomData useEffect 5');
          const rooms = await AsyncStorage.getItem('rooms');
          // LogUtil.info('ChatsMain setOnRoomData useEffect 6');
          rooms ? setOnRoomData(JSON.parse(rooms)) : setOnRoomData(null);
          // LogUtil.info('ChatsMain setOnRoomData useEffect 7');
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [chatStatus.rooms]),
  );
  const archivedRoomList: Room[] = useMemo(() => onRoomsData?.archivedRooms ?? [], [onRoomsData?.archivedRooms]);
  const fixedRoomList: Room[] = useMemo(
      () => (onRoomsData?.unArchivedRooms ?? []).filter((room) => room.is_fixed).sort(roomSort),
      [onRoomsData?.unArchivedRooms],
  );
  const unFixedRoomList: Room[] = useMemo(
      () => (onRoomsData?.unArchivedRooms ?? []).filter((room) => !room.is_fixed).sort(roomSort),
      [onRoomsData?.unArchivedRooms],
  );
  const unArchivedRoomList: Room[] = useMemo(
      () => [...fixedRoomList, ...unFixedRoomList],
      [fixedRoomList, unFixedRoomList],
  );

  const roomList: Room[] = useMemo(
      () => [...archivedRoomList, ...unArchivedRoomList],
      [archivedRoomList, unArchivedRoomList],
  );
  const [checkedRoomList, setCheckedRoomList] = useState<Room[]>([]);

  const buttonList = [
    {
      icon: require('assets/ic-search.png'),
      onClick: () => {
        navigation.navigate('/chats/chats-search');
      },
    },
    {
      icon: require('assets/ic-add-chat.png'),
      onClick: () => navigation.navigate('/chats/new-chat'),
    },
    {
      icon: require('assets/ic_edit.png'),
      onClick: () => unArchivedRoomList.length > 0 && setIsEdit(true),
    },
  ];

  const extractItemKey = (item: Room): string => item._id;

  const refreshRooms = useCallback(async (_chatSocketUtil: ChatSocketUtil) => {
    await _chatSocketUtil.easy.getRooms('채팅목록');
  }, []);
  const onQuickActionPin = useCallback(
      async (room: Room) => {
        LogUtil.info('onQuickActionPin');
        await ChatHttpUtil.requestPinRoom(room);
        await refreshRooms(chatSocketUtil);
      },
      [chatSocketUtil, refreshRooms],
  );

  const onQuickActionMute = useCallback(
      async (room: Room) => {
        LogUtil.info('onQuickActionMute');
        await ChatHttpUtil.requestMuteRoom(room);
        await refreshRooms(chatSocketUtil);
      },
      [chatSocketUtil, refreshRooms],
  );

  const onQuickActionRead = useCallback(
      async (room: Room) => {
        LogUtil.info('onQuickActionRead');
        await ChatHttpUtil.requestReadRoom(room);
        await refreshRooms(chatSocketUtil);
      },
      [chatSocketUtil, refreshRooms],
  );

  const onQuickActionArchive = useCallback(
      async (room: Room) => {
        LogUtil.info('onArchive');
        await ChatHttpUtil.requestArchiveRoom(room);
        await refreshRooms(chatSocketUtil);
      },
      [chatSocketUtil, refreshRooms],
  );

  const onQuickActionExit = useCallback(
      async (room: Room) => {
        setDeleteRoom(room);
        setIsVisible(true);
        await refreshRooms(chatSocketUtil);
      },
      [chatSocketUtil, refreshRooms],
  );

  const handleDeselect = useCallback(() => {
    setCount(0);
    setIsDeselect(!isDeselect);
  }, [isDeselect]);

  const unReadRoomList = useMemo(() => roomList.filter((room) => room.unread_count > 0), [roomList]);
  const unReadRoomCount = useMemo(() => unReadRoomList.length, [unReadRoomList.length]);
  LogUtil.info(
      'roomList',
      roomList.filter((room) => room.unread_count > 0),
  );

  const checkedUnReadRoomList = useMemo(
      () => (checkedRoomList ?? []).filter((room) => unReadRoomList.includes(room)),
      [checkedRoomList, unReadRoomList],
  );
  const checkedUnReadRoomCount = useMemo(() => checkedUnReadRoomList.length, [checkedUnReadRoomList.length]);

  const isRoomDataEmpty = useMemo(() => (roomList.length ?? 0) <= 0, [roomList.length]);
  const isArchivedRoomDataEmpty = useMemo(() => (archivedRoomList?.length ?? 0) <= 0, [archivedRoomList?.length]);
  const isAllRoomEmpty = useMemo(
      () => isRoomDataEmpty && isArchivedRoomDataEmpty,
      [isArchivedRoomDataEmpty, isRoomDataEmpty],
  );

  const [initPreloadMessagesOfRoom, setInitPreloadMessagesOfRoom] = useState(false);
  const preloadMessagesOfRoom = useCallback(
      async (_onRoomsData: OnRoomsType) => {
        const promiseList: Promise<Nullable<MessageDocs>>[] = _onRoomsData.unArchivedRooms.map((room) =>
            ChatHttpUtil.requestGetMessagesOfRoom(room._id),
        );
        new PromiseUtil()
            .onlyFulfilled(promiseList)
            .then((messageDocsList) => {
              LogUtil.info('Promise all messageDocsList');
              if (messageDocsList) {
                const newMessageDocsByRoomId = {};
                for (const messageDocs of messageDocsList.filter((_messageDocs) => (_messageDocs?.docs.length ?? 0) > 0)) {
                  newMessageDocsByRoomId[messageDocs!.room._id] = {
                    messageDocs: messageDocs!,
                  };
                }
                chatStatus.messageDocsByRoomId = { ...chatStatus.messageDocsByRoomId, ...newMessageDocsByRoomId };
                forceUpdateForChatStatus();
              }
            })
            .catch((error) => {
              LogUtil.info('Promise all messageDocsList error', error);
            });
      },
      [chatStatus, forceUpdateForChatStatus],
  );

  if (onRoomsData && !initPreloadMessagesOfRoom) {
    setInitPreloadMessagesOfRoom(true);
    preloadMessagesOfRoom(onRoomsData).then(console.log);
  }

  const onPressMarkAsRead = useCallback(async () => {
    if (checkedUnReadRoomCount > 0) {
      LogUtil.info('onPressMarkAsRead checkedUnReadRoomList', checkedUnReadRoomList);

      for (const checkedUnReadRoom of checkedUnReadRoomList) {
        await ChatHttpUtil.requestReadRoom(checkedUnReadRoom);
      }

      setCheckedRoomList([]);
      setCount(0);
      await refreshRooms(chatSocketUtil);
      setIsEdit(false);
    }
  }, [checkedUnReadRoomCount, checkedUnReadRoomList, refreshRooms, chatSocketUtil]);

  const onPressReadAll = useCallback(async () => {
    if (unReadRoomCount > 0) {
      LogUtil.info('onPressReadAll unReadRoomList : ', unReadRoomList);
      for (const unReadRoom of unReadRoomList) {
        await ChatHttpUtil.requestReadRoom(unReadRoom);
      }

      setCheckedRoomList([]);
      setCount(0);
      await refreshRooms(chatSocketUtil);
      setIsEdit(false);
    }
  }, [unReadRoomCount, unReadRoomList, refreshRooms, chatSocketUtil]);

  const onLeaveChatRoom = useCallback(async () => {
    setLoading(true);

    try {
      const room_ids: string[] = deleteRoom ? [deleteRoom._id] : checkedRoomList.map((checkedRoom) => checkedRoom._id);

      if (room_ids.length > 0) {
        try {
          await ChatHttpUtil.requestLeaveRoom(room_ids);
        } catch (e) {}
      }

      setDeleteRoom(null);
      setCheckedRoomList([]);
      setCount(0);

      await refreshRooms(chatSocketUtil);
      setIsEdit(false);
      setIsVisible(false);
    } catch (e) {
    } finally {
      setLoading(false);
    }
  }, [chatSocketUtil, checkedRoomList, deleteRoom, refreshRooms]);

  useFocusEffect(
      useCallback(() => {
        ChatSocketUtil.instance.easy.join('ChatsMain');
      }, []),
  );

  if (!onRoomsData) {
    return (
        <NavbarLayout>
          <TitleHeader
              title={t('chats-main.Chats')}
              border={false}
              justify={'flex-start'}
              button={buttonList.map((button, i) => (
                  <IconButton key={i} themeColor={true} source={button.icon} onClick={() => button.onClick()} />
              ))}
          />

          <View style={tw`flex-1 justify-center items-center`}>
            <ActivityIndicator />
          </View>
        </NavbarLayout>
    );
  }


  return (
      <>
        <LoadingModal modalVisible={loading} />
        {isEdit ? (
            <MainLayout>
              <BackHeader
                  title={t('chats-main.Edit')}
                  onClick={() => {
                    setCount(0);
                    setIsEdit(false);
                  }}
                  button={[<DeselectButton key={0} count={count} handleDeselect={handleDeselect} />]}
              />
              {isAllRoomEmpty && <DescChatBubble />}
              {isAllRoomEmpty ? (
                  <NoChatRoom />
              ) : (
                  <Container>
                    {archivedRoomList.length !== 0 && (
                        <ArchivedNav onPress={() => navigation.navigate('/chats/archive')}>
                          <ArchiveIcon width={22} height={22} />
                          <ArchivedLabel style={{ fontSize: me?.setting.ct_text_size }}>
                            {t('chats-main.Archived Chats')}
                          </ArchivedLabel>
                          <Count style={{ fontSize: me?.setting.ct_text_size }}>{archivedRoomList.length}</Count>
                        </ArchivedNav>
                    )}
                    <SwipeListView
                        rightOpenValue={-280} //이동거리
                        directionalDistanceChangeThreshold={2} //민감도가 높으면, 클릭이 잘됨.
                        data={unArchivedRoomList}
                        renderItem={(renderedItem, rowMap) => (
                            <ChatListItem
                                checkedRoomList={checkedRoomList}
                                setCheckedRoomList={setCheckedRoomList}
                                isDeselect={isDeselect}
                                isEdit={isEdit}
                                count={count}
                                setCount={setCount}
                                room={renderedItem.item}
                                rowMap={rowMap}
                                setOpenId={setOpenId}
                                onClose={() => (openId ? rowMap[openId]?.closeRow() : undefined)}
                            />
                        )}
                        keyExtractor={extractItemKey}
                        disableRightSwipe={true}
                        closeOnRowPress={true}
                    />
                    <Footer
                        // eslint-disable-next-line react-native/no-inline-styles
                        style={{
                          justifyContent: 'center',
                          alignItems: 'flex-end',
                          shadowColor: COLOR.BLACK,
                          shadowOpacity: 0.1,
                          shadowOffset: {
                            width: 0,
                            height: -15,
                          },
                          shadowRadius: 10,
                        }}
                    >
                      <Row>
                        {count === 0 ? (
                            <FooterButton onPress={onPressReadAll}>
                              <FooterButtonLabel selected={count === 0 && unReadRoomCount > 0}>
                                {t('chats-main.Read All')}
                              </FooterButtonLabel>
                            </FooterButton>
                        ) : (
                            <FooterButton onPress={onPressMarkAsRead}>
                              <FooterButtonLabel selected={checkedUnReadRoomCount > 0}>
                                {t('chats-main.Mark as Read')}
                              </FooterButtonLabel>
                            </FooterButton>
                        )}
                        <FooterButton onPress={() => count !== 0 && setIsVisible(true)}>
                          <FooterButtonLabel selected={count !== 0}>{t('chats-main.Leave')}</FooterButtonLabel>
                        </FooterButton>
                      </Row>
                    </Footer>
                  </Container>
              )}
              <ModalBase isVisible={isVisible} onBackdropPress={() => setIsVisible(false)} width={350}>
                <Column justify="center" align="center">
                  <ModalTitle>{t('chats-main.Are you sure you want to leave the chat room?')}</ModalTitle>
                  <ModalText>
                    {t(
                        'chats-main.If you leave, all the conversation history will be deleted and this chatroom will be removed from the chat list',
                    )}
                  </ModalText>
                  {/* eslint-disable-next-line react-native/no-inline-styles */}
                  <Row style={{ paddingTop: 15 }}>
                    <CancelButton
                        onPress={() => {
                          setDeleteRoom(null);
                          setIsVisible(false);
                        }}
                    >
                      <CancelLabel>{t('chats-main.Cancel')}</CancelLabel>
                    </CancelButton>
                    {/* eslint-disable-next-line react-native/no-inline-styles */}
                    <View style={{ padding: 10 }} />
                    <DeleteButton onPress={onLeaveChatRoom}>
                      <DeleteLabel>{t('chats-main.Delete')}</DeleteLabel>
                    </DeleteButton>
                  </Row>
                </Column>
              </ModalBase>
            </MainLayout>
        ) : (
            <NavbarLayout>
              <TouchableWithoutFeedback onPress={() => setCloseSwipe(!closeSwipe)}>
                <View style={{ flex: 1 }}>
                  <TitleHeader
                      title={t('chats-main.Chats')}
                      border={false}
                      justify={'flex-start'}
                      button={buttonList.map((button, i) => (
                          <IconButton key={i} themeColor={true} source={button.icon} onClick={() => button.onClick()} />
                      ))}
                  />
                  {isAllRoomEmpty && <DescChatBubble />}
                  {isAllRoomEmpty ? (
                      <NoChatRoom />
                  ) : (
                      <Container>
                        {archivedRoomList.length !== 0 && (
                            <ArchivedNav onPress={() => navigation.navigate('/chats/archive')}>
                              <ArchiveIcon width={22} height={22} />
                              <ArchivedLabel style={{ fontSize: me?.setting.ct_text_size }}>
                                {t('chats-main.Archived Chats')}
                              </ArchivedLabel>
                              <Count style={{ fontSize: me?.setting.ct_text_size }}>{archivedRoomList.length}</Count>
                            </ArchivedNav>
                        )}
                        <SwipeListView
                            rightOpenValue={-280} //이동거리
                            directionalDistanceChangeThreshold={2} //민감도
                            data={[1,2,3]}
                            renderItem={(item, rowMap) => (
                                <ChatListItem
                                    room={item.item}
                                    rowMap={rowMap}
                                    setOpenId={setOpenId}
                                    closeSwipe={closeSwipe}
                                    onClose={() => (openId ? rowMap[openId]?.closeRow() : undefined)}
                                />
                            )}
                            keyExtractor={extractItemKey}
                            ListFooterComponent={<>{Platform.OS === 'android' && <AndroidPadding />}</>}
                            renderHiddenItem={(item, rowMap) => (
                                <ChatRoomQuickActions
                                    room={item.item}
                                    dark={themeContext.dark}
                                    onPin={onQuickActionPin}
                                    onMute={onQuickActionMute}
                                    onRead={onQuickActionRead}
                                    onArchive={onQuickActionArchive}
                                    onExit={onQuickActionExit}
                                    onClose={() => (openId ? rowMap[openId]?.closeRow() : undefined)}
                                />
                            )}
                            disableRightSwipe={true}
                            closeOnRowPress={true}
                        />
                      </Container>
                  )}
                </View>
              </TouchableWithoutFeedback>
              <ModalBase isVisible={isVisible} onBackdropPress={() => setIsVisible(false)} width={350}>
                <Column justify="center" align="center">
                  <ModalTitle>{t('chats-main.Are you sure you want to leave the chat room?')}</ModalTitle>
                  <ModalText>
                    {t(
                        'chats-main.If you leave, all the conversation history will be deleted and this chatroom will be removed from the chat list',
                    )}
                  </ModalText>
                  {/* eslint-disable-next-line react-native/no-inline-styles */}
                  <Row style={{ paddingTop: 15 }}>
                    <CancelButton
                        onPress={() => {
                          setDeleteRoom(null);
                          setIsVisible(false);
                        }}
                    >
                      <CancelLabel>{t('chats-main.Cancel')}</CancelLabel>
                    </CancelButton>
                    {/* eslint-disable-next-line react-native/no-inline-styles */}
                    <View style={{ padding: 10 }} />
                    <DeleteButton onPress={onLeaveChatRoom}>
                      <DeleteLabel>{t('chats-main.Delete')}</DeleteLabel>
                    </DeleteButton>
                  </Row>
                </Column>
              </ModalBase>
            </NavbarLayout>
        )}
      </>
  );
};

export default ChatsMain;

const ChatBubbleContainer = styled.View`
  width: 148px;
  position: absolute;
  top: 58px;
  right: 53px;
`;
const MyChatBubble = styled.View`
  border-radius: 15px;
  background-color: ${COLOR.PRIMARY};
  width: 148px;
  justify-content: center;
  align-items: center;
`;
const ChatText = styled.Text<{ themeFont: number }>`
  color: ${COLOR.WHITE};
  font-size: ${({ themeFont }) => themeFont - 3};
  font-weight: 500;
  padding: 8px;
`;
const ChatTail = styled(Tail)`
  position: absolute;
  top: -10px;
  right: 15px;
`;
const Container = styled.View`
  flex: 1;
`;
const ArchivedNav = styled.TouchableOpacity`
  background-color: #f8f8f8;
  flex-direction: row;
  padding: 20px;
  align-items: center;
`;
const ArchivedLabel = styled.Text`
  margin-left: 15px;
  color: ${COLOR.BLACK};
`;
const Count = styled.Text`
  color: ${COLOR.PRIMARY};
  font-weight: bold;
  margin-left: 5px;
`;
const DeselectButtonLabel = styled.Text`
  color: #999999;
  margin-left: 5px;
`;
const ModalTitle = styled.Text`
  color: black;
  padding: 10px;
`;
const ModalText = styled.Text`
  color: #999999;
  padding: 10px;
  text-align: center;
`;
const CancelButton = styled.TouchableOpacity`
  background-color: #fff;
  width: 100px;
  height: 42px;
  align-items: center;
  justify-content: center;
  border: 1px solid #ccc;
  border-radius: 10px;
`;
const AndroidPadding = styled.View`
  height: ${`${Dimensions.get('window').height / 17}px`};
`;

const DescChatBubble = () => {
  const { t } = useTranslation();
  const me = useAtomValue(userAtom);

  return (
      <ChatBubbleContainer>
        <MyChatBubble>
          <ChatText themeFont={me?.setting.ct_text_size as number}>{t('chats-main.Create new chat room')}</ChatText>
        </MyChatBubble>
        <ChatTail fill={COLOR.PRIMARY} style={{ transform: [{ rotate: '45deg' }] }} />
      </ChatBubbleContainer>
  );
};

const DeselectButton = ({ count, handleDeselect }) => {
  const { t } = useTranslation();
  const me = useAtomValue(userAtom);
  return (
      // eslint-disable-next-line react-native/no-inline-styles
      <TouchableOpacity style={{ flexDirection: 'row', marginRight: 5 }} onPress={() => handleDeselect()}>
        <Count style={{ fontSize: me?.setting.ct_text_size }}>{count}</Count>
        <DeselectButtonLabel style={{ fontSize: me?.setting.ct_text_size }}>
          {t('chats-main.Deselect')}
        </DeselectButtonLabel>
      </TouchableOpacity>
  );
};
