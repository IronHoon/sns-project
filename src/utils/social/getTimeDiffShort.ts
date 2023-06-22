import DateOrString from 'types/_common/DateOrString';

export const getTimeDiffShort = (date: DateOrString) => {
  const newDate = new Date(date);
  const now = Date.now();
  const diff = (now - newDate.getTime()) / 1000;

  if (diff < 60) return 'now';
  else if (diff >= 60 && diff < 3600) return `${Math.floor(diff / 60)}min`;
  else if (diff >= 3600 && diff < 86400) return `${Math.floor(diff / 3600)}h`;
  else if (diff >= 86400 && diff < 604800) return `${Math.floor(diff / 86400)}d`;
  else return `${Math.floor(diff / 604800)}w`;
};
