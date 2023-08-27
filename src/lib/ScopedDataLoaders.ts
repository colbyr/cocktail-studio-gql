import DataLoader from 'dataloader';
import { Context, context } from '../Context';

export class ScopedDataLoaders<
  Loaders extends Record<string, DataLoader<unknown, unknown, unknown>>,
> {
  private _makeLoaders: (context: Context) => Loaders;

  constructor(makeLoaders: (context: Context) => Loaders) {
    this._makeLoaders = makeLoaders;
  }

  makeLoaders(context: Context): Loaders {
    return this._makeLoaders(context);
  }
}
