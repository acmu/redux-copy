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
