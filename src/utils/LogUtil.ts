import DateUtil from './DateUtil';
import { logToDebugger } from 'react-native-qa-debugger';

class LogUtil {
  static info(message: string, obj?) {
    if (obj) {
      const jsonObj =
        obj instanceof Map ? JSON.stringify(Object.fromEntries(obj), null, 2) : JSON.stringify(obj, null, 2);
      const label = `${DateUtil.nowWithKST()}, ${message}, ${jsonObj}`;
      console.info(label);
      logToDebugger({
        label,
        type: 'log',
        logType: 'success',
      });
    } else {
      const label = `${DateUtil.nowWithKST()}, ${message}`;
      console.info(label);
      logToDebugger({
        label,
        type: 'log',
        logType: 'success',
      });
    }
  }

  static error(message: string, obj?) {
    if (obj) {
      const jsonObj =
        obj instanceof Map ? JSON.stringify(Object.fromEntries(obj), null, 2) : JSON.stringify(obj, null, 2);
      const label = `${DateUtil.nowWithKST()}, ${message}, ${jsonObj}`;
      console.error(label);
      logToDebugger({
        label,
        type: 'log',
        logType: 'error',
      });
    } else {
      const label = `${DateUtil.nowWithKST()}, ${message}`;
      console.error(label);
      logToDebugger({
        label,
        type: 'log',
        logType: 'error',
      });
    }
  }
}

export default LogUtil;
