import {
  check,
  checkMultiple,
  Permission,
  PermissionStatus,
  Rationale,
  request,
  requestMultiple,
  RESULTS,
} from 'react-native-permissions';
import LogUtil from './LogUtil';

class PermissionUtil {
  //권한 요청
  static requestPermission(permission: Permission, rationale?: Rationale): Promise<PermissionStatus> {
    return new Promise(async (resolve, reject) => {
      request(permission)
        .then((permissionStatus) => {
          LogUtil.info('requestPermission response', permissionStatus);
          resolve(permissionStatus);
        })
        .catch((error) => {
          LogUtil.error('requestPermission ERROR : ', error);
          reject(error);
        });
    });
  }

  //허용된 권한에 대한 체킹 + logging
  static checkPermission(permission: Permission): Promise<PermissionStatus> {
    return new Promise(async (resolve, reject) => {
      check(permission)
        .then((permissionStatus) => {
          switch (permissionStatus) {
            case RESULTS.UNAVAILABLE:
              LogUtil.info('This feature is not available (on this device / in this context)');
              resolve(permissionStatus);
              break;
            case RESULTS.DENIED:
              LogUtil.info('The permission has not been requested / is denied but requestable');
              resolve(permissionStatus);
              break;
            case RESULTS.LIMITED:
              LogUtil.info('The permission is limited: some actions are possible');
              resolve(permissionStatus);
              break;
            case RESULTS.GRANTED:
              LogUtil.info('The permission is granted');
              resolve(permissionStatus);
              break;
            case RESULTS.BLOCKED:
              LogUtil.info('The permission is denied and not requestable anymore');
              resolve(permissionStatus);
              break;
            default:
              LogUtil.info('The permission is unknown result type');
              resolve(permissionStatus);
              break;
          }
        })
        .catch((error) => {
          LogUtil.error('PERMISSION ERROR : ', error);
          reject(error);
        });
    });
  }

  static requestMultiplePermissions(permissionList: Permission[]): Promise<Record<Permission, PermissionStatus>> {
    return new Promise(async (resolve, reject) => {
      requestMultiple(permissionList)
        .then((record) => {
          LogUtil.info('requestMultiplePermissions record : ', record);
          resolve(record);
        })
        .catch((error) => {
          LogUtil.error('requestMultiplePermissions ERROR : ', error);
          reject(error);
        });
    });
  }

  static checkMultiplePermissions(permissionList: Permission[]): Promise<Record<Permission, PermissionStatus>> {
    return new Promise(async (resolve, reject) => {
      checkMultiple(permissionList)
        .then((record) => {
          LogUtil.info('checkMultiplePermissions record : ', record);
          resolve(record);
        })
        .catch((error) => {
          LogUtil.error('checkMultiplePermissions ERROR : ', error);
          reject(error);
        });
    });
  }
}

export default PermissionUtil;
