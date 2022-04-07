export interface Device {
  device_id: string;
  type: string;
  hostname: string;
}

export interface NetworkInterface {
  hostname: string;
  interfaceName: string;
  macAddress: string;
  address: string;
  gatewayAddress?: string;
}
