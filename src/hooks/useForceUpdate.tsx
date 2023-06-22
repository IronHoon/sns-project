import { atom, useAtom } from 'jotai';
import { useCallback } from 'react';

const forceUpdateAtom = atom({});

const useForceUpdate = () => {
  const [_, updateState] = useAtom(forceUpdateAtom);
  const forceUpdate = useCallback(() => updateState({}), [updateState]);

  return { forceUpdate };
};

export default useForceUpdate;
