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
