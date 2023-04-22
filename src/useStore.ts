import { useContext } from 'react';
import Context from './context';

export function createStoreHook(context = Context) {
  return function useStore() {
    const { store } = useContext(context);
    return store;
  };
}

export default createStoreHook();
