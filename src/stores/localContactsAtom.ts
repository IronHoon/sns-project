import { atom } from 'jotai';
import LocalContact from '../types/contacts/LocalContact';

const localContactsAtom = atom<LocalContact[]>([]);

export default localContactsAtom;
