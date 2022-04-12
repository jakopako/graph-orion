import { networkInterfacesSteps } from './network-interfaces';
import { devicesSteps } from './devices';

const integrationSteps = [...devicesSteps, ...networkInterfacesSteps];

export { integrationSteps };
