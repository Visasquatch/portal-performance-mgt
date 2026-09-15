import { Navigate, Route, Routes } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuth } from './auth/useAuth';
import type { Role } from './api/types';
import { AppShell } from './layout/AppShell';
import SignIn from './pages/SignIn';
import AcceptInvite from './pages/AcceptInvite';
import Overview from './pages/Overview';
import Collection from './pages/Collection';
import Remittance from './pages/Remittance';
import TradeDesk from './pages/TradeDesk';
import Settings from './pages/Settings';

function Home() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return (
    <Navigate
      to={user.role === 'treasury' ? '/trade' : '/overview'}
      replace
    />
  );
}

function Protected({
  allowedRoles,
  children,
}: {
  allowedRoles?: Role[];
  children: ReactNode;
}) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <Navigate
        to={user.role === 'treasury' ? '/trade' : '/overview'}
        replace
      />
    );
  }
  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<SignIn />} />
      <Route path="/accept" element={<AcceptInvite />} />
      <Route element={<AppShell />}>
        <Route path="/" element={<Home />} />
        <Route
          path="/overview"
          element={
            <Protected allowedRoles={['admin']}>
              <Overview />
            </Protected>
          }
        />
        <Route
          path="/collection"
          element={
            <Protected allowedRoles={['admin']}>
              <Collection />
            </Protected>
          }
        />
        <Route
          path="/remittance"
          element={
            <Protected allowedRoles={['admin']}>
              <Remittance />
            </Protected>
          }
        />
        <Route
          path="/trade"
          element={
            <Protected>
              <TradeDesk />
            </Protected>
          }
        />
        <Route
          path="/settings"
          element={
            <Protected allowedRoles={['admin']}>
              <Settings />
            </Protected>
          }
        />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}