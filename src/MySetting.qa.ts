// export default class MySetting {
//   static readonly httpUrl: string = 'https://qa-api.kokkokchat.link';
//   static readonly socketUrl: string = 'https://qa-api.kokkokchat.link:2004';
// }
import { Platform } from 'react-native';
import Package from '../package.json';
import { name as appName } from '../app.json';
import { isTablet } from 'react-native-device-info';
export default class MySetting {
  static readonly appName: string = appName;
  static readonly appVersion: string = Package.version;
  static readonly httpUrl: string = 'https://qa-api.kokkokchat.link';
  static readonly socketUrl: string = 'https://qa-api.kokkokchat.link:2004';

  static isBackground: boolean = false;
  static readonly isIos = Platform.OS === 'ios';
  static readonly isAndroid = Platform.OS === 'android';
  static readonly deviceType: 'tablet' | 'mobile' | 'pc' = isTablet()
    ? 'tablet'
    : MySetting.isAndroid || MySetting.isIos
    ? 'mobile'
    : 'pc';

  static readonly liveShoppingStreamUrl: string = 'rtmps://6c2dd7e0a447.global-contribute.live-video.net:443/app/';
  static readonly liveShoppingStreamKey: string = 'sk_ap-northeast-2_WWUfRBcHWp9j_11a4jDthh48Y4c15nGXjSpSLgLP1WP';
  static readonly liveShoppingPlaybackUrl: string =
    'https://6c2dd7e0a447.ap-northeast-2.playback.live-video.net/api/video/v1/ap-northeast-2.405476690233.channel.s8NGOTUcsNhC.m3u8';

  static readonly googleApiKey: string = 'AIzaSyDivn5hDkFZ-ad5MYC1QxuGOwm4qdimHX4';
}
