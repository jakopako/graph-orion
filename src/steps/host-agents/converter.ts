import {
  convertProperties,
  createIntegrationEntity,
  Entity,
} from '@jupiterone/integration-sdk-core';
import { SolarwindsHostAgent } from '../../solarwinds/types';
import { Entities } from '../constants';
import crypto from 'crypto';

export function createHostAgentEntityIdentifier(hostname: string): string {
  return `device:${hostname}:${crypto
    .createHash('md5')
    .update(hostname)
    .digest('hex')}`;
}

export function createHostAgentEntity(swa: SolarwindsHostAgent): Entity {
  const name = swa.hostname;
  return createIntegrationEntity({
    entityData: {
      source: swa,
      assign: {
        ...convertProperties(swa),
        _key: createHostAgentEntityIdentifier(swa.hostname),
        _type: Entities.HOST_AGENT._type,
        _class: Entities.HOST_AGENT._class,
        name,
        displayName: name,
        function: ['activity-monitor'],
      },
    },
  });
}
