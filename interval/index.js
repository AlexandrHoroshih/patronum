const {
  createEffect,
  createStore,
  createEvent,
  sample,
  forward,
  guard,
  is,
} = require('effector');

function interval({ timeout, start, stop, leading = false, trailing = false }) {
  const tick = createEvent();
  const $timeout = toStoreNumber(timeout);
  const $opened = createStore(false);

  let timeoutId;

  const timeoutFx = createEffect((timeout) => {
    return new Promise((resolve) => {
      timeoutId = setTimeout(resolve, timeout);
    });
  });

  const cleanupFx = createEffect(() => {
    clearTimeout(timeoutId);
  });

  $opened.on(start, () => true);

  sample({
    clock: start,
    source: $timeout,
    target: timeoutFx,
  });

  if (leading) forward({ from: start, to: tick });

  guard({
    clock: timeoutFx.done,
    filter: $opened,
    source: $timeout,
    target: timeoutFx,
  });

  sample({
    clock: timeoutFx.done,
    fn: () => {},
    target: tick,
  });

  if (stop) {
    if (trailing) forward({ from: stop, to: tick });
    $opened.on(stop, () => false);
    forward({ from: stop, to: cleanupFx });
  }

  return { tick, opened: $opened };
}

module.exports = { interval };

function toStoreNumber(value) {
  if (is.store(value)) return value;
  if (typeof value === 'number') {
    if (!Number.isFinite(value) || value < 0) {
      throw new TypeError(
        `timeout parameter in interval method should be positive number or zero. '${value}' was passed`,
      );
    }
    return createStore(value);
  }
  throw new TypeError(
    `timeout parameter in interval method should be number or Store. "${typeof value}" was passed`,
  );
}
