import type { MochaUser } from '@getmocha/users-service/shared';

export interface Bindings extends Omit<Env, 'DEMO_MODE' | 'OPENAI_API_KEY' | 'MOCHA_USERS_SERVICE_API_URL' | 'MOCHA_USERS_SERVICE_API_KEY'> {
  DEMO_MODE?: string;
  OPENAI_API_KEY?: string;
  MOCHA_USERS_SERVICE_API_URL?: string;
  MOCHA_USERS_SERVICE_API_KEY?: string;
}
export type AppEnv = { Bindings: Bindings; Variables: { user: MochaUser } };
