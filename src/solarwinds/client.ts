import { Device } from './types';
import fetch, { RequestInit } from 'node-fetch';
import { IntegrationProviderAPIError } from '@jupiterone/integration-sdk-core';

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
        this.url = options.url;
    }

    private async query<OrionResponse extends Device[]>(
        query: string,
    ): Promise<OrionResponse> {
        const postBody: any = {
            query: query,
            parameters: {},
        };
        const options: RequestInit = {
            method: 'post',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                'Authorization': 'Basic ' + Buffer.from(`${this.username}:${this.password}`).toString('base64'),
            },
            body: postBody,
        };

        const response = await fetch(this.url, options)

        if (response.status === 200) {
            const items = await response.json();;
            return items as OrionResponse;
        } else {
            throw new IntegrationProviderAPIError({
                endpoint: this.url,
                statusText: response.statusText,
                status: response.status,
            });
        }
    }

    public async fetchDevices(): Promise<Device[]> {
        try {
            const devices = await this.query<Device[]>("query-string");
            return devices;
        } catch (err) {
            throw err;
        }
    }

    public async verifyAuthentication(): Promise<void> {
        try {
            await this.query("light-weight-query");
        } catch (err) {
            throw err;
        }
    }
}
