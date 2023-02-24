export const debounce = (func: Function, delayMs: number) => {
  let timeoutId: null | ReturnType<typeof setTimeout> = null;

  return (...args: any[]) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      func(...args);
    }, delayMs);
  };
};
