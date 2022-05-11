import {
  RelationshipClass,
  StepEntityMetadata,
  StepRelationshipMetadata,
} from '@jupiterone/integration-sdk-core';

export const Steps = {
  HOST_AGENTS: 'fetch-host-agents',
  NETWORK_INTERFACES: 'fetch-network-interfaces',
  IP_ADDRESSES: 'fetch-ip-addresses',
};

export const Entities: Record<
  'NETWORK_INTERFACE' | 'HOST_AGENT' | 'IP_ADDRESS',
  StepEntityMetadata
> = {
  NETWORK_INTERFACE: {
    resourceName: 'Solarwinds Network Interface',
    _type: 'solarwinds_network_interface',
    _class: ['NetworkInterface'],
  },
  HOST_AGENT: {
    resourceName: 'Solarwinds Host Agent',
    _type: 'solarwinds_hostagent',
    _class: ['HostAgent'],
  },
  IP_ADDRESS: {
    resourceName: 'Solarwinds Ip Address',
    _type: 'solarwinds_ip_address',
    _class: ['IpAddress'],
  },
};

export const Relationships: Record<
  | 'HOST_AGENT_MONITORS_NETWORK_INTERFACE'
  | 'NETWORK_INTERFACE_HAS_IP_ADDRESS'
  | 'HOST_AGENT_MONITORS_IP_ADDRESS',
  StepRelationshipMetadata
> = {
  HOST_AGENT_MONITORS_NETWORK_INTERFACE: {
    _type: 'solarwinds_hostagent_monitors_network_interface',
    sourceType: Entities.HOST_AGENT._type,
    _class: RelationshipClass.MONITORS,
    targetType: Entities.NETWORK_INTERFACE._type,
  },
  NETWORK_INTERFACE_HAS_IP_ADDRESS: {
    _type: 'solarwinds_network_interface_has_ip_address',
    sourceType: Entities.NETWORK_INTERFACE._type,
    _class: RelationshipClass.HAS,
    targetType: Entities.IP_ADDRESS._type,
  },
  HOST_AGENT_MONITORS_IP_ADDRESS: {
    _type: 'solarwinds_hostagent_monitors_ip_address',
    sourceType: Entities.HOST_AGENT._type,
    _class: RelationshipClass.MONITORS,
    targetType: Entities.IP_ADDRESS._type,
  },
};
