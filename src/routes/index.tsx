import React, { lazy } from 'react';
import { Route, Routes } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';

const Home = lazy(() => import('../pages/home/Home'));
const Chat = lazy(() => import('../pages/chat/Chat'));
const Login = lazy(() => import('../pages/login/Login'));

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Login />} />
    <Route
      path="/home"
      element={
        <MainLayout>
          <Home />
        </MainLayout>
      }
    />
    <Route
      path="/chat/:recipientId"
      element={
        <MainLayout>
          <Chat />
        </MainLayout>
      }
    />
  </Routes>
);

export default AppRoutes;
