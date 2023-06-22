import { atom } from 'jotai';
import { Appearance, ColorSchemeName } from 'react-native';

const colorScheme = Appearance.getColorScheme();
const themeAtom = atom<ColorSchemeName>(colorScheme);

export default themeAtom;
