import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthService } from './auth.service.js';
import type { PrismaService } from '../prisma/prisma.service.js';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: {
    user: {
      findUnique: ReturnType<typeof vi.fn>;
      create: ReturnType<typeof vi.fn>;
    };
  };
  let jwtService: { sign: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    prisma = {
      user: {
        findUnique: vi.fn().mockResolvedValue(null),
        create: vi.fn().mockResolvedValue({ id: 3, email: 'user@example.com' }),
      },
    };
    jwtService = { sign: vi.fn().mockReturnValue('signed-token') };
    service = new AuthService(
      prisma as unknown as PrismaService,
      jwtService as unknown as JwtService,
    );
  });

  it('registers with a hashed password and returns a JWT', async () => {
    const result = await service.register('user@example.com', 'secret123');
    const createCall = prisma.user.create.mock.calls[0][0];

    expect(createCall.data.email).toBe('user@example.com');
    expect(await bcrypt.compare('secret123', createCall.data.passwordHash)).toBe(true);
    expect(result).toEqual({
      accessToken: 'signed-token',
      user: { id: 3, email: 'user@example.com' },
    });
    expect(jwtService.sign).toHaveBeenCalledWith({
      sub: 3,
      email: 'user@example.com',
    });
  });

  it('rejects registration when the email already exists', async () => {
    prisma.user.findUnique.mockResolvedValue({ id: 3, email: 'user@example.com' });

    await expect(
      service.register('user@example.com', 'secret123'),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(prisma.user.create).not.toHaveBeenCalled();
  });

  it('rejects login with an incorrect password', async () => {
    const passwordHash = await bcrypt.hash('correct-password', 4);
    prisma.user.findUnique.mockResolvedValue({
      id: 3,
      email: 'user@example.com',
      passwordHash,
    });

    await expect(
      service.login('user@example.com', 'wrong-password'),
    ).rejects.toBeInstanceOf(UnauthorizedException);
    expect(jwtService.sign).not.toHaveBeenCalled();
  });
});
