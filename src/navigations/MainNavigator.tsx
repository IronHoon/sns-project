import * as React from 'react';
import { Dispatch, SetStateAction } from 'react';
import { createNativeStackNavigator, NativeStackNavigationProp } from '@react-navigation/native-stack';
import PageList from '../pages/PageList';
import Components from '../pages/__dev__/Components';
import ImageEdit from '../pages/ImageEdit';
import ShareMessage from '../pages/ShareMessage';
import MediaMain from '../pages/media/MediaMain';
import Category from '../pages/media/Category';
import Article from '../pages/media/Article';

import KokKokMeMainPage from '../pages/kokkokme/KokKokMeMainPage';
import NoResultPostPage from '../pages/kokkokme/NoResultPostPage';
import KokKokMeDetailPage from '../pages/kokkokme/KokKokMeDetailPage';
import KokKokMeSearch from '../pages/kokkokme/KokKokMeSearch';
import LikesPage from '../pages/kokkokme/LikesPage';
import UserTimelinePage from '../pages/kokkokme/UserTimelinePage';
import ActivityPage from '../pages/kokkokme/ActivityPage';
import Followers from '../pages/kokkokme/Followers';
import ArichivedLive from '../pages/kokkokme/ArchivedLive';
import Description from '../pages/kokkokme/Description';
import KokKokMePost from '../pages/kokkokme/KokKokMePost';
import KokKokMeEditPost from '../pages/kokkokme/KokKokMeEditPost';
import Live from '../pages/kokkokme/Live';
import AudienceSettings from '../pages/kokkokme/AudienceSettings';
import WatchingList from '../pages/kokkokme/WatchingList';
import * as Pages from 'pages';
import Splash from '../views/Splash';
import KokKokMeBackup from '../views/kokkokme/KokKokMeBackup';
import KokKokMeTagUsers from 'pages/kokkokme/KokKokMeTagUsers';
import TestLoginPage from 'pages/__dev__/TestLoginPage';
import Room, { CallType, RoomTypeOfClient } from 'types/chats/rooms/Room';
import { SearchMapCallback } from 'views/chats/components/message-type/SearchMap';
import { DocumentScannerCallback } from 'pages/chats/message-type/KokkokDocumentScannerPage';
import KokKokMeSearchHash from '../pages/kokkokme/KokKokMeSearchHash';
import User from '../types/auth/User';
import Message from '../types/chats/rooms/messages/Message';
import ShareChatPage from '../pages/chats/ShareChatPage';
import { PermissionsCallback } from 'views/landing/Permissions';
import { KokKokGalleryPageCallback } from 'pages/chats/message-type/KokKokGalleryPage';
import SearchLocationPage from '../pages/kokkokme/SearchLocationPage';
import Region from '../types/socials/posts/Region';
import { ChooseFriendsCallback, ChooseFriendsCloseCallback } from 'views/chats/ChooseFriends';
import EditImagePage from '../pages/chats/message-type/EditImagePage';
import CameraRoll from '@react-native-camera-roll/camera-roll';
import QRScanPage from '../pages/QRScanPage';
import MediaDetailPage from '../pages/chats/MediaDetailPage';
import BroadcastExamplePage from 'pages/kokkokme/live-streaming/BroadcastExamplePage';
import PlayExamplePage from 'pages/kokkokme/live-streaming/PlayExamplePage';
import { gestureHandlerRootHOC } from 'react-native-gesture-handler';
import LicensePage from '../pages/more/settings/LicensePage';

