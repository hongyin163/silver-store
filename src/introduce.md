## Situation

Currently, the application structure in our systems is not very clear. For state management, there are both Redux + Saga and hook APIs. A consistent design solution for state management is needed, as the Redux + Saga solution is too complex to be easily promoted, and the hook API can achieve logic sharing but not state sharing.

## Goals

The overall layered design of the entire application has been determined, mainly including store, pages, components, etc. In the future, data and business logic will be centralized in the store, and the view will only be responsible for rendering from data to UI. Event triggers will call the API in the store layer, resulting in less code in the components, and better sharing of logic in the store.

1. Increase development efficiency
1. Improve maintainability
1. Retain time travel ability
1. Utilize the type constraint ability of TypeScript

## Research

### Dvajs

This is a package that encapsulates Redux + Saga and maintains actions and reducers together.

```js
app.model({
  namespace: "count",
  state: {
    record: 0,
    current: 0,
  },
  reducers: {
    add(state) {
      const newCurrent = state.current + 1;
      return {
        ...state,
        record: newCurrent > state.record ? newCurrent : state.record,
        current: newCurrent,
      };
    },
    minus(state) {
      return { ...state, current: state.current - 1 };
    },
  },
  effects: {
    *add(action, { call, put }) {
      yield call(delay, 1000);
      yield put({ type: "minus" });
    },
  },
  subscriptions: {
    keyboardWatcher({ dispatch }) {
      key("⌘+up, ctrl+up", () => {
        dispatch({ type: "add" });
      });
    },
  },
});
```

### Mirror

1. Minimal API(only 4 newly introduced)
1. Easy to start
1. Actions done easy, sync or async
1. Support code splitting
1. Full-featured hook mechanism

```js
import mirror, { actions } from "mirrorx";

let nextId = 0;

mirror.model({
  name: "todos",
  initialState: [],
  reducers: {
    add(state, text) {
      return [...state, { text, id: nextId++ }];
    },
    complete(state, id) {
      return state.map((todo) => {
        if (todo.id === id) todo.completed = true;
        return todo;
      });
    },
  },
  effects: {
    async addAsync(data, getState) {
      const res = await Promise.resolve(data);
      // 调用 `actions` 上的方法 dispatch 一个同步 action
      actions.todos.add(res);
    },
  },
});

// ...

// 在某个事件处理函数中
actions.todos.add("a new todo");

// 在另一个事件处理函数中
actions.todos.complete(42);
```

### MobX

### [Overstated](https://github.com/fabiospampinato/overstated)

1. Easy: there's barely anything you need to learn before you can start using Overstated, you just have to wrap your app with Provider, define some initial state and some methods for updating it in a Store and then access the state and methods you need in your components either via the useStore hook or connect.
1. Performant: Overstated has been designed from the ground up with performance in mind, everything you need to write very performant applications (selector function, autosuspend, debug) is built-in.
1. Scalable: you can write big apps with this. You can connect to multiple stores with a single call, compose multiple stores easily and use middlewares.
1. TypeScript-ready: Overstated has been written in TypeScript and enables you to get a fully typed app with minimal effort.

```js
import { compose, Store } from "overstated";

class Foo extends Store<{ value: number }, App> {
  state: {
    value: 123,
  };
  setValue = (value: number) => {
    return this.setState({ value });
  };
  example = () => {
    this.ctx.updateBar(); // Accessing the parent
    this.ctx.bar.setValue("Hi"); // Accessing a sibling via the parent
  };
}

class Bar extends Store<{ value: string }, App> {
  state: {
    value: "hello",
  };
  setValue = (value: string) => {
    return this.setState({ value });
  };
  example = () => {
    this.ctx.updateFoo(); // Accessing the parent
    this.ctx.foo.setValue(0); // Accessing a sibling via the parent
  };
}

@compose({
  foo: Foo,
  bar: Bar,
})
class App extends Store<{}, undefined, { foo: Foo, bar: Bar }> {
  updateFoo = () => {
    return this.foo.setValue(10); // Accessing a sibling
  };
  updateBar = () => {
    return this.bar.setValue("hello there!"); // Accessing a sibling
  };
}
```

### [Ayanami](https://github.com/LeetCode-OpenSource/ayanami)

1. No extra configuration, everything is out of the box
1. Define state and actions in a predictable and type-safe way
1. Use RxJS to create side effects and more
1. Debuggable: Inspect actions and state changes via redux-devtools-extension

```js
import * as React from "react";
import * as ReactDOM from "react-dom";
import { Injectable } from "@asuka/di";
import { Ayanami, Reducer, useAyanami } from "ayanami";

interface State {
  count: number;
}

// About dependencies injection, see:
// https://github.com/LeetCode-OpenSource/asuka/tree/master/packages/di
@Injectable()
class Count extends Ayanami<State> {
  defaultState = {
    count: 0,
  };

  @Reducer()
  add(state: State, addCount: number): State {
    return {
      ...state,
      count: state.count + addCount,
    };
  }
}

function App() {
  const [state, actions] = useAyanami(Count);

  const add = (count: number) => () => actions.add(count);

  return (
    <div>
      <p>Count: {state.count}</p>
      <button onClick={add(1)}>add one</button>
    </div>
  );
}

ReactDOM.render(<App />, document.querySelector("#app"));
```

