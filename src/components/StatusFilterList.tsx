/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from "react";
import { JobApplication, JobStatus } from "../types";
import { ExternalLink, ChevronRight, Briefcase, Building2, BarChart2, Calendar, MapPin, ArrowUpDown, LayoutGrid, Table as TableIcon } from "lucide-react";
import { cn } from "../lib/utils";

interface StatusFilterListProps {
  applications: JobApplication[];
  onSelectJob: (id: string) => void;
  selectedStatus: JobStatus | "All";
  onStatusChange: (status: JobStatus | "All") => void;
  sortBy: SortField;
  onSortByChange: (field: SortField) => void;
  sortOrder: SortOrder;
  onSortOrderChange: (order: SortOrder) => void;
}

type SortField = "avgCompetency" | "avgInterest" | "overallScore" | "applicationDate" | "title" | "company";
type SortOrder = "asc" | "desc";
type ViewMode = "cards" | "table";

const ViewModeSettings = {
  cards: "cards",
  table: "table"
} as const;

const getStatusColor = (status: JobStatus) => {
  switch (status) {
    case JobStatus.NOT_APPLIED:
      return "bg-slate-100 text-slate-600";
    case JobStatus.APPLIED:
      return "bg-amber-100 text-amber-700";
    case JobStatus.AWAITING_INTERVIEW:
      return "bg-cyan-100 text-cyan-700";
    case JobStatus.INTERVIEWING:
      return "bg-blue-100 text-blue-700";
    case JobStatus.OFFERED:
      return "bg-emerald-100 text-emerald-700";
    case JobStatus.REJECTED:
      return "bg-rose-100 text-rose-700";
    case JobStatus.WITHDRAWN:
      return "bg-slate-200 text-slate-600";
    case JobStatus.GHOSTED:
      return "bg-gray-100 text-gray-500";
    case JobStatus.NO_LONGER_INTERESTED:
      return "bg-indigo-50 text-indigo-600";
    default:
      return "bg-gray-100 text-gray-600";
  }
};

