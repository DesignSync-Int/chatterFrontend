import * as React from 'react';
import Footer from '../ui/Footer';

const Container = ({ children }: { children: React.ReactNode }) => {
  return (
    <div style={{ height: '100vh', width: '100vw' }} className="w-full h-full flex flex-col">
      <div className="flex-grow">
        {children}
      </div>
      <Footer />
    </div>
  );
};

export default Container;
