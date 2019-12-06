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
