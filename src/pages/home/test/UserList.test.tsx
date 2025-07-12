import { describe, it, expect, beforeEach } from 'vitest';
import useUserStore from '../../../store/user.store';

describe('useUserStore', () => {
  beforeEach(() => {
    // Reset the store state before each test
    useUserStore.setState({
      currentUser: {
        _id: '1',
        name: 'Alisha',
        profile: 'https://randomuser.me/api/portraits/women/89.jpg',
      },
      currentRecipient: null,
    });
  });

  it('should have the default currentUser', () => {
    const { currentUser } = useUserStore.getState();
    expect(currentUser).toEqual({
      _id: '1',
      name: 'Alisha',
      profile: 'https://randomuser.me/api/portraits/women/89.jpg',
    });
  });

  it('should have the default currentRecipient as null', () => {
    const { currentRecipient } = useUserStore.getState();
    expect(currentRecipient).toBeNull();
  });

  it('should update currentUser using setCurrentUser', () => {
    const newUser = {
      _id: '2',
      name: 'John',
      profile: 'https://randomuser.me/api/portraits/men/45.jpg',
    };
    useUserStore.getState().setCurrentUser(newUser);
    const { currentUser } = useUserStore.getState();
    expect(currentUser).toEqual(newUser);
  });

  it('should update currentRecipient using setCurrentRecipient', () => {
    const newRecipient = {
      _id: '3',
      name: 'Emma',
      profile: 'https://randomuser.me/api/portraits/women/12.jpg',
    };
    useUserStore.getState().setCurrentRecipient(newRecipient);
    const { currentRecipient } = useUserStore.getState();
    expect(currentRecipient).toEqual(newRecipient);
  });

  it('should set currentRecipient to null', () => {
    useUserStore.getState().setCurrentRecipient(null);
    const { currentRecipient } = useUserStore.getState();
    expect(currentRecipient).toBeNull();
  });
});
