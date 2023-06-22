import { COLOR } from "constants/COLOR";

export const light = {
  dark: false,
  colors: {
    ...COLOR,
    background: '#ffffff',
    text: '#000000',
  }
};

export const dark = {
  dark: true,
  colors: {
    ...COLOR,
    background: "#585858",
    text: '#ffffff'
  },
};