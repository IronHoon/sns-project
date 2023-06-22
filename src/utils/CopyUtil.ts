import DateOrString from 'types/_common/DateOrString';
import LogUtil from './LogUtil';

class CopyUtil {
  static deepCopy<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj));
  }
}

export default CopyUtil;
