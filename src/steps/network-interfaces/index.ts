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
import { createNetworkInterfaceEntity } from './converter';

export async function fetchNetworkInterfaces({
  instance,
  jobState,
}: IntegrationStepExecutionContext<IntegrationConfig>) {
  const apiClient = createAPIClient(instance.config);

  await apiClient.iterateNetworkInterfaces(async (nInterface) => {
    const NIEntity = await jobState.addEntity(
      createNetworkInterfaceEntity(nInterface),
    );

    const hostAgentEntity = await jobState.findEntity(
      createHostAgentEntityIdentifier(nInterface.hostname),
    );
    if (hostAgentEntity) {
      await jobState.addRelationship(
        createDirectRelationship({
          _class: RelationshipClass.MONITORS,
          from: hostAgentEntity,
          to: NIEntity,
        }),
      );
    }
  });
}

export const networkInterfacesSteps: IntegrationStep<IntegrationConfig>[] = [
  {
    id: Steps.NETWORK_INTERFACES,
    name: 'Fetch Network Interfaces',
    entities: [Entities.NETWORK_INTERFACE],
    relationships: [Relationships.HOST_AGENT_MONITORS_NETWORK_INTERFACE],
    dependsOn: [Steps.HOST_AGENTS],
    executionHandler: fetchNetworkInterfaces,
  },
];
