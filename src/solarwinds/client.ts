import {
  SolarwindsHostAgent,
  NetworkInterface,
  IpAddress,
  OrionIpAddress,
} from './types';
import fetch, { RequestInit } from 'node-fetch';
import { IntegrationProviderAPIError } from '@jupiterone/integration-sdk-core';
import path from 'path';
import { URL } from 'url';

interface CreateOrionClientParams {
  username: string;
  password: string;
  url: string;
}

export class OrionAPIClient {
  private readonly username: string;
  private readonly password: string;
  private readonly url: string;

  constructor(options: CreateOrionClientParams) {
    this.username = options.username;
    this.password = options.password;
    this.url = new URL(
      path.join(options.url, '/Solarwinds/InformationService/V3/Json/Query'),
    ).toString();
  }

  private filterNetworkInterfaces(nis: NetworkInterface[]): NetworkInterface[] {
    // a hack
    // there doesn't seem to be a 1:1 mapping interface -> ipAddress
    // at least I couldn't find one
    // also, mac addresses don't seem to be unique?? related to layer 2 virtual lan?
    // so we use dnsName + interfaceName as uID
    // resources:
    // http://solarwinds.github.io/OrionSDK/2020.2/schema/Orion.Nodes.html
    // http://solarwinds.github.io/OrionSDK/2020.2/schema/Orion.NodeIPAddresses.html
    // http://solarwinds.github.io/OrionSDK/2020.2/schema/Orion.NPM.Interfaces.html
    //
    // Another note: macAddress is stored like so: 6C8BD30FFB6B and not 6c:8b:d3:0f:fb:6b
    // we can't change it here because the macAddress property of the NetworkInterface
    // has format 'hostname', see https://github.com/JupiterOne/data-model/blob/main/src/schemas/NetworkInterface.json
    const uIDSet: Set<string> = new Set();
    const newList: NetworkInterface[] = [];
    for (const nInterface of nis) {
      if (nInterface.hostname != '') {
        if (nInterface.macAddress == '') {
          nInterface.macAddress = 'unknown';
        }
        const uID = nInterface.hostname + nInterface.interfaceName;
        if (!uIDSet.has(uID)) {
          uIDSet.add(uID);
          newList.push(nInterface);
        }
      }
    }
    return newList;
  }

  private filterSolarwindsHostAgents(
    swa: SolarwindsHostAgent[],
  ): SolarwindsHostAgent[] {
    const newList: SolarwindsHostAgent[] = [];
    const hostnameSet: Set<string> = new Set();
    for (const ha of swa) {
      if (ha.hostname != '') {
        if (!hostnameSet.has(ha.hostname)) {
          hostnameSet.add(ha.hostname);
          newList.push(ha);
        }
      }
    }
    return newList;
  }

  private getIPVersionFromString(ipVersion: string): number {
    switch (ipVersion) {
      case 'IPv4':
        return 4;
      case 'IPv6':
        return 6;
      default:
        return 4;
    }
  }

  private filterOrionIpAddresses(oia: OrionIpAddress[]): IpAddress[] {
    const newList: IpAddress[] = [];
    for (const oip of oia) {
      if (oip.hostname != '' && oip.subnetMask != '') {
        const ipAddress: IpAddress = {
          ipAddress: oip.ipAddress,
          subnetMask: oip.subnetMask,
          ipVersion: this.getIPVersionFromString(oip.ipAddressType),
          hostname: oip.hostname,
        };
        newList.push(ipAddress);
      }
    }
    return newList;
  }

  private async query<
    OrionResponse extends
      | SolarwindsHostAgent[]
      | NetworkInterface[]
      | OrionIpAddress[],
  >(query: string): Promise<OrionResponse> {
    const postBody: any = {
      query: query,
      parameters: {},
    };
    const options: RequestInit = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization:
          'Basic ' +
          Buffer.from(`${this.username}:${this.password}`).toString('base64'),
      },
      body: JSON.stringify(postBody),
    };

    const response = await fetch(this.url, options);

    if (response.status === 200) {
      const items = await response.json();

      return items['results'] as OrionResponse;
    } else {
      throw new IntegrationProviderAPIError({
        endpoint: this.url,
        statusText: response.statusText,
        status: response.status,
      });
    }
  }

  public async fetchHostAgents(): Promise<SolarwindsHostAgent[]> {
    const query =
      'SELECT n.DNS as dnsName, n.SysName as hostname, n.Vendor as vendor, n.Description as description, n.NodeDescription as nodeDescription FROM Orion.Nodes n';
    const hostAgents = await this.query<SolarwindsHostAgent[]>(query);
    return this.filterSolarwindsHostAgents(hostAgents);
  }

  public async fetchNetworkInterfaces(): Promise<NetworkInterface[]> {
    const query =
      'SELECT n.SysName as hostname, n.Interfaces.Index as interfaceIndex, n.Interfaces.MAC as macAddress, n.Interfaces.Name as interfaceName, n.Interfaces.Caption as interfaceDescription, n.Interfaces.TypeDescription as interfaceType, i.IPAddress as ipAddress, i.SubnetMask as subnetMask FROM Orion.Nodes n LEFT JOIN Orion.NodeIPAddresses i ON i.InterfaceIndex = n.Interfaces.Index AND i.NodeID = n.NodeID WHERE n.Interfaces.Index IS NOT NULL';
    const interfaces = await this.query<NetworkInterface[]>(query);
    return this.filterNetworkInterfaces(interfaces);
  }

  public async fetchIpAddresses(): Promise<IpAddress[]> {
    const query =
      "SELECT n.SysName as hostname, i.IPAddress as ipAddress, i.SubnetMask as subnetMask, i.IPAddressType as ipAddressType FROM Orion.Nodes n LEFT JOIN Orion.NodeIPAddresses i ON i.NodeID = n.NodeID WHERE ipAddressType = 'IPv4'";
    const ipAddresses = await this.query<OrionIpAddress[]>(query);
    return this.filterOrionIpAddresses(ipAddresses);
  }

  public async verifyAuthentication(): Promise<void> {
    const query = 'SELECT IPAddress FROM Orion.Nodes';
    await this.query(query);
  }
}
