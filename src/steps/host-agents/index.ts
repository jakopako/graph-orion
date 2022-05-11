import {
  IntegrationStep,
  IntegrationStepExecutionContext,
} from '@jupiterone/integration-sdk-core';
import { createAPIClient } from '../../client';

import { IntegrationConfig } from '../../config';
import { Steps, Entities } from '../constants';
import { createHostAgentEntity } from './converter';

export async function fetchHostAgents({
  instance,
  jobState,
}: IntegrationStepExecutionContext<IntegrationConfig>) {
  const apiClient = createAPIClient(instance.config);

  await apiClient.iterateHostAgents(async (device) => {
    await jobState.addEntity(createHostAgentEntity(device));
  });
}
export const hostAgentSteps: IntegrationStep<IntegrationConfig>[] = [
  {
    id: Steps.HOST_AGENTS,
    name: 'Fetch Host Agents',
    entities: [Entities.HOST_AGENT],
    relationships: [],
    dependsOn: [],
    executionHandler: fetchHostAgents,
  },
];
