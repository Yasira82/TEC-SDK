import { AuthClient }  from '../src/api/authClient';
import { TecSdkError } from '../src/api/baseClient';
import axios           from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

const mockUser = {
  id:               'user-uuid-1',
  piId:             'pi-uuid-1',
  piUsername:       'testuser',
  role:             'user',
  subscriptionPlan: null as string | null,
  createdAt:        '2026-04-10T00:00:00Z',
};

const mockLoginResponse = {
  success:   true,
  isNewUser: false,
  user:      mockUser,
  tokens: {
    accessToken:  'access-token-123',
    refreshToken: 'refresh-token-456',
  },
};

type ClientWithInternals = AuthClient & {
  tokens: { get: (k: string) => string | null; set: (k: string, v: string) => void };
  client: jest.Mocked<typeof axios>;
};

describe('AuthClient', () => {
  const baseURL = 'https://api.tec.test';
  const apiKey  = 'test-api-key';
  let client: ClientWithInternals;

  beforeEach(() => {
    mockedAxios.create.mockReturnThis();
    client = new AuthClient(baseURL, apiKey) as ClientWithInternals;
    client.client = mockedAxios;
    jest.clearAllMocks();
  });

  describe('loginWithPi', () => {
    it('logs in successfully and stores tokens in TokenStore', async () => {
      mockedAxios.post.mockResolvedValue({ data: mockLoginResponse });

      const result = await client.loginWithPi('pi-access-token');

      expect(result.success).toBe(true);
      expect(result.user.piUsername).toBe('testuser');
      expect(result.tokens.accessToken).toBe('access-token-123');
      expect(client.tokens.get('tec_token')).toBe('access-token-123');
      expect(client.tokens.get('tec_refresh_token')).toBe('refresh-token-456');
      expect(client.tokens.get('tec_user')).toBe(JSON.stringify(mockUser));
    });

    it('returns isNewUser=true for new users', async () => {
      mockedAxios.post.mockResolvedValue({
        data: { ...mockLoginResponse, isNewUser: true },
      });

      const result = await client.loginWithPi('pi-access-token');
      expect(result.isNewUser).toBe(true);
    });

    it('throws on 401', async () => {
      mockedAxios.post.mockRejectedValue({
        response: { status: 401, data: { message: 'Unauthorized' } },
      });

      await expect(client.loginWithPi('invalid-token')).rejects.toThrow();
    });

    it('throws on network error', async () => {
      mockedAxios.post.mockRejectedValue(new Error('Network Error'));

      await expect(client.loginWithPi('pi-access-token')).rejects.toThrow();
    });

    it('throws on invalid response shape (Zod)', async () => {
      mockedAxios.post.mockResolvedValue({
        data: { success: true, user: { id: 'only-id' } },
      });

      await expect(client.loginWithPi('pi-access-token')).rejects.toThrow();
    });

    it('calls correct endpoint with correct payload', async () => {
      mockedAxios.post.mockResolvedValue({ data: mockLoginResponse });

      await client.loginWithPi('my-pi-token');

      expect(mockedAxios.post).toHaveBeenCalledWith(
        '/api/auth/pi-login',
        { accessToken: 'my-pi-token' },
      );
    });
  });

  describe('refreshToken', () => {
    it('refreshes token successfully', async () => {
      client.tokens.set('tec_refresh_token', 'old-refresh-token');

      mockedAxios.post.mockResolvedValue({
        data: { success: true, token: 'new-access-token' },
      });

      const result = await client.refreshToken();

      expect(result.token).toBe('new-access-token');
      expect(client.tokens.get('tec_token')).toBe('new-access-token');
    });

    it('throws TecSdkError(401) when no refresh token stored', async () => {
      await expect(client.refreshToken()).rejects.toThrow(TecSdkError);
      await expect(client.refreshToken()).rejects.toMatchObject({ status: 401 });
    });

    it('sends refresh token in request body', async () => {
      client.tokens.set('tec_refresh_token', 'stored-refresh');

      mockedAxios.post.mockResolvedValue({
        data: { success: true, token: 'new-token' },
      });

      await client.refreshToken();

      expect(mockedAxios.post).toHaveBeenCalledWith(
        '/api/auth/refresh',
        { refreshToken: 'stored-refresh' },
      );
    });
  });

  describe('getProfile', () => {
    it('returns user profile', async () => {
      mockedAxios.get.mockResolvedValue({ data: mockUser });

      const profile = await client.getProfile();

      expect(profile.piUsername).toBe('testuser');
      expect(profile.id).toBe('user-uuid-1');
      expect(mockedAxios.get).toHaveBeenCalledWith('/api/auth/me');
    });

    it('throws on malformed profile response', async () => {
      mockedAxios.get.mockResolvedValue({ data: { id: 'only-id' } });

      await expect(client.getProfile()).rejects.toThrow();
    });
  });

  describe('health', () => {
    it('returns health status', async () => {
      mockedAxios.get.mockResolvedValue({ data: { status: 'ok' } });

      const result = await client.health();

      expect(result.status).toBe('ok');
      expect(mockedAxios.get).toHaveBeenCalledWith('/api/auth/health');
    });
  });

  describe('logout', () => {
    it('clears all tokens from TokenStore', () => {
      client.tokens.set('tec_token',         'access');
      client.tokens.set('tec_refresh_token', 'refresh');
      client.tokens.set('tec_user',          '{}');

      client.logout();

      expect(client.tokens.get('tec_token')).toBeNull();
      expect(client.tokens.get('tec_refresh_token')).toBeNull();
      expect(client.tokens.get('tec_user')).toBeNull();
    });
  });
});
