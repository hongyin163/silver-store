## Silver Store

A simple, easy-to-use React Store solution, based on immerjs.

## Objectives

1. Improve development efficiency
1. Improve maintainability
1. Preserve the Time Travel capability
1. The ability to take advantage of TS type constraints

## Install

```
npm install silver-store or yarn add silver-store
```

## Use

### Store Definition

1. defined in the store directory, the default defineStore name parameter is the same as the filename
1. remember to add TS type definition to the state
1. setState parameter can be either an object or a function, use immer library to update

```ts
import { IState, ITodoState } from ". /types";
import { defineStore, useSelector } from "silver-store";

const namespace = "todos";
const { getState, setState, store } = defineStore<ITodoState>(namespace, {
  current: 0,
  list: [],
});

export const addTask = (id, name) => {
  let list = getState().list;
  // Combine with immer to do state updates
  setState((state) => {
    state.list = list.concat({ id, name });
  });
};

export const setCurrent = (current) => {
  setState({
    current,
  });
};

// Use useSelector hook to subscribe store
export const userList = () => {
  return useSelector<IState>((state) => {
    return state.todos;
  });
};

export const userList2 = () => {
  return useSelector<IState>((state) => {
    return getState().todos;
  });
};
```

### Use Store

```tsx
import React, { useContext, useMemo } from "react";
import { addTask, setCurrent, useList } from ".. /.. /store/todos";
import { useSelector } from "silver-store";

export default function Todos() {
  const { list, current } = useList();

  function add() {
    addTask(Math.random(), Math.random());
  }
  function setNow(i) {
    setCurrent(i);
  }
  return (
    <div>
      {list.map(({ id, name }, i) => {
        return (
          <div id={id} key={i} onClick={setNow.bind(null, i)}>
            {name} {current === i ? "now" : ""}
          </div>
        );
      })}
      <button onClick={add}>add</button>
    </div>
  );
}
```
