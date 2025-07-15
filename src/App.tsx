import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './routes';
import { Suspense } from "react";
import { Toaster } from "react-hot-toast";

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div>Loading...</div>}>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4001,
            style: {
              background: "#363636",
              color: "#fff",
            },
          }}
        />
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
