import { SolarwindsHostAgent, NetworkInterface } from './types';
import fetch, { RequestInit } from 'node-fetch';
import { IntegrationProviderAPIError } from '@jupiterone/integration-sdk-core';

// work around
// https://bobbyhadz.com/blog/javascript-error-err-require-esm-of-es-module-node-fetch
// const fetch = (url: RequestInfo, init?: RequestInit) =>
//   import('node-fetch').then(({ default: fetch }) => fetch(url, init));

interface CreateOrionClientParams {
  username: string;
  password: string;
  url: string;
  verifyCert: boolean;
}

export class OrionAPIClient {
  private readonly username: string;
  private readonly password: string;
  private readonly url: string;

  constructor(options: CreateOrionClientParams) {
    this.username = options.username;
    this.password = options.password;
    this.url = options.url + 'Solarwinds/InformationService/V3/Json/Query';
    if (!options.verifyCert) {
      process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
    }
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
    const uIDSet: Set<string> = new Set();
    const newList: NetworkInterface[] = [];
    for (const nInterface of nis) {
      if (nInterface.hostname != '' && nInterface.macAddress != '') {
        const uID = nInterface.hostname + nInterface.interfaceName;
        if (!uIDSet.has(uID)) {
          // console.log(nInterface);
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

  private async query<
    OrionResponse extends SolarwindsHostAgent[] | NetworkInterface[],
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

  public async fetchDevices(): Promise<SolarwindsHostAgent[]> {
    try {
      const query =
        'SELECT n.DNS as dnsName, n.SysName as hostname, n.Vendor as vendor, n.Description as description, n.NodeDescription as nodeDescription FROM Orion.Nodes n';
      const devices = await this.query<SolarwindsHostAgent[]>(query);
      return this.filterSolarwindsHostAgents(devices);
    } catch (err) {
      throw err;
    }
  }

  public async fetchNetworkInterfaces(): Promise<NetworkInterface[]> {
    try {
      const query =
        'SELECT n.SysName as hostname, n.Interfaces.Index as interfaceIndex, n.Interfaces.MAC as macAddress, n.Interfaces.Name as interfaceName, i.IPAddress as ipAddress, i.SubnetMask as subnetMask FROM Orion.Nodes n JOIN Orion.NodeIPAddresses i ON i.InterfaceIndex = n.Interfaces.Index AND i.NodeID = n.NodeID';
      const interfaces = await this.query<NetworkInterface[]>(query);
      // console.log(interfaces)
      return this.filterNetworkInterfaces(interfaces);
    } catch (err) {
      throw err;
    }
  }

  public async verifyAuthentication(): Promise<void> {
    try {
      const query = 'SELECT IPAddress FROM Orion.Nodes';
      await this.query(query);
    } catch (err) {
      throw err;
    }
  }
}
