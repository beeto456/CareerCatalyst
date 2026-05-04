/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList
} from 'recharts';
import { JobApplication, JobStatus } from '../types';

interface JobStatusGraphProps {
  applications: JobApplication[];
}

export default function JobStatusGraph({ applications }: JobStatusGraphProps) {
  // Define the order precisely as requested and mapped to JobStatus enum
  const statusOrder = [
    { label: 'Have Not Applied', value: JobStatus.NOT_APPLIED },
    { label: 'Applied', value: JobStatus.APPLIED },
    { label: 'Awaiting Interview', value: JobStatus.AWAITING_INTERVIEW },
    { label: 'Interviewing', value: JobStatus.INTERVIEWING },
    { label: 'Offered', value: JobStatus.OFFERED },
    { label: 'Rejected', value: JobStatus.REJECTED },
    { label: 'Withdrawn', value: JobStatus.WITHDRAWN },
    { label: 'Ghosted', value: JobStatus.GHOSTED },
  ];

  const data = statusOrder.map(status => {
    return {
      name: status.label,
      count: applications.filter(app => app.status === status.value).length,
      fullStatus: status.value
    };
  });

  // Colors for different statuses to make it more visual
  const getStatusColor = (status: JobStatus) => {
    switch (status) {
      case JobStatus.OFFERED: return '#10b981'; // Emerald
      case JobStatus.REJECTED: return '#ef4444'; // Red
      case JobStatus.INTERVIEWING: return '#3b82f6'; // Blue
      case JobStatus.AWAITING_INTERVIEW: return '#8b5cf6'; // Purple
      case JobStatus.APPLIED: return '#f59e0b'; // Amber
      case JobStatus.GHOSTED: return '#6b7280'; // Gray
      case JobStatus.WITHDRAWN: return '#94a3b8'; // Slate
      default: return '#e2e8f0'; // Base
    }
  };

  return (
    <div className="w-full bg-white rounded-3xl border border-gray-100 p-8 shadow-sm overflow-hidden">
      <div className="text-center mb-10">
        <h2 className="text-2xl font-bold tracking-tighter text-brand-primary">Job Status Graph</h2>
        <p className="text-gray-400 text-[10px] mt-1 uppercase tracking-widest font-bold font-mono">
          Distribution across {applications.length} applications
        </p>
      </div>

      <div className="h-[400px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart 
            data={data} 
            margin={{ top: 20, right: 30, left: 10, bottom: 40 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
            <XAxis 
              dataKey="name" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
              interval={0}
              angle={-15}
              textAnchor="end"
              dy={10}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }}
              allowDecimals={false}
            />
            <Tooltip 
              cursor={{ fill: 'rgba(0,0,0,0.02)' }}
              contentStyle={{ 
                borderRadius: '16px', 
                border: 'none',
                boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                fontSize: '12px',
                fontWeight: '700',
                padding: '12px 16px'
              }}
            />
            <Bar dataKey="count" radius={[8, 8, 0, 0]} barSize={50}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getStatusColor(entry.fullStatus as JobStatus)} />
              ))}
              <LabelList 
                dataKey="count" 
                position="top" 
                style={{ fill: '#64748b', fontSize: 11, fontWeight: 800, fontFamily: 'monospace' }} 
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
        {data.filter(d => d.count > 0).map((d) => (
          <div key={d.name} className="bg-gray-50/50 rounded-xl p-3 border border-gray-100 flex flex-col items-center">
            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter mb-1">{d.name}</span>
            <span className="text-lg font-bold text-gray-900 font-mono leading-none">{d.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
