import React from 'react';
import { Text } from 'react-native';
import styled from 'styled-components';

import { COLOR } from 'constants/COLOR';
import { Column } from 'components/layouts/Column';

const Conatainer = styled(Column)`
  margin-left: 15px;
`;

const Name = styled(Text)`
  color: ${({ theme }) => (theme.dark ? COLOR.WHITE : COLOR.BLACK)};
  font-size: 15px;
  font-weight: 500;
`;
const Time = styled(Text)`
  color: ${COLOR.DARK_GRAY};
  font-size: 11px;
`;

function getMonth(m: any) {
  let month = '';

  if (m < 10) {
    month = `0${m}`;
  } else {
    month = `${m}`;
  }

  switch (month) {
    case '01':
      return `Jan`;
    case '02':
      return `Feb`;
    case '03':
      return `Mar`;
    case '04':
      return `Apr`;
    case '05':
      return `May`;
    case '06':
      return `Jun`;
    case '07':
      return `Jul`;
    case '08':
      return `Aug`;
    case '09':
      return `Sep`;
    case '10':
      return `Oct`;
    case '11':
      return `Nov`;
    case '12':
      return `Dec`;
    default:
      return '';
  }
}

const getTime = (createdAt) => {
  const date = new Date(createdAt);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hours = date.getHours();
  const minutes = date.getMinutes();

  return `${getMonth(month)} ${day < 10 ? `0${day}` : `${day}`}, ${year} at ${hours < 10 ? `0${hours}` : `${hours}`}:${
    minutes < 10 ? `0${minutes}` : `${minutes}`
  } ${hours < 13 ? 'AM' : 'PM'}`;
};

const SenderInfo = ({ date, name }) => {
  const createAt = getTime(date);

  return (
    <Conatainer>
      <Name numberOfLines={1}>{name}</Name>
      <Time>{createAt}</Time>
    </Conatainer>
  );
};

export default SenderInfo;
