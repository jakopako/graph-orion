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

// note that this interface does not really correspond to
// https://github.com/JupiterOne/data-model/blob/main/src/schemas/IpAddress.json
// but is adapted to fit our purpose
export interface IpAddress {
  hostname: string; // we use hostname instead of dnsName because our solarwinds data points don't always have a dnsName set.
  ipAddress: string;
  ipVersion: number;
  subnetMask: string;
}

export interface OrionIpAddress {
  hostname: string; // we use hostname instead of dnsName because our solarwinds data points don't always have a dnsName set.
  ipAddress: string;
  ipAddressType: string;
  subnetMask: string;
}
