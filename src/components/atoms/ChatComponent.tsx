import styled from 'styled-components/native';
import { COLOR } from '../../constants/COLOR';

export const CancelLabel = styled.Text`
  color: #ccc;
  font-size: 13px;
  font-weight: 500;
`;
export const DeleteButton = styled.TouchableOpacity`
  background-color: ${COLOR.PRIMARY};
  width: 100px;
  height: 42px;
  align-items: center;
  justify-content: center;
  border: 1px solid ${COLOR.PRIMARY};
  border-radius: 10px;
`;
export const DeleteLabel = styled.Text`
  color: #fff;
  font-size: 13px;
  font-weight: 500;
`;
export const Footer = styled.View`
  height: 55px;
  justify-content: center;
  align-items: flex-end;
  background-color: ${({ theme }) => (theme.dark ? '#585858' : '#ffffff')};
`;
export const FooterButton = styled.TouchableOpacity`
  padding: 15px;
  width: 50%;
  align-items: center;
`;
export const FooterButtonLabel = styled.Text<{ selected: boolean }>`
  color: ${({ selected }) => (selected ? COLOR.PRIMARY : '#999999')};
  font-size: 13px;
  font-weight: 500;
`;
