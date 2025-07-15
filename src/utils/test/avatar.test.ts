import { describe, it, expect } from 'vitest';
import { generateRandomAvatar, getAvatarUrl, getDefaultAvatar } from '../avatar';

describe('Avatar utility functions', () => {
  it('should generate a random avatar URL with seed', () => {
    const seed = 'testuser123';
    const avatar = generateRandomAvatar(seed);
    
    expect(avatar).toContain('https://api.dicebear.com');
    expect(avatar).toContain('testuser123');
  });

  it('should generate consistent avatar for same seed', () => {
    const seed = 'testuser123';
    const avatar1 = generateRandomAvatar(seed);
    const avatar2 = generateRandomAvatar(seed);
    
    // Should return the same URL for same seed
    expect(avatar1).toBe(avatar2);
  });

  it('should return user profile if available', () => {
    const user = {
      name: 'John Doe',
      _id: '123',
      profile: 'https://example.com/profile.jpg'
    };
    
    const avatarUrl = getAvatarUrl(user);
    expect(avatarUrl).toBe('https://example.com/profile.jpg');
  });

  it('should generate random avatar if no profile', () => {
    const user = {
      name: 'John Doe',
      _id: '123'
    };
    
    const avatarUrl = getAvatarUrl(user);
    expect(avatarUrl).toContain('https://api.dicebear.com');
    expect(avatarUrl).toContain('123');
  });

  it('should use name as seed if no _id', () => {
    const user = {
      name: 'John Doe'
    };
    
    const avatarUrl = getAvatarUrl(user);
    expect(avatarUrl).toContain('https://api.dicebear.com');
    expect(avatarUrl).toContain('John%20Doe');
  });

  it('should return default avatar path', () => {
    const defaultAvatar = getDefaultAvatar();
    expect(defaultAvatar).toBe('/default-avatar.png');
  });
});
