import DataLoader from 'dataloader';
import { Context } from '../Context';
import { AnyZodObject, ZodAny, ZodNullableDef, ZodType, z } from 'zod';
import { ID } from './ID';
import { groupBy, indexBy } from 'ramda';
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

export function zParseById<Z extends ZodType>({
  ZType,
  rows,
  requestedIds,
  id = 'id',
}: {
  ZType: Z;
  rows: RowList<Row[]>;
  requestedIds: readonly ID[];
  id?: string;
}): z.infer<Z>[] {
  const byId: Record<ID, (typeof rows)[number]> = indexBy(
    (row) => row[id],
    rows,
  );
  return requestedIds.map((id) => ZType.parse(byId[id]));
}

export function zParseGroupById<Z extends ZodType>({
  id,
  ZType,
  rows,
  requestedIds,
}: {
  ZType: Z;
  rows: RowList<Row[]>;
  requestedIds: readonly ID[];
  id: string;
}): z.infer<Z>[][] {
  const groupsById = groupBy((row) => row[id], rows);
  return requestedIds.map((id) => {
    const rowGroup = groupsById[id];
    if (!rowGroup) {
      return [];
    }
    return rowGroup.map((row) => ZType.parse(row));
  });
}
