/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { 
  Trash2,
  HelpCircle 
} from "lucide-react";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceArea,
  ReferenceLine,
  Label,
  Cell,
} from "recharts";
import { JobApplication } from "../types";
import { DEFAULT_THRESHOLDS } from "../constants";

interface JobChartProps {
  applications: JobApplication[];
  onSelectJob: (job: JobApplication) => void;
  onDeleteJob?: (id: string) => void;
  onClearAll?: () => void;
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload as JobApplication;
    return (
      <div className="bg-white p-3 border border-gray-200 shadow-lg rounded-lg">
        <p className="font-bold text-sm">{data.title}</p>
        <p className="text-xs text-gray-500">{data.company}</p>
        <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-1">
            <span className="text-gray-400">Competence:</span>{" "}
            <HelpCircle className="w-2.5 h-2.5 cursor-help text-gray-300" title="How good you are at this job" />
            <span className="font-mono font-bold text-brand-accent ml-auto">
              {data.avgCompetency.toFixed(1)}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-gray-400">Interest:</span>{" "}
            <HelpCircle className="w-2.5 h-2.5 cursor-help text-gray-300" title="How much you enjoy this job" />
            <span className="font-mono font-bold text-orange-500 ml-auto">
              {data.avgInterest.toFixed(1)}
            </span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export default function JobChart({ applications, onSelectJob, onDeleteJob, onClearAll }: JobChartProps) {
  const [showResetConfirm, setShowResetConfirm] = React.useState(false);
  const [deletingId, setDeletingId] = React.useState<string | null>(null);

  const chartData = applications.map((app, index) => ({
    ...app,
    x: app.avgCompetency,
    y: app.avgInterest,
    color: COLORS[index % COLORS.length]
  }));

  return (
    <div id="job-matrix-capture" className="w-full bg-white rounded-3xl border border-gray-100 p-8 shadow-sm overflow-hidden flex flex-col md:flex-row gap-8">
      {/* Chart Sidebar - List of Jobs */}
      <div className="w-full md:w-64 order-2 md:order-1 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Opportunities</h3>
          {onClearAll && applications.length > 0 && (
            <div className="flex items-center">
              {showResetConfirm ? (
                <div className="flex items-center gap-1.5 animate-in fade-in slide-in-from-right-1 duration-200">
                  <span className="text-[8px] font-bold text-gray-400 uppercase">Clear?</span>
                  <button 
                    onClick={() => {
                      onClearAll();
                      setShowResetConfirm(false);
                    }}
                    className="text-[9px] font-bold text-red-500 hover:underline px-1"
                  >
                    Yes
                  </button>
                  <button 
                    onClick={() => setShowResetConfirm(false)}
                    className="text-[9px] font-bold text-gray-400 hover:text-gray-600 px-1"
                  >
                    No
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => setShowResetConfirm(true)}
                  className="text-[9px] font-bold text-red-500 hover:underline uppercase tracking-tight"
                >
                  Reset
                </button>
              )}
            </div>
          )}
        </div>
        <div className="space-y-3 overflow-y-auto max-h-[400px] pr-2">
          {chartData.map((app) => (
            <div key={app.id} className="group flex items-center gap-2">
              <button
                onClick={() => onSelectJob(app)}
                className="flex items-start gap-3 text-left group w-full overflow-hidden"
              >
                <div 
                  className="w-2 h-2 rounded-full mt-1.5 shrink-0" 
                  style={{ backgroundColor: app.color }}
                />
                <span className="text-[11px] font-medium text-gray-500 group-hover:text-brand-primary truncate">
                  {app.title}
                </span>
              </button>
              {onDeleteJob && (
                <div className="flex items-center">
                  {deletingId === app.id ? (
                    <div className="flex items-center gap-1 animate-in fade-in slide-in-from-right-1 duration-200">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteJob(app.id);
                          setDeletingId(null);
                        }}
                        className="p-1 px-2 text-[9px] font-bold text-red-500 hover:bg-red-50 rounded"
                      >
                        Del
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeletingId(null);
                        }}
                        className="p-1 px-1.5 text-[9px] font-bold text-gray-400 hover:text-gray-600"
                      >
                        X
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeletingId(app.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-300 hover:text-red-500 transition-all"
                      title="Remove"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Main Chart Area */}
      <div className="flex-1 order-1 md:order-2">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold tracking-tighter">Jobs Matrix</h2>
          <div className="flex items-center justify-center gap-4 mt-1">
            <div className="flex items-center gap-1 text-[9px] font-bold text-gray-400 uppercase tracking-wider">
              <HelpCircle className="w-3 h-3 text-brand-accent" />
              <span>Competence: Skill Fit</span>
            </div>
            <div className="flex items-center gap-1 text-[9px] font-bold text-gray-400 uppercase tracking-wider">
              <HelpCircle className="w-3 h-3 text-orange-500" />
              <span>Interest: Passion Match</span>
            </div>
          </div>
        </div>

        <div className="h-[500px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 20, bottom: 40, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
              
              <XAxis
                type="number"
                dataKey="x"
                name="Competence"
                domain={[0, 10]}
                tickCount={11}
                stroke="#e2e8f0"
                tick={{ fill: '#94a3b8', fontSize: 10 }}
              >
                <Label value="Competence" offset={-20} position="insideBottom" fill="#64748b" fontSize={11} fontWeight="bold" />
              </XAxis>
              
              <YAxis
                type="number"
                dataKey="y"
                name="Interest"
                domain={[0, 10]}
                tickCount={11}
                stroke="#e2e8f0"
                tick={{ fill: '#94a3b8', fontSize: 10 }}
              >
                <Label value="Interest" angle={-90} position="insideLeft" style={{ textAnchor: 'middle' }} fill="#64748b" fontSize={11} fontWeight="bold" />
              </YAxis>

              <ZAxis type="number" range={[60, 60]} />

              {/* Prominent Survival Threshold Lines (7x7) */}
              <ReferenceLine x={7} stroke="#3b82f6" strokeWidth={1.5} />
              <ReferenceLine y={7} stroke="#3b82f6" strokeWidth={1.5} />

              <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3' }} />
              
              <Scatter
                name="Jobs"
                data={chartData}
                onClick={(data) => onSelectJob(data as any)}
                className="cursor-pointer"
              >
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.color}
                    stroke="#fff"
                    strokeWidth={1}
                  />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-8 text-center bg-gray-50/50 p-4 rounded-xl border border-gray-100">
           <p className="text-xs font-medium text-gray-500 max-w-lg mx-auto leading-relaxed italic">
             Use this chart to visualise your average score. A higher score will indicate a better match with the job you are applying.
           </p>
        </div>
      </div>
    </div>
  );
}

const COLORS = [
  '#3b82f6', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', 
  '#ec4899', '#06b6d4', '#f97316', '#6366f1', '#14b8a6'
];
