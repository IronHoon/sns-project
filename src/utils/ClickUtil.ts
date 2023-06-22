import DateUtil from './DateUtil';

class ClickUtil {
  static _lastClickDateTime: Date | null = null;

  //중복 없이 클릭
  static clickSafely(work: Function, milliSecondsForPreventingMultipleClicks: number = 1000) {
    const now = new Date();

    if (this._lastClickDateTime) {
      if (Math.abs(DateUtil.subtract(now, this._lastClickDateTime)) < milliSecondsForPreventingMultipleClicks) {
        return;
      }
    }

    this._lastClickDateTime = now;
    work();
  }
}

export default ClickUtil;
