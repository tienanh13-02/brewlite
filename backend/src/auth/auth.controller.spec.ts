import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: {
    register: ReturnType<typeof vi.fn>;
    login: ReturnType<typeof vi.fn>;
    getMe: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    authService = {
      register: vi.fn(),
      login: vi.fn(),
      getMe: vi.fn(),
    };
    controller = new AuthController(authService as unknown as AuthService);
  });

  it('forwards registration credentials to the service', () => {
    const dto = { email: 'user@example.com', password: 'secret123' };
    controller.register(dto);
    expect(authService.register).toHaveBeenCalledWith(dto.email, dto.password);
  });

  it('forwards login credentials to the service', () => {
    const dto = { email: 'user@example.com', password: 'secret123' };
    controller.login(dto);
    expect(authService.login).toHaveBeenCalledWith(dto.email, dto.password);
  });

  it('gets the current user using the authenticated user id', () => {
    controller.getMe({ user: { userId: 3 } });
    expect(authService.getMe).toHaveBeenCalledWith(3);
  });
});
