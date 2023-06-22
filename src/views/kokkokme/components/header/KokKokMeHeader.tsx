import { useAtomValue } from 'jotai';
import React, { useCallback, useContext, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import styled from 'styled-components';

import { Row } from 'components/layouts/Row';
import SwrContainer from 'components/containers/SwrContainer';
import { useFetchWithType } from 'net/useFetch';
import { IActivities, IActivityDocs } from 'types/socials';
import Buttons from 'views/kokkokme/components/header/Buttons';
import UserInfo from 'views/kokkokme/components/header/UserInfo';
import userAtom from '../../../../stores/userAtom';
import { ThemeContext } from 'styled-components/native';

const Container = styled(Row)`
  height: 72px;
`;

interface Props {
  pressNoti: () => void;
  pressSearch: () => void;
  pressPost: () => void;
  data: any;
  error: any;
  haveNewNoti: boolean;
}

const KokKokMeHeader = ({ data, error, haveNewNoti, pressNoti, pressSearch, pressPost }: Props) => {
  const user = useAtomValue(userAtom);

  return (
    <Container align="center" fullWidth justify="space-between">
      <UserInfo user={user!} />
      <SwrContainer data={data} error={error}>
        <Buttons haveNewNoti={haveNewNoti} pressNoti={pressNoti} pressSearch={pressSearch} pressPost={pressPost} />
      </SwrContainer>
    </Container>
  );
};

export default KokKokMeHeader;
