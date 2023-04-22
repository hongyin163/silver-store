import React from 'react';
import { IStore } from './store/types';
import DefaultContext from './context';
import DefaultStore from './store/Store';
import { IContext } from './context/types';

interface IProiverProps {
  children: React.ReactElement;
  store?: IStore;
  context?: React.Context<IContext>;
}

// Context 存储了store
export function Provider(props: IProiverProps) {
  const { children, context = DefaultContext, store = DefaultStore } = props;

  const value = { store };

  const Context = context || DefaultContext;

  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export default Provider;
