export interface SolarwindsHostAgent {
  hostname: string;
  dnsName: string;
  vendor: string;
  description: string;
  nodeDescription: string;
  function: string;
}

export interface NetworkInterface {
  hostname: string;
  interfaceIndex: number;
  interfaceName: string;
  interfaceDescription: string;
  interfaceType: string;
  macAddress: string;
  ipAddress: string;
  subnetMask: string;
}
