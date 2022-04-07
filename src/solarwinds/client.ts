import { Device } from './types';

interface CreateOrionClientParams {
  username: string;
  password: string;
}

export class OrionAPIClient {
  private readonly username: string;
  private readonly password: string;

  constructor(options: CreateOrionClientParams) {
    this.username = options.username;
    this.password = options.password;
  }

  public async fetchDevices(): Promise<Device[]> {
    // TODO
  }
}
