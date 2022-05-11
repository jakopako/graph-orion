import {
  convertProperties,
  createIntegrationEntity,
  Entity,
} from '@jupiterone/integration-sdk-core';
import { IpAddress } from '../../solarwinds/types';
import { Entities } from '../constants';

export function createIpAddressEntityIdentifier(ip: IpAddress): string {
  const id = `ipaddress:${ip.hostname}:${ip.ipAddress}`;
  return id;
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
