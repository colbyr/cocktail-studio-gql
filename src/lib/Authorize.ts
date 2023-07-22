import { Context, ContextAuthenticated } from '../Context';

export function requireAuth(
  _root: unknown,
  _args: unknown,
  context: Context,
): context is ContextAuthenticated {
  return context.userId !== null && context.token !== null;
}
