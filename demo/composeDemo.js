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
