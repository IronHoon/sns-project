import React, { useCallback, useEffect, useRef, useState } from 'react';
import styled from 'styled-components/native';
import MainLayout from 'components/layouts/MainLayout';
import BackHeader from 'components/molecules/BackHeader';
import { Row } from '../../../../components/layouts/Row';
import { COLOR } from '../../../../constants/COLOR';
import { Radio } from '../../../../components/atoms/input/Radio';
import { FlatList, Pressable, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { t } from 'i18next';
import { useAtom, useAtomValue } from 'jotai';
import User from 'types/auth/User';
import { useNavigation } from '@react-navigation/native';
import langAtom from 'stores/langAtom';
import LogUtil from 'utils/LogUtil';
import i18n from '../../../../../i18n';
import useComponentWillUnmountRef from 'hooks/useComponentWillUnmountRef';
import userAtom from 'stores/userAtom';

type LanguageType = {
  label: string;
  key: string;
};

const LanguageRow = styled(Row)`
  width: 100%;
  padding: 20px;
  /* height: 60px; */
  border-color: ${COLOR.GRAY};
  border-bottom-width: 1px;
  align-items: center;
`;

const Label = styled.Text`
  font-size: 14px;
  color: ${({ theme }) => (theme.dark ? COLOR.WHITE : COLOR.BLACK)};
`;

const DoneButton = ({ active, onClick }) => {
  return (
    <Pressable onPress={() => onClick()}>
      <Text style={{ fontSize: 14, color: active ? COLOR.PRIMARY : '#dddddd' }}>{t('theme.Done')}</Text>
    </Pressable>
  );
};

const Language = () => {
  const languageOptions: LanguageType[] = [
    { label: 'ພາສາລາວ', key: 'lo' },
    { label: 'English', key: 'en' },
  ];

  const navigation = useNavigation();
  const componentWillUnmountRef = useComponentWillUnmountRef();
  const [originLanguage, setOriginLanguage] = useState<string>(i18n.language);
  const [selectedLanguage, setSelectedLanguage] = useState<string>(i18n.language);
  const myUser: User | null = useAtomValue(userAtom);

  const handleDone = (field: string, value: any) => {
    i18n.changeLanguage(value);
    setOriginLanguage(value);
    setSelectedLanguage(value);
  };
  const handleSelect = async (lang: string) => {
    i18n.changeLanguage(lang);
    setSelectedLanguage(lang);
  };

  useEffect(() => {
    return () => {
      if (componentWillUnmountRef.current) {
        if (originLanguage !== selectedLanguage) {
          handleSelect(originLanguage);
        }
      }
    };
  }, [componentWillUnmountRef.current, originLanguage, selectedLanguage]);

  if (!(originLanguage && selectedLanguage)) {
    return <></>;
  }

  return (
    <MainLayout>
      <BackHeader
        title={t('language.Language')}
        onClick={() => navigation.goBack()}
        button={[
          <DoneButton
            key={0}
            active={originLanguage !== selectedLanguage}
            onClick={() => handleDone('language', selectedLanguage)}
          />,
        ]}
      />
      <FlatList
        data={languageOptions}
        renderItem={({ item }) => (
          <LanguageRow key={item.key} justify="space-between">
            <Label style={{ fontSize: myUser?.setting?.ct_text_size as number }}>{item.label}</Label>
            <Radio checked={item.key === selectedLanguage} handleChecked={() => handleSelect(item.key)} />
          </LanguageRow>
        )}
      />
    </MainLayout>
  );
};

export default Language;
