import {
  IntegrationStep,
  IntegrationStepExecutionContext,
} from '@jupiterone/integration-sdk-core';
import { createAPIClient } from '../../client';

import { IntegrationConfig } from '../../config';
import { Steps, Entities } from '../constants';
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
  });
}
export const networkInterfacesSteps: IntegrationStep<IntegrationConfig>[] = [
  {
    id: Steps.NETWORK_INTERFACES,
    name: 'Fetch Network Interfaces',
    entities: [Entities.NETWORK_INTERFACE],
    relationships: [],
    dependsOn: [Steps.DEVICES],
    executionHandler: fetchNetworkInterfaces,
  },
];
