import {
  RelationshipClass,
  // RelationshipClass,
  StepEntityMetadata,
  StepRelationshipMetadata,
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

export const Relationships: Record<
  'HOST_AGENT_MONITORS_NETWORK_INTERFACE',
  StepRelationshipMetadata
> = {
  HOST_AGENT_MONITORS_NETWORK_INTERFACE: {
    _type: 'solarwinds_hostagent_monitors_network_interface',
    sourceType: Entities.HOST_AGENT._type,
    _class: RelationshipClass.MONITORS,
    targetType: Entities.NETWORK_INTERFACE._type,
  },
};
