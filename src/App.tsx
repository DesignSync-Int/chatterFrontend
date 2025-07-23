import { HashRouter } from 'react-router-dom';
import AppRoutes from './routes';
import { Suspense } from "react";
import { Toaster } from "react-hot-toast";
import FloatingBuyButton from './components/ui/FloatingBuyButton';

function App() {
  return (
    <HashRouter>
      <Suspense
        fallback={
          <div className="flex items-center justify-center h-screen">
            <div className="flex items-center gap-3 text-gray-600">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <span className="text-lg">Loading application...</span>
            </div>
          </div>
        }
      >
        <AppRoutes />
        <FloatingBuyButton />
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
    </HashRouter>
  );
}

export default App;
