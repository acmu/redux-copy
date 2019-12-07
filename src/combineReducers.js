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
