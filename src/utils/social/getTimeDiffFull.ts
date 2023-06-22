import DateOrString from 'types/_common/DateOrString';

export const getTimeDiffFull = (date: DateOrString) => {
  const newDate = new Date(date);
  const now = Date.now();
  const diff = (now - newDate.getTime()) / 1000;

  if (diff < 60) return 'now';
  else if (diff >= 60 && diff < 3600) {
    return `${Math.floor(diff / 60)}${Math.floor(diff / 60) > 1 ? 'minutes' : 'minute'}`;
  } else if (diff >= 3600 && diff < 86400) {
    return `${Math.floor(diff / 3600)}${Math.floor(diff / 3600) > 1 ? 'hours' : 'hour'}`;
  } else if (diff >= 86400 && diff < 604800) {
    return `${Math.floor(diff / 86400)}${Math.floor(diff / 86400) > 1 ? 'days' : 'day'}`;
  } else {
    return `${Math.floor(diff / 604800)}${Math.floor(diff / 604800) > 1 ? 'weeks' : 'week'}`;
  }
};
