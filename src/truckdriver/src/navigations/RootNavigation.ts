import { createNavigationContainerRef, StackActions } from '@react-navigation/native';
import { MainNavigationProp } from './MainNavigator';
export class RootNavigation {
    static readonly navigationRef = createNavigationContainerRef<MainNavigationProp>();
    //@ts-ignore
    static navigate(name, params) {
        if (this.navigationRef.isReady()) {
            this.navigationRef.navigate(name, params);
        }
    }
    //@ts-ignore
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
    //@ts-ignore
    static push(...args) {
        if (this.navigationRef.isReady()) {
            //@ts-ignore
            this.navigationRef.dispatch(StackActions.push(...args));
        }
    }
}
