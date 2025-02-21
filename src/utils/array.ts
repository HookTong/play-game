/**
 * 从给定数组中随机取元素
 * @param source 可选值
 */
export function randomTakeEle<T = any>(source: T[]) {
  return source[Math.floor(Math.random() * source.length)];
}

/**
 * 以2为底的对数取元素
 * @param num 数字
 * @param source 可选值
 * @param zoneVal num为0时返回的值(0无法取对数)
 */
export function log2TakeEle<T = any>(num: number, source: T[], zoneVal?: T) {
  if (num === 0) return zoneVal;
  const index = Math.floor(Math.log2(Math.abs(num))) - 1;
  return index < source.length ? source[index] : source[source.length - 1];
}
