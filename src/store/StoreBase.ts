import produce from "immer";
import merge from "../utils/merge";
import defaultStore from "./Store";
import { logByFunc } from "../log";
import { IStore } from "./types";

export function createStoreBase(store = defaultStore) {
  return class StoreBase<S> {
    name: string = "";
    state?: S;
    store: IStore = store;
    constructor() {
      this.init(this.state);
      this.regist();
    }
    regist = () => {
      this.store[this.name] = this;
    };
    getState(): S {
      return this.store.getState()[this.name];
    }
    init = (initState) => {
      const currentState = this.getState();
      if (!currentState) {
        if (typeof initState === "function") {
          this.setState(initState());
        } else {
          this.setState(initState);
        }
      }
    };
    setState = (state: S | ((pre: S) => void)) => {
      const lastState = this.getState();
      let nextState;
      if (typeof state === "function") {
        nextState = produce(lastState, state as (pre: S) => void);
      } else {
        nextState = merge(lastState, state);
      }

      if (process.env.NODE_ENV === "development") {
        logByFunc(this.setState, this.name, lastState, nextState);
      }

      this.store.setState({
        [this.name]: nextState,
      } as any);
    };
  };
}

export default createStoreBase();

export class StoreBase<S> {
  name: string = "";
  state?: S | (() => S);
  store: IStore;
  constructor(store = defaultStore) {
    this.store = store;
    this.init(this.state);
  }
  getState(): S {
    return this.store.getState()[this.name];
  }
  init = (initState) => {
    const currentState = this.getState();
    if (!currentState) {
      if (typeof initState === "function") {
        this.setState(initState());
      } else {
        this.setState(initState);
      }
    }
  };
  setState = (state: S | ((pre: S) => void)) => {
    const lastState = this.getState();
    let nextState;
    if (typeof state === "function") {
      nextState = produce(lastState, state as (pre: S) => void);
    } else {
      nextState = merge(lastState, state);
    }

    if (process.env.NODE_ENV === "development") {
      logByFunc(this.setState, this.name, lastState, nextState);
    }

    this.store.setState({
      [this.name]: nextState,
    } as any);
  };
}
