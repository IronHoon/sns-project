/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react/self-closing-comp */
import React, { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import tw from 'twrnc';
import Space from '../../components/utils/Space';
import BackHeader from '../../components/molecules/BackHeader';
import TitleHeader from 'components/molecules/TitleHeader';
import CloseHeader from 'components/molecules/CloseHeader';
import PrevHeader from 'components/molecules/PrevHeader';
import NavbarLayout from 'components/layouts/NavbarLayout';
import { COLOR } from 'constants/COLOR';
import Toast from 'react-native-toast-message';
import { ModalBase } from 'components/modal/ModalBase';
import { H1, H2, H3, H4, H5, H6 } from 'components/atoms/typography/Heading';
import { Button, ButtonTextVariant, ButtonVariant } from 'components/atoms/button/Button';
import { Checkbox } from 'components/atoms/input/Checkbox';
import { Radio } from 'components/atoms/input/Radio';
import { SwitchButton } from 'components/atoms/switch/SwitchButton';

// 공통 이전 임시 컴포넌트
import MButton from '../../components/atoms/MButton';
import MIconButton from 'components/atoms/MIconButton';

// 아이콘 버튼 이미지
import AddIconWhite from '../../assets/images/icon/ic-add-white22.svg';
import AddIcon from '../../assets/images/icon/ic-add-22.svg';
import CheckIcon from '../../assets/images/icon/check-black.svg';
import { Avatar } from 'components/atoms/image';

function Components() {
  const handleClick = () => console.log('click');
  const [modal, setModal] = useState(false);

  return (
    <NavbarLayout>
      <ScrollView>
        <BackHeader title="Components" />
        <Text style={tw`text-2xl font-bold`}>Components</Text>
        <Space height={32} />

        <View style={{ marginBottom: 32 }}>
          <H1>Heading</H1>
          <H2>Heading</H2>
          <H3>Heading</H3>
          <H4>Heading</H4>
          <H5>Heading</H5>
          <H6>Heading</H6>
        </View>

        <View style={{ marginBottom: 32 }}>
          <Avatar size={44} />
        </View>

        <View style={{ marginBottom: 32 }}>
          <H2>Button</H2>

          <Button label="Text" />
          <Space height={16} />
          <Button active label="Text" />
          <Space height={16} />
          <Button label="Text" inactive textvariant={ButtonTextVariant.InactiveText} />
          <Space height={16} />
          <Button label="Text" marginRight={10} marginLeft={10} borderRadius />
          <Space height={16} />
          <Button label="Text" variant={ButtonVariant.Gray} textvariant={ButtonTextVariant.GrayText} />
          <Space height={16} />
          <Button label="Text" variant={ButtonVariant.Gray} active textvariant={ButtonTextVariant.GrayText} />
          <Space height={16} />
          <Button label="Text" variant={ButtonVariant.Gray} inactive textvariant={ButtonTextVariant.InactiveText} />
          <Space height={16} />
          <Button label="Text" width={100} height={42} borderRadius fontSize={13} />
          <Space height={16} />
          <Button label="Text" width={100} height={32} borderRadiusRound fontSize={13} />
          <Space height={16} />
          <Button
            label="Text"
            // width={'50%'}
            height={42}
            borderRadius
            fontSize={13}
            fontWeight={400}
            variant={ButtonVariant.Outlined}
            textvariant={ButtonTextVariant.OutlinedText}
          />
          <Space height={16} />
          <Button
            label="Text"
            width={100}
            height={32}
            borderRadius
            fontSize={13}
            fontWeight={400}
            variant={ButtonVariant.Outlined}
            blacklined
            textvariant={ButtonTextVariant.OutlinedText}
            blacklinedText
          />
          <Space height={16} />
          <Button
            label="Tex4t"
            width={100}
            height={32}
            borderRadius
            fontSize={13}
            fontWeight={500}
            variant={ButtonVariant.TextBtn}
            textvariant={ButtonTextVariant.Text}
          />
          <Button
            label="Text"
            width={100}
            height={32}
            borderRadius
            fontSize={13}
            fontWeight={500}
            variant={ButtonVariant.TextBtn}
            textvariant={ButtonTextVariant.Text}
            redText
          />
          <Button
            label="Text"
            width={100}
            height={32}
            borderRadius
            fontSize={13}
            fontWeight={500}
            variant={ButtonVariant.TextBtn}
            textvariant={ButtonTextVariant.Text}
            grayText
          />
          <Button
            label="Text"
            width={100}
            height={32}
            borderRadius
            fontSize={13}
            fontWeight={500}
            variant={ButtonVariant.TextBtn}
            textvariant={ButtonTextVariant.Text}
            deepGrayText
          />
        </View>

        <View style={{ marginBottom: 32 }}>
          <H2>Icon Button</H2>
          <Button label="Text" height={60} fontSize={16} borderRadius marginRight={10} marginLeft={10}>
            <AddIconWhite width={22} height={22} />
          </Button>
          <Space height={16} />
          <Button
            label="Text"
            height={60}
            fontSize={16}
            borderRadius
            marginRight={10}
            marginLeft={10}
            variant={ButtonVariant.Outlined}
            blacklined
            textvariant={ButtonTextVariant.OutlinedText}
            blacklinedText
          >
            <AddIcon width={22} height={22} />
          </Button>
          <Space height={16} />
          <Button
            label="Text"
            height={60}
            borderRadiusRound
            fontSize={16}
            marginRight={10}
            marginLeft={10}
            variant={ButtonVariant.White}
            white
            textvariant={ButtonTextVariant.WhiteText}
          >
            <CheckIcon width={15} height={15} />
          </Button>
        </View>

        <View style={{ marginBottom: 32 }}>
          <H2>Checkbox</H2>
          <Checkbox checked={true} handleChecked={() => {}}></Checkbox>
          <Checkbox checked={false} handleChecked={() => {}}></Checkbox>
          <Checkbox round checked={true} handleChecked={() => {}}></Checkbox>
          <Checkbox round checked={false} handleChecked={() => {}}></Checkbox>
        </View>

        <View style={{ marginBottom: 32 }}>
          <H2>Radio</H2>
          <Radio checked={true} handleChecked={() => {}}></Radio>
          <Radio checked={false} handleChecked={() => {}}></Radio>
          <Radio small checked={true} handleChecked={() => {}}></Radio>
          <Radio small checked={false} handleChecked={() => {}}></Radio>
        </View>

        <View style={{ marginBottom: 32 }}>
          <H2>Switch</H2>
          <SwitchButton isEnabled={true} setIsEnabled={() => {}}></SwitchButton>
          <SwitchButton isEnabled={false} setIsEnabled={() => {}}></SwitchButton>
        </View>

        <View style={{ marginBottom: 32 }}>
          <H2>Select</H2>
        </View>

        <View style={{ marginBottom: 32 }}>
          <MButton
            style={{ width: '100%' }}
            onPress={() =>
              Toast.show({
                type: 'inApp',
                text1: 's ddddsddddsdddds',
                text2:
                  'messagemessaddddsddddsddddsgemessagemessaddddsddddsddddsgemmessagemessaddddsddddsddddsgemmessagemessaddddsddddsddddsgemm',
              })
            }
          >
            inApp Toast
          </MButton>
          <Space height={16} />
          <MButton
            style={{ width: '100%' }}
            onPress={() =>
              Toast.show({
                type: 'success',
                text1: 'This is an success message',
              })
            }
          >
            Success Toast
          </MButton>
          <Space height={16} />
          <MButton
            style={{ width: '100%' }}
            onPress={() =>
              Toast.show({
                type: 'error',
                text1: 'This is an error message',
              })
            }
          >
            Error Toast
          </MButton>
          <Space height={16} />
          <MButton
            style={{ width: '100%' }}
            onPress={() =>
              Toast.show({
                type: 'info',
                text1: 'This is an info message',
              })
            }
          >
            Info Toast
          </MButton>
          <Space height={16} />
          <MButton style={{ width: '100%' }} onPress={() => setModal(true)}>
            Base Modal
          </MButton>
          <ModalBase
            isVisible={modal}
            onBackdropPress={() => setModal(false)}
            title={'Infomation'}
            subDesc={'Required items must be agreed to use the service'}
          >
            <MButton
              style={{ width: 100, height: 42, borderRadius: 5 }}
              onPress={() => setModal(false)}
              labelStyle={{ fontSize: 14 }}
            >
              Confirm
            </MButton>
          </ModalBase>
        </View>

        <View style={{ backgroundColor: COLOR.LIGHT_GRAY, height: 10 }} />
        <Text style={tw`text-2xl font-bold`}>Headers</Text>
        <Space height={32} />
        <View style={{ backgroundColor: COLOR.LIGHT_GRAY, height: 10 }} />
        <BackHeader />
        <View style={{ backgroundColor: COLOR.LIGHT_GRAY, height: 10 }} />
        <BackHeader title="Headers" />
        <View style={{ backgroundColor: COLOR.LIGHT_GRAY, height: 10 }} />
        <BackHeader
          title="Headers"
          button={[<MIconButton key={0} onClick={handleClick} source={require('../../assets/ic-set.png')} />]}
        />
        <View style={{ backgroundColor: COLOR.LIGHT_GRAY, height: 10 }} />
        <TitleHeader
          title="Headers"
          button={[<MIconButton key={0} onClick={handleClick} source={require('../../assets/ic-set.png')} />]}
        />
        <View style={{ backgroundColor: COLOR.LIGHT_GRAY, height: 10 }} />
        <TitleHeader title="Headers" justify="flex-start" />
        <View style={{ backgroundColor: COLOR.LIGHT_GRAY, height: 10 }} />
        <TitleHeader
          title="Headers"
          justify="flex-start"
          button={[<MIconButton key={0} onClick={handleClick} source={require('../../assets/ic-set.png')} />]}
        />
        <View style={{ backgroundColor: COLOR.LIGHT_GRAY, height: 10 }} />
        <CloseHeader />
        <View style={{ backgroundColor: COLOR.LIGHT_GRAY, height: 10 }} />
        <CloseHeader title="Headers" />
        <View style={{ backgroundColor: COLOR.LIGHT_GRAY, height: 10 }} />
        <CloseHeader
          position="left"
          button={[<MIconButton key={0} onClick={handleClick} source={require('../../assets/ic-set.png')} />]}
        />
        <View style={{ backgroundColor: COLOR.LIGHT_GRAY, height: 10 }} />
        <CloseHeader position="left" />
        <View style={{ backgroundColor: COLOR.LIGHT_GRAY, height: 10 }} />
        <PrevHeader />
        <View style={{ backgroundColor: COLOR.LIGHT_GRAY, height: 10 }} />
        <PrevHeader
          title={
            <View>
              <Text style={{ fontWeight: 'bold' }}>Hedaers</Text>
              <Text>sub text</Text>
            </View>
          }
        />
        <View style={{ backgroundColor: COLOR.LIGHT_GRAY, height: 10 }} />
        <PrevHeader
          title={
            <View>
              <Text style={{ fontWeight: 'bold' }}>Hedaers</Text>
              <Text>sub text</Text>
            </View>
          }
          button={[<MIconButton key={0} onClick={handleClick} source={require('../../assets/ic-set.png')} />]}
        />
        <View style={{ backgroundColor: COLOR.LIGHT_GRAY, height: 10 }} />
      </ScrollView>
    </NavbarLayout>
  );
}

export default Components;
