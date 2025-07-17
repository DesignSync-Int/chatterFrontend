import { lazy } from 'react';
import { Route, Routes } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';

const Home = lazy(() => import('../pages/home/Home'));
const Login = lazy(() => import('../pages/login/Login'));
const EmailVerification = lazy(
  () => import("../pages/email/EmailVerification")
);

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Login />} />
    <Route path="/verify-email" element={<EmailVerification />} />
    <Route
      path="/home"
      element={
        <MainLayout>
          <Home />
        </MainLayout>
      }
    />
  </Routes>
);

export default AppRoutes;
