export async function asyncForEach<T>(
  array: T[],
  callback: (value: T, index: number, array: T[]) => Promise<void>,
): Promise<void> {
  for (let index = 0; index < array.length; index++) {
    const value = array[index];
    if (value !== undefined) {
      await callback(value, index, array);
    }
  }
}
