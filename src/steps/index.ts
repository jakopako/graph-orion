import { networkInterfacesSteps } from './network-interfaces';
import { hostAgentSteps } from './host-agents';
import { ipAddressesSteps } from './ip-addresses';

const integrationSteps = [
  ...hostAgentSteps,
  ...networkInterfacesSteps,
  ...ipAddressesSteps,
];

export { integrationSteps };