### hox

1. Just one API, simple and efficient. Almost no learning cost.
1. Define model with custom Hooks.
1. Perfect typescript support.
1. Supports multiple data sources.

Create a model

```js
import { useState } from "react";
import { createModel } from "hox";

function useCounter() {
  const [count, setCount] = useState(0);
  const decrement = () => setCount(count - 1);
  const increment = () => setCount(count + 1);
  return {
    count,
    decrement,
    increment,
  };
}

export default createModel(useCounter);
```

Use model

```js
import useCounterModel from "../models/counter";

function App(props) {
  const counter = useCounterModel();
  return (
    <div>
      <p>{counter.count}</p>
      <button onClick={counter.increment}>Increment</button>
    </div>
  );
}
```

### reto

1. Supports all react hooks. Writing a store is just like writing a component.
1. Simple but efficient, quite easy to learn.
1. Use multiple stores to organize your data.
1. Dependency injection based on React Context.
1. Strongly typed with Typescript, also works well with JS.

```js
import React from "react";
import { useState } from "react";
import { Provider, useStore } from "reto";

function FooStore() {
  const [counter, setCounter] = useState(0);
  function reset() {
    setCounter(0);
  }
  return {
    counter,
    setCounter,
    reset,
  };
}

export function Simple() {
  return (
    <Provider of={FooStore}>
      <App />
    </Provider>
  );
}

function App() {
  const fooStore = useStore(FooStore);
  function changeStore() {
    fooStore.setCounter(fooStore.counter + 1);
  }
  return (
    <div>
      <p>{fooStore.counter}</p>
      <button onClick={changeStore}>Change</button>
      <button onClick={fooStore.reset}>Reset</button>
    </div>
  );
}
```

### Redux Toolkit

1. Built-in utilities for common use cases like store setup, creating reducers and actions, and immutable updates
1. Provides a standardized file structure and reduces boilerplate code
1. Strongly typed with TypeScript support
1. Simplifies the use of Redux middleware
1. Compatible with Redux DevTools

```ts
import { createSlice, configureStore } from "@reduxjs/toolkit";

const counterSlice = createSlice({
  name: "counter",
  initialState: 0,
  reducers: {
    increment: (state) => state + 1,
    decrement: (state) => state - 1,
    incrementByAmount: (state, action) => state + action.payload,
  },
});

const store = configureStore({
  reducer: counterSlice.reducer,
});

store.dispatch(counterSlice.actions.increment());
store.dispatch(counterSlice.actions.incrementByAmount(5));
```

### Effector

1. Highly performant and scalable
1. Has a simple and intuitive API
1. Built-in support for TypeScript
1. Has support for code splitting
1. Provides a rich set of combinators for working with events and state

```js
import { createEvent, createStore, createEffect } from 'effector';

const add = createEvent<number>();

const incrementFx = createEffect<number, void>(async (value: number) => {
  const response = await fetch(`https://jsonplaceholder.typicode.com/todos/${value}`);
  return response.json();
});

const $count = createStore(0)
  .on(add, (state, payload) => state + payload)
  .on(incrementFx.done, (state, {result}) => state + result.userId)

add.watch((payload) => console.log('add', payload));
incrementFx.done.watch(({params, result}) => console.log('incrementFx', params, result));

add(1); // 1
add(1); // 2
incrementFx(1); // 11

```

### XState

1. Declarative state machines
1. Provides a powerful visualizer for understanding state transitions
1. Built-in support for complex use cases like hierarchical and parallel states
1. Works well with React and other UI libraries/frameworks
1. Provides type safety with TypeScript support

```js
import { createMachine, interpret } from "xstate";

const toggleMachine = createMachine({
  id: "toggle",
  initial: "inactive",
  states: {
    inactive: { on: { TOGGLE: "active" } },
    active: { on: { TOGGLE: "inactive" } },
  },
});

const toggleService = interpret(toggleMachine)
  .onTransition((state) => console.log(state.value))
  .start();

toggleService.send("TOGGLE"); // 'active'
toggleService.send("TOGGLE"); // 'inactive'
```

### Recoil

1. Has a simple and intuitive API
1. Uses atoms and selectors to manage state
1. Provides support for asynchronous selectors
1. Provides a selector family API for creating families of selectors
1. Compatible with React and other UI libraries/frameworks

```js
import { atom, selector, useRecoilState, useRecoilValue } from 'recoil';

const countState = atom({
  key: 'count',
  default: 0
});

const countSelector = selector({
  key: 'countSelector',
  get: ({get}) => {
    const count = get(countState);
    return count * 2;
  },
  set: ({set}, newValue) => {
    set(countState, newValue / 2);
  }
});

function Counter() {
  const [count, setCount] = useRecoilState(countState);
  const double

```

### 新的尝试

1. Similar to the ORM idea, and Redux similar, update state without reducer
1. TS type friendly
1. Update state based on immer
1. useSelector refer to the implementation of react-redux

Problems:

1. reducer and actions are gone, the log is printed out through the execution stack

```ts
import { IState, ITodoState } from ". /types";
import { defineStore, useSelector } from "silver-store";

const namespace = "todos";
const { getState, setState, store } = defineStore<ITodoState>("todos", {
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

1. Use useSelector to subscribe store

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
