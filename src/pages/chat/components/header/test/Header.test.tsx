import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import Header from '../Header';
import usePageStore from '../../../../../store/page.store';
import useUserStore from '../../../../../store/user.store';

describe('Header Component', () => {
  beforeEach(() => {
    // Reset Zustand store state before each test
    useUserStore.setState({
      currentRecipient: null,
      currentUser: undefined,
    });
    usePageStore.setState({
      setCurrentPage: vi.fn(),
    });
  });
  it('renders correctly when currentRecipient and currentUser exist', () => {
    useUserStore.setState({
      currentRecipient: { _id: '1', name: 'Recipient User' },
      currentUser: { _id: '1', name: 'Current User' },
    });

    render(
      <MemoryRouter initialEntries={['/chat/123']}>
        <Routes>
          <Route path="/chat/:recipientId" element={<Header />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Recipient User')).toBeInTheDocument();
    expect(screen.getByText('123')).toBeInTheDocument(); // Check recipientId
  });

  //   it('does not render when currentRecipient or currentUser is missing', () => {
  //     useUserStore.setState({
  //       currentRecipient: null,
  //       currentUser: undefined,
  //     });

  //     const { container } = render(
  //       <MemoryRouter initialEntries={['/chat/123']}>
  //         <Routes>
  //           <Route path="/chat/:recipientId" element={<Header />} />
  //         </Routes>
  //       </MemoryRouter>
  //     );

  //     expect(container.firstChild).toBeNull();
  //   });

  //   it('calls setCurrentPage when ChevronLeft is clicked', () => {
  //     const setCurrentPageMock = vi.fn();
  //     usePageStore.setState({
  //       setCurrentPage: setCurrentPageMock,
  //     });

  //     useUserStore.setState({
  //       currentRecipient: { _id: '1', name: 'Recipient User' },
  //       currentUser: { _id: '1', name: 'Current User' },
  //     });

  //     render(
  //       <MemoryRouter initialEntries={['/chat/123']}>
  //         <Routes>
  //           <Route path="/chat/:recipientId" element={<Header />} />
  //         </Routes>
  //       </MemoryRouter>
  //     );

  //     const chevronLeft = screen.getByRole('button', { name: /ChevronLeft/i });
  //     fireEvent.click(chevronLeft);

  //     expect(setCurrentPageMock).toHaveBeenCalledWith('home');
  //   });

  //   it('renders recipientId from the URL', () => {
  //     useUserStore.setState({
  //       currentRecipient: { _id: '1', name: 'Recipient User' },
  //       currentUser: { _id: '1', name: 'Current User' },
  //     });

  //     render(
  //       <MemoryRouter initialEntries={['/chat/456']}>
  //         <Routes>
  //           <Route path="/chat/:recipientId" element={<Header />} />
  //         </Routes>
  //       </MemoryRouter>
  //     );

  //     expect(screen.getByText('456')).toBeInTheDocument(); // Check recipientId
  //   });
});
