import { createNavigationContainerRef, StackActions } from '@react-navigation/native';
import LogUtil from 'utils/LogUtil';
import { MainNavigationProp } from './MainNavigator';
export class RootNatigation {
  static readonly navigationRef = createNavigationContainerRef<MainNavigationProp>();

  static getPageName() {
    const pageName = this.navigationRef.current?.getCurrentRoute()?.name ?? '';

    LogUtil.info(`RootNatigation getPageName pageName:${pageName}`);
    return pageName;
  }

  static navigate(name, params) {
    if (this.navigationRef.isReady()) {
      this.navigationRef.navigate(name, params);
    }
  }
  static replace(name, params) {
    if (this.navigationRef.isReady()) {
      this.navigationRef.dispatch(StackActions.replace(name, params));
    }
  }

  static popToTop() {
    if (this.navigationRef.isReady()) {
      this.navigationRef.dispatch(StackActions.popToTop());
    }
  }
  static push(...args) {
    if (this.navigationRef.isReady()) {
      //@ts-ignore
      this.navigationRef.dispatch(StackActions.push(...args));
    }
  }
}
