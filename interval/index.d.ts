import { Event, Store } from 'effector';

export function interval(config: {
  timeout: number | Store<number>;
  leading?: boolean;
  trailing?: boolean;
  start: Event<void>;
  stop?: Event<void>;
}): { tick: Event<void>; opened: Store<boolean> };
