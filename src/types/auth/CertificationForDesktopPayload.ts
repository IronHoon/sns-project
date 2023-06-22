export default interface CertificationForDesktopPayload {
  action: 'login' | 'deny';
  code: string;
}
