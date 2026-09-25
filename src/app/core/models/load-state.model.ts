export type LoadState = 'idle' | 'loading' | 'success' | 'empty' | 'error';

export interface LoadStateSnapshot<T> {
  readonly state: LoadState;
  readonly data: T;
  readonly errorMessage: string | null;
}
