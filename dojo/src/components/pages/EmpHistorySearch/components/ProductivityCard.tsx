import React from 'react';
import type { ProductivityEvaluation } from '../types';

interface ProductivityCardProps {
    evaluations: ProductivityEvaluation[];
}

const ProductivityCard: React.FC<ProductivityCardProps> = ({ evaluations }) => {
    return (
        <div className='bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-2xl border border-blue-100 hover:shadow-3xl transition-shadow duration-300 h-[450px] flex flex-col'>
            <div className='flex items-center mb-6'>
                <div className='bg-gradient-to-r from-blue-500 to-cyan-500 p-3 rounded-2xl mr-4 shadow-lg'>
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                </div>
                <h2 className='text-2xl font-bold text-gray-800'>Productivity Evaluations</h2>
            </div>
            <div className='flex-1 overflow-y-auto hide-scrollbar space-y-4 pr-2'>
                {evaluations && evaluations.length > 0 ? (
                    evaluations.map((evalItem) => (
                        <div key={evalItem.id} className='bg-gradient-to-r from-blue-50 to-cyan-50 p-5 rounded-2xl border-l-4 border-blue-500 hover:shadow-md transition-all duration-200'>
                            <div className="flex justify-between items-center mb-2">
                                <span className="font-bold text-lg text-gray-800">{evalItem.evaluation_date}</span>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${evalItem.status === 'PASS' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                    {evalItem.status}
                                </span>
                            </div>
                            <div className="flex justify-between text-base mb-1">
                                <span className="text-gray-600">Marks: {evalItem.obtained_marks} / {evalItem.max_marks}</span>
                                <span className="font-bold text-blue-600">{evalItem.percentage.toFixed(1)}%</span>
                            </div>
                            {evalItem.trainer_name && (
                                <div className="mt-2 text-sm text-gray-500 text-right border-t border-blue-100 pt-2">
                                    Trainer: <span className="font-medium text-gray-700">{evalItem.trainer_name}</span>
                                </div>
                            )}
                        </div>
                    ))
                ) : (
                    <div className='flex flex-col items-center justify-center h-full text-gray-400'>
                        <svg className="w-12 h-12 mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        <span className="text-lg">No evaluations found</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductivityCard;