export type MainNavigatorRouteParams = {
  '/': undefined;
  '/splash': undefined;
  '/__dev__/test-login': undefined;
  '/__dev__/page-list': undefined;
  '/__dev__/components': undefined;
  '/landing/permissions': {
    callback: PermissionsCallback;
  };
  '/webview': {
    title: 'Terms of Service' | 'Support Center' | 'Licenses';
  };
  '/lock': undefined;
  '/landing': undefined;
  '/sign-up/registered': {
    uid: string;
    contact: string;
    first_name: string;
    last_name: string;
    profile_image: string;
  };
  '/sign-up/profile-enroll': {
    route: 'sign-up';
    data: any;
  };
  '/select-country': undefined;
  '/code': {
    route: 'sign-in' | 'sign-up' | 'change-number' | 'register-email' | 'change-email';
    data: any;
    update?: (field: string, value: any) => void;
  };
  '/qr-scan': undefined;
  '/phone-number-input': {
    route: 'sign-up' | 'sign-in' | 'change-number';
    update?: (field: string, value: any) => void;
  };
  '/more': undefined;
  '/more/profile-edit': undefined;
  '/more/profile-edit/change-number-info': {
    update?: (field: string, value: any) => void;
  };
  '/more/profile-edit/change-mail-info': {
    update?: (field: string, value: any) => void;
  };
  '/more/profile-edit/email-input': {
    route: 'register-email' | 'change-email';
    update?: (field: string, value: any) => void;
  };
  '/more/profile-edit/official-account': undefined;
  '/more/profile-edit/new-phone-number': undefined;
  '/more/profile-edit/new-email': undefined;
  '/more/saved-messages': undefined;
  '/more/settings': undefined;
  '/more/settings/general': undefined;
  '/more/settings/notifications-settings': undefined;
  '/more/settings/notifications-settings/kokkokme': undefined;
  '/more/settings/notifications-settings/kokkokme/live-notifications': undefined;
  '/more/settings/privacy-and-security': undefined;
  '/more/settings/privacy-and-security/recent-login': undefined;
  '/more/settings/privacy-and-security/profile-photo': undefined;
  '/more/settings/privacy-and-security/call': undefined;
  '/more/settings/privacy-and-security/friends': undefined;
  '/more/settings/privacy-and-security/friends/add-users': undefined;
  '/more/settings/privacy-and-security/passcode': undefined;
  '/more/settings/privacy-and-security/passcode/set-passcode': {
    route: 'set-pass' | 'change-pass';
  };
  '/more/settings/privacy-and-security/kokkokme': undefined;
  '/more/settings/privacy-and-security/kokkokme/privacy-settings': {
    route: 'post' | 'live' | 'tag';
    private: boolean;
  };
  '/more/settings/privacy-and-security/kokkokme/privacy-settings/except': {
    route: 'post' | 'live' | 'tag';
    private: boolean;
  };
  '/more/settings/privacy-and-security/kokkokme/privacy-settings/except/add-except': {
    route: 'post' | 'live' | 'tag';
    private: boolean;
  };
  '/more/settings/privacy-and-security/kokkokme/hide-all-activities': undefined;
  '/more/settings/privacy-and-security/birthday': undefined;
  '/more/settings/privacy-and-security/bolcked-users': undefined;
  '/more/settings/privacy-and-security/bolcked-users/add-blocked-user': undefined;
  '/more/settings/theme': undefined;
  '/more/settings/theme/chat': undefined;
  '/more/settings/theme/chat-background': undefined;
  '/more/settings/theme/text-size': undefined;
  '/more/settings/language': undefined;
  '/more/settings/chatting': undefined;
  '/more/settings/chatting/export': undefined;
  '/more/settings/help': undefined;
  '/more/settings/help/license': undefined;
  '/more/settings/help/delete-account': undefined;
  '/more/settings/help/delete-account/confirm': undefined;
  '/more/settings/storage': undefined;
  '/media': undefined;
  '/media/category': undefined;
  '/media/article': undefined;
  '/contacts': undefined;
  '/profile-detail': undefined;
  '/contacts/contacts-add-friend': undefined;
  '/contacts/contacts-add-friend/using-phone-number': undefined;
  '/contacts/contacts-add-friend/user-info': undefined;
  '/contacts/contacts-add-friend/invite-friends': undefined;
  '/contacts/contacts-add-friend/from-phonebook': undefined;
  '/contacts/contacts-search': undefined;
  '/contacts/contacts-search/result': {
    result: object;
    setResult: Dispatch<SetStateAction<boolean>>;
  };
  '/chats': undefined;
  '/chats/chats-search': undefined;
  '/chats/new-chat': undefined;
  '/chats/new-chat/choose-friends': {
    chatRoomType: RoomTypeOfClient;
    callback: ChooseFriendsCallback;
    closeCallback?: ChooseFriendsCloseCallback;
    byCallView?: boolean;
    roomId?: string;
    joinedUsers?: User[];
    chatList?: Message[];
  };
  '/chats/archive': undefined;
  '/chats/chat-room': {
    room: Room;
  };
  '/chats/chat-room/share-chat': {
    room: Room;
    chatList?: Message[];
    chatRoomType: RoomTypeOfClient;
    roomId?: string;
    contact?: boolean;
    shareEx?: boolean;
  };
  '/chats/chat-room/gallery': {
    callback?: KokKokGalleryPageCallback;
    codeScan?: boolean;
    setNotFound?: (boolean) => void;
    setImage?: Dispatch<SetStateAction<any[]>>;
    setIsLoading?: Dispatch<SetStateAction<boolean>>;
    image?: string[];
    update?: (field: string, value: any) => void;
    selectedPhotoType?: string;
  };
  '/chats/chat-room/gallery/edit': {
    callback?: KokKokGalleryPageCallback;
    checkedFileItem: CameraRoll.PhotoIdentifier[];
    media?: boolean;
    image?: string[];
    setImage?: Dispatch<SetStateAction<any[]>>;
    setIsLoading?: Dispatch<SetStateAction<boolean>>;
    videoList?: any[];
    chat?: boolean;
    edit?: boolean;
    update?: (field: string, value: string) => void;
    selectedPhotoType?: string;
  };
  '/chats/chat-room/media-detail': {
    selectedItem: Message;
    room: Room;
    userName: string;
  };
  '/chats/chat-room/choose-contacts': undefined;
  '/chats/chat-room/view-map': {
    locationInfo: any;
  };
  '/chats/chat-room/search-map': {
    callback?: SearchMapCallback;
  };
  '/chats/chat-room/video-player': {
    uri: string;
  };
  '/chats/chat-room/document-scanner': {
    callback: DocumentScannerCallback;
  };
  '/chats/chat-room/chats-report': undefined;
  '/chats/chat-room/chat-room-detail': {
    room: Room;
  };
  '/image-box': undefined;
  '/chats/chat-room/chat-room-detail/media': {
    room: Room;
  };
  '/chats/chat-room/chat-room-detail/files': {
    room: Room;
  };
  '/chats/chat-room/chat-room-detail/links': {
    room: Room;
  };
  '/image-edit': undefined;
  '/share-message': undefined;
  '/chats/receive-call': {
    room: Room;
    callType: CallType;
  };
  '/market/neighborhood-search': undefined;
  '/market/neighborhood-settings': {
    location?: string[];
  };
  '/market': {
    location?: string[];
  };
  '/market/item': undefined;
  '/market/item-detail': undefined;
  '/market/item/seller-profile': undefined;
  '/market/item/seller-profile/seller-items': undefined;
  '/market/item/seller-profile/market-report': undefined;
  '/market/filter': undefined;
  '/market/market-search': undefined;
  '/market/listings': undefined;
  '/market/listings/select-buyer': undefined;
  '/market/purchases': undefined;
  '/market/purchases/review': undefined;
  '/market/saved': undefined;
  '/market/my-reviews': undefined;
  '/market/market-post': undefined;
  '/market/market-notifications': undefined;
  '/market/market-notifications/keyword': undefined;
  '/market/make-offer': undefined;
  '/market/offers': undefined;
  '/kokkokme': undefined;
  '/kokkokme/no-result': undefined;
  '/kokkokme/host': undefined;
  '/kokkokme/guest': undefined;
  '/kokkokme-backup': undefined;
  '/kokkokme/:id': {
    // TODO: 더미데이터 삭제 시 수정 필요
    id: number | string;
  };
  '/kokkokme/kokkokeme-search': undefined;
  '/kokkokme/kokkokme-search/hash': {
    hash: string;
    setSize?: Dispatch<SetStateAction<any[]>>;
    size?: number;
    setIsSearching?: Dispatch<SetStateAction<any[]>>;
  };
  '/kokkokme/likes/:id': {
    // TODO: 더미데이터 삭제 시 수정 필요
    id: number | string;
  };
  '/kokkokme/user-timeline/:id': {
    id: number | undefined;
    uid?: string;
    hide?: boolean;
    contact?: string;
  };
  '/kokkokme/user-timeline/followers': {
    id: number;
    name: string;
  };
  '/kokkokme/user-timeline/archived-live': undefined;
  '/kokkokme/activity': undefined;
  '/kokkokme/description': undefined;
  '/kokkokme/kokkokme-post': undefined;
  '/kokkokme/kokkokme-post/location': {
    setRegion: Dispatch<SetStateAction<any[]>>;
    setIsTagLocation: Dispatch<SetStateAction<any[]>>;
    setAddress: Dispatch<SetStateAction<any[]>>;
    region: Region;
  };
  '/kokkokme/kokkokme-post/tag-users': {
    tagUsers: any[];
    setTagedUsers: Dispatch<SetStateAction<any[]>>;
  };
  '/kokkokme/kokkokme-post/edit': {
    id: string;
  };
  '/kokkokme/live': undefined;
  '/kokkokme/live/audience-settings': undefined;
  '/kokkokme/live/watching-list': undefined;
};

