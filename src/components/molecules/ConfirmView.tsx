import React from 'react';
import { View } from 'react-native';
import tw from 'twrnc';
import styled from 'styled-components/native';
import { Row } from '../layouts/Row';
import { COLOR } from '../../constants/COLOR';
import Space from '../utils/Space';
import { useAtomValue } from 'jotai';
import confirmAtom from '../../stores/confirmAtom';

export default function ConfirmView({ width = 350, radius = false, padding = true }) {
  const confirm = useAtomValue(confirmAtom);
  return (
    <View
      style={[tw`absolute w-full h-full justify-center items-center`, { display: confirm.visible ? 'flex' : 'none' }]}
    >
      <View style={tw`absolute w-full h-full bg-black opacity-70`} />
      <StyledModalContainer width={width} radius={radius} isPadding={padding}>
        {!!confirm.title && <Title>{confirm.title}</Title>}
        <Space height={10} />
        {!!confirm.description && <Description>{confirm.description}</Description>}
        <Space height={10} />

        <Row style={{ paddingTop: 15 }}>
          <CancelButton onPress={confirm.cancel}>
            <CancelLabel>Cancel</CancelLabel>
          </CancelButton>
          <View style={{ padding: 10 }} />
          <ConfirmButton onPress={confirm.ok}>
            <ModalLabel>Delete</ModalLabel>
          </ConfirmButton>
        </Row>
      </StyledModalContainer>
    </View>
  );
}

const StyledModalContainer = styled.View<{ width: number; radius: boolean; isPadding: boolean }>`
  flex-direction: column;
  align-items: center;
  width: ${({ width }) => `${width}px`};
  border-radius: ${({ radius }) => (radius ? '11px' : '0px')};
  padding: ${({ isPadding }) => (isPadding ? '35px 15px' : '0px 15px')};
  background-color: #fff;
`;

const Title = styled.Text`
  text-align: center;
  margin-bottom: 10px;
  font-weight: 500;
  font-size: 15px;
  line-height: 20px;
  color: ${COLOR.BLACK};
`;

const Description = styled.Text`
  font-size: 13px;
  line-height: 19px;
  color: ${COLOR.TEXT_GRAY};

  text-align: center;
`;

const CancelButton = styled.TouchableOpacity`
  background-color: #fff;
  width: 110px;
  height: 50px;
  align-items: center;
  justify-content: center;
  border: 1px solid #ccc;
  border-radius: 10px;
`;

const CancelLabel = styled.Text`
  color: #ccc;
  font-weight: bold;
`;

const ConfirmButton = styled.TouchableOpacity<{ disabled?: boolean }>`
  background-color: ${(props) => (props.disabled ? '#ccc' : props.theme.colors.PRIMARY)};
  width: 110px;
  height: 50px;
  align-items: center;
  justify-content: center;
  border: 1px solid ${(props) => (props.disabled ? '#ccc' : props.theme.colors.PRIMARY)};
  border-radius: 10px;
`;

const ModalLabel = styled.Text`
  color: #fff;
  font-weight: bold;
`;
