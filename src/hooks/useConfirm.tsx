import { useSetAtom } from 'jotai';
import confirmAtom from '../stores/confirmAtom';
import { useCallback } from 'react';

interface Props {
  title: string;
  description: string;
  ok?: () => void;
  cancel?: () => void;
}

export default function useConfirm() {
  const setConfirm = useSetAtom(confirmAtom);
  const close = useCallback(() => {
    setConfirm({
      visible: false,
      title: '',
      description: '',
      ok: () => {},
      cancel: () => {},
    });
  }, [setConfirm]);
  return function confirm({ title, description, ok, cancel }: Props) {
    setConfirm({
      visible: true,
      title,
      description,
      ok: () => {
        ok?.();
        close();
      },
      cancel: () => {
        cancel?.();
        close();
      },
    });
  };
}