export type MainNavigationProp = NativeStackNavigationProp<MainNavigatorRouteParams, '/'>;

const Stack = createNativeStackNavigator<MainNavigatorRouteParams>();

function MainNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'none',
      }}
    >
      <Stack.Screen name="/splash" component={Splash} />
      <Stack.Screen name="/__dev__/page-list" component={PageList} />
      <Stack.Screen name="/__dev__/test-login" component={TestLoginPage} />
      <Stack.Screen name="/" component={PageList} />
      <Stack.Screen name="/__dev__/components" component={Components} />
      <Stack.Screen name="/landing/permissions" component={Pages.PermissionsPage} />
      <Stack.Screen name="/webview" component={Pages.WebviewPage} />
      <Stack.Screen name="/lock" component={Pages.LockPage} />
      <Stack.Screen name="/landing" component={Pages.LandingPage} />
      <Stack.Screen name="/sign-up/registered" component={Pages.RegisteredPage} />
      <Stack.Screen name="/sign-up/profile-enroll" component={Pages.ProfileEnrollPage} />
      <Stack.Screen name="/code" component={Pages.CodePage} />
      <Stack.Screen name="/phone-number-input" component={Pages.PhoneNumberInputPage} />
      <Stack.Screen name="/more" component={Pages.MoreMainPage} />
      <Stack.Screen name="/more/profile-edit" component={Pages.EditProfilePage} />
      <Stack.Screen name="/more/profile-edit/email-input" component={Pages.EmailInputPage} />
      <Stack.Screen name="/more/profile-edit/official-account" component={Pages.OfficialAccountPage} />
      <Stack.Screen name="/more/profile-edit/change-number-info" component={Pages.ChangeNumberInfoPage} />
      <Stack.Screen name="/more/profile-edit/change-mail-info" component={Pages.ChangeMailInfoPage} />
      <Stack.Screen name="/more/profile-edit/new-phone-number" component={Pages.NewPhoneNumberPage} />
      <Stack.Screen name="/more/profile-edit/new-email" component={Pages.NewEmailPage} />
      <Stack.Screen name="/more/saved-messages" component={Pages.SavedMessagesPage} />
      <Stack.Screen name="/more/settings" component={Pages.SettingsPage} />
      <Stack.Screen name="/more/settings/general" component={Pages.GeneralPage} />
      <Stack.Screen name="/more/settings/notifications-settings" component={Pages.NotificationsSettingsPage} />
      <Stack.Screen
        name="/more/settings/notifications-settings/kokkokme"
        component={Pages.KokKokMeNotificationssPage}
      />
      <Stack.Screen
        name="/more/settings/notifications-settings/kokkokme/live-notifications"
        component={Pages.LiveNotificationsPage}
      />
      <Stack.Screen name="/more/settings/privacy-and-security" component={Pages.PrivacyAndSecurityPage} />
      <Stack.Screen name="/more/settings/privacy-and-security/recent-login" component={Pages.RecentLoginPage} />
      <Stack.Screen name="/more/settings/privacy-and-security/profile-photo" component={Pages.ProfilePhotoPage} />
      <Stack.Screen name="/more/settings/privacy-and-security/call" component={Pages.CallSettingsPage} />
      <Stack.Screen name="/more/settings/privacy-and-security/friends" component={Pages.FriendsPage} />
      <Stack.Screen name="/more/settings/privacy-and-security/friends/add-users" component={Pages.AddUsersPage} />
      <Stack.Screen name="/more/settings/privacy-and-security/passcode" component={Pages.PasscodePage} />
      <Stack.Screen
        name="/more/settings/privacy-and-security/passcode/set-passcode"
        component={Pages.SetPasscodePage}
      />
      <Stack.Screen name="/more/settings/privacy-and-security/kokkokme" component={Pages.KokKokMePrivacyPage} />
      <Stack.Screen
        name="/more/settings/privacy-and-security/kokkokme/privacy-settings"
        component={Pages.PrivacySettingsPage}
      />
      <Stack.Screen
        name="/more/settings/privacy-and-security/kokkokme/privacy-settings/except"
        component={Pages.ExceptPage}
      />
      <Stack.Screen
        name="/more/settings/privacy-and-security/kokkokme/privacy-settings/except/add-except"
        component={Pages.AddExceptPage}
      />
      <Stack.Screen
        name="/more/settings/privacy-and-security/kokkokme/hide-all-activities"
        component={Pages.HideAllActivitiesPage}
      />
      <Stack.Screen name="/more/settings/privacy-and-security/birthday" component={Pages.BirthdayPage} />
      <Stack.Screen name="/more/settings/privacy-and-security/bolcked-users" component={Pages.BlockedUsersPage} />
      <Stack.Screen
        name="/more/settings/privacy-and-security/bolcked-users/add-blocked-user"
        component={Pages.AddBlockedPage}
      />
      <Stack.Screen name="/more/settings/theme" component={Pages.ThemePage} />
      <Stack.Screen name="/more/settings/theme/chat" component={Pages.ChatThemePage} />
      <Stack.Screen name="/more/settings/theme/chat-background" component={Pages.ChatBackgroundPage} />
      <Stack.Screen name="/more/settings/theme/text-size" component={Pages.TextSizePage} />
      <Stack.Screen name="/more/settings/language" component={Pages.LanguagePage} />
      <Stack.Screen name="/more/settings/chatting" component={Pages.ChattingPage} />
      <Stack.Screen name="/more/settings/chatting/export" component={Pages.ExportPage} />
      <Stack.Screen name="/more/settings/help" component={Pages.HelpPage} />
      <Stack.Screen name="/more/settings/help/license" component={LicensePage} />
      <Stack.Screen name="/more/settings/help/delete-account" component={Pages.DeleteAccountPage} />
      <Stack.Screen name="/more/settings/help/delete-account/confirm" component={Pages.DeleteAccountConfirmPage} />
      <Stack.Screen name="/more/settings/storage" component={Pages.StoragePage} />
      <Stack.Screen name="/qr-scan" component={QRScanPage} />
      <Stack.Screen name="/media" component={MediaMain} />
      <Stack.Screen name="/media/category" component={Category} />
      <Stack.Screen name="/media/article" component={Article} />
      <Stack.Screen name="/contacts" component={Pages.ContactsMainPage} />
      <Stack.Screen name="/profile-detail" component={Pages.ProfileDatailPage} />
      <Stack.Screen name="/contacts/contacts-add-friend" component={Pages.AddFriendMainPage} />
      <Stack.Screen name="/contacts/contacts-add-friend/using-phone-number" component={Pages.UsingPhoneNumberPage} />
      <Stack.Screen name="/contacts/contacts-add-friend/invite-friends" component={Pages.InviteFriendsPage} />
      <Stack.Screen name="/contacts/contacts-add-friend/from-phonebook" component={Pages.FromPhoneBookPage} />
      <Stack.Screen name="/contacts/contacts-search" component={Pages.ContactsSearchPage} />
      <Stack.Screen name="/contacts/contacts-search/result" component={Pages.ScanResultPage} />
      <Stack.Screen name="/chats" component={Pages.ChatsMainPage} />
      <Stack.Screen name="/chats/chats-search" component={Pages.ChatsSearchPage} />
      <Stack.Screen name="/chats/new-chat" component={Pages.NewChatPage} />
      <Stack.Screen name="/chats/new-chat/choose-friends" component={Pages.ChooseFriendsPage} />
      <Stack.Screen name="/chats/archive" component={Pages.ArchiveChatPage} />
      <Stack.Screen name="/chats/chat-room" component={Pages.ChatRoomPage} />
      <Stack.Screen name="/chats/chat-room/share-chat" component={ShareChatPage} />
      <Stack.Screen name="/chats/chat-room/view-map" component={Pages.ViewMapPage} />
      <Stack.Screen name="/chats/chat-room/search-map" component={Pages.SearchMapPage} />
      <Stack.Screen name="/chats/chat-room/choose-contacts" component={Pages.ChooseContactsPage} />
      <Stack.Screen name="/chats/chat-room/gallery" component={Pages.KokKokGalleryPage} />
      <Stack.Screen name="/chats/chat-room/gallery/edit" component={gestureHandlerRootHOC(EditImagePage)} />
      <Stack.Screen name="/chats/chat-room/document-scanner" component={Pages.KokkokDocumentScannerPage} />
      <Stack.Screen name="/chats/chat-room/video-player" component={Pages.VideoPlayerPage} />
      <Stack.Screen name="/chats/chat-room/media-detail" component={MediaDetailPage} />
      <Stack.Screen name="/chats/chat-room/chat-room-detail" component={Pages.ChatRoomDetailPage} />
      <Stack.Screen name="/chats/chat-room/chat-room-detail/media" component={Pages.MediaPage} />
      <Stack.Screen name="/chats/chat-room/chat-room-detail/files" component={Pages.FilesPage} />
      <Stack.Screen name="/chats/chat-room/chat-room-detail/links" component={Pages.LinksPage} />
      <Stack.Screen name="/image-edit" component={ImageEdit} />
      <Stack.Screen name="/share-message" component={ShareMessage} />
      <Stack.Screen name="/chats/receive-call" component={Pages.ReceiveCallPage} />
      {/*<<<<<<< Updated upstream*/}

      <Stack.Screen name="/market/neighborhood-search" component={Pages.NeighborhoodSearchPage} />
      <Stack.Screen name="/market/neighborhood-settings" component={Pages.NeighborhoodSettingsPage} />
      <Stack.Screen name="/market" component={Pages.MarketMainPage} />
      <Stack.Screen name="/market/item" component={Pages.ItemPage} />
      <Stack.Screen name="/market/saved" component={Pages.SavedPage} />
      <Stack.Screen name="/market/purchases" component={Pages.PurchasesPage} />
      <Stack.Screen name="/market/purchases/review" component={Pages.ReviewPage} />
      <Stack.Screen name="/market/my-reviews" component={Pages.MyReviewsPage} />
      <Stack.Screen name="/market/market-post" component={Pages.MarketEditPostPage} />
      <Stack.Screen name="/market/listings" component={Pages.ListingsPage} />
      <Stack.Screen name="/market/item-detail" component={Pages.ItemDetailPage} />

      <Stack.Screen name="/market/item/seller-profile" component={Pages.SellerProfilePage} />
      <Stack.Screen name="/market/item/seller-profile/seller-items" component={Pages.SellerItemsPage} />

      <Stack.Screen name="/market/item/seller-profile/market-report" component={Pages.MarketReportPage} />
      <Stack.Screen name="/market/market-search" component={Pages.MarketSearchPage} />
      <Stack.Screen name="/market/listings/select-buyer" component={Pages.SelectBuyerPage} />
      <Stack.Screen name="/market/market-notifications" component={Pages.MarketNotificationsPage} />
      <Stack.Screen name="/market/market-notifications/keyword" component={Pages.KeywordPage} />
      <Stack.Screen name="/market/make-offer" component={Pages.MakeOfferPage} />
      {/* <Stack.Screen name="/market/offers" component={Pages.OffersPage} /> */}

      <Stack.Screen name="/kokkokme" component={KokKokMeMainPage} />
      <Stack.Screen name="/kokkokme/no-result" component={NoResultPostPage} />
      <Stack.Screen name="/kokkokme/host" component={BroadcastExamplePage} />
      {/*<Stack.Screen name="/kokkokme/guest" component={PlayExamplePage} />*/}
      <Stack.Screen name="/kokkokme-backup" component={KokKokMeBackup} />
      <Stack.Screen name="/kokkokme/:id" component={KokKokMeDetailPage} />
      <Stack.Screen name="/kokkokme/kokkokeme-search" component={KokKokMeSearch} />
      <Stack.Screen name="/kokkokme/kokkokme-search/hash" component={KokKokMeSearchHash} />
      <Stack.Screen name="/kokkokme/likes/:id" component={LikesPage} />
      <Stack.Screen name="/kokkokme/user-timeline/:id" component={UserTimelinePage} />
      <Stack.Screen name="/kokkokme/user-timeline/followers" component={Followers} />
      <Stack.Screen name="/kokkokme/user-timeline/archived-live" component={ArichivedLive} />
      <Stack.Screen name="/kokkokme/activity" component={ActivityPage} />
      <Stack.Screen name="/kokkokme/description" component={Description} />
      <Stack.Screen name="/kokkokme/kokkokme-post" component={KokKokMePost} />
      <Stack.Screen name="/kokkokme/kokkokme-post/location" component={SearchLocationPage} />
      <Stack.Screen name="/kokkokme/kokkokme-post/tag-users" component={KokKokMeTagUsers} />
      <Stack.Screen name="/kokkokme/kokkokme-post/edit" component={KokKokMeEditPost} />
      <Stack.Screen name="/kokkokme/live" component={Live} />
      <Stack.Screen name="/kokkokme/live/audience-settings" component={AudienceSettings} />
      <Stack.Screen name="/kokkokme/live/watching-list" component={WatchingList} />
    </Stack.Navigator>
  );
}

export default MainNavigator;
