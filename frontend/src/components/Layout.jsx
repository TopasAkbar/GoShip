import { Outlet, Link, useLocation } from 'react-router-dom';

function Layout({ setIsAuthenticated }) {
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
  };

  const navItems = [
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/simulate-order', label: 'Simulasi Order' },
    { path: '/check-ongkir', label: 'Cek Ongkir' },
    { path: '/request-resi', label: 'Request Resi' },
    { path: '/update-tracking', label: 'Update Tracking' },
    { path: '/tracking', label: 'Tracking' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-blue-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold">GoShip</h1>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      location.pathname === item.path
                        ? 'border-white text-white'
                        : 'border-transparent text-blue-100 hover:border-blue-300 hover:text-white'
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
            <div className="flex items-center">
              <button
                onClick={handleLogout}
                className="bg-blue-700 hover:bg-blue-800 px-4 py-2 rounded-md text-sm font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;




