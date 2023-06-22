import MySetting from 'MySetting';
import Geocoder from 'react-native-geocoding';

class GeoCoderUtil {
  constructor() {
    Geocoder.init(MySetting.googleApiKey);
    // Geocoder.init(MySetting.googleApiKey, {language : "en"});
  }

  addressToLocation(address: string): Promise<any> {
    return Geocoder.from(address);
  }

  locationToAddress(latitude: number, longitude: number): Promise<any> {
    return Geocoder.from(latitude, longitude);
  }
}
export default GeoCoderUtil;
