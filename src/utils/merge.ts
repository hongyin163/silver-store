export default function merge(to, from) {
  let target;
  if (typeof from === 'object' && typeof to === 'object') {
    target = Object.assign({}, to, from);
  } else {
    target = from;
  }
  return target;
}
