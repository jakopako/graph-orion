import {
  IntegrationExecutionContext,
  IntegrationValidationError,
  IntegrationInstanceConfigFieldMap,
  IntegrationInstanceConfig,
} from '@jupiterone/integration-sdk-core';
import { createAPIClient } from './client';

/**
 * A type describing the configuration fields required to execute the
 * integration for a specific account in the data provider.
 *
 * When executing the integration in a development environment, these values may
 * be provided in a `.env` file with environment variables. For example:
 *
 * - `CLIENT_ID=123` becomes `instance.config.clientId = '123'`
 * - `CLIENT_SECRET=abc` becomes `instance.config.clientSecret = 'abc'`
 *
 * Environment variables are NOT used when the integration is executing in a
 * managed environment. For example, in JupiterOne, users configure
 * `instance.config` in a UI.
 */
export const instanceConfigFields: IntegrationInstanceConfigFieldMap = {
  username: {
    type: 'string',
  },
  password: {
    type: 'string',
    mask: true,
  },
  url: {
    type: 'string',
  },
  verifyCert: {
    type: 'boolean',
  },
};

/**
 * Properties provided by the `IntegrationInstance.config`. This reflects the
 * same properties defined by `instanceConfigFields`.
 */
export interface IntegrationConfig extends IntegrationInstanceConfig {
  username: string;
  password: string;
  url: string;
  verifyCert: boolean;
}

export async function validateInvocation(
  context: IntegrationExecutionContext<IntegrationConfig>,
) {
  const { config } = context.instance;

  if (!config.username || !config.password || !config.url) {
    throw new IntegrationValidationError(
      'Config requires all of {username, password, url}',
    );
  }

  const apiClient = createAPIClient(config);
  await apiClient.verifyAuthentication();
}
