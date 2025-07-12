import * as React from 'react';

const Container = ({ children }: { children: React.ReactNode }) => {
  return (
    <div style={{ height: '100vh', width: '100vw' }} className="w-full h-full">
      {children}
    </div>
  );
};

export default Container;
