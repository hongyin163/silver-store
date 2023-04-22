export function extract(log: string = '', isAsync = false) {
  const regx = /at\s(.*)\s\(/g;
  const matches = log.match(regx);
  if (matches) {
    const target =
      matches.length > 0 ? (isAsync ? matches[1] : matches[0]) : '';
    return target.split(' ')[1];
  }
  return '';
}

export function logByFunc(stack, name, lastState, nextState, isAsync = false) {
  let obj: any = {};
  // console.trace()
  if (!isAsync) {
    Error.captureStackTrace(obj, stack);
  } else {
    obj.stack = stack;
  }
  const action = extract(obj.stack, isAsync);
  console.group(`%c @${name}/${action}`, 'color:#03A9F4');
  console.log('%c preState', 'color:#9E9E9E', lastState);
  // console.log('%c action', 'color:#03A9F4', action);
  console.log('%c nextState', 'color:#4CAF50', nextState);
  console.groupEnd();
}
