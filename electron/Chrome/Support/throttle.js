export default function throttle(type, name, obj) {
  let running = false;
  obj.addEventListener(type, () => {
    if (running) {
      return;
    }
    running = true;

    requestAnimationFrame(() => {
      obj.dispatchEvent(new CustomEvent(name));
      running = false;
    });
  });
}
