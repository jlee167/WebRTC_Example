// Logs an action (text) and the time when it happened on the console.
export function trace(text: String) {
  text = text.trim();
  const now = (window.performance.now() / 1000).toFixed(3);
  console.log(now, text);
}