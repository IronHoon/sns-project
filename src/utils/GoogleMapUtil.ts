class GoogleMapUtil {
  static image(lat: number, lng: number, zoom: number, key: string): string {
    return `https://maps.googleapis.com/maps/api/staticmap?center=${lat}, ${lng}&zoom=${zoom}&size=400x400&key=${key}`;
  }
}

export default GoogleMapUtil;
