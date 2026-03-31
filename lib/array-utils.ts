/**
 * Safe array operations to prevent stack overflow with large arrays
 *
 * Math.max(...array) and Math.min(...array) use spread operator which can cause
 * stack overflow with arrays >100k items. Use these safe iterative versions instead.
 */

/**
 * Safe Math.max for large arrays (prevents stack overflow)
 * Use this instead of Math.max(...array) for arrays with 100k+ items
 *
 * @param arr - Array of numbers
 * @returns Maximum value in array, or 0 if array is empty
 */
export function safeArrayMax(arr: number[]): number {
  if (arr.length === 0) return 0
  let max = arr[0]
  for (let i = 1; i < arr.length; i++) {
    if (arr[i] > max) max = arr[i]
  }
  return max
}

/**
 * Safe Math.min for large arrays (prevents stack overflow)
 * Use this instead of Math.min(...array) for arrays with 100k+ items
 *
 * @param arr - Array of numbers
 * @returns Minimum value in array, or 0 if array is empty
 */
export function safeArrayMin(arr: number[]): number {
  if (arr.length === 0) return 0
  let min = arr[0]
  for (let i = 1; i < arr.length; i++) {
    if (arr[i] < min) min = arr[i]
  }
  return min
}
