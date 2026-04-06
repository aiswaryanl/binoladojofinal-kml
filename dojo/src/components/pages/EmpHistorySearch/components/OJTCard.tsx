import React from 'react';
import type { OJTRecord } from '../types';

interface OJTCardProps {
    ojtRecords: OJTRecord[];
}

const OJTCard: React.FC<OJTCardProps> = ({ ojtRecords }) => {
    return (
        <div className='bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-2xl border border-orange-100 hover:shadow-3xl transition-shadow duration-300 h-[450px] flex flex-col'>
            <div className='flex items-center mb-6'>
                <div className='bg-gradient-to-r from-orange-500 to-amber-500 p-3 rounded-2xl mr-4 shadow-lg'>
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                </div>
                <h2 className='text-2xl font-bold text-gray-800'>OJT Records</h2>
            </div>
            <div className='flex-1 overflow-y-auto hide-scrollbar space-y-4 pr-2'>
                {ojtRecords && ojtRecords.length > 0 ? (
                    ojtRecords.map((record) => (
                        <div key={record.id} className='bg-gradient-to-r from-orange-50 to-amber-50 p-5 rounded-2xl border-l-4 border-orange-500 hover:shadow-md transition-all duration-200'>
                            <h3 className="font-bold text-lg text-gray-800 mb-2 truncate" title={record.station_name}>
                                {record.station_name || "Unknown Station"}
                            </h3>
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-semibold text-orange-700 bg-orange-100 px-2 py-0.5 rounded">
                                    {record.level_name || "Level ?"}
                                </span>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${record.status?.toLowerCase() === 'qualified' || record.status?.toLowerCase() === 'pass'
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-gray-100 text-gray-600'
                                    }`}>
                                    {record.status}
                                </span>
                            </div>
                            <div className="text-sm text-gray-600 space-y-1">
                                <div className="flex justify-between">
                                    <span>Start Date:</span>
                                    <span className="font-medium text-gray-800">{record.doj}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Process:</span>
                                    <span className="font-medium text-gray-800 truncate w-32 text-right" title={record.process_name}>{record.process_name}</span>
                                </div>
                            </div>
                            {record.trainer_name && (
                                <div className="mt-3 text-sm text-gray-500 text-right border-t border-orange-200 pt-2">
                                    Trainer: <span className="font-medium text-gray-700">{record.trainer_name}</span>
                                </div>
                            )}
                        </div>
                    ))
                ) : (
                    <div className='flex flex-col items-center justify-center h-full text-gray-400'>
                        <svg className="w-12 h-12 mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                        <span className="text-lg">No OJT records found</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OJTCard;
