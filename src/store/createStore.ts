import { IStore } from './types';
import merge from '../utils/merge';
export default function createStore(initState = {}): IStore {
  let currentState = initState;
  const listeners: (() => void)[] = [];

  function setState(nextState) {
    currentState = merge(currentState, nextState);
    for (let i = 0; i < listeners.length; i++) {
      const listener = listeners[i];
      listener();
    }
  }

  function getState() {
    return currentState || {};
  }

  function subscribe(listener: () => void) {
    let isSubscribed = true;
    listeners.push(listener);

    return function unsubscribe() {
      if (!isSubscribed) {
        return;
      }
      isSubscribed = false;
      const index = listeners.indexOf(listener);
      listeners.splice(index, 1);
    };
  }

  return {
    setState,
    getState,
    subscribe,
  };
}
