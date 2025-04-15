/**
 * @jest-environment node
 */

import { createMocks } from 'node-mocks-http';
import route from './src/app/api/generate-quote/route';

describe('/api/generate-quote', () => {
  it('should return a quote when a valid inputString is provided', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      url: '/api/generate-quote',
      body: { inputString: 'Tell me a quote about AI' },
    });

    await route(req, res);

    expect(res._getStatusCode()).toBe(200);
    const response = JSON.parse(res._getData());
    expect(response).toHaveProperty('quote');
    expect(typeof response.quote).toBe('string');
  });

  it('should return an error when the quote generation fails', async () => {
    // Mock the fetch function to simulate an API error
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: false,
        status: 500,
        json: () => Promise.resolve({ error: 'Failed to generate quote' }),
      })
    );

    const { req, res } = createMocks({
      method: 'POST',
      url: '/api/generate-quote',
      body: { inputString: 'Invalid input' },
    });

    await route(req, res);

    expect(res._getStatusCode()).toBe(200); // Assuming your route returns 200 even on error, adjust if needed
    const response = JSON.parse(res._getData());
    expect(response).toHaveProperty('error');
    expect(response.error).toBe('Failed to generate quote');

    // Restore the original fetch function
    global.fetch.mockRestore();
  });
});