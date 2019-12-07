本文会讲解 [Redux](https://github.com/reduxjs/redux) & [redux-thunk](https://github.com/reduxjs/redux-thunk) & [redux-promise](https://github.com/redux-utilities/redux-promise) 源码，并抄写一个无类型检测、易懂的版本

## 项目准备

Redux 源码使用了 ES6 语法，rollup 打包。本文使用 Parcel 打包，因为它可以零配置，安装了直接用就好。

1. 新建项目 `mkdir dev-redux && cd dev-redux`
2. 初始化 `yarn init -y`
3. 安装 parcel `yarn add parcel-bundler --dev`
4. 在 `package.json` 中添加 `start` 命令 `parcel ./src/index.html`

`package.json` 代码：

```json
{
  "name": "dev-redux",
  "version": "1.0.0",
  "main": "index.js",
  "license": "MIT",
  "scripts": {
    "start": "parcel index.html"
  },
  "devDependencies": {
    "parcel-bundler": "^1.12.4"
  }
}
```

## 目录结构

在 Redux 仓库的 src 目录下，有几个文件，这就是它的全部源码：

![](https://user-gold-cdn.xitu.io/2019/7/28/16c3680019a31238?w=536&h=540&f=png&s=58747)

在我们的项目中，新建一个文件夹 `src` ，创建如上相同的 js 文件。

在根目录下新建 `index.html`，作为 Parcel 打包的入口，html 中引入 index.js

`index.html` 代码：

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="X-UA-Compatible" content="ie=edge" />
    <title>Redux 源码</title>
  </head>
  <body>
    <h1>Redux 源码</h1>
    <script src="./src/index.js"></script>
  </body>
</html>
```

这时，可以在 index.js 中写一个 `console.log('hello');` 执行`yarn start`，打开`localhost:1234`，看到控制台的输出，就可以进入开发了。

## 代码编写

### copy 目录

Redux 源码 src 目录的副本，方便对比查看。

### utils 目录

此目录下是一些工具函数，比较简单。

`warning.js` 输出 error。

```js
export default function warning(message) {
  if (typeof console !== 'undefined' && typeof console.error === 'function') {
    console.error(message);
  }
}
```

`isPlainObject.js` 判断是否为纯对象，`dispatch` 的 `action` 就会由它来判断。

```js
export default function isPlainObject(obj) {
  // 因为 typeof null 等于 'object' 所以需要特殊判断一下
  if (typeof obj !== 'object' || obj === null) return false;

  // 并不是所有 typeof 值为 object 的都是纯对象，比如 typeof [] 等于 'object'
  // 所以需要判断原型链，设纯对象的原型是A，那么A的原型一定是 null
  let proto = obj;
  while (Object.getPrototypeOf(proto) !== null) {
    proto = Object.getPrototypeOf(proto);
  }

  return Object.getPrototypeOf(obj) === proto;
}
```

`actionTypes.js` 定义了三个 action 类型

```js
// 随机一个 [0-9a-z] (36进制) 的字符串
// substring(7) 的原因，个人认为：生成字符串的长度大约为 8 位到 15 位不等
// 后面的字符除了[0-9a-z]这36种可能外，又多了一种不存在的可能，增大了不相等的概率
const randomString = () =>
  Math.random()
    .toString(36)
    .substring(7)
    .split('')
    .join('.');

// 定义了 3 中内部使用的 action type
const ActionTypes = {
  INIT: `@@redux/INIT${randomString()}`,
  REPLACE: `@@redux/REPLACE${randomString()}`,
  PROBE_UNKNOW_ACTION: () => `@@redux/PROBE_UNKNOWN_ACTION${randomString()}`
};

export default ActionTypes;
```

`utils` 目录至此结束，下面让我们来看些更有意思的。

### `compose.js` 文件

当你调用 `compose(a, b, c)(1, 2, 3)` 后，就和调用 `a(b(c(1, 2, 3)))` 一样，这个函数，有时面试会问。

```js
export default function compose(...funcs) {
  // 如果没参数，返回一个函数
  if (funcs.length === 0) {
    return f => f;
  }
  // 如果只有一个参数，直接返回
  if (funcs.length === 1) {
    return funcs[0];
  }

  return funcs.reduce((accumulator, currentValue) => {
    return (...args) => {
      return accumulator(currentValue(...args));
    };
  });
}
```

accumulator(累计器)、currentValue(当前的值) `funcs.reduce` 返回值是一个函数，当调 `compose(a, b, c)` (a b c 都是函数) 时，变量 funcs 是 `[a, b, c]`

| 执行次数 | accumulator 值             | currentValue 值 |
| -------- | -------------------------- | --------------- |
| 1        | `a`                        | `b`             |
| 2        | `(...arg) => a(b(...arg))` | `c`             |

最后，返回值就是 `(...arg) => a(b(c(...arg)))`，我们新建一个 `demo` 目录(用于测试已完成的代码)，写入测试代码

`demo/composeDemo.js` 代码

```js
import compose from '../src/compose';

function a(value) {
  console.log('a: ', value);
  return value + 'a';
}

function b(value) {
  console.log('b: ', value);
  return value + 'b';
}

function c(value) {
  console.log('c: ', value);
  return value + 'c';
}

const thunk = compose(a, b, c);

console.log(thunk('MinYuan'));
```

执行测试代码(共两步 1: 将 `index.html` 的 `script src` 路径改成测试文件的路径 2: 执行 `yarn start`) 输出如下：

![](https://user-gold-cdn.xitu.io/2019/12/6/16edb70fbf0a18a5?w=329&h=228&f=png&s=15103)

这个文件看起来很高大上，但只是为了实现上述功能，并不难。

接下来，就要进入`createStore.js`部分的讲解，这是 Redux 中最重要的部分。

### `createStore.js` 文件

> 这里教大家一个 VSCode 快捷键，`cmd + k 和 cmd + n(数字)` 意思是以第 n 层级为准对代码进行折叠，比如 `cmd + k 和 cmd + 2` 是第二层级， `cmd + 3` 就是第三层级。折叠之后全部展开的快捷键是 `cmd + k 和 cmd + j`

这是 Redux 中最主要的部分，虽然代码较长，但不用怕，折叠二层级后发现有用的，就这几个函数：

![](https://user-gold-cdn.xitu.io/2019/12/6/16edb7d3139d3f59?w=504&h=782&f=png&s=77686)

还有上面的一坨类型判断，这个留到最后再说。

`createStore.js` 代码：

```js
import ActionTypes from './utils/actionTypes';
import isPlainObject from './utils/isPlainObject';

// 传入 reducer 函数、preloadedState 预置state 和 enhancer store的增强函数(增强是store的dispatch方法)
export default function createStore(reducer, preloadedState, enhancer) {
  // 如果有增强函数，那就直接返回调用 enhancer 的值
  // 这里传的参数正好和 applyMiddleware.js 中相互对应
  if (typeof enhancer === 'function') {
    return enhancer(createStore)(reducer, preloadedState);
  }

  // 当前的 reducer 函数
  let currentReducer = reducer;
  // 当前的 state ，也就是 store 的值，只是一个普通的对象而已
  let currentState = preloadedState;
  // 监听函数的数组集合，如果state发生改变，就要调用这里的监听函数
  let currentListeners = [];
  // 新添加的监听函数
  let nextListeners = currentListeners;
  // 是否正在 dispatching
  // 通过这个实现一个 store 只能同时 dispatch 一个 action
  // 不能同时 dispatch 多个 action
  let isDispatching = false;

  // 把当前的监听数组做一个浅拷贝，目的是改变 nextListeners 时，currentListeners 不受到影响
  // 浅拷贝就是只把第一层做一次拷贝
  function ensureCanMutateNextListeners() {
    if (nextListeners === currentListeners) {
      nextListeners = currentListeners.slice();
    }
  }

  // 就是返回当前的 currentState
  function getState() {
    return currentState;
  }

  // 添加订阅函数
  // 这里只是把 listener 添加到 nextListeners 中
  // 在 dispatch 时，才会依次调用 nextListeners 中的函数
  function subscribe(listener) {
    let isSubscribed = true;

    // 确保不会改变当前 listener
    ensureCanMutateNextListeners();
    // 把当前函数添加到监听列表中
    nextListeners.push(listener);

    // 返回一个取消订阅函数
    return function unsubscribe() {
      // 如果已经调用过 取消订阅 就直接 return
      if (!isSubscribed) {
        return;
      }

      isSubscribed = false;

      ensureCanMutateNextListeners();
      const index = nextListeners.indexOf(listener);
      // 删除当前的订阅函数
      nextListeners.splice(index, 1);
      // 这里设为null 原因是让 ensureCanMutateNextListeners 中 nextListeners 不等于 currentListeners
      // 这样 nextListeners 就不会被重新赋值
      currentListeners = null;
    };
  }

  // 通过 dispatch action 来改变 state
  function dispatch(action) {
    // 判断 action 对象是否符合规范
    if (!isPlainObject(action) || typeof action.type === 'undefined') {
      return;
    }

    try {
      isDispatching = true;
      // 通过调用 reducer(state, action) 获取到新的 state
      // 这里是直接赋值，代表一个全新的对象
      currentState = currentReducer(currentState, action);
    } finally {
      isDispatching = false;
    }

    // 更新当前的 listener 并分别调用
    const listeners = (currentListeners = nextListeners);
    for (let i = 0; i < listeners.length; i++) {
      const listener = listeners[i];
      listener();
    }

    // 返回传入的action
    return action;
  }

  // 替换reducer，以下情况可能会用到：
  // 1. 实现代码分割
  // 2. 动态加载 reducer
  // 3. 实现热重载
  function replaceReducer(nextReducer) {
    currentReducer = nextReducer;

    dispatch({ type: ActionTypes.REPLACE });
  }

  // 执行初始化
  dispatch({ type: ActionTypes.INIT });

  // 返回一个 store
  return {
    dispatch,
    subscribe,
    getState,
    replaceReducer
  };
}
```

当实现了 `createStore.js` 后，就可以运行[官方 Demo 代码](https://github.com/reduxjs/redux#the-gist)了，在 `demo` 目录中新建 `createStoreDemo.js`

`demo/createStoreDemo.js` 代码：

```js
import createStore from '../src/createStore';

// 这是 reducer ，一个纯函数
function counter(state = 0, action) {
  switch (action.type) {
    case 'INCREMENT':
      return state + 1;
    case 'DECREMENT':
      return state - 1;
    default:
      return state;
  }
}

// 创建一个 redux state 储存你的App状态数据
// 它的 API 是 { subscribe, dispatch, getState }
let store = createStore(counter);

// 你可以通过 subscribe 去订阅 state 的变化
store.subscribe(() => console.log(store.getState()));

// 改变内部 state 的唯一方式就是 dispatch 一个 action
store.dispatch({ type: 'INCREMENT' });
// 1
store.dispatch({ type: 'INCREMENT' });
// 2
store.dispatch({ type: 'DECREMENT' });
// 1

console.log(store);
```

可以看到输出的 `store` ，只是一个简单的对象而已，里面包含了几个方法。

![](https://user-gold-cdn.xitu.io/2019/12/5/16ed4a8459a3f281?w=958&h=200&f=png&s=51017)

`store` 并没有把 `currentState` 暴露出来，而是通过 `dispatch` `action` 之后传给 `reducer` 去修改，返回一个全新的 `store` ，并且通过 `getState` 去获取 `currentState`。

显然，这里是通过闭包的方式去隐藏 `currentState` 的，但我们还是有两种方式可以直接获取到 `currentState` 的值：

1. `reducer` 中的第一个参数，即 `currentState = currentReducer(currentState, action);`
2. `getState` 的返回值，即 `return currentState;`

你可以通过以上方式直接去改变 `currentState` ，而不需要 `dispatch` ，也不会触发 `listeners` ，当然，这是正常开发下不希望看到的效果，所以要保证每个 `reducer` 是纯函数、无副作用，最好是使用 [immutable.js](https://immutable-js.github.io/immutable-js/)，这样 store 中的数据天生就不可修改，很符合当前使用场景。

不用 `dispatch` 就能改变 `state` 的例子， `demo/hackStateDemo.js` 代码：

```js
import createStore from '../src/createStore';

const defaultState = {
  num: 6
};

function counter(state = defaultState, action) {
  switch (action.type) {
    case 'INCREMENT':
      return {
        ...state,
        num: state.num + 1
      };
    case 'DECREMENT':
      // 这里没有用 dispatch 就改变了 state 的值
      // 也没有触发 listener，且这行有副作用
      state.sideEffect = true;
      return {
        ...state,
        num: state.num - 1
      };
    default:
      return state;
  }
}

let store = createStore(counter);

store.subscribe(() => console.log('subscribe', store.getState()));

store.dispatch({ type: 'INCREMENT' });
store.dispatch({ type: 'INCREMENT' });
store.dispatch({ type: 'DECREMENT' });

const obj = store.getState();

// 这里没有用 dispatch 就改变了 state 的值
// 也没有触发 listener
obj.num = 1;

console.log(store.getState());
```

运行测试代码，输出如下：

![](https://user-gold-cdn.xitu.io/2019/12/7/16edf1e51c53bed1?w=478&h=226&f=png&s=28156)

### `combineReducers.js` 文件

随着你的 App 变得复杂，state 也会变得很庞大，我们可以通过 `combineReducers` 函数拆分 `reducer`。

使用方法如下：

```js
// 根 reducer 由 potatoReducer 和 tomatoReducer 组成
rootReducer = combineReducers({potato: potatoReducer, tomato: tomatoReducer})
// 传入 createStore
const store = createStore(rootReducer)
// 会生成如下的 state 对象
{
  potato: {
    // potatoReducer 生成的 potatoes
  },
  tomato: {
    // tomatoReducer 生成的 tomatoes
  }
}
```

通过对应的 reducer (potatoReducer) 会生成对应的对象 potato (store.potato)

`combineReducers.js` 代码：

```js
// 组合 reducers
export default function combinReducers(reducers) {
  const reducerKeys = Object.keys(reducers);
  const finalReducers = {};

  // 把有效的 key 放到 finalReducers 中
  for (let i = 0; i < reducerKeys.length; i++) {
    const key = reducerKeys[i];
    if (typeof reducers[key] === 'function') {
      finalReducers[key] = reducers[key];
    }
  }

  const finalReducerKeys = Object.keys(finalReducers);

  return function combinatin(state = {}, action) {
    let hasChanged = false;
    const nextState = {};

    for (let i = 0; i < finalReducerKeys.length; i++) {
      const key = finalReducerKeys[i];
      const reducer = finalReducers[key];
      // 获取之前的 state 值
      const previousStateForKey = state[key];
      // 获取之后的 state 值
      const nextStateForKey = reducer(previousStateForKey, action);
      nextState[key] = nextStateForKey;
      hasChanged = hasChanged || nextStateForKey !== previousStateForKey;
    }
    // 如果 state 已经变化，就直接替换
    return hasChanged ? nextState : state;
  };
}
```

`bindActionCreators.js` 代码：

```js
zmy:todo 完善代码 以及使用方法
```

### redux 中间件机制

`applyMiddleware.js` 代码：



## 结语

虽然如今 Redux 已用 TS 重写，但核心代码基本没变，只是添加一些类型声明而已。

我认为 Redux 也就 2 个难点，分别是 `createStore` 函数 和 中间件机制

## 记录

中间件使你能包裹 dispatch 方法

`({ getState, dispatch }) => next => action` 是中间件的特征

```js
```

```js
```
