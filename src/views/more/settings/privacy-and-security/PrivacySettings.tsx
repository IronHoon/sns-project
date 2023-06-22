import React, { useCallback, useContext, useState } from 'react';
import BackHeader from '../../../../components/molecules/BackHeader';
import MainLayout from 'components/layouts/MainLayout';
import styled, { ThemeContext } from 'styled-components/native';
import { Radio } from 'components/atoms/input/Radio';
import { Pressable, View } from 'react-native';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { Row } from 'components/layouts/Row';
import { Button, ButtonTextVariant, ButtonVariant } from 'components/atoms/button/Button';
import { Column } from 'components/layouts/Column';
import { MainNavigationProp } from 'navigations/MainNavigator';
import { useFetchWithType } from '../../../../net/useFetch';
import User from '../../../../types/auth/User';
import { patch } from '../../../../net/rest/api';
import SwrContainer from '../../../../components/containers/SwrContainer';
import i18next, { t } from 'i18next';
import i18n from 'i18next';
import LogUtil from '../../../../utils/LogUtil';
import userAtom from '../../../../stores/userAtom';
import { useAtom } from 'jotai';

const RadioContainer = styled.View`
  flex-direction: row;
  padding: 15px;
  padding-right: 20px;
  align-items: center;
  border-bottom-width: 1px;
  border-bottom-color: #e3e3e3;
`;
const RadioLabel = styled.Text`
  flex: 1;
  font-size: 14px;
  color: ${(props) => (props.theme.dark ? '#ffffff' : '#000000')};
`;
const Except = styled.Text`
  flex: 1;
  font-size: 13px;
  padding-bottom: 5px;
  /* line-height: 18px; */
  color: #999999;
`;
const Description = styled.Text`
  width: 90%;
  font-size: 13px;
  padding-bottom: 5px;
  /* line-height: 18px; */
  color: #999999;
`;

