import {
  convertProperties,
  createIntegrationEntity,
  Entity,
} from '@jupiterone/integration-sdk-core';
import { NetworkInterface } from '../../solarwinds/types';

import { Entities } from '../constants';

export function createNetworkInterfaceEntityIdentifier(
  hostname: string,
  ipAddress: string,
  interfaceIndex: number,
): string {
  // the reason why we do not only rely on hostname and ip address is
  // that sometimes the ip address is null which leads to duplicate ids
  // when there are multiple interfaces without ip address for the same
  // host. We could only rely on hostname + interfaceIndex however, for
  // the link between IpAddresses and NetworkInterfaces
  // (= NETWORK_INTERFACE_HAS_IP_ADDRESS) we need to be able to find
  // network interface IDs by hostname and ip address only.
  var id: string;
  if (ipAddress == undefined) {
    id = `network-interface:${hostname}:${interfaceIndex}`;
  } else {
    id = `network-interface:${hostname}:${ipAddress}`;
  }
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
        _key: createNetworkInterfaceEntityIdentifier(
          networkInterface.hostname,
          networkInterface.ipAddress,
          networkInterface.interfaceIndex,
        ),
        _type: Entities.NETWORK_INTERFACE._type,
        _class: Entities.NETWORK_INTERFACE._class,
        name,
        displayName: name,
      },
    },
  });
}
