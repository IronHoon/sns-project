import React, { useContext } from 'react';
import { Image, TouchableOpacity } from 'react-native';
import styled, { ThemeContext } from 'styled-components';

import { Row } from 'components/layouts/Row';

import NotificationOff from 'assets/kokkokme/ic-notification-off.svg';
import NotificationOffWhite from 'assets/kokkokme/ic-notification-off-white.svg';
import NotificationOn from 'assets/kokkokme/ic-notification-on.svg';
import NotificationOnWhite from 'assets/kokkokme/ic-notification-on-white.svg';
import Search from 'assets/kokkokme/ic-search.svg';
import SearchWhite from 'assets/kokkokme/ic-search-white.svg';
import Upload from 'assets/kokkokme/ic-write.svg';
import UploadWhite from 'assets/kokkokme/ic-write-white.svg';
import { COLOR } from '../../../../constants/COLOR';

interface Props {
  haveNewNoti: boolean;
  pressNoti: () => void;
  pressSearch: () => void;
  pressPost: () => void;
}

const Container = styled(Row)``;
const IcContainer = styled(TouchableOpacity)<{ noMargin?: boolean }>`
  height: 22px;
  margin-right: ${({ noMargin }) => (!noMargin ? 15 : 0)}px;
  width: 22px;
`;

const SearchIc = styled(Search)`
  fill: ${({ theme }) => (theme.dark ? COLOR.WHITE : COLOR.BLACK)};
`;
const UploadIc = styled(Upload)`
  fill: ${({ theme }) => (theme.dark ? COLOR.WHITE : COLOR.BLACK)};
`;
const NotificationOnIc = styled(NotificationOn)`
  fill: ${({ theme }) => (theme.dark ? COLOR.WHITE : COLOR.BLACK)};
`;
const NotificationOffIc = styled(NotificationOff)`
  fill: ${({ theme }) => (theme.dark ? COLOR.WHITE : COLOR.BLACK)};
`;
const Buttons = ({ haveNewNoti, pressNoti, pressSearch, pressPost }: Props) => {
  const theme = useContext(ThemeContext);
  return (
    <Container>
      <IcContainer onPress={pressSearch}>
        <>{theme.dark ? <SearchWhite /> : <Search />}</>
      </IcContainer>
      <IcContainer onPress={pressPost}>{theme.dark ? <UploadWhite /> : <Upload />}</IcContainer>
      <IcContainer noMargin onPress={pressNoti}>
        {haveNewNoti ? (
          theme.dark ? (
            <NotificationOnWhite />
          ) : (
            <NotificationOn />
          )
        ) : theme.dark ? (
          <NotificationOffWhite />
        ) : (
          <NotificationOff />
        )}
      </IcContainer>
    </Container>
  );
};

export default Buttons;
