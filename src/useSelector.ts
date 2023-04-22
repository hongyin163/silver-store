import { useContext, useLayoutEffect, useReducer, useRef } from 'react';
import Context from './context';
import { IContext } from './context/types';
import defaultStore from './store/Store';

//TODO
export const createSelectorHook = <T>(context = Context) => {
  return function useSelector<S extends T>(selector: (state: S) => unknown) {
    const { store = defaultStore } = useContext<IContext>(context); //as { store: IStore<S> }
    const [, forceRender] = useReducer((s) => s + 1, 0);
    const latestState = useRef<unknown>();

    useLayoutEffect(() => {
      const subscribe = store.subscribe(() => {
        const newState = selector(store.getState() as unknown as S);
        if (latestState.current === newState) {
          return;
        }
        latestState.current = newState;
        forceRender();
      });
      return () => {
        subscribe();
      };
    });

    return selector(store.getState() as unknown as S);
  };
};

export default createSelectorHook();
