import React from 'react';

interface FooterLogoProps {
  isLoading?: boolean;
  logoUrl?: string;
  companyName: string;
}

export const FooterLogo: React.FC<FooterLogoProps> = ({ isLoading, logoUrl, companyName }) => {
  return (
    <div className='flex justify-center md:justify-start w-full md:w-auto'>
      {isLoading ? (
        <div className='h-10 w-40 bg-gray-200 rounded animate-pulse'></div>
      ) : logoUrl ? (
        <img
          src={logoUrl}
          alt={companyName}
          className='h-20 w-auto max-w-[200px] object-contain'
        />
      ) : (
        <div className='text-2xl font-semibold'>
          {companyName}
        </div>
      )}
    </div>
  );
};