function PrivacySettings() {
  const [selected, setSelected] = useState<'everybody' | 'followers' | 'nobody'>('followers');
  const lan = i18next.language;
  const themeContext = useContext(ThemeContext);
  const navigation = useNavigation<MainNavigationProp>();
  const { params } = useRoute();
  //@ts-ignore
  const routeName = params?.route ?? 'post';
  //@ts-ignore
  const privateEnabled = params.private;
  const [user, setUser] = useAtom(userAtom);
  const { data: meData, error: meError, mutate: mutateMe } = useFetchWithType<User>('/auth/me');
  const update = useCallback(
    async (field: string, value: any) => {
      console.log({
        ...meData?.setting,
        [field]: value,
      });
      let myUserSetting = {
        ...user,
        ['setting']: {
          ...user?.setting,
          [field]: value,
        },
      };
      //@ts-ignore
      setUser(myUserSetting);
      LogUtil.info(JSON.stringify(user?.setting));
      await patch('/auth/user-setting', {
        ...meData?.setting,
        [field]: value,
      });
      await mutateMe();
    },
    [meData],
  );

  const title = routeName.charAt(0).toUpperCase() + routeName.slice(1);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        await mutateMe();
      })();
    }, [mutateMe]),
  );

  return (
    <MainLayout>
      <BackHeader
        title={
          title === 'Post'
            ? t('privacy.Post')
            : title === 'Live'
            ? t('privacy.Live')
            : title === 'Tag'
            ? t('privacy.Tag')
            : ''
        }
      />
      <SwrContainer data={meData} error={meError}>
        <>
          {!privateEnabled && (
            <Pressable
              onTouchStart={() => {
                if (routeName === 'post') {
                  update('sc_sns_post', 'public');
                } else if (routeName === 'live') {
                  update('sc_sns_live', 'public');
                } else if (routeName === 'tag') {
                  update('sc_sns_tag', 'public');
                }
              }}
            >
              <RadioContainer>
                <RadioLabel style={{ fontSize: user?.setting?.ct_text_size as number }}>
                  {t('privacy.Everybody')}
                </RadioLabel>
                <Radio
                  checked={
                    routeName === 'post'
                      ? user?.setting?.sc_sns_post === 'public'
                      : routeName === 'live'
                      ? user?.setting?.sc_sns_live === 'public'
                      : routeName === 'tag'
                      ? user?.setting?.sc_sns_tag === 'public'
                      : false
                  }
                  handleChecked={() => {
                    if (routeName === 'post') {
                      update('sc_sns_post', 'public');
                    } else if (routeName === 'live') {
                      update('sc_sns_live', 'public');
                    } else if (routeName === 'tag') {
                      update('sc_sns_tag', 'public');
                    }
                  }}
                />
              </RadioContainer>
            </Pressable>
          )}
          {!privateEnabled ? (
            <>
              <Pressable
                onTouchStart={() => {
                  if (routeName === 'post') {
                    update('sc_sns_post', 'friends');
                  } else if (routeName === 'live') {
                    update('sc_sns_live', 'friends');
                  } else if (routeName === 'tag') {
                    update('sc_sns_tag', 'friends');
                  }
                }}
              >
                <RadioContainer>
                  <Column style={{ flex: 1 }}>
                    <Row>
                      <RadioLabel style={{ fontSize: user?.setting?.ct_text_size as number }}>
                        {t('common.Following')}
                      </RadioLabel>
                      <Radio
                        checked={
                          routeName === 'post'
                            ? user?.setting?.sc_sns_post === 'friends'
                            : routeName === 'live'
                            ? user?.setting?.sc_sns_live === 'friends'
                            : routeName === 'tag'
                            ? user?.setting?.sc_sns_tag === 'friends'
                            : false
                        }
                        handleChecked={() => {
                          if (routeName === 'post') {
                            update('sc_sns_post', 'friends');
                          } else if (routeName === 'live') {
                            update('sc_sns_live', 'friends');
                          } else if (routeName === 'tag') {
                            update('sc_sns_tag', 'friends');
                          }
                        }}
                      />
                    </Row>
                    <Row style={{ alignItems: 'center', paddingTop: 15 }}>
                      <Except style={{ fontSize: user?.setting?.ct_text_size as number }}>
                        {t('privacy.Except from')}
                      </Except>
                      <Button
                        label={t('privacy.Manage')}
                        width={lan === 'lo' ? 100 : 75}
                        height={35}
                        borderRadius
                        fontSize={13}
                        fontWeight={400}
                        variant={ButtonVariant.Outlined}
                        textvariant={ButtonTextVariant.OutlinedText}
                        blacklined={!themeContext.dark}
                        whitelined={themeContext.dark}
                        blacklinedText={!themeContext.dark}
                        whitelinedText={themeContext.dark}
                        onPress={() => {
                          navigation.navigate('/more/settings/privacy-and-security/kokkokme/privacy-settings/except', {
                            route: routeName,
                            private: privateEnabled,
                          });
                        }}
                      />
                    </Row>
                  </Column>
                </RadioContainer>
              </Pressable>
              <Pressable
                onTouchStart={() => {
                  if (routeName === 'post') {
                    update('sc_sns_post', 'private');
                  } else if (routeName === 'live') {
                    update('sc_sns_live', 'private');
                  } else if (routeName === 'tag') {
                    update('sc_sns_tag', 'private');
                  }
                }}
              >
                <RadioContainer>
                  <RadioLabel style={{ fontSize: user?.setting?.ct_text_size as number }}>
                    {t('privacy.Nobody')}
                  </RadioLabel>
                  <Radio
                    checked={
                      routeName === 'post'
                        ? user?.setting?.sc_sns_post === 'private'
                        : routeName === 'live'
                        ? user?.setting?.sc_sns_live === 'private'
                        : routeName === 'tag'
                        ? user?.setting?.sc_sns_tag === 'private'
                        : false
                    }
                    handleChecked={() => {
                      if (routeName === 'post') {
                        update('sc_sns_post', 'private');
                      } else if (routeName === 'live') {
                        update('sc_sns_live', 'private');
                      } else if (routeName === 'tag') {
                        update('sc_sns_tag', 'private');
                      }
                    }}
                  />
                </RadioContainer>
              </Pressable>
              <View style={{ alignItems: 'center', paddingTop: 20 }}>
                <Description style={{ fontSize: user?.setting?.ct_text_size as number }}>
                  {routeName === 'post' && t('privacy.You can manage users who can see your posts on Kok Kok Me')}
                  {routeName === 'live' && t('privacy.You can manage users who can watch your live on Kok Kok Me')}
                  {routeName === 'tag' && t('privacy.You can manage users who can tag you on their post and live')}
                </Description>
              </View>
            </>
          ) : (
            <>
              <RadioContainer>
                <Column style={{ flex: 1 }}>
                  <Row>
                    <RadioLabel style={{ fontSize: user?.setting?.ct_text_size as number }}>
                      {t('common.Followers')}
                    </RadioLabel>
                    <Radio
                      checked={
                        routeName === 'post'
                          ? user?.setting?.sc_sns_post === 'friends'
                          : routeName === 'live'
                          ? user?.setting?.sc_sns_live === 'friends'
                          : routeName === 'tag'
                          ? user?.setting?.sc_sns_tag === 'friends'
                          : false
                      }
                      handleChecked={() => {
                        if (routeName === 'post') {
                          update('sc_sns_post', 'friends');
                        } else if (routeName === 'live') {
                          update('sc_sns_live', 'friends');
                        } else if (routeName === 'tag') {
                          update('sc_sns_tag', 'friends');
                        }
                      }}
                    />
                  </Row>
                  <Row style={{ alignItems: 'center', paddingTop: 15 }}>
                    <Except>{t('privacy.Except from')}</Except>
                    <Button
                      label={t('privacy.Manage')}
                      width={lan === 'lo' ? 100 : 75}
                      height={35}
                      borderRadius
                      fontSize={13}
                      fontWeight={400}
                      variant={ButtonVariant.Outlined}
                      textvariant={ButtonTextVariant.OutlinedText}
                      blacklined={!themeContext.dark}
                      whitelined={themeContext.dark}
                      blacklinedText={!themeContext.dark}
                      whitelinedText={themeContext.dark}
                      onPress={() => {
                        navigation.navigate('/more/settings/privacy-and-security/kokkokme/privacy-settings/except', {
                          route: routeName,
                          private: privateEnabled,
                        });
                      }}
                    />
                  </Row>
                </Column>
              </RadioContainer>
              <RadioContainer>
                <RadioLabel style={{ fontSize: user?.setting?.ct_text_size as number }}>
                  {t('privacy.Nobody')}
                </RadioLabel>
                <Radio
                  checked={
                    routeName === 'post'
                      ? user?.setting?.sc_sns_post === 'private'
                      : routeName === 'live'
                      ? user?.setting?.sc_sns_live === 'private'
                      : routeName === 'tag'
                      ? user?.setting?.sc_sns_tag === 'private'
                      : false
                  }
                  handleChecked={() => {
                    if (routeName === 'post') {
                      update('sc_sns_post', 'private');
                    } else if (routeName === 'live') {
                      update('sc_sns_live', 'private');
                    } else if (routeName === 'tag') {
                      update('sc_sns_tag', 'private');
                    }
                  }}
                />
              </RadioContainer>
              <View style={{ alignItems: 'center', paddingTop: 20 }}>
                <Description style={{ fontSize: user?.setting?.ct_text_size as number }}>
                  {routeName === 'post' && t('privacy.You can manage users who can see your posts on Kok Kok Me')}
                  {routeName === 'live' && t('privacy.You can manage users who can watch your live on Kok Kok Me')}
                  {routeName === 'tag' && t('privacy.You can manage users who can tag you on their post and live')}
                </Description>
              </View>
            </>
          )}
        </>
      </SwrContainer>
    </MainLayout>
  );
}

export default PrivacySettings;
