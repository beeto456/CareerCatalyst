/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import confetti from "canvas-confetti";
import { 
  Calendar, 
  Trash2, 
  ChevronDown, 
  Info,
  ExternalLink,
  MessageSquare,
  Edit2,
  Check,
  Globe,
  DollarSign,
  MapPin,
  HelpCircle,
  Plus
} from "lucide-react";
import { JobApplication, JobRequirement, JobStatus, InterviewMethod, WorkArrangement } from "../types";
import { STATUS_OPTIONS, INTERVIEW_METHOD_OPTIONS, WORK_ARRANGEMENT_OPTIONS } from "../constants";
import { cn } from "../lib/utils";

interface JobTableProps {
  job: JobApplication;
  onUpdate: (updates: Partial<JobApplication>) => void;
  onDelete: () => void;
}

export default function JobTable({ job, onUpdate, onDelete }: JobTableProps) {
  const [isEditingTitle, setIsEditingTitle] = React.useState(false);
  const [isEditingCompany, setIsEditingCompany] = React.useState(false);
  const [isEditingUrl, setIsEditingUrl] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [newRequirementText, setNewRequirementText] = React.useState("");
  const [isAddingRequirement, setIsAddingRequirement] = React.useState(false);

  const handleRequirementScore = (reqId: string, field: 'competencyScore' | 'interestScore', value: number) => {
    const updatedRequirements = job.requirements.map(req => 
      req.id === reqId ? { ...req, [field]: value } : req
    );
    
    // Calculate new averages
    const avgCompetency = updatedRequirements.reduce((acc, curr) => acc + curr.competencyScore, 0) / updatedRequirements.length;
    const avgInterest = updatedRequirements.reduce((acc, curr) => acc + curr.interestScore, 0) / updatedRequirements.length;
    const overallScore = (avgCompetency + avgInterest) / 2;

    onUpdate({ 
      requirements: updatedRequirements,
      avgCompetency,
      avgInterest,
      overallScore
    });
  };

  const handleRequirementTextChange = (reqId: string, text: string) => {
    const updatedRequirements = job.requirements.map(req => 
      req.id === reqId ? { ...req, text } : req
    );
    onUpdate({ requirements: updatedRequirements });
  };

  const handleDeleteRequirement = (reqId: string) => {
    if (job.requirements.length <= 1) {
      alert("At least one requirement is required.");
      return;
    }
    const updatedRequirements = job.requirements.filter(req => req.id !== reqId);
    
    // Calculate new averages
    const avgCompetency = updatedRequirements.reduce((acc, curr) => acc + curr.competencyScore, 0) / updatedRequirements.length;
    const avgInterest = updatedRequirements.reduce((acc, curr) => acc + curr.interestScore, 0) / updatedRequirements.length;
    const overallScore = (avgCompetency + avgInterest) / 2;

    onUpdate({ 
      requirements: updatedRequirements,
      avgCompetency,
      avgInterest,
      overallScore
    });
  };

  const handleAddRequirement = () => {
    if (job.requirements.length >= 25) {
      alert("Maximum of 25 requirements reached.");
      return;
    }
    if (!newRequirementText.trim()) return;

    const newReq: JobRequirement = {
      id: crypto.randomUUID(),
      text: newRequirementText.trim(),
      competencyScore: 0,
      interestScore: 0
    };

    const updatedRequirements = [...job.requirements, newReq];
    
    // Calculate new averages
    const avgCompetency = updatedRequirements.reduce((acc, curr) => acc + curr.competencyScore, 0) / updatedRequirements.length;
    const avgInterest = updatedRequirements.reduce((acc, curr) => acc + curr.interestScore, 0) / updatedRequirements.length;
    const overallScore = (avgCompetency + avgInterest) / 2;

    onUpdate({ 
      requirements: updatedRequirements,
      avgCompetency,
      avgInterest,
      overallScore
    });
    setNewRequirementText("");
    setIsAddingRequirement(false);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden mb-8">
      {/* Header */}
      <div className="p-6 border-bottom border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gray-50">
        <div className="flex flex-col gap-2 w-full md:w-2/3">
          {/* Title Area */}
          <div className="flex items-center gap-2 group/title">
            {isEditingTitle ? (
              <div className="flex items-center gap-2 flex-1">
                <input 
                  type="text"
                  value={job.title}
                  autoFocus
                  onChange={(e) => onUpdate({ title: e.target.value })}
                  onKeyDown={(e) => e.key === 'Enter' && setIsEditingTitle(false)}
                  className="text-xl font-bold tracking-tight bg-white border border-brand-accent rounded px-2 py-1 outline-none w-full"
                  placeholder="Job Title"
                />
                <button 
                  onClick={() => setIsEditingTitle(false)}
                  className="p-1.5 bg-brand-accent text-white rounded hover:bg-brand-accent/90 transition-colors"
                >
                  <Check className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <>
                <h2 className="text-xl font-bold tracking-tight text-gray-900 px-1">{job.title}</h2>
                <button 
                  onClick={() => setIsEditingTitle(true)}
                  className="p-1.5 text-gray-400 hover:text-brand-accent opacity-0 group-hover/title:opacity-100 transition-all rounded-md hover:bg-white"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </>
            )}
          </div>

          {/* Company Area */}
          <div className="flex items-center gap-2 group/company">
            {isEditingCompany ? (
              <div className="flex items-center gap-2 flex-1">
                <input 
                  type="text"
                  value={job.company}
                  autoFocus
                  onChange={(e) => onUpdate({ company: e.target.value })}
                  onKeyDown={(e) => e.key === 'Enter' && setIsEditingCompany(false)}
                  className="text-sm font-medium uppercase tracking-wide bg-white border border-brand-accent rounded px-2 py-1 outline-none w-full"
                  placeholder="Company Name"
                />
                <button 
                  onClick={() => setIsEditingCompany(false)}
                  className="p-1.5 bg-brand-accent text-white rounded hover:bg-brand-accent/90 transition-colors"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <>
                <p className="text-sm text-gray-500 font-medium uppercase tracking-wide px-1">{job.company}</p>
                <button 
                  onClick={() => setIsEditingCompany(true)}
                  className="p-1.5 text-gray-400 hover:text-brand-accent opacity-0 group-hover/company:opacity-100 transition-all rounded-md hover:bg-white"
                >
                  <Edit2 className="w-3 h-3" />
                </button>
              </>
            )}
          </div>

          {/* URL / Source Area */}
          <div className="flex items-center gap-2 group/url pt-1">
            <div className="flex items-center gap-2 bg-white/50 border border-gray-100 rounded-lg px-2 py-1 flex-1 max-w-md">
              <Globe className="w-3 h-3 text-gray-400 shrink-0" />
              {isEditingUrl ? (
                <div className="flex items-center gap-2 flex-1">
                  <input 
                    type="text"
                    value={job.url || ""}
                    autoFocus
                    onChange={(e) => onUpdate({ url: e.target.value, sourceType: e.target.value ? 'URL' : 'Manual Input' })}
                    onKeyDown={(e) => e.key === 'Enter' && setIsEditingUrl(false)}
                    className="text-[10px] bg-transparent outline-none w-full font-mono"
                    placeholder="Enter URL..."
                  />
                  <button 
                    onClick={() => setIsEditingUrl(false)}
                    className="text-brand-accent hover:text-brand-accent/80"
                  >
                    <Check className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between flex-1">
                  <div className="flex items-center gap-2 overflow-hidden">
                    {job.url ? (
                      <a 
                        href={job.url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-[10px] text-brand-accent hover:underline font-mono truncate"
                      >
                        {job.url}
                      </a>
                    ) : (
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Manual Input</span>
                    )}
                  </div>
                  <button 
                    onClick={() => setIsEditingUrl(true)}
                    className="p-1 text-gray-400 hover:text-brand-accent opacity-0 group-hover/url:opacity-100 transition-all"
                  >
                    <Edit2 className="w-2.5 h-2.5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-end">
             <span className="text-[10px] uppercase font-bold text-gray-400 mb-1">Job Status</span>
             <select 
              value={job.status}
              onChange={(e) => {
                const newStatus = e.target.value as JobStatus;
                onUpdate({ status: newStatus });
                if (newStatus === JobStatus.OFFERED) {
                  confetti({
                    particleCount: 150,
                    spread: 70,
                    origin: { y: 0.6 },
                    colors: ['#141414', '#1d4ed8', '#f97316', '#10b981']
                  });
                }
              }}
              className="text-xs font-bold bg-white border border-gray-200 rounded px-3 py-1.5 focus:border-brand-accent outline-none"
             >
                {STATUS_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
             </select>
          </div>
          
          <div className="mt-4">
            {isDeleting ? (
              <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-1 duration-200">
                <span className="text-[8px] font-bold text-red-500 uppercase tracking-tighter">Remove Job?</span>
                <button 
                  onClick={() => {
                    onDelete();
                    setIsDeleting(false);
                  }}
                  className="text-[10px] font-bold text-white bg-red-500 px-2 py-1 rounded hover:bg-red-600 transition-all"
                >
                  Yes
                </button>
                <button 
                  onClick={() => setIsDeleting(false)}
                  className="text-[10px] font-bold text-gray-500 hover:text-gray-700 transition-colors"
                >
                  No
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setIsDeleting(true)}
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                title="Remove opportunity"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white border-bottom border-gray-100 italic">
              <th className="px-6 py-4 text-[11px] font-medium text-gray-400 uppercase tracking-wider w-16 text-center">S/N</th>
              <th className="px-6 py-4 text-[11px] font-medium text-gray-400 uppercase tracking-wider">Job Requirement (Core Tasks)</th>
              <th className="px-6 py-4 text-[11px] font-medium text-gray-400 uppercase tracking-wider w-44 text-center">
                Competence (1-10)
              </th>
              <th className="px-6 py-4 text-[11px] font-medium text-gray-400 uppercase tracking-wider w-44 text-center">
                Interest (1-10)
              </th>
              <th className="px-6 py-4 text-[11px] font-medium text-gray-400 uppercase tracking-wider w-16"></th>
            </tr>
          </thead>
          <tbody className="font-mono text-sm">
            {job.requirements.map((req, index) => (
              <tr key={req.id} className="border-bottom border-gray-50 hover:bg-gray-100 transition-colors group">
                <td className="px-6 py-4 text-gray-400 group-hover:text-gray-900 transition-colors uppercase text-center align-middle">{String(index + 1).padStart(2, '0')}</td>
                <td className="px-6 py-4 font-sans font-medium text-gray-700 leading-relaxed align-middle">
                  <textarea
                    value={req.text}
                    onChange={(e) => handleRequirementTextChange(req.id, e.target.value)}
                    rows={1}
                    className="w-full bg-transparent border-none focus:ring-0 resize-none p-0 focus:outline-none overflow-hidden"
                    style={{ height: 'auto' }}
                    ref={(el) => {
                      if (el) {
                        el.style.height = 'auto';
                        el.style.height = `${el.scrollHeight}px`;
                      }
                    }}
                    onInput={(e) => {
                      const target = e.target as HTMLTextAreaElement;
                      target.style.height = 'auto';
                      target.style.height = `${target.scrollHeight}px`;
                    }}
                  />
                </td>
                <td className="px-6 py-4 text-center align-middle">
                  <input 
                    type="number" 
                    min="0" 
                    max="10"
                    value={req.competencyScore}
                    onChange={(e) => handleRequirementScore(req.id, 'competencyScore', Number(e.target.value))}
                    className="w-16 px-3 py-2 bg-transparent border border-transparent hover:border-gray-200 focus:border-brand-accent focus:bg-white rounded transition-all text-center font-bold text-brand-accent mx-auto"
                  />
                </td>
                <td className="px-6 py-4 text-center align-middle">
                  <input 
                    type="number" 
                    min="0" 
                    max="10"
                    value={req.interestScore}
                    onChange={(e) => handleRequirementScore(req.id, 'interestScore', Number(e.target.value))}
                    className="w-16 px-3 py-2 bg-transparent border border-transparent hover:border-gray-200 focus:border-brand-accent focus:bg-white rounded transition-all text-center font-bold text-orange-500 mx-auto"
                  />
                </td>
                <td className="px-6 py-4 align-middle">
                   <button 
                    onClick={() => handleDeleteRequirement(req.id)}
                    className="p-1 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded transition-all opacity-40 group-hover:opacity-100"
                    title="Remove requirement"
                   >
                     <Trash2 className="w-3.5 h-3.5" />
                   </button>
                </td>
              </tr>
            ))}
            
            {/* Add New Requirement Row */}
            {job.requirements.length < 25 && (
              <tr className="border-bottom border-gray-50 bg-gray-50/30 group">
                <td className="px-6 py-4 text-gray-400 text-center">
                  <Plus className="w-4 h-4 mx-auto" />
                </td>
                <td className="px-6 py-4" colSpan={4}>
                  {isAddingRequirement ? (
                    <div className="flex items-center gap-2">
                       <input 
                        type="text"
                        value={newRequirementText}
                        autoFocus
                        onChange={(e) => setNewRequirementText(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddRequirement()}
                        onBlur={() => {
                          if (!newRequirementText.trim()) setIsAddingRequirement(false);
                        }}
                        className="flex-1 bg-white border border-brand-accent rounded-md px-3 py-1.5 font-sans outline-none text-sm"
                        placeholder="Type new requirement and press Enter..."
                      />
                      <button 
                        onClick={handleAddRequirement}
                        disabled={!newRequirementText.trim()}
                        className="px-3 py-1.5 bg-brand-accent text-white rounded-md text-xs font-bold hover:bg-brand-accent/90 disabled:opacity-50"
                      >
                        Add
                      </button>
                      <button 
                        onClick={() => {
                          setIsAddingRequirement(false);
                          setNewRequirementText("");
                        }}
                        className="text-xs text-gray-500 font-bold hover:text-gray-700"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={() => setIsAddingRequirement(true)}
                      className="text-xs font-bold text-brand-accent hover:underline flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Another Requirement ({job.requirements.length}/25)
                    </button>
                  )}
                </td>
              </tr>
            )}
          </tbody>
          <tfoot className="bg-gray-100 font-mono text-sm border-top border-gray-100">
            <tr className="font-bold">
              <td className="px-6 py-4" colSpan={2}>
                <div className="flex items-center gap-2 font-sans italic text-gray-400">
                  <Info className="w-4 h-4" />
                  <span>Your Calculated Averages</span>
                </div>
              </td>
              <td className="px-6 py-4 text-xl text-brand-accent tabular-nums text-center align-middle">
                {job.avgCompetency.toFixed(1)}
              </td>
              <td className="px-6 py-4 text-xl text-orange-500 tabular-nums text-center align-middle">
                {job.avgInterest.toFixed(1)}
              </td>
              <td className="px-6 py-4 border-l border-gray-200 bg-gray-200/20 text-center align-middle">
                <div className="flex flex-col items-center">
                  <span className="text-[8px] uppercase text-gray-500 mb-0.5">Overall</span>
                  <span className="text-2xl text-brand-primary">{job.overallScore.toFixed(1)}</span>
                </div>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Interaction Details */}
      <div className="p-6 bg-white border-top border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div>
            <label className="block text-[10px] uppercase font-bold text-gray-400 mb-2 flex items-center gap-2">
              <Calendar className="w-3 h-3" />
              Application Date
            </label>
            <input 
              type="date"
              value={job.applicationDate || ""}
              onChange={(e) => onUpdate({ applicationDate: e.target.value })}
              className="w-full font-bold bg-gray-50 border border-gray-100 rounded-lg px-4 py-3 focus:bg-white focus:border-brand-accent outline-none text-sm transition-all"
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold text-gray-400 mb-2 flex items-center gap-2">
              <ChevronDown className="w-3 h-3" />
              Interview Method
            </label>
            <select 
              value={job.interviewMethod || ""}
              onChange={(e) => onUpdate({ interviewMethod: e.target.value as InterviewMethod })}
              className="w-full font-bold bg-gray-50 border border-gray-100 rounded-lg px-4 py-3 focus:bg-white focus:border-brand-accent outline-none text-sm transition-all"
            >
                <option value="" disabled>Select Method</option>
                {INTERVIEW_METHOD_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>
          
          <div>
            <label className="block text-[10px] uppercase font-bold text-gray-400 mb-2 flex items-center gap-2">
              <Calendar className="w-3 h-3" />
              Interview Date 1
            </label>
            <input 
              type="date"
              value={job.interviewDate || ""}
              onChange={(e) => onUpdate({ interviewDate: e.target.value })}
              className="w-full font-bold bg-gray-50 border border-gray-100 rounded-lg px-4 py-3 focus:bg-white focus:border-brand-accent outline-none text-sm transition-all"
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold text-gray-400 mb-2 flex items-center gap-2">
              <Calendar className="w-3 h-3" />
              Interview Date 2
            </label>
            <input 
              type="date"
              value={job.interviewDate2 || ""}
              onChange={(e) => onUpdate({ interviewDate2: e.target.value })}
              className="w-full font-bold bg-gray-50 border border-gray-100 rounded-lg px-4 py-3 focus:bg-white focus:border-brand-accent outline-none text-sm transition-all"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 pt-6 border-t border-gray-50 text-left">
          <div>
            <label className="block text-[10px] uppercase font-bold text-gray-400 mb-2 flex items-center gap-2">
              <DollarSign className="w-3 h-3 text-emerald-500" />
              Posted Salary Range
            </label>
            <input 
              type="text"
              placeholder="e.g. $6k-8k/month"
              value={job.salaryPosted || ""}
              onChange={(e) => onUpdate({ salaryPosted: e.target.value })}
              className="w-full font-bold bg-gray-50 border border-gray-100 rounded-lg px-4 py-3 focus:bg-white focus:border-brand-accent outline-none text-sm transition-all"
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold text-gray-400 mb-2 flex items-center gap-2">
              <DollarSign className="w-3 h-3 text-brand-accent" />
              My Target Salary
            </label>
            <input 
              type="text"
              placeholder="e.g. $6k-8k/month"
              value={job.salaryTarget || ""}
              onChange={(e) => onUpdate({ salaryTarget: e.target.value })}
              className="w-full font-bold bg-gray-50 border border-gray-100 rounded-lg px-4 py-3 focus:bg-white focus:border-brand-accent outline-none text-sm transition-all"
            />
          </div>

          <div className="flex flex-col gap-3">
            <div>
              <label className="block text-[10px] uppercase font-bold text-gray-400 mb-2 flex items-center gap-2">
                <MapPin className="w-3 h-3" />
                Work Arrangement
              </label>
              <select 
                value={job.workArrangement || ""}
                onChange={(e) => onUpdate({ workArrangement: e.target.value as WorkArrangement })}
                className="w-full font-bold bg-gray-50 border border-gray-100 rounded-lg px-4 py-3 focus:bg-white focus:border-brand-accent outline-none text-sm transition-all"
              >
                  <option value="" disabled>Select Option</option>
                  {WORK_ARRANGEMENT_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>

            {(job.workArrangement === WorkArrangement.HYBRID || job.workArrangement === WorkArrangement.ONSITE) && (
              <div className="animate-in fade-in slide-in-from-top-1 duration-200">
                <label className="block text-[10px] uppercase font-bold text-gray-400 mb-2 flex items-center gap-2">
                  <MapPin className="w-3 h-3" />
                  Office Location
                </label>
                <input 
                  type="text"
                  placeholder="e.g. Paya Lebar"
                  value={job.officeLocation || ""}
                  onChange={(e) => onUpdate({ officeLocation: e.target.value })}
                  className="w-full font-bold bg-gray-50 border border-gray-100 rounded-lg px-4 py-3 focus:bg-white focus:border-brand-accent outline-none text-sm transition-all"
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold text-gray-400 mb-2 flex items-center gap-2">
              <Calendar className="w-3 h-3 text-brand-primary" />
              Follow-up Date
            </label>
            <input 
              type="date"
              value={job.followUpDate || ""}
              onChange={(e) => onUpdate({ followUpDate: e.target.value })}
              className="w-full font-bold bg-gray-50 border border-gray-100 rounded-lg px-4 py-3 focus:bg-white focus:border-brand-accent outline-none text-sm transition-all"
            />
          </div>
        </div>

        <div className="border-t border-gray-50 pt-8">
          <label className="block text-[10px] uppercase font-bold text-gray-400 mb-2 flex items-center gap-2">
            <MessageSquare className="w-3 h-3" />
            Notes and Comments
          </label>
          <textarea 
            placeholder="Key achievements to mention, questions to ask, or feedback received..."
            value={job.notes}
            onChange={(e) => onUpdate({ notes: e.target.value })}
            rows={5}
            className="w-full font-sans bg-gray-50 border border-gray-100 rounded-lg px-4 py-3 focus:bg-white focus:border-brand-accent outline-none text-sm resize-none transition-all placeholder:italic"
          />
        </div>
      </div>
    </div>
  );
}
