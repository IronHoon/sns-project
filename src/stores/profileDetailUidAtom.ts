import { atom } from 'jotai';
import Contacts from '../types/contacts/Contact';

const profileDetailUidAtom = atom<string | null>(null);

export default profileDetailUidAtom;
