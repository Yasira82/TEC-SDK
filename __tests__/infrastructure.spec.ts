import { AuthClient } from '../src/api/authClient';
import { logger } from '../src/utils/logger';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('SDK Infrastructure & Error Handling', () => {
  const baseURL = 'https://api.tec.test';
  const apiKey = 'test-api-key';
  let client: AuthClient;

  beforeEach(() => {
    mockedAxios.create.mockReturnThis();
    client = new AuthClient(baseURL, apiKey);
    (client as any).client = mockedAxios;
  });

  // 1. Test Authentication Failure (401)
  it('should throw an error when API key is invalid (401)', async () => {
    mockedAxios.post.mockRejectedValue({
      response: { status: 401, data: { message: 'Unauthorized Access' } }
    });

    await expect(client.loginWithPi('invalid_token'))
      .rejects.toThrow();
  });

  // 2. Test Zod Validation Failure
  it('should throw a validation error when API returns malformed data', async () => {
    // Missing required fields according to UserSchema
    const malformedUser = { id: '123' }; 
    
    mockedAxios.post.mockResolvedValue({ data: { token: 'abc', user: malformedUser } });

    await expect(client.loginWithPi('valid_token'))
      .rejects.toThrow(); // Zod will throw because data doesn't match UserSchema
  });

  // 3. Test Logger Functionality
  it('should log errors without crashing', () => {
    const logSpy = jest.spyOn(logger, 'error');
    const testError = new Error('Test Log');
    
    logger.error(testError, 'Testing logger');
    
    expect(logSpy).toHaveBeenCalled();
    logSpy.mockRestore();
  });
});
