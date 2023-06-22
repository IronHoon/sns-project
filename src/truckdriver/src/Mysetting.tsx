import {Platform} from 'react-native';
import Package from '../package.json';
import {name as appName} from '../app.json';

export default class MySetting {
    static readonly appName: string = appName;
    static readonly appVersion: string = Package.version;
    static readonly httpUrl: string = 'http://13.209.185.155/api/';

    static isBackground: boolean = false;
    static readonly isIos = Platform.OS === 'ios';
    static readonly isAndroid = Platform.OS === 'android';
    static AppleLoginKey = 'GJ3RRCXFBN';


}

