// src/app/api/webhooks/route.test.ts
import { NextRequest } from 'next/server';
import { POST } from './route';

// Mock the Prisma client
const mockCreate = jest.fn();
const mockUpdate = jest.fn();
const mockDelete = jest.fn();
const mockPrisma = {
  user: {
    create: mockCreate,
    update: mockUpdate,
    delete: mockDelete,
  },
};

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    user: {
      create: mockCreate,
      update: mockUpdate,
      delete: mockDelete,
    },
  })),
}));

describe('Webhook Route', () => {
  it('should create a user when a user.created event is received', async () => {
    const mockRequest = new NextRequest(new URL('http://localhost/api/webhooks'), {
      method: 'POST',
      body: JSON.stringify({
        data: {
          id: 'user_123',
          email_addresses: [{ email_address: 'test@example.com' }],
          first_name: 'Test',
          last_name: 'User',
        },
        type: 'user.created',
      }),
      headers: {
        'svix-id': 'msg_123',
        'svix-timestamp': '1678886400',
        'svix-signature': 'v1,...', // Replace with a valid signature if needed for verification
      },
    });

    const response = await POST(mockRequest);

    expect(response.status).toBe(200);
    expect(mockCreate).toHaveBeenCalledWith({
      data: {
        id: 'user_123',
        email: 'test@example.com',
        name: 'Test User',
      },
    });
  });

  it('should update a user when a user.updated event is received', async () => {
    const mockRequest = new NextRequest(new URL('http://localhost/api/webhooks'), {
      method: 'POST',
      body: JSON.stringify({
        data: {
          id: 'user_123',
          email_addresses: [{ email_address: 'updated@example.com' }],
          first_name: 'Updated',
          last_name: 'User',
        },
        type: 'user.updated',
      }),
      headers: {
        'svix-id': 'msg_456',
        'svix-timestamp': '1678886400',
        'svix-signature': 'v1,...',
      },
    });

    const response = await POST(mockRequest);

    expect(response.status).toBe(200);
    expect(mockUpdate).toHaveBeenCalledWith({
      where: { id: 'user_123' },
      data: { email: 'updated@example.com', name: 'Updated User' },
    });
  });

  it('should delete a user when a user.deleted event is received', async () => {
    const mockRequest = new NextRequest(new URL('http://localhost/api/webhooks'), {
      method: 'POST',
      body: JSON.stringify({
        data: { id: 'user_123' },
        type: 'user.deleted',
      }),
      headers: {
        'svix-id': 'msg_789',
        'svix-timestamp': '1678886400',
        'svix-signature': 'v1,...',
      },
    });

    const response = await POST(mockRequest);

    expect(response.status).toBe(200);
    expect(mockDelete).toHaveBeenCalledWith({ where: { id: 'user_123' } });
  });

  it('should handle missing data for user.created event', async () => {
    const mockRequest = new NextRequest(new URL('http://localhost/api/webhooks'), {
      method: 'POST',
      body: JSON.stringify({
        data: { id: 'user_123' },
        type: 'user.created',
      }),
      headers: {
        'svix-id': 'msg_101',
        'svix-timestamp': '1678886400',
        'svix-signature': 'v1,...',
      },
    });

    const response = await POST(mockRequest);
    expect(response.status).toBe(200);
    expect(mockCreate).toHaveBeenCalledWith({
      data: {
        id: 'user_123',
        email: undefined,
        name: '',
      },
    });
  });

  it('should handle missing data for user.updated event', async () => {
    const mockRequest = new NextRequest(new URL('http://localhost/api/webhooks'), {
      method: 'POST',
      body: JSON.stringify({
        data: { id: 'user_123' },
        type: 'user.updated',
      }),
      headers: {
        'svix-id': 'msg_112',
        'svix-timestamp': '1678886400',
        'svix-signature': 'v1,...',
      },
    });

    const response = await POST(mockRequest);

    expect(response.status).toBe(200);
    expect(mockUpdate).toHaveBeenCalledWith({
      where: { id: 'user_123' },
      data: { email: undefined, name: '' },
    });
  });

    
});