import DataLoader from 'dataloader';
import { Context } from '../Context';
import { AnyZodObject, z } from 'zod';
import { ID } from './ID';
import { indexBy } from 'ramda';
import { Row, RowList } from 'postgres';

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

export function zParseById<ZObject extends AnyZodObject>({
  ZType,
  rows,
  requestedIds,
}: {
  ZType: ZObject;
  rows: RowList<Row[]>;
  requestedIds: readonly ID[];
}): (z.infer<ZObject> | null)[] {
  const byId: Record<ID, (typeof rows)[number]> = indexBy(
    (row) => row.id,
    rows,
  );
  return requestedIds.map((id) => {
    if (!byId[id]) {
      return null;
    }
    return ZType.parse(byId[id]);
  });
}
