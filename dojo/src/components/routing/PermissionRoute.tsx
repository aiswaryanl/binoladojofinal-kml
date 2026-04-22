import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import type { RootState } from '../../store/store'; // Fixed the Type import

interface PermissionRouteProps {
  requiredPermission: string;
}

const PermissionRoute: React.FC<PermissionRouteProps> = ({ requiredPermission }) => {
  const { user, isAuthenticated, loading } = useSelector((state: RootState) => state.auth);
  const location = useLocation();

  // 1. Handle the "Loading" state to prevent white screen
  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // 2. Not logged in? Go to login page
  if (!isAuthenticated) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  const role = user?.role?.toLowerCase();
  const permissions = user?.permissions || [];

  // 3. Check access: Admin/Dev always true, others check the permission key
  const hasPermission = 
    role === 'admin' || 
    role === 'developer' || 
    permissions.includes(requiredPermission);

  // 🔍 DEBUG: If it's still failing, check your console
  if (!hasPermission) {
    console.warn(`Access Denied for ${requiredPermission}. Redirecting to /home.`);
    return <Navigate to="/home" replace />;
  }

  return <Outlet />;
};

export default PermissionRoute;


// import React from 'react';
// import { useSelector } from 'react-redux';
// import { Navigate, Outlet } from 'react-router-dom';
// // import { RootState } from '../../store/store';
// import type { RootState } from '../../store/store';

// interface PermissionRouteProps {
//   requiredPermission: string;
// }

// const PermissionRoute: React.FC<PermissionRouteProps> = ({ requiredPermission }) => {
//   const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  
//   // 1. If not logged in, go to login
//   if (!isAuthenticated) return <Navigate to="/" replace />;

//   const role = user?.role?.toLowerCase();
//   const permissions = user?.permissions || [];

//   // 2. Admin/Developer always get in. Others check the key.
//   const hasPermission = 
//     role === 'admin' || 
//     role === 'developer' || 
//     permissions.includes(requiredPermission);

//   // 3. If no permission, bounce back to /home
//   return hasPermission ? <Outlet /> : <Navigate to="/home" replace />;
// };

// export default PermissionRoute;