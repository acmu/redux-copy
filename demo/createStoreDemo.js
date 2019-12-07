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
