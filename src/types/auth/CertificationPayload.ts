export default interface CertificationPayload {
  contact: string;
  code: string;
  device_id: string;
  mode?: string;
  device_name?: string;
  push_token: string;
}
