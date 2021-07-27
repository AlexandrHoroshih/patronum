// @ts-nocheck
import { createEvent, createStore } from 'effector';
import { argumentHistory, wait } from '../test-library';
import { interval } from './index';

test('after timeout tick triggered only once', async () => {
  const start = createEvent();
  const stop = createEvent();
  const { tick } = interval({ timeout: 10, start, stop });
  const tickFn = watch(tick);

  expect(tickFn).not.toBeCalled();

  start();
  expect(tickFn).not.toBeCalled();

  await wait(10);
  expect(tickFn).toBeCalledTimes(1);

  stop();
});

test('triggers tick multiple times', async () => {
  const start = createEvent();
  const stop = createEvent();
  const { tick } = interval({ timeout: 10, start, stop });
  const tickFn = watch(tick);

  start();
  await wait(10);
  expect(tickFn).toBeCalledTimes(1);

  await wait(10);
  expect(tickFn).toBeCalledTimes(2);

  await wait(10);
  expect(tickFn).toBeCalledTimes(3);

  stop();
  await wait(20);
  expect(tickFn).toBeCalledTimes(3);
});

test('after stop interval do not triggers again', async () => {
  const start = createEvent();
  const stop = createEvent();
  const { tick } = interval({ timeout: 10, start, stop });
  const tickFn = watch(tick);

  start();
  await wait(10);
  expect(tickFn).toBeCalledTimes(1);

  stop();
  await wait(20);
  expect(tickFn).toBeCalledTimes(1);
});

test('after timeout tick triggered only once', async () => {
  const start = createEvent();
  const stop = createEvent();
  const { tick } = interval({ timeout: 10, leading: true, start, stop });
  const tickFn = watch(tick);

  expect(tickFn).not.toBeCalled();

  start();
  expect(tickFn).toBeCalled();

  await wait(10);
  expect(tickFn).toBeCalledTimes(2);

  stop();
});

test('timeout can be changed during execution (timeout will be changed in the next tick)', async () => {
  const start = createEvent();
  const stop = createEvent();
  const increment = createEvent();
  const $timeout = createStore(10).on(increment, (timeout) => timeout * 2);
  const { tick } = interval({ timeout: $timeout, start, stop });
  const tickFn = watch(tick);

  start();
  await wait(10);
  expect(tickFn).toBeCalledTimes(1);

  increment(); // timeout will be changed in the next tick
  await wait(10);
  expect(tickFn).toBeCalledTimes(2);

  await wait(10); // $timeout now is 20ms
  expect(tickFn).toBeCalledTimes(2); // not ticked yet

  await wait(10);
  expect(tickFn).toBeCalledTimes(3); // ticked

  stop();
});

test('opened should be true on pending interval', async () => {
  const start = createEvent();
  const stop = createEvent();
  const { opened } = interval({ timeout: 10, start, stop });
  const openedFn = watch(opened);

  expect(argumentHistory(openedFn)).toMatchInlineSnapshot(`
    Array [
      false,
    ]
  `);

  start();
  await wait(10);
  expect(argumentHistory(openedFn)).toMatchInlineSnapshot(`
    Array [
      false,
      true,
    ]
  `);

  await wait(20);
  expect(argumentHistory(openedFn)).toMatchInlineSnapshot(`
    Array [
      false,
      true,
    ]
  `);

  stop();
  await wait(20);
  expect(argumentHistory(openedFn)).toMatchInlineSnapshot(`
    Array [
      false,
      true,
      false,
    ]
  `);
});

/** Triggers fn on effect start */
function watch<T>(unit: Event<T> | Store<T> | Effect<T, any, any>) {
  const fn = jest.fn();
  unit.watch(fn);
  return fn;
}
