import React, { useCallback } from 'react';
import BackHeader from '../../../../components/molecules/BackHeader';
import MainLayout from 'components/layouts/MainLayout';
import styled from 'styled-components/native';
import { Radio } from 'components/atoms/input/Radio';
import { Column } from 'components/layouts/Column';
import { Row } from 'components/layouts/Row';
import System from 'assets/theme/system.svg';
import Light from 'assets/theme/light.svg';
import Dark from 'assets/theme/dark.svg';
import { patch } from 'net/rest/api';
import themeAtom from 'stores/themeAtom';
import { Appearance } from 'react-native';
import userAtom from 'stores/userAtom';
import { useAtom } from 'jotai';
import { useSetAtom } from 'jotai';
import { t } from 'i18next';

const RadioContainer = styled.TouchableOpacity`
  flex-direction: row;
  padding: 15px;
  padding-right: 20px;
  min-height: 98px;
  align-items: center;
  border-bottom-width: 1px;
  border-bottom-color: #e3e3e3;
`;
const RadioLabel = styled.Text`
  font-size: 14px;
  margin-left: 15px;
  color: ${(props) => (props.theme.dark ? '#ffffff' : '#000000')};
`;
const Description = styled.Text`
  font-size: 13px;
  margin-top: 5px;
  margin-left: 15px;
  color: #999999;
`;
function ChatTheme() {
  const [myUser, setMyUser] = useAtom(userAtom);
  const setTheme = useSetAtom(themeAtom);

  const currentTheme = myUser?.setting?.ct_chat_theme;

  const update = useCallback(
    async (value: string) => {
      await patch('/auth/user-setting', {
        ...myUser?.setting,
        ['ct_chat_theme']: value,
      }).then(() => {
        let myUserSetting = {
          ...myUser,
          setting: {
            ...myUser?.setting,
            ['ct_chat_theme']: value,
          },
        };
        // @ts-ignore;
        setMyUser(myUserSetting);

        if (value === 'system') {
          const colorScheme = Appearance.getColorScheme();
          setTheme(colorScheme);
        } else {
          // @ts-ignore
          setTheme(value);
        }
      });
    },
    [myUser],
  );

  if (myUser?.setting?.ct_chat_theme === '0') {
    update('light');
  }

  return (
    <MainLayout>
      <BackHeader title={t('theme.Theme')} />
      <RadioContainer onPress={() => update('system')}>
        <Row style={{ flex: 1, alignItems: 'center' }}>
          <System height={56} width={36} />
          <Column>
            <RadioLabel style={{ fontSize: myUser?.setting?.ct_text_size as number }}>
              {t('theme.System Mode')}
            </RadioLabel>
            <Description style={{ fontSize: myUser?.setting?.ct_text_size as number }}>
              {t('theme.Automatically apply the display mode(Dark/Light) based on system settings')}
            </Description>
          </Column>
        </Row>
        <Radio checked={currentTheme === 'system'} handleChecked={() => update('system')} />
      </RadioContainer>
      <RadioContainer onPress={() => update('light')}>
        <Row style={{ flex: 1, alignItems: 'center' }}>
          <Light height={56} width={36} />
          <RadioLabel style={{ fontSize: myUser?.setting?.ct_text_size as number }}>{t('theme.Light Mode')}</RadioLabel>
        </Row>
        <Radio checked={currentTheme === 'light'} handleChecked={() => update('light')} />
      </RadioContainer>
      <RadioContainer onPress={() => update('dark')}>
        <Row style={{ flex: 1, alignItems: 'center' }}>
          <Dark height={56} width={36} />
          <RadioLabel style={{ fontSize: myUser?.setting?.ct_text_size as number }}>{t('theme.Dark Mode')}</RadioLabel>
        </Row>
        <Radio checked={currentTheme === 'dark'} handleChecked={() => update('dark')} />
      </RadioContainer>
    </MainLayout>
  );
}

export default ChatTheme;
