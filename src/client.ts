import { IntegrationValidationError } from '@jupiterone/integration-sdk-core';
import { OrionAPIClient } from './solarwinds/client';

import { IntegrationConfig } from './config';
import {
  SolarwindsHostAgent,
  NetworkInterface,
  IpAddress,
} from './solarwinds/types';

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
  public async iterateHostAgents(
    iteratee: ResourceIteratee<SolarwindsHostAgent>,
  ): Promise<void> {
    const hostAgents = await this.client.fetchHostAgents();
    for (const hostAgent of hostAgents) {
      await iteratee(hostAgent);
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
    for (const nInterface of interfaces) {
      await iteratee(nInterface);
    }
  }

  public async iterateIpAddresses(
    iteratee: ResourceIteratee<IpAddress>,
  ): Promise<void> {
    const ipAddresses = await this.client.fetchIpAddresses();
    for (const nIpAddress of ipAddresses) {
      await iteratee(nIpAddress);
    }
  }
}

export function createAPIClient(config: IntegrationConfig): APIClient {
  return new APIClient(config);
}
