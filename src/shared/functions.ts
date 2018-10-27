export function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function random(len: number) {
  return Math.random().toString(36).substr(2, len);
}