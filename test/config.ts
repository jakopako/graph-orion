import { IntegrationInvocationConfig } from '@jupiterone/integration-sdk-core';
import { StepTestConfig } from '@jupiterone/integration-sdk-testing';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { invocationConfig } from '../src';
import { IntegrationConfig } from '../src/config';

if (process.env.LOAD_ENV) {
  dotenv.config({
    path: path.join(__dirname, '../.env'),
  });
}

const DEFAULT_USERNAME = 'dummy-username';
const DEFAULT_PASSWORD = 'dummy-password';
const DEFAULT_URL = 'http://localhost:17777/';
// const DEFAULT_VERIFY_CERT = true;

export const integrationConfig: IntegrationConfig = {
  username: process.env.USERNAME || DEFAULT_USERNAME,
  password: process.env.PASSWORD || DEFAULT_PASSWORD,
  url: process.env.URL || DEFAULT_URL,
  verifyCert: process.env.VERIFY_CERT == 'true',
};

export function buildStepTestConfigForStep(stepId: string): StepTestConfig {
  return {
    stepId,
    instanceConfig: integrationConfig,
    invocationConfig: invocationConfig as IntegrationInvocationConfig,
  };
}
