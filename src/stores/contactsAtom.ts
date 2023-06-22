import { atom } from 'jotai';
import Contacts from '../types/contacts/Contact';

const contactsAtom = atom<Contacts | null>(null);

export default contactsAtom;
