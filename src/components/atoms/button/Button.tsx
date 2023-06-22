import React from 'react';
import styled from 'styled-components/native';
import { COLOR } from 'constants/COLOR';
import { RADIUS } from 'constants/RADIUS';

export const ButtonVariant = Object.freeze({
  Default: 'default',
  Gray: 'gray',
  White: 'white',
  Outlined: 'outlined',
  Inactive: 'inactive',
  Active: 'active',
  Blacklined: 'blacklined',
  TextBtn: 'textBtn',
} as const);

export const ButtonTextVariant = Object.freeze({
  DefaultText: 'defaultText',
  PrimaryText: 'primaryText',
  GrayText: 'grayText',
  WhiteText: 'whiteText',
  OutlinedText: 'outlinedText',
  Text: 'text',
  InactiveText: 'inactiveText',
  BlacklinedText: 'blacklinedText',
} as const);

export type ButtonVariantProperty =
  | 'default'
  | 'gray'
  | 'white'
  | 'outlined'
  | 'textBtn'
  | 'inactive'
  | 'active'
  | 'blacklined';

export type ButtonTextVariantProperty =
  | 'defaultText'
  | 'primaryText'
  | 'whiteText'
  | 'outlinedText'
  | 'text'
  | 'inactiveText'
  | 'blacklinedText'
  | 'grayText'
  | 'redText'
  | 'deepGrayText';

export const ButtonTheme = {
  [ButtonVariant.Default]: {
    default: `
					background: ${COLOR.PRIMARY};
			`,
    active: `
					background: ${COLOR.SECONDARY} ;
			`,
    inactive: `
					background: ${COLOR.LIGHT_GRAY} ;
			`,
  },
  [ButtonTextVariant.DefaultText]: {
    default: `
					color : #fff;
					font-weight: bold; 
			`,
  },
  [ButtonTextVariant.PrimaryText]: {
    default: `
					color : ${COLOR.PRIMARY};
					font-weight: bold; 
			`,
  },
  [ButtonTextVariant.InactiveText]: {
    default: `
    	color : ${COLOR.TEXT_GRAY};
    `,
  },
  [ButtonVariant.Gray]: {
    default: `
					background: ${COLOR.GRAY};
			`,
    active: `
					background: ${COLOR.TEXT_GRAY} ;
			`,
    inactive: `
					background: ${COLOR.LIGHT_GRAY} ;
			`,
  },
  [ButtonTextVariant.GrayText]: {
    default: `
					color : #fff;
					font-weight: bold; 
			`,
  },
  [ButtonVariant.Outlined]: {
    default: `
					border : 1px solid ${COLOR.GRAY};
			`,
    blacklined: `
					border : 1px solid ${COLOR.BLACK} ;
			`,
    whitelined: `
					border : 1px solid #ffffff ;
			`,
    redlined: `
      border : 1px solid ${COLOR.RED} ;
    `,
  },
  [ButtonTextVariant.OutlinedText]: {
    default: `
					color : #999;
			`,
    blacklinedText: `
					color : ${COLOR.BLACK};
			`,
    whitelinedText: `
					color : #ffffff;
			`,
  },
  [ButtonVariant.TextBtn]: {
    default: `
        background: transparent;
      `,
  },
  [ButtonTextVariant.Text]: {
    default: `
				color : ${COLOR.PRIMARY};
		`,
    grayText: `
				color: ${COLOR.GRAY} ;
		`,
    redText: `
				color: ${COLOR.RED} ;
		`,
    deepGrayText: `
				color: #bcb3c5 ;
		`,
  },
  [ButtonVariant.White]: {
    default: `
			background: #fff;
			box-shadow: 0 0 10px rgb(9 9 9 / 10%);
		`,
  },
  [ButtonTextVariant.WhiteText]: {
    default: `
				color : ${COLOR.BLACK};
		`,
  },
};

type FlexDirectionProperty = 'row' | 'column';

type ButtonProps = {
  label: string;
  children?: React.ReactNode | string;
  onPress?: () => void;

  fontSize?: number;
  fontWeight?: number;
  marginRight?: number;
  marginLeft?: number;
  width?: number | string;
  height?: number;
  borderRadius?: boolean;
  borderRadiusRound?: boolean;
  blacklined?: boolean;
  whitelined?: boolean;
  redlined?: boolean;
  whitelinedText?: boolean;
  blacklinedText?: boolean;
  grayText?: boolean;
  redText?: boolean;
  deepGrayText?: boolean;
  white?: boolean;
  variant?: ButtonVariantProperty;
  textvariant?: ButtonTextVariantProperty;
  inactive?: boolean;
  inactiveText?: boolean;
  active?: boolean;
  textBtn?: boolean;
  text?: boolean;
  flexDirection?: FlexDirectionProperty;
};

