export interface IStore {
  setState: (state) => void;
  getState: () => any;
  subscribe: (listener: () => void) => () => void;
}

// export type TSetStateFunc = (state:) => void
