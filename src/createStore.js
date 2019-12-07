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
