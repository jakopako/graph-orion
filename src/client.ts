import { IntegrationValidationError } from '@jupiterone/integration-sdk-core';
import { OrionAPIClient } from './solarwinds/client';

import { IntegrationConfig } from './config';
import { SolarwindsHostAgent, NetworkInterface } from './solarwinds/types';

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
      url: this.config.url,
      verifyCert: this.config.verifyCert,
    });
  }

  client: OrionAPIClient;

  public async verifyAuthentication(): Promise<void> {
    // TODO make the most light-weight request possible to validate
    // authentication works with the provided credentials, throw an err if
    // authentication fails
    try {
      await this.client.verifyAuthentication();
    } catch (err) {
      throw new IntegrationValidationError(
        `Failed to authenticate with the solarwinds API: ${err.message}`,
      );
    }
  }

  /**
   * Iterates each device resource in the provider.
   *
   * @param iteratee receives each resource to produce entities/relationships
   */
  public async iterateDevices(
    iteratee: ResourceIteratee<SolarwindsHostAgent>,
  ): Promise<void> {
    const devices = await this.client.fetchDevices();
    for (const device of devices) {
      await iteratee(device);
    }
  }

  /**
   * Iterates each network interface resource in the provider.
   *
   * @param iteratee receives each resource to produce entities/relationships
   */
  public async iterateNetworkInterfaces(
    iteratee: ResourceIteratee<NetworkInterface>,
  ): Promise<void> {
    const interfaces = await this.client.fetchNetworkInterfaces();
    // console.log(interfaces)
    for (const nInterface of interfaces) {
      await iteratee(nInterface);
    }
  }
}

export function createAPIClient(config: IntegrationConfig): APIClient {
  return new APIClient(config);
}
