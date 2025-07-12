import React from 'react';
import Container from '../components/container/Container';

const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Container>{children}</Container>
);

export default MainLayout;
