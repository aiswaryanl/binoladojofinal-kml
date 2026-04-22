import React, { useState, useEffect,useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../../organisms/Navbar/Navbar';
import { NAVIGATION_ROUTES } from '../../constants/navigation';
import { API_ENDPOINTS } from '../../constants/api';
import HomepageHeader from '../../molecules/HomepageHeader/HomepageHeader';
import TilesGrid from '../../organisms/TilesGrid/TilesGrid';

import { useSelector } from 'react-redux'; // Add this
import type { RootState } from '../../../store/store'; // Add this
import { tiles as allTiles } from '../../constants/tileData'; // Renamed to allTiles to match logic


// import { tiles } from '../../constants/tileData';



interface CompanyLogo {
  id: number;
  name: string;
  logo: string;
  uploaded_at: string;
}

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [companyLogo, setCompanyLogo] = useState<CompanyLogo | null>(null);
  const [logoLoading, setLogoLoading] = useState(true);

  // 1. Get User and Permissions from Redux
  const { user } = useSelector((state: RootState) => state.auth);
  const userPermissions = user?.permissions || [];
  const roleName = user?.role?.toLowerCase() || '';

  // 2. Filter Tiles based on Permissions
  const filteredTiles = useMemo(() => {
    return allTiles
      .filter(tile => {
        // Admin/Developer override: see everything
        if (roleName === 'admin' || roleName === 'developer') return true;
        // Check if the Parent Tile key is in permissions
        return userPermissions.includes((tile as any).permissionKey);
      })
      .map(tile => ({
        ...tile,
        // Filter the sub-links inside each tile
        links: tile.links.filter(link => {
          if (roleName === 'admin' || roleName === 'developer') return true;
          return userPermissions.includes((link as any).permissionKey);
        })
      }))
      // Hide the tile entirely if it has no accessible links left
      .filter(tile => tile.links.length > 0);
  }, [userPermissions, roleName]);


  useEffect(() => {
    const fetchCompanyLogo = async () => {
      try {
        const response = await fetch(`${API_ENDPOINTS.BASE_URL}${API_ENDPOINTS.LOGOS}`);
        const data = await response.json();
        // Get the first logo or the most recent one
        if (data && data.length > 0) {
          setCompanyLogo(data[0]);
        }
      } catch (error) {
        console.error('Error fetching company logo:', error);
      } finally {
        setLogoLoading(false);
      }
    };

    fetchCompanyLogo();
  }, []);

  const handleNavigateHome = () => navigate(NAVIGATION_ROUTES.HOME);
  const handleNavigateBack = () => navigate(-1);
  const handleNavigateToRoot = () => navigate(NAVIGATION_ROUTES.ROOT);
  const handleLogout = () => {
    // Add your logout logic here
    console.log('Logout clicked');
    navigate(NAVIGATION_ROUTES.ROOT);
  };
  const handlePrivacyPolicy = () => navigate(NAVIGATION_ROUTES.PRIVACY_POLICY);
  const handleTermsAndConditions = () => navigate(NAVIGATION_ROUTES.TERMS_AND_CONDITIONS);
  const handleVersionControl = () => navigate(NAVIGATION_ROUTES.VERSION_CONTROL);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-200 via-purple-100 to-slate-200 flex flex-col">
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header Section */}
        <div className="w-full">
          <HomepageHeader 
            logo={companyLogo?.logo || null} 
            logoLoading={logoLoading} 
            companyName={companyLogo?.name || 'NL'}
          />
        </div>
        
        {/* Tiles Grid Section */}
        <div className="flex-1 px-4 pb-6">
          <TilesGrid tiles={filteredTiles as any} />
        </div>
      </div>

      {/* Footer - Can be added here if needed */}
      {/* <div className="bg-gray-800 text-white p-4">
        Footer content goes here
      </div> */}
    </div>
  );
};