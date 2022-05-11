import {
  convertProperties,
  createIntegrationEntity,
  Entity,
} from '@jupiterone/integration-sdk-core';
import { IpAddress } from '../../solarwinds/types';
import { Entities } from '../constants';

export function createIpAddressEntityIdentifier(ip: IpAddress): string {
  return `ipaddress:${ip.hostname}:${ip.ipAddress}`;
}

export function createIpAddressEntity(ip: IpAddress): Entity {
  return createIntegrationEntity({
    entityData: {
      source: ip,
      assign: {
        ...convertProperties(ip),
        _key: createIpAddressEntityIdentifier(ip),
        _type: Entities.IP_ADDRESS._type,
        _class: Entities.IP_ADDRESS._class,
        name: ip.ipAddress,
      },
    },
  });
}
