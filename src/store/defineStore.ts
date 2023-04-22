import defaultStore from './Store';
import produce from 'immer';
import merge from '../utils/merge';
import { logByFunc } from '../log';
import { IStore } from './types';

// TODO add enhancer
export function createDefineStore(
  _store: IStore = defaultStore,
  enhancer?: (createDefineStore: any) => <S>(
    name: any,
    initState: S
  ) => {
    getState: () => S;
    setState: (state: Partial<S> | ((pre: S) => void), currName?: any) => void;
    regist: (funcs?: {}) => void;
    store: IStore;
    setAsyncState: (state: (pre: S) => void) => Promise<S>;
    name: any;
    subscribe: any;
  }
) {
  console.log('test enhancer.............');
  console.log(enhancer);
  if (typeof enhancer !== 'undefined') {
    if (typeof enhancer !== 'function') {
      throw new Error(`Expected the enhancer to be a function`);
    }
    return enhancer(createDefineStore);
  }
  const store: IStore = _store || defaultStore;
  return function defineStore<S>(name, initState: S) {
    function getState(): S {
      const state = store.getState();
      if (typeof state === 'object' && state) {
        return state[name] as S;
      }
      return void 0 as unknown as S;
    }

    function setState(state: Partial<S> | ((pre: S) => void)) {
      const lastState = getState();

      //TODO

      let nextState;
      if (typeof state === 'function') {
        nextState = produce(lastState, state as (pre: S) => void);
      } else {
        nextState = merge(lastState, state);
      }

      if (process.env.NODE_ENV === 'development') {
        logByFunc(setState, name, lastState, nextState);
      }

      store.setState({
        [name]: nextState,
      });

      //TODO
    }

    async function setAsyncState(state: (pre: S) => void) {
      const startStack = new Error().stack;
      const lastState = getState();
      let nextState;
      nextState = await produce(lastState, state as (pre: S) => void);

      if (process.env.NODE_ENV === 'development') {
        logByFunc(startStack, name, lastState, nextState, true);
      }

      store.setState({
        [name]: nextState,
      });
    }

    function regist(funcs = {}) {
      store[name] = merge(store[name], funcs);
    }

    function init() {
      const currentState = getState();
      if (!currentState) {
        setState(initState);
      }
    }

    init();

    return {
      getState,
      setState,
      regist,
      store,
      setAsyncState,
      subscribe: store.subscribe,
    };
  };
}

export default createDefineStore();
