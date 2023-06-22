import React, { useContext, useEffect, useState } from 'react';
import DatePicker from 'react-native-date-picker';
import { RowContainer } from 'views/more/components/RowContainer';
import { Title } from 'views/more/components/Title';
import ButtonInput from 'views/more/components/ButtonInput';
import { format, parse } from 'date-fns';
import { patch } from '../../../net/rest/api';
import { t } from 'i18next';
import { ThemeContext } from 'styled-components/native';
import LogUtil from 'utils/LogUtil';
import Nullable from 'types/_common/Nullable';
import el from 'date-fns/esm/locale/el/index.js';
import moment from 'moment';
import User from 'types/auth/User';
import DateUtil from 'utils/DateUtil';
import { useAtomValue } from 'jotai';
import userAtom from 'stores/userAtom';

interface BirthdayProps {
  draft: User | undefined;
  update: (field: string, value: any) => void;
}

const Birthday = ({ draft, update }: BirthdayProps) => {
  const [open, setOpen] = useState(false);
  const { dark } = useContext(ThemeContext);
  const [currentDate, setCurrentDate] = useState<Nullable<Date>>();

  const me: User | null = useAtomValue(userAtom);
  const themeFont = me?.setting.ct_text_size as number;

  useEffect(() => {
    if (draft?.birth && draft?.birth !== null) {
      setCurrentDate(DateUtil.stringToDate(draft.birth!));
    }
  }, [draft]);

  return (
    <RowContainer fullWidth>
      <Title style={{ fontSize: themeFont - 2 }}>{t('profile-edit.Birth')}</Title>
      <ButtonInput
        placeholder="MM/DD/YYYY"
        value={(currentDate ? DateUtil.dateToString(currentDate, 'MM/DD/yyyy') : '') ?? ''}
        dark={dark}
        onPress={() => setOpen(true)}
      />
      <DatePicker
        modal
        mode="date"
        open={open}
        date={currentDate ?? new Date()}
        onConfirm={(_date: Date) => {
          setOpen(false);
          setCurrentDate(_date);
          update('birth', DateUtil.dateToString(_date));
        }}
        onCancel={() => {
          setOpen(false);
        }}
      />
    </RowContainer>
  );
};

export default Birthday;
