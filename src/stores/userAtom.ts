import { atom } from 'jotai';
import User from '../types/auth/User';

const userAtom = atom<User | null>(null);

export default userAtom;
