export default function isPlainObject(obj) {
  // 因为 typeof null 等于 'object' 所以需要特殊判断一下
  if (typeof obj !== 'object' || obj === null) return false;

  // 并不是所有 typeof 值为 object 的都是纯对象，比如 typeof [] 等于 'object'
  // 所以需要判断原型链，设纯对象的原型是A，那么A的原型一定是 null
  let proto = obj;
  while (Object.getPrototypeOf(proto) !== null) {
    console.log('proto', proto);
    proto = Object.getPrototypeOf(proto);
  }

  return Object.getPrototypeOf(obj) === proto;
}
