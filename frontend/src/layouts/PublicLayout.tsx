import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from '@components/Navbar';
import Footer from '@components/Footer';

export const PublicLayout: React.FC = () => {
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-black">
      {/* Navbar — hidden on auth pages for a cleaner look */}
      {!isAuthPage && <Navbar />}

      {/* Page Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer — hidden on auth pages */}
      {!isAuthPage && <Footer />}
    </div>
  );
};

export default PublicLayout;
