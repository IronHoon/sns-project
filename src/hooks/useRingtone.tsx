import { useRef } from 'react';
import Sound from 'react-native-sound';

export const ringtoneName = 'iphone_ringtone';
const useRingtone = () => {
  const localSoundRef = useRef<Sound>(null);
  const play = () => {
    // getRingerMode().then((ringerMode) => {
    //   // LogUtil.info(`useRingtone ringerMode: ${ringerMode}`);
    //   if (ringerMode === RINGER_MODE.vibrate) {
    //     Vibration.vibrate([1000, 2000, 1000, 2000], true);
    //   }
    // });
    // Sound.setCategory('Ambient'); //진동, 무음일대 알아서 처리해줌.

    if (!localSoundRef.current) {
      //@ts-ignore
      localSoundRef.current = new Sound(`${ringtoneName}.mp3`, Sound.MAIN_BUNDLE, (error) => {
        localSoundRef.current?.setNumberOfLoops(-1);
        localSoundRef.current?.play((success) => {});
      });
    }
  };
  const stop = () => {
    // Vibration.cancel();
    if (localSoundRef.current) {
      localSoundRef.current.stop(() => {
        localSoundRef.current?.release();
        //@ts-ignore
        localSoundRef.current = null;
      });
    }
  };

  return { play, stop };
};

export default useRingtone;