export default function StatusFilterList({ 
  applications, 
  onSelectJob,
  selectedStatus,
  onStatusChange,
  sortBy,
  onSortByChange,
  sortOrder,
  onSortOrderChange
}: StatusFilterListProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("cards");
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {
      All: applications.length,
    };
    Object.values(JobStatus).forEach((status) => {
      counts[status] = applications.filter((app) => app.status === status).length;
    });
    return counts;
  }, [applications]);

  const filteredAndSortedJobs = useMemo(() => {
    const filtered = selectedStatus === "All" 
      ? applications 
      : applications.filter(app => app.status === selectedStatus);
    return [...filtered].sort((a, b) => {
      let valA: any = a[sortBy];
      let valB: any = b[sortBy];

      // Handle alphabetical sorting for strings
      if (sortBy === "title" || sortBy === "company") {
        const strA = (valA || "").toString().toLowerCase();
        const strB = (valB || "").toString().toLowerCase();
        return sortOrder === "asc" 
          ? strA.localeCompare(strB) 
          : strB.localeCompare(strA);
      }

      // Handle null dates for sorting
      if (sortBy === "applicationDate") {
        valA = valA ? new Date(valA).getTime() : (sortOrder === "asc" ? Infinity : -Infinity);
        valB = valB ? new Date(valB).getTime() : (sortOrder === "asc" ? Infinity : -Infinity);
      } else {
        valA = Number(valA) || 0;
        valB = Number(valB) || 0;
      }

      if (sortOrder === "asc") return valA - valB;
      return valB - valA;
    });
  }, [applications, selectedStatus, sortBy, sortOrder]);

  const statusOptions = Object.values(JobStatus);

  const toggleSortOrder = () => {
    onSortOrderChange(sortOrder === "asc" ? "desc" : "asc");
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 bg-white p-10 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex-1">
          <h2 
            className="text-4xl font-extrabold tracking-tight text-brand-primary cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => onStatusChange("All")}
          >
            Status Explorer
          </h2>
          <p className="text-gray-500 text-lg mt-3">Filter and browse your opportunities by application stage</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-6">
          <div className="relative min-w-[240px]">
            <label htmlFor="status-select" className="block text-[12px] uppercase font-bold text-gray-400 mb-2 ml-1">
              Current Stage
            </label>
            <select
              id="status-select"
              value={selectedStatus}
              onChange={(e) => onStatusChange(e.target.value as JobStatus | "All")}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-5 py-3.5 text-lg font-bold text-brand-primary focus:ring-2 focus:ring-brand-accent/20 focus:border-brand-accent outline-none appearance-none cursor-pointer transition-all pr-12"
            >
              <option value="All">All ({statusCounts["All"]})</option>
              {statusOptions.map(status => (
                <option key={status} value={status}>
                  {status} ({statusCounts[status] || 0})
                </option>
              ))}
            </select>
            <div className="absolute right-5 bottom-4 pointer-events-none text-gray-400">
              <ChevronRight className="w-5 h-5 rotate-90" />
            </div>
          </div>

          <div className="flex items-end gap-3">
            <div className="flex bg-gray-50 border border-gray-200 rounded-xl p-1 mb-[1px] h-[58px] items-center">
              <button
                onClick={() => setViewMode("cards")}
                className={cn(
                  "p-3 rounded-lg transition-all flex items-center justify-center",
                  viewMode === "cards" ? "bg-white text-brand-accent shadow-sm" : "text-gray-400 hover:text-brand-primary"
                )}
                title="Card View"
              >
                <LayoutGrid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode("table")}
                className={cn(
                  "p-3 rounded-lg transition-all flex items-center justify-center",
                  viewMode === "table" ? "bg-white text-brand-accent shadow-sm" : "text-gray-400 hover:text-brand-primary"
                )}
                title="Table View"
              >
                <TableIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="relative min-w-[220px]">
              <label htmlFor="sort-select" className="block text-[12px] uppercase font-bold text-gray-400 mb-2 ml-1">
                Sort By
              </label>
              <select
                id="sort-select"
                value={sortBy}
                onChange={(e) => onSortByChange(e.target.value as SortField)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-5 py-3.5 text-lg font-bold text-brand-primary focus:ring-2 focus:ring-brand-accent/20 focus:border-brand-accent outline-none appearance-none cursor-pointer transition-all pr-12"
              >
                <option value="overallScore">Overall Score</option>
                <option value="avgCompetency">Competence</option>
                <option value="avgInterest">Interest</option>
                <option value="applicationDate">Application Date</option>
                <option value="title">Job Role</option>
                <option value="company">Company</option>
              </select>
              <div className="absolute right-5 bottom-4 pointer-events-none text-gray-400">
                <ChevronRight className="w-5 h-5 rotate-90" />
              </div>
            </div>
            
            <button
              onClick={toggleSortOrder}
              className="p-4 bg-gray-50 border border-gray-200 rounded-xl text-brand-primary hover:bg-gray-100 transition-all focus:ring-2 focus:ring-brand-accent/20 h-[58px] flex items-center justify-center"
              title={sortOrder === "asc" ? "Ascending" : "Descending"}
            >
              <ArrowUpDown className={cn("w-6 h-6 transition-transform", sortOrder === "asc" ? "rotate-180" : "")} />
            </button>
          </div>
        </div>
      </div>

      {viewMode === "cards" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredAndSortedJobs.length > 0 ? (
            filteredAndSortedJobs.map((job) => (
              <div 
                key={job.id} 
                className="group bg-white rounded-2xl border border-gray-100 p-10 flex flex-col shadow-sm hover:shadow-md hover:border-brand-accent/30 transition-all cursor-pointer relative overflow-hidden"
                onClick={() => onSelectJob(job.id)}
              >
                {/* Decorative accent */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-accent/5 -mr-16 -mt-16 rounded-full group-hover:scale-110 transition-transform duration-500" />
                
                <div className="relative mb-8">
                  <div className="flex items-center gap-2 mb-3">
                    <Briefcase className="w-5 h-5 text-brand-accent" />
                    <span className="text-[12px] font-bold text-brand-accent uppercase tracking-wider">Role</span>
                  </div>
                  <h4 className="text-2xl font-bold text-brand-primary leading-tight line-clamp-2">{job.title}</h4>
                </div>

                <div className="relative mb-8 flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <Building2 className="w-5 h-5 text-gray-400" />
                    <span className="text-[12px] font-bold text-gray-400 uppercase tracking-wider">Company</span>
                  </div>
                  <p className="text-xl text-gray-600 font-bold">{job.company}</p>
                  
                  <div className="mt-6 space-y-4">
                    {job.applicationDate && (
                      <div className="flex items-center gap-2.5 text-[11px] font-bold text-gray-400 uppercase">
                        <Calendar className="w-4 h-4 text-brand-accent/60" />
                        <span>Applied: {new Date(job.applicationDate).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      </div>
                    )}
                    {job.workArrangement && (
                      <div className="flex items-center gap-2.5 text-[11px] font-bold text-gray-400 uppercase">
                        <MapPin className="w-4 h-4 text-orange-400/60" />
                        <span>{job.workArrangement}</span>
                      </div>
                    )}
                  </div>

                  {job.url && (
                    <a 
                      href={job.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="mt-8 inline-flex items-center gap-2 text-base text-brand-accent hover:underline font-bold"
                    >
                      View Job Listing
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-4 pt-8 border-t border-gray-100">
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[10px] uppercase font-bold text-gray-400 tracking-tighter">Avg Comp.</span>
                    <span className="text-xl font-bold font-mono text-brand-accent">
                      {job.avgCompetency.toFixed(1)}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[10px] uppercase font-bold text-gray-400 tracking-tighter">Avg Int.</span>
                    <span className="text-xl font-bold font-mono text-orange-500">
                      {job.avgInterest.toFixed(1)}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1.5 border-l border-gray-100 pl-4 bg-gray-50/50 rounded-r-lg">
                    <span className="text-[10px] uppercase font-bold text-brand-primary tracking-tighter">Overall</span>
                    <span className="text-xl font-bold font-mono text-brand-primary">
                      {job.overallScore.toFixed(1)}
                    </span>
                  </div>
                </div>

                <div className="mt-10 flex items-center justify-between">
                  <span className="text-[12px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    Click to view details
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-40 flex flex-col items-center justify-center text-gray-400 bg-white/50 rounded-3xl border border-dashed border-gray-200">
              <BarChart2 className="w-24 h-24 mb-6 opacity-10" />
              <h3 className="text-2xl font-bold text-gray-500 mb-3">No matches found</h3>
              <p className="text-lg text-gray-400 text-center px-10">You don't have any jobs marked as "{selectedStatus}" yet.</p>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Role & Company</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Stage</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Score</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Date Applied</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Work Mode</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Location</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredAndSortedJobs.length > 0 ? (
                  filteredAndSortedJobs.map((job) => (
                    <tr 
                      key={job.id} 
                      className="hover:bg-gray-50/50 transition-colors cursor-pointer group"
                      onClick={() => onSelectJob(job.id)}
                    >
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-brand-primary group-hover:text-brand-accent transition-colors">{job.title}</span>
                          <span className="text-xs text-gray-400 font-medium">{job.company}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          "inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                          getStatusColor(job.status as JobStatus)
                        )}>
                          {job.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-3">
                          <div className="flex flex-col items-center">
                            <span className="text-[8px] font-bold text-gray-400 mb-0.5">COMP</span>
                            <span className="text-xs font-bold font-mono text-brand-accent">{job.avgCompetency.toFixed(1)}</span>
                          </div>
                          <div className="flex flex-col items-center">
                            <span className="text-[8px] font-bold text-gray-400 mb-0.5">INT</span>
                            <span className="text-xs font-bold font-mono text-orange-500">{job.avgInterest.toFixed(1)}</span>
                          </div>
                          <div className="flex flex-col items-center px-2 py-1 bg-gray-50 rounded-lg">
                            <span className="text-[8px] font-bold text-brand-primary mb-0.5">OVERALL</span>
                            <span className="text-xs font-bold font-mono text-brand-primary">{job.overallScore.toFixed(1)}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-medium text-gray-500">
                          {job.applicationDate ? new Date(job.applicationDate).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) : "N/A"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-medium text-gray-500">{job.workArrangement || "N/A"}</span>
                      </td>
                      <td className="px-6 py-4 text-xs font-medium text-gray-500 italic max-w-[150px] truncate">
                        {job.officeLocation || "N/A"}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center justify-center text-gray-400">
                        <BarChart2 className="w-12 h-12 mb-4 opacity-10" />
                        <p className="text-sm font-medium">No opportunities found for this filter</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
