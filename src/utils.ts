export const debounce = (func: Function, delayMs: number) => {
  let timeoutId: number | undefined;

  return (...args: any[]) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      func(...args);
    }, delayMs);
  };
};
