import i18next from '../../i18n';

export const COMMENT = [
  {
    value: 'hide-comment',
    label: i18next.t('kokkokme-main.Hide this comment'),
  },
  {
    value: 'hide-all-activities',
    label: i18next.t('kokkokme-main.Hide all activities'),
    desc: 'User’s all activities will be hidden on Timeline',
  },
  {
    value: 'report',
    label: i18next.t('kokkokme-main.Report'),
  },
  {
    value: 'cancel',
    label: i18next.t('kokkokme-main.Cancel'),
  },
];

export const REPORT = {
  title: i18next.t('kokkokme-main.Please select a reason for reporting'),

  menu: [
    {
      value: 'spam',
      label: i18next.t('kokkokme-main.Spam'),
    },
    {
      value: 'nude-images',
      label: i18next.t('kokkokme-main.Nude images or sexual acts'),
    },
    {
      value: 'do-not-like',
      label: i18next.t("kokkokme-main.I don't like it"),
    },
    {
      value: 'fraudulent',
      label: i18next.t('kokkokme-main.Fraudulent or false'),
    },
    {
      value: 'hate-speech',
      label: i18next.t('kokkokme-main.Hate speech or symbol'),
    },
    {
      value: 'false-information',
      label: i18next.t('kokkokme-main.False information'),
    },
    {
      value: 'Cancel',
      label: i18next.t('kokkokme-main.Cancel'),
    },
  ],
};

export const MY_POST = [
  {
    value: 'Edit',
    label: i18next.t('kokkokme-main.Edit'),
  },
  {
    value: 'Delete',
    label: i18next.t('kokkokme-main.Delete'),
  },
  {
    value: 'Copy link',
    label: i18next.t('kokkokme-main.Copy link'),
  },
  {
    value: 'Share',
    label: i18next.t('kokkokme-main.Share'),
  },
  {
    value: 'Cancel',
    label: i18next.t('kokkokme-main.Cancel'),
  },
];

export const OTHERS_POST = [
  {
    value: 'Copy link',
    label: i18next.t('kokkokme-main.Copy link'),
  },
  {
    value: 'Share',
    label: i18next.t('kokkokme-main.Share'),
  },
  // {
  //   value: 'Share to post',
  //   label: i18next.t('kokkokme-main.Share to post'),
  // },
  {
    value: 'unfollow',
    label: i18next.t('kokkokme-main.Unfollow this user'),
  },
  {
    value: 'hide',
    label: i18next.t('kokkokme-main.Hide this post'),
  },
  {
    value: 'Report',
    label: i18next.t('kokkokme-main.Report'),
  },
  {
    value: 'Cancel',
    label: i18next.t('kokkokme-main.Cancel'),
  },
];

export const OTHERS_POST_NOFOLLOW = [
  {
    value: 'Copy link',
    label: i18next.t('kokkokme-main.Copy link'),
  },
  {
    value: 'Share',
    label: i18next.t('kokkokme-main.Share'),
  },
  // {
  //   value: 'Share to post',
  //   label: i18next.t('kokkokme-main.Share to post'),
  // },
  {
    value: 'hide',
    label: i18next.t('kokkokme-main.Hide this post'),
  },
  {
    value: 'Report',
    label: i18next.t('kokkokme-main.Report'),
  },
  {
    value: 'Cancel',
    label: i18next.t('kokkokme-main.Cancel'),
  },
];
export const SEARCH = [
  {
    value: 'accounts',
    label: i18next.t('kokkokme-main.Accounts'),
  },
  {
    value: 'posts',
    label: i18next.t('kokkokme-main.Posts'),
  },
  // {
  //   value: 'live',
  //   label: 'Live',
  // },
];

export const FOLLOW = [
  {
    value: 'followers',
    label: i18next.t('common.Followers'),
  },
  {
    value: 'following',
    label: i18next.t('common.Following'),
  },
];

export const LISTINGS = [
  {
    value: 'On sale',
    label: i18next.t('market.On sale'),
  },
  {
    value: 'Sold',
    label: i18next.t('market.Sold'),
  },
  {
    value: 'Hidden',
    label: i18next.t('market.Hidden'),
  },
];

export const EDIT_HIDE_DEL = [
  {
    value: 'Edit',
    label: i18next.t('market.Edit'),
  },
  {
    value: 'Hide',
    label: i18next.t('market.Hide'),
  },
  {
    value: 'Delete',
    label: i18next.t('market.Delete'),
  },
];
