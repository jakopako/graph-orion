import {
  convertProperties,
  createIntegrationEntity,
  Entity,
} from '@jupiterone/integration-sdk-core';
import { NetworkInterface } from '../../solarwinds/types';

import { Entities } from '../constants';

export function createNetworkInterfaceEntityIdentifier(
  networkInterface: NetworkInterface,
): string {
  const id = `${networkInterface.hostname}:${networkInterface.interfaceIndex}`;
  return id;
}

export function createNetworkInterfaceEntity(
  networkInterface: NetworkInterface,
): Entity {
  const name = networkInterface.interfaceName;
  return createIntegrationEntity({
    entityData: {
      source: networkInterface,
      assign: {
        ...convertProperties(networkInterface),
        _key: createNetworkInterfaceEntityIdentifier(networkInterface),
        _type: Entities.NETWORK_INTERFACE._type,
        _class: Entities.NETWORK_INTERFACE._class,
        name,
        displayName: name,
      },
    },
  });
}
