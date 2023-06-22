import { atom } from 'jotai';

const confirmAtom = atom({
  visible: false,
  title: '',
  description: '',
  cancel: () => {},
  ok: () => {},
});

export default confirmAtom;