type ComponentBoxProps = {
  marginRight?: number;
  marginLeft?: number;
  width?: number | string;
  height?: number;
  borderRadius?: boolean;
  borderRadiusRound?: boolean;
  blacklined?: boolean;
  whitelined?: boolean;
  redlined?: boolean;
  variant?: ButtonVariantProperty;
  inactive?: boolean;
  active?: boolean;
  textBtn?: boolean;
  flexDirection?: FlexDirectionProperty;
};

type ComponentTextProps = {
  fontWeight?: number;
  fontSize?: number;
  text?: boolean;
  blacklinedText?: boolean;
  whitelinedText?: boolean;
  grayText?: boolean;
  redText?: boolean;
  deepGrayText?: boolean;
  textvariant?: ButtonTextVariantProperty;
  inactiveText?: boolean;
  flexDirection?: FlexDirectionProperty;
};

const Component = styled.TouchableOpacity<ComponentBoxProps>`
  align-items: center;
  justify-content: center;

  flex-direction: ${({ flexDirection }) => (flexDirection === 'row' ? 'row' : 'column')};
  margin-right: ${({ marginRight }) => marginRight || 0}px;
  margin-left: ${({ marginLeft }) => marginLeft || 0}px;
  ${({ height = 70 }) => `height: ${height}px;`}
  ${({ width }) => (width ? (typeof width === 'string' ? `width: ${width}` : `width: ${width}px;`) : '')}
  ${({ borderRadius }) => (borderRadius ? `border-radius: ${RADIUS.MD}px;` : '')}
  ${({ borderRadiusRound, height }) => (borderRadiusRound ? `border-radius: ${height}px;` : '')}

  ${({ variant, blacklined, whitelined, redlined, inactive, active, textBtn }) => {
    const theme = ButtonTheme[variant || ButtonVariant.Default];
    return `
      ${theme.default};
      ${whitelined ? `${theme.whiteline}` : ''};
      ${blacklined ? `${theme.blacklined}` : ''};
      ${redlined ? `${theme.redlined}` : ''};
      ${inactive ? `${theme.inactive}` : ''};
      ${active ? `${theme.active}` : ''};
      ${textBtn ? `${theme.textBtn}` : ''};
      `;
  }}
`;

const ButtonText = styled.Text<ComponentTextProps>`
  font-weight: ${({ fontWeight = 500 }) => fontWeight};
  font-size: ${({ fontSize = 18 }) => fontSize}px;

  ${({ textvariant, inactiveText, whitelinedText, blacklinedText, grayText, redText, deepGrayText, text }) => {
    const theme = ButtonTheme[textvariant || ButtonTextVariant.DefaultText];
    return `
      ${theme.default};
      ${whitelinedText ? `${theme.whitelinedText}; ` : ''};
      ${blacklinedText ? `${theme.blacklinedText}; ` : ''};
      ${inactiveText ? `${theme.inactiveText}; ` : ''};
      ${grayText ? `${theme.grayText}` : ''};
      ${redText ? `${theme.redText}` : ''};
      ${deepGrayText ? `${theme.deepGrayText}` : ''};  
      ${text ? `${theme.text}` : ''};  
			`;
  }}
  ${({ flexDirection }) => (flexDirection === 'column' ? 'margin-top: 4px;' : '')}
`;

const IconContainer = styled.View`
  margin-right: 7px;
`;

export const Button = ({
  label,
  children,
  onPress,
  variant,
  textvariant,
  marginRight,
  marginLeft,
  fontSize,
  fontWeight,
  width,
  height,
  borderRadius,
  borderRadiusRound,
  blacklined,
  blacklinedText,
  whitelined,
  whitelinedText,
  grayText,
  redlined,
  redText,
  deepGrayText,
  inactive,
  inactiveText,
  active,
  textBtn,
  text,
  flexDirection = 'row',
  ...props
}: ButtonProps) => {
  return (
    <Component
      activeOpacity={0.8}
      onPress={onPress}
      variant={variant}
      marginRight={marginRight}
      marginLeft={marginLeft}
      width={width}
      height={height}
      borderRadius={borderRadius}
      borderRadiusRound={borderRadiusRound}
      redlined={redlined}
      blacklined={blacklined}
      whitelined={whitelined}
      inactive={inactive}
      active={active}
      textBtn={textBtn}
      flexDirection={flexDirection}
      {...props}
    >
      {children && <IconContainer>{children}</IconContainer>}
      <ButtonText
        textvariant={textvariant}
        fontSize={fontSize}
        fontWeight={fontWeight}
        blacklinedText={blacklinedText}
        whitelinedText={whitelinedText}
        grayText={grayText}
        redText={redText}
        deepGrayText={deepGrayText}
        inactiveText={inactiveText}
        text={text}
        flexDirection={flexDirection}
      >
        {label}
      </ButtonText>
    </Component>
  );
};
