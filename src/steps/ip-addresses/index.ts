import {
  createDirectRelationship,
  IntegrationStep,
  IntegrationStepExecutionContext,
  RelationshipClass,
} from '@jupiterone/integration-sdk-core';
import { createAPIClient } from '../../client';

import { IntegrationConfig } from '../../config';
import { Steps, Entities, Relationships } from '../constants';
import { createHostAgentEntityIdentifier } from '../host-agents/converter';
import { createNetworkInterfaceEntityIdentifier } from '../network-interfaces/converter';
import { createIpAddressEntity } from './converter';

export async function fetchIpAddresses({
  instance,
  jobState,
}: IntegrationStepExecutionContext<IntegrationConfig>) {
  const apiClient = createAPIClient(instance.config);

  await apiClient.iterateIpAddresses(async (ipAddress) => {
    const IAEntity = await jobState.addEntity(createIpAddressEntity(ipAddress));

    const NIEntity = await jobState.findEntity(
      createNetworkInterfaceEntityIdentifier(
        ipAddress.hostname,
        ipAddress.ipAddress,
        0,
      ),
    );
    if (NIEntity) {
      await jobState.addRelationship(
        createDirectRelationship({
          _class: RelationshipClass.HAS,
          from: NIEntity,
          to: IAEntity,
        }),
      );
    }
    const hostAgentEntity = await jobState.findEntity(
      createHostAgentEntityIdentifier(ipAddress.hostname),
    );
    if (hostAgentEntity) {
      await jobState.addRelationship(
        createDirectRelationship({
          _class: RelationshipClass.MONITORS,
          from: hostAgentEntity,
          to: IAEntity,
        }),
      );
    }
  });
}

export const ipAddressesSteps: IntegrationStep<IntegrationConfig>[] = [
  {
    id: Steps.IP_ADDRESSES,
    name: 'Fetch IP addresses',
    entities: [Entities.IP_ADDRESS],
    relationships: [
      Relationships.NETWORK_INTERFACE_HAS_IP_ADDRESS,
      Relationships.HOST_AGENT_MONITORS_IP_ADDRESS,
    ],
    dependsOn: [Steps.NETWORK_INTERFACES, Steps.HOST_AGENTS],
    executionHandler: fetchIpAddresses,
  },
];
