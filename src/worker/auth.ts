import type { MiddlewareHandler } from 'hono';
import { authMiddleware, MOCHA_SESSION_TOKEN_COOKIE_NAME } from '@getmocha/users-service/backend';
import { getCookie } from 'hono/cookie';
import type { AppEnv, Bindings } from './env';

export function isLocalDemo(env: Bindings, requestUrl: string) {
  const hostname = new URL(requestUrl).hostname;
  return env.DEMO_MODE === 'true' && ['localhost', '127.0.0.1', '[::1]'].includes(hostname);
}
export const hasAuthConfiguration = (env: Bindings) =>
  Boolean(env.MOCHA_USERS_SERVICE_API_KEY && env.MOCHA_USERS_SERVICE_API_URL);

export const requireUser: MiddlewareHandler<AppEnv> = async (c, next) => {
  if (isLocalDemo(c.env, c.req.url)) {
    if (getCookie(c, MOCHA_SESSION_TOKEN_COOKIE_NAME) !== 'dev-session-token') {
      return c.json({ error: 'Sign in to continue.' }, 401);
    }
    const now = new Date().toISOString();
    c.set('user', {
      id: 'local-demo-user', email: 'demo@habitflow.local', google_sub: 'local-demo',
      google_user_data: { email: 'demo@habitflow.local', email_verified: true, name: 'Local Demo', picture: null, sub: 'local-demo' },
      last_signed_in_at: now, created_at: now, updated_at: now,
    });
    await next();
    return;
  }
  if (!hasAuthConfiguration(c.env)) return c.json({ error: 'Authentication is not configured.' }, 503);
  return authMiddleware(c, next);
};
