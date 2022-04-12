import {
  // RelationshipClass,
  StepEntityMetadata,
  // StepRelationshipMetadata,
} from '@jupiterone/integration-sdk-core';

export const Steps = {
  DEVICES: 'fetch-devices',
  NETWORK_INTERFACES: 'fetch-network-interfaces',
};

export const Entities: Record<
  'NETWORK_INTERFACE' | 'HOST_AGENT',
  StepEntityMetadata
> = {
  NETWORK_INTERFACE: {
    resourceName: 'Solarwinds Network Interface',
    _type: 'solarwinds_network_interface',
    _class: ['NetworkInterface'],
  },
  HOST_AGENT: {
    resourceName: 'Solarwinds Device',
    _type: 'solarwinds_hostagent',
    _class: ['HostAgent'],
  },
};
