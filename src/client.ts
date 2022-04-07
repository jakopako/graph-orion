import http from 'http';

import { IntegrationProviderAuthenticationError } from '@jupiterone/integration-sdk-core';
import { OrionAPIClient } from './solarwinds/client';

import { IntegrationConfig } from './config';
import { AcmeUser, AcmeGroup } from './types';
import { Device } from './solarwinds/types';

export type ResourceIteratee<T> = (each: T) => Promise<void> | void;

/**
 * An APIClient maintains authentication state and provides an interface to
 * third party data APIs.
 *
 * It is recommended that integrations wrap provider data APIs to provide a
 * place to handle error responses and implement common patterns for iterating
 * resources.
 */
export class APIClient {
  constructor(readonly config: IntegrationConfig) {
    this.client = new OrionAPIClient({
      username: this.config.username,
      password: this.config.password,
    });
  }

  client: OrionAPIClient;

  public async verifyAuthentication(): Promise<void> {
    // TODO make the most light-weight request possible to validate
    // authentication works with the provided credentials, throw an err if
    // authentication fails
    const request = new Promise<void>((resolve, reject) => {
      http.get(
        {
          hostname: 'localhost',
          port: 443,
          path: '/api/v1/some/endpoint?limit=1',
          agent: false,
          timeout: 10,
        },
        (res) => {
          if (res.statusCode !== 200) {
            reject(new Error('Provider authentication failed'));
          } else {
            resolve();
          }
        },
      );
    });

    try {
      await request;
    } catch (err) {
      throw new IntegrationProviderAuthenticationError({
        cause: err,
        endpoint: 'https://localhost/api/v1/some/endpoint?limit=1',
        status: err.status,
        statusText: err.statusText,
      });
    }
  }

  /**
   * Iterates each device resource in the provider.
   *
   * @param iteratee receives each resource to produce entities/relationships
   */
  public async iterateDevices(
    iteratee: ResourceIteratee<Device>,
  ): Promise<void> {
    const devices = await this.client.fetchDevices();
    for (const device of devices) {
      await iteratee(device);
    }
  }
}

export function createAPIClient(config: IntegrationConfig): APIClient {
  return new APIClient(config);
}
