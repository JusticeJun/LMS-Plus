export type Feed<T> = { status: 'ready' | 'pending' | 'loading' | 'error'; items: T[] };
export const pendingFeed = <T>(): Feed<T> => ({ status: 'pending', items: [] });
