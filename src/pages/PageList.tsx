import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import tw from 'twrnc';
import type { MainNavigationProp } from '../navigations/MainNavigator';
import Screen from '../components/containers/Screen';
import Padding from '../components/containers/Padding';
import { useAtomValue } from 'jotai';
import userAtom from '../stores/userAtom';
import tokenAtom from '../stores/tokenAtom';

const list = [
  {
    title: '테스트용 로그인/로그아웃 페이지',
    name: '/__dev__/test-login',
    status: 'N/A',
  },
  {
    title: '라이브스트리밍(호스트)',
    name: '/kokkokme/host',
    status: '대기중',
  },
  {
    title: '라이브스트리밍(게스트)',
    name: '/kokkokme/guest',
    status: '대기중',
  },
  {
    title: '6. 채팅',
    name: '/chats',
    status: '대기중',
  },
  {
    title: '페이지 리스트',
    name: '/__dev__/page-list',
    status: 'N/A',
  },
  {
    title: '[DEV] 컴포넌트',
    name: '/__dev__/components',
    status: 'N/A',
  },
  {
    title: '0. 스플래시',
    name: '/splash',
    status: '대기중',
  },
  {
    title: '0 권한 획득',
    name: '/landing/permissions',
    status: '대기중',
  },
  {
    title: '0. 패스코드',
    name: '/lock',
    status: '대기중',
  },
  {
    title: '0. 랜딩',
    name: '/landing',
    status: '대기중',
  },
  {
    title: '1. 로그인',
    name: '/phone-number-input',
    status: '대기중',
    params: { route: 'sign-in' },
  },
  {
    title: '1. 회원가입 > already',
    name: '/sign-up/registered',
    status: '대기중',
  },
  {
    title: '1. 회원가입 > 프로필 등록',
    name: '/sign-up/profile-enroll',
    status: '대기중',
  },
  {
    title: '1. 회원 가입 > 휴대폰 번호 입력',
    name: '/phone-number-input',
    status: '대기중',
    params: { route: 'sign-up' }, // 'sign-in' || 'sign-up' || 'change-number'
  },
  {
    title: '코드 인증 (직접 접속 불가)',
    name: '/code',
    status: '대기중',
    params: { route: 'sign-up' }, // 'sign-in' || 'sign-up' || 'change-number' || 'register-email' || 'change-email'
  },
  {
    title: '3. 더보기',
    name: '/more',
    status: '대기중',
  },
  {
    title: '3-2. 더보기 > 프로필 설정',
    name: '/more/profile-edit',
    status: '대기중',
  },
  {
    title: '3-2. 더보기 > 프로필 설정 > 이메일 등록',
    name: '/more/profile-edit/email-input',
    status: '대기중',
    params: { route: 'register' }, // 'register' || 'change'
  },
  {
    title: '3-2-2. 더보기 > 프로필 설정 > 공식 계정 설정',
    name: '/more/profile-edit/official-account',
    status: '대기중',
  },
  {
    title: '3-2-2. 더보기 > 프로필 설정 > Change Number 설명',
    name: '/more/profile-edit/change-number-info',
    status: '대기중',
  },
  {
    title: '3-2-2. 더보기 > 프로필 설정 > Change E-mail 설명',
    name: '/more/profile-edit/change-mail-info',
    status: '대기중',
  },
  {
    title: '3-3. 더보기 > 저장 메세지',
    name: '/more/saved-messages',
    status: '완료',
  },
  {
    title: '3. 더보기 > 설정',
    name: '/more/settings',
    status: '대기중',
  },
  {
    title: '3-0. 더보기 > 설정 > 일반설정',
    name: '/more/settings/general',
    status: '대기중',
  },
  {
    title: '3-5. 더보기 > 설정 > Notifications',
    name: '/more/settings/notifications-settings',
    status: '대기중',
  },
  {
    title: '3-5-1-1. 더보기 > 설정 > Notifications > SNS 상세 알림 (Kok Kok Me)',
    name: '/more/settings/notifications-settings/kokkokme',
    status: '대기중',
  },
  {
    title: '3-5-1-2. 더보기 > 설정 > Notifications > SNS 상세 알림 (Live)',
    name: '/more/settings/notifications-settings/kokkokme/live-notifications',
    status: '대기중',
  },
  {
    title: '3-6. 더보기 > 설정 > Privacy and Security',
    name: '/more/settings/privacy-and-security',
    status: '대기중',
  },
  {
    title: '3-6-1. 더보기 > 설정 > Privacy and Security > Recent Login',
    name: '/more/settings/privacy-and-security/recent-login',
    status: '대기중',
  },
  {
    title: '3-6-2. 더보기 > 설정 > Privacy and Security > Profile photo',
    name: '/more/settings/privacy-and-security/profile-photo',
    status: '대기중',
  },
  {
    title: '3-6-3. 더보기 > 설정 > Privacy and Security > Call',
    name: '/more/settings/privacy-and-security/call',
    status: '대기중',
  },
  {
    title: '3-6-4. 더보기 > 설정 > Privacy and Security > Friends',
    name: '/more/settings/privacy-and-security/friends',
    status: '대기중',
  },
  {
    title: '3-6-4-1. 더보기 > 설정 > Privacy and Security > Friends > Add users',
    name: '/more/settings/privacy-and-security/friends/add-users',
    status: '대기중',
  },
  {
    title: '3-6-5. 더보기 > 설정 > Privacy and Security > Passcode',
    name: '/more/settings/privacy-and-security/passcode',
    status: '대기중',
  },
  {
    title: '3-6-5-1. 더보기 > 설정 > Privacy and Security > Passcode > set Passcode',
    name: '/more/settings/privacy-and-security/passcode/set-passcode',
    status: '대기중',
  },
  {
    title: '3-6-6. 더보기 > 설정 > Privacy and Security > SNS 공개 범위 페이지',
    name: '/more/settings/privacy-and-security/kokkokme',
    status: '대기중',
  },
  {
    title: '3-6-6-0. 더보기 > 설정 > Privacy and Security > SNS 공개 범위 페이지 > 게시물 공개 범위 페이지',
    name: '/more/settings/privacy-and-security/kokkokme/privacy-settings',
    status: '대기중',
    params: {
      private: true, // true || false
      type: 'post', // 'post' || 'live' || 'tag'
    },
  },
  {
    title:
      '3-6-6-0. 더보기 > 설정 > Privacy and Security > SNS 공개 범위 페이지 > 게시물 공개 범위 페이지 > 제외 연락처 설정',
    name: '/more/settings/privacy-and-security/kokkokme/settings/except',
    status: '대기중',
    params: 'post', // 'post' || 'live' || 'tag'
  },

  {
    title: '3-6-6-2. 더보기 > 설정 > Privacy and Security > SNS 공개 범위 페이지 > 활동 정보 숨김',
    name: '/more/settings/privacy-and-security/kokkokme/settings/hide-all-activities',
    status: '대기중',
  },
  {
    title: '3-6-7. 더보기 > 설정 > Privacy and Security > 생일 설정',
    name: '/more/settings/privacy-and-security/birthday',
    status: '대기중',
  },
  {
    title: '3-6-4-2. 더보기 > 설정 > Privacy and Security > Blocked users',
    name: '/more/settings/privacy-and-security/bolcked-users',
    status: '대기중',
  },
  {
    title: '3-7. 더보기 > 설정 > Language',
    name: '/more/settings/language',
    status: '진행중',
  },
  {
    title: '3-8. 더보기 > 설정 > Theme',
    name: '/more/settings/theme',
    status: '대기중',
  },
  {
    title: '3-8. 더보기 > 설정 > Theme > Chat',
    name: '/more/settings/theme/chat',
    status: '대기중',
  },
  {
    title: '3-8. 더보기 > 설정 > Theme > Chat Background',
    name: '/more/settings/theme/chat-background',
    status: '대기중',
  },
  {
    title: '3-8. 더보기 > 설정 > Theme > Text Size',
    name: '/more/settings/theme/text-size',
    status: '대기중',
  },
  {
    title: '3-7. 더보기 > 설정 > 언어',
    name: '/more/settings/language',
    status: '대기중',
  },
  {
    title: '3-9. 더보기 > 설정 > 채팅 설정',
    name: '/more/settings/chatting',
    status: '대기중',
  },
  {
    title: '3-9-1. 더보기 > 설정 > 채팅 설정 > 내보내기',
    name: '/more/settings/chatting/export',
    status: '대기중',
  },
  {
    title: '3-10. 더보기 > 설정 > 도움말',
    name: '/more/settings/help',
    status: '대기중',
  },
  {
    title: '3-11. 더보기 > 설정 > 저장 공간 관리',
    name: '/more/settings/storage',
    status: '대기중',
  },
  {
    title: '4. 미디어',
    name: '/media',
    status: '대기중',
  },
  {
    title: '4-1. 미디어 > 카테고리',
    name: '/media/category',
    status: '대기중',
  },
  {
    title: '4-2. 미디어 > 기사 본문',
    name: '/media/article',
    status: '대기중',
  },
  {
    title: '5. 연락처',
    name: '/contacts',
    status: '대기중',
  },
  {
    title: '프로필 상세',
    name: '/profile-detail',
    status: '대기중',
  },
  {
    title: '5-1. 연락처 > 친구 추가',
    name: '/contacts/contacts-add-friend',
    status: '대기중',
  },
  {
    title: '5-1-1. 연락처 > 친구 추가 > 연락처로 친구 추가',
    name: '/contacts/contacts-add-friend/using-phone-number',
    status: '대기중',
  },
  {
    title: '친구 검색 결과',
    name: '/contacts/contacts-add-friend/user-info',
    status: '대기중',
  },
  {
    title: '5-1-4. 연락처 > 친구 추가 > 연락처에서 친구 초대',
    name: '/contacts/contacts-add-friend/invite-friends',
    status: '대기중',
  },
  {
    title: '5-1-5. 연락처 > 친구 추가 > 연락처에서 친구 추가',
    name: '/contacts/contacts-add-friend/from-phonebook',
    status: '대기중',
  },
  {
    title: '5-2. 친구 검색',
    name: '/contacts/contacts-search',
    status: '대기중',
  },
  {
    title: '6-0. 채팅 > 검색',
    name: '/chats/chats-search',
    status: '대기중',
  },
  {
    title: '6-1. 채팅 > 새로운 대화창 생성',
    name: '/chats/new-chat',
    status: '대기중',
  },
  {
    title: '6-1-1. 채팅 > 새로운 대화창 생성 > 새로운 대화 친구 선택',
    name: '/chats/new-chat/chats-add-friend',
    status: '대기중',
    params: 'chat', // 'chat' || 'audio' || 'video'
  },
  {
    title: '6-2-1. 채팅 > 아카이브',
    name: '/chats/archive',
    status: '대기중',
  },
  {
    title: '6-3. 채팅 > 대화방',
    name: '/chats/chat-room',
    status: '대기중',
  },
  {
    title: '7-1-2-1-1. 채팅 > 대화방 > 신고하기 (거래채팅)',
    name: '/chats/chat-room/chats-report',
    status: '대기중',
  },
  {
    title: '6-3-1-1. 채팅 > 대화방 > 대화방 상세',
    name: '/chats/chat-room/chat-room-detail',
    status: '대기중',
    parmas: 'one-on-one', // 'one-on-one' || 'group-nomal' || 'group-admin' || 'myself'
  },
  {
    title: '이미지 라이트 박스', // 프로필 사진 보기
    name: '/image-box',
    status: '대기중',
  },
  {
    title: '6-3-1-1-1. 채팅 > 대화방 > 대화방 상세 > 미디어',
    name: '/chats/chat-room/chat-room-detail/media',
    status: '대기중',
  },
  {
    title: '6-3-1-1-2. 채팅 > 대화방 > 대화방 상세 > 파일',
    name: '/chats/chat-room/chat-room-detail/files',
    status: '대기중',
  },
  {
    title: '6-3-1-1-3. 채팅 > 대화방 > 대화방 상세 > 링크',
    name: '/chats/chat-room/chat-room-detail/links',
    status: '대기중',
  },
  {
    title: '이미지 편집',
    name: '/image-edit',
    status: '대기중',
  },
  {
    title: '메세지 공유',
    name: '/share-message',
    status: '대기중',
    params: {
      type: 'chat', // 'chat' || 'market'
    },
  },
  {
    title: '6-4. 채팅 > 대화방 > 음성 통화',
    name: '/chats/voice-call',
    status: '대기중',
  },
  {
    title: '6-5. 채팅 > 대화방 > 영상 통화',
    name: '/chats/video-call',
    status: '대기중',
  },
  {
    title: '7-0 마켓 > 위치 검색',
    name: '/market/neighborhood-search',
    status: '대기중',
  },
  {
    title: '7-0-1 마켓 > 위치 설정',
    name: '/market/neighborhood-settings',
    status: '대기중',
  },
  {
    title: '7. 마켓(거래품 목록)',
    name: '/market',
    status: '대기중',
  },

  {
    title: '7-1. 마켓 > 거래 품목 상세',
    name: '/market/item',
    status: '대기중',
  },
  {
    title: '7-1. 마켓 > 거래 품목 상세 > 판매자 프로필',
    name: '/market/item/seller-profile',
    status: '대기중',
  },
  {
    title: '7-1. 마켓 > 거래 품목 상세 > 판매자 프로필 > 판매자의 판매 물품',
    name: '/market/item/seller-profile/seller-items',
    status: '대기중',
  },
  {
    title: '7-1-1. 마켓 > 거래 품목 상세 > 판매자 프로필 > 신고',
    name: '/market/item/seller-profile/market-report',
    status: '대기중',
  },
  {
    title: '7-2. 마켓 > 카테고리',
    name: '/market/filter',
    status: '대기중',
  },
  {
    title: '7-3. 마켓 > 검색',
    name: '/market/market-search',
    status: '대기중',
  },
  {
    title: '7-4-1. 마켓 > Listings',
    name: '/market/listings',
    status: '대기중',
  },
  {
    title: '7-4-1-1. 마켓 > Listings > 구매자 선택',
    name: '/market/listings/select-buyer',
    status: '대기중',
  },
  {
    title: '7-4-2. 마켓 > Purchases',
    name: '/market/purchases',
    status: '대기중',
  },
  {
    title: '7-4-1-1-1-a. 마켓 > Purchases > Review',
    name: '/market/purchases/review',
    status: '대기중',
  },
  {
    title: '7-4-3. 마켓 > Saved',
    name: '/market/saved',
    status: '대기중',
  },
  {
    title: '7-4-1-1-1-a. 마켓 > 내가 받은 리뷰',
    name: '/market/my-reviews',
    status: '대기중',
  },
  {
    title: '7-5. 마켓 > 개인 거래 글쓰기',
    name: '/market/market-post',
    status: '대기중',
  },
  {
    title: '7-6. 마켓 > 알림',
    name: '/market/market-notifications',
    status: '대기중',
  },
  {
    title: '7-6. 마켓 > 알림 > 키워드 알림 등록',
    name: '/market/market-notifications/keyword',
    status: '대기중',
  },
  {
    title: '7-7. 마켓 > 가격 제안 (판매자도 동일 페이지에서)',
    name: '/market/make-offer',
    status: '대기중',
  },
  {
    title: '7-7. 마켓 > offers',
    name: '/market/offers',
    status: '대기중',
  },
  {
    title: '8. SNS(타임라인)',
    name: '/kokkokme',
    status: '작업중',
  },
  {
    title: '8-1-2. SNS(타임라인) > 검색',
    name: '/kokkokme/kokkokeme-search',
    status: '완료',
  },
  {
    title: '8-1-2. SNS(타임라인) > 좋아요한 친구 목록',
    name: '/kokkokme/likes',
    status: '완료',
  },
  {
    title: '8-2. SNS(타임라인) > 개인 타임라인',
    name: '/kokkokme/user-timeline/:id',
    status: '작업중',
    params: { id: 4 },
  },
  {
    title: '8-2-1. SNS(타임라인) > 개인 타임라인 > 활동 알림',
    name: '/kokkokme/user-timeline/activity',
    status: '대기중',
  },
  {
    title: '8-2-2. SNS(타임라인) > 개인 타임라인 > 팔로워 관리',
    name: '/kokkokme/user-timeline/followers',
    status: '대기중',
  },
  {
    title: '8-2-3. SNS(타임라인) > 개인 타임라인 > 아카이브 라이브',
    name: '/kokkokme/user-timeline/archived-live',
    status: '대기중',
  },
  {
    title: '아카이브 라이브 설명 작성',
    name: '/kokkokme/description',
    status: '대기중',
  },
  {
    title: '8-3. SNS(타임라인) > 게시글 상세',
    name: '/kokkokme/:id',
    status: '작업중',
    params: { id: 1 },
  },
  {
    title: '8-4. SNS(타임라인) > 게시글 작성',
    name: '/kokkokme/kokkokme-post',
    status: '대기중',
  },
  {
    title: '8-4-1. SNS(타임라인) > 게시글 수정',
    name: '/kokkokme/kokkokme-post/edit',
    status: '대기중',
  },
  {
    title: '8-4-2. SNS(타임라인) > 게시글 유저 태그',
    name: '/kokkokme/kokkokme-post/tag-users',
    status: '대기중',
  },
  {
    title: '8-5. SNS(타임라인) > 라이브 방송',
    name: '/kokkokme/ive',
    status: '대기중',
  },
  {
    title: '8-5-1. SNS(타임라인) > 라이브 방송 > audience settings',
    name: '/kokkokme/live/audience-settings',
    status: '대기중',
    params: 'hide', // 'invite' || 'hide'
  },
  {
    title: '8-5-2. SNS(타임라인) > 라이브 방송 > 참여자 목록',
    name: '/kokkokme/live/watching-list',
    status: '대기중',
  },
];

function PageList() {
  const navigation = useNavigation<MainNavigationProp>();
  const user = useAtomValue(userAtom);
  const token = useAtomValue(tokenAtom);

  return (
    <Screen>
      <Padding>
        <Text style={tw`text-2xl font-bold text-black`}>PageList</Text>
        <ScrollView>
          <View style={tw`border-b border-gray-200 py-2`}>
            <Text>현재 상태</Text>
            <Text>Token : {JSON.stringify(token)}</Text>
            {user && <Text>User : {`id : ${user.id} / uid : ${user.uid} / contact : ${user.contact}`}</Text>}
          </View>
          {list.map(({ title, name, status, params }, index) => (
            <TouchableOpacity
              key={index}
              // @ts-ignore
              onPress={() => navigation.navigate(name, params || '')}
              style={tw`flex-row border-b border-gray-200 py-2`}
            >
              <View style={tw`flex-1`}>
                <Text style={tw`text-black`}>{title}</Text>
                <Text style={tw`text-xs mt-1 text-black`}>{name}</Text>
              </View>
              <Text style={tw`bg-gray-300 rounded p-2`}>{status}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </Padding>
    </Screen>
  );
}

export default PageList;
