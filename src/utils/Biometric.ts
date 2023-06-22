import { BackHandler } from 'react-native';
import ReactNativeBiometrics from 'react-native-biometrics';

const rnBiometrics = new ReactNativeBiometrics({ allowDeviceCredentials: true });

const CallCheckBiomatric = async () => {
  //@ts-ignore
  const { available } = await rnBiometrics.isSensorAvailable();
  return available;
};

const CallAuthBiomatirc = async () => {
  try {
    const { success } = await rnBiometrics.simplePrompt({ promptMessage: 'Authentication required' });
    if (success) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.log('biometrics failed', error);
    return null;
  }
};

const CreateBioAuthKey = async () => {
  try {
    console.info('enter for Sign');
    let epochTimeSeconds = Math.round(new Date().getTime() / 1000).toString();
    let payload = epochTimeSeconds + 'some message';
    //@ts-ignore
    const { success, signature } = await rnBiometrics.createSignature({
      promptMessage: 'Authentication required',
      payload: payload,
    });
    if (success) {
      return signature;
    } else {
      return null;
    }
  } catch (error) {
    console.log('biometrics failed', error);
  }
};

export { CallCheckBiomatric, CreateBioAuthKey, CallAuthBiomatirc };
