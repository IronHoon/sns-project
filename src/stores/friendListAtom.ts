import { atom } from 'jotai';

const friendListAtom = atom<Array<number> | null>(null);

export default friendListAtom;
