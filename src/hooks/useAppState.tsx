import { useEffect, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { useAtom } from 'jotai';
import activityAtom from '../stores/activityAtom';

type useAppStateProps = {
  onInactiveOrBackground?: () => void;
  onForeground?: () => void;
  onBackground?: () => void;
  onChange?: (status: AppStateStatus) => void;
};

export default function useAppState({
  onChange,
  onForeground,
  onInactiveOrBackground,
  onBackground,
}: useAppStateProps) {
  //foreground, background 파악 가능
  const [appState, setAppState] = useState(AppState.currentState);
  const [activity, setActivity] = useAtom(activityAtom);

  useEffect(() => {
    function handleAppStateChange(nextAppState: AppStateStatus) {
      console.log('appState', appState);
      console.log('nextAppState', nextAppState);
      console.log('activity', activity);
      if (nextAppState === 'background' && !activity) {
        onBackground?.();
      }
      if (appState === 'background' && nextAppState === 'active') {
        setActivity(false);
      }
      if (nextAppState === 'active' && appState !== 'active') {
        onForeground?.();
      } else if (appState === 'active' && nextAppState.match(/inactive|background/)) {
        onInactiveOrBackground?.();
      }
      setAppState(nextAppState);
      onChange?.(nextAppState);
    }
    const state = AppState.addEventListener('change', handleAppStateChange);

    return () => state.remove();
  }, [onChange, onForeground, onInactiveOrBackground, appState, onBackground]);

  return { appState };
}
