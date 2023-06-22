import React from 'react';
import { Image, ScrollView, Text } from 'react-native';

import TagSearching from './TagSearching';
import Space from '../../../../components/utils/Space';
import { Center } from '../../../../components/layouts/Center';
import styled from 'styled-components';
import { t } from 'i18next';

const Icon = styled(Image)`
  width: 52px;
  height: 52px;
`;

const Description = styled(Text)`
  text-align: center;
  padding-top: 10px;
  padding-bottom: 5px;
  line-height: 18px;
  color: #999999;
`;
interface Props {
  data: any;
  searchValue: string;
  onPress: (data: any) => void;
}

const TagUsersResults = ({ data, searchValue = '', onPress }: Props) => {
  if (searchValue.length) {
    return <TagSearching key={data.id} searchValue={searchValue} data={data} onPress={onPress} />;
  }
  return <></>;
};

export default TagUsersResults;
