// import React from 'react';

// export interface HomepageHeaderProps {
//   logo: string | null;
//   logoLoading: boolean;
//   companyName: string;
// }

// const HomepageHeader: React.FC<HomepageHeaderProps> = ({
//   logo,
//   logoLoading,
//   companyName = 'KML',
// }) => {
//   return (
//     <div className='bg-[#010101] text-white text-center py-4 md:py-6 px-4 mb-6'>
//       <div className="flex flex-col md:flex-row md:items-center md:justify-between max-w-7xl mx-auto">
//         {/* Logo Section - shown only on md screens and larger */}
//         <div className='flex justify-center md:justify-start mb-4 md:mb-0 pl-16'>
//           {logoLoading ? (
//             <div className='h-10 w-auto bg-gray-200 rounded animate-pulse'></div>
//           ) : logo ? (
//             <img
//               src={logo}
//               alt={companyName}
//               className='h-20 w-auto max-w-[200px] object-contain'
//             />
//           ) : (
//             <div className='text-2xl font-semibold'>{companyName}</div>
//           )}
//         </div>

//         {/* Text Section - centered on all screens */}
//         <div className="flex flex-col text-center md:text-center md:flex-1">
//           <h1 className="text-5xl md:text-3xl lg:text-4xl font-semibold mb-2">
//             Digital Operations Excellence
//           </h1>
//           <h2 className="text-lg md:text-2xl font-semibold mb-2">
//             Skill Development Platform
//           </h2>
//         </div>

//         {/* Empty space for balance - hidden on mobile */}
//         <div className="hidden md:block w-64"></div>
//       </div>
//     </div>
//   );
// };

// export default HomepageHeader;


import React from 'react';

export interface HomepageHeaderProps {
  logo: string | null;
  logoLoading: boolean;
  companyName: string;
}

const HomepageHeader: React.FC<HomepageHeaderProps> = ({
  logo,
  logoLoading,
  companyName = 'KML',
}) => {
  return (
    <div className='relative bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white py-8 md:py-16 px-4 mb-8 overflow-hidden'>
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse animation-delay-4000"></div>
      </div>

      <div className="relative flex flex-col md:flex-row md:items-center md:justify-between max-w-7xl mx-auto">
        {/* Logo Section - shown only on md screens and larger */}
        <div className='flex justify-center md:justify-start mb-6 md:mb-0 md:pl-8 lg:pl-16'>
  {logoLoading ? (
    <div className='h-32 md:h-36 lg:h-40 w-64 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-lg animate-pulse backdrop-blur-sm'></div>
  ) : logo ? (
    <div className="relative group max-w-[800px] max-h-[400px]">
      <div></div>
      <img
        src={logo}
        alt={companyName}
        className='relative h-32 md:h-36 lg:h-40 w-auto max-w-[800px] md:max-w-[400px] object-contain filter drop-shadow-2xl'
      />
    </div>
  ) : (
    <div className='text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent'>
      {companyName}
    </div>
  )}
</div>

        {/* Text Section - centered on all screens */}
        <div className="flex flex-col text-center md:text-center md:flex-1 space-y-4">
          <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight">
            <span className="bg-gradient-to-r from-white via-purple-200 to-white bg-clip-text text-transparent animate-gradient-x">
              Digital Operations
            </span>
            <br />
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent animate-gradient-x animation-delay-1000">
              Excellence
            </span>
          </h1>
          <h2 className="text-xl md:text-2xl lg:text-3xl font-medium text-purple-200/90 tracking-wide">
            Skill Development Platform
          </h2>
          
          {/* Optional decorative line */}
          <div className="flex justify-center mt-4">
            <div className="w-24 h-1 bg-gradient-to-r from-transparent via-purple-400 to-transparent rounded-full"></div>
          </div>
        </div>

        {/* Empty space for balance - hidden on mobile */}
        <div className="hidden md:block w-48 lg:w-64"></div>
      </div>
    </div>
  );
};

export default HomepageHeader;
