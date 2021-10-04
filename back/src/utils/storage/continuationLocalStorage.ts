import cls from 'cls-hooked';
import EventEmitter from 'events';
import type { ParameterizedContext } from 'koa';

export interface ContinuationLocalStorage<T> {
  get(): T | undefined;
  set(
    data: T,
    context: ParameterizedContext<object>,
    next: () => Promise<void>,
  ): Promise<void>;
  bindEmitter(emitter: EventEmitter): void;
}

export function buildContinuationLocalStorage<T>({
  storeKey,
}: {
  storeKey: string;
}): ContinuationLocalStorage<T> {
  const store = cls.createNamespace(storeKey);

  // see https://medium.com/@evgeni.kisel/add-correlation-id-in-node-js-applications-fde759eed5e3
  const rebindOnFinished = (container: any): void => {
    if (container.__onFinished) {
      // __onFinished is used by package (on-finished) that are used by Koa
      // itself (Application.handleRequest) to run tasks once response ended
      // lib creates 1 field to store all on finish listeners in queue
      container.__onFinished = store.bind(container.__onFinished);
    }
  };

  return {
    get(): T | undefined {
      return store.get(storeKey);
    },
    // FIXME: find a way to not couple it to Koa context
    set(
      data: T,
      context: ParameterizedContext<object>,
      next: () => Promise<void>,
    ): Promise<void> {
      return new Promise((resolve, reject) => {
        store.run(() => {
          store.set(storeKey, data);
          rebindOnFinished(context.res);
          next().then(resolve).catch(reject);
        });
      });
    },
    bindEmitter(emitter: EventEmitter): void {
      store.bindEmitter(emitter);
    },
  };
}
