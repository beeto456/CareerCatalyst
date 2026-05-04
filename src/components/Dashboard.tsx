/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from "react";
import { 
  LogOut, 
  Download, 
  LayoutDashboard, 
  Plus, 
  Trash2,
  FileSpreadsheet,
  FileText,
  MessageSquare,
  ChevronUp,
  ChevronDown,
  HelpCircle
} from "lucide-react";
import { JobApplication, UserProfile } from "../types";
import JobInput from "./JobInput";
import JobChart from "./JobChart";
import JobStatusGraph from "./JobStatusGraph";
import JobTable from "./JobTable";
import { ParsedJob } from "../services/geminiService";
import { cn } from "../lib/utils";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

interface DashboardProps {
  applications: JobApplication[];
  onAddJob: (parsed: ParsedJob) => JobApplication;
  onUpdateJob: (id: string, updates: Partial<JobApplication>) => void;
  onDeleteJob: (id: string) => void;
  onReorderJob: (id: string, direction: "up" | "down") => void;
  onClearAll: () => void;
}

export default function Dashboard({ 
  applications, 
  onAddJob, 
  onUpdateJob, 
  onDeleteJob,
  onReorderJob,
  onClearAll
}: DashboardProps) {
  const [activeTab, setActiveTab] = useState<"dashboard" | "add">("dashboard");
  const [selectedJobId, setSelectedJobId] = useState<string | null>(applications[0]?.id || null);

  const selectedJob = useMemo(() => 
    applications.find(a => a.id === selectedJobId) || applications[0]
  , [applications, selectedJobId]);

  const [isExporting, setIsExporting] = useState(false);
  const [isExcelExporting, setIsExcelExporting] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleExportExcel = async () => {
    const element = document.getElementById("job-matrix-capture");
    if (!element || isExcelExporting) return;

    try {
      setIsExcelExporting(true);
      console.log("Starting Excel export...");
      
      // Capture the matrix
      let base64Image = null;
      try {
        const canvas = await html2canvas(element, {
          scale: 1.5, // Reduced scale for stability
          useCORS: true,
          logging: false,
          backgroundColor: "#ffffff",
          onclone: (clonedDoc) => {
            const styles = clonedDoc.getElementsByTagName('style');
            for (let i = 0; i < styles.length; i++) {
              styles[i].innerHTML = styles[i].innerHTML
                .replace(/oklch\([^)]+\)/g, '#888')
                .replace(/oklab\([^)]+\)/g, '#888')
                .replace(/color-mix\([^)]+\)/g, '#888');
            }
          }
        });
        base64Image = canvas.toDataURL("image/png");
      } catch (captureError) {
        console.warn("Chart capture failed, proceeding with data only:", captureError);
      }

      const workbook = new ExcelJS.Workbook();
      workbook.creator = "Catalyst Career Strategist";
      workbook.created = new Date();

      const worksheet = workbook.addWorksheet("Job Matrix Analysis");

      // Set columns
      worksheet.columns = [
        { header: "No.", key: "index", width: 5 },
        { header: "Job Title", key: "title", width: 35 },
        { header: "Company", key: "company", width: 25 },
        { header: "Job URL", key: "url", width: 35 },
        { header: "Status", key: "status", width: 15 },
        { header: "Competency", key: "competency", width: 15 },
        { header: "Interest", key: "interest", width: 15 },
        { header: "Overall Fit", key: "overall", width: 15 },
        { header: "Salary Posted", key: "salaryPosted", width: 20 },
        { header: "Target Salary", key: "salaryTarget", width: 20 },
        { header: "Work Mode", key: "work", width: 20 },
        { header: "Location", key: "location", width: 20 },
        { header: "Job Description", key: "description", width: 50 },
        { header: "Notes", key: "notes", width: 50 },
      ];

      // Styling Columns
      worksheet.getColumn('description').alignment = { vertical: 'top', wrapText: true };
      worksheet.getColumn('notes').alignment = { vertical: 'top', wrapText: true };
      worksheet.getColumn('url').alignment = { vertical: 'top' };

      // Styling Header
      const headerRow = worksheet.getRow(1);
      headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
      headerRow.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF141414" }
      };

      // Add Data
      applications.forEach((app, idx) => {
        const row = worksheet.addRow({
          index: idx + 1,
          title: app.title,
          company: app.company,
          url: app.url || "N/A",
          status: app.status,
          competency: Number(app.avgCompetency.toFixed(2)),
          interest: Number(app.avgInterest.toFixed(2)),
          overall: Number(app.overallScore.toFixed(2)),
          salaryPosted: app.salaryPosted || "N/A",
          salaryTarget: app.salaryTarget || "N/A",
          work: app.workArrangement || "N/A",
          location: app.officeLocation || "N/A",
          description: app.requirements.map(r => r.text).join("\n"),
          notes: app.notes
        });
        row.alignment = { vertical: 'top', wrapText: true };
      });

      // Add Chart if captured successfully
      if (base64Image) {
        try {
          const startChartRow = applications.length + 4;
          worksheet.mergeCells(`A${startChartRow}:N${startChartRow}`);
          const titleCell = worksheet.getCell(`A${startChartRow}`);
          titleCell.value = "Job Matrix Analysis Visualization";
          titleCell.font = { bold: true, size: 14 };
          titleCell.alignment = { horizontal: "center" };

          const imageId = workbook.addImage({
            base64: base64Image,
            extension: 'png',
          });

          worksheet.addImage(imageId, {
            tl: { col: 0, row: startChartRow + 1 },
            ext: { width: 500, height: 300 } // Smaller size in Excel to be safe
          });
        } catch (imgAddError) {
          console.error("Failed to add image to Excel:", imgAddError);
        }
      }

      // Write to buffer and save
      console.log("Generating buffer...");
      const buffer = await workbook.xlsx.writeBuffer();
      console.log("Buffer generated successfully.");
      const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
      saveAs(blob, `Catalyst_Report_${new Date().toISOString().split('T')[0]}.xlsx`);

    } catch (error) {
      console.error("CRITICAL: Excel Export failed:", error);
      const errorMsg = error instanceof Error ? error.message : String(error);
      const stack = error instanceof Error ? error.stack : "No stack trace";
      alert(`Export failed at step: ${errorMsg}\n\nStack: ${stack.slice(0, 100)}...`);
    } finally {
      setIsExcelExporting(false);
    }
  };

  const handleExportPDF = async () => {
    const element = document.getElementById("active-job-details");
    if (!element || isExporting) return;

    try {
      setIsExporting(true);
      // Wait for any animations or state changes to settle
      await new Promise(resolve => setTimeout(resolve, 500));

      const canvas = await html2canvas(element, {
        scale: 2, // Higher resolution
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight,
        onclone: (clonedDoc) => {
          // Identify and neutralize modern CSS color functions that crash html2canvas
          const styles = clonedDoc.getElementsByTagName('style');
          for (let i = 0; i < styles.length; i++) {
            styles[i].innerHTML = styles[i].innerHTML
              .replace(/oklch\([^)]+\)/g, '#888')
              .replace(/oklab\([^)]+\)/g, '#888')
              .replace(/color-mix\([^)]+\)/g, '#888');
          }

          // Override variables to HEX in the clone
          const style = clonedDoc.createElement('style');
          style.innerHTML = `
            :root {
              --color-gray-50: #f9fafb !important;
              --color-gray-100: #f3f4f6 !important;
              --color-gray-200: #e5e7eb !important;
              --color-gray-300: #d1d5db !important;
              --color-gray-400: #9ca3af !important;
              --color-gray-500: #6b7280 !important;
              --color-gray-600: #4b5563 !important;
              --color-gray-700: #374151 !important;
              --color-gray-800: #1f2937 !important;
              --color-gray-900: #111827 !important;
              --color-gray-950: #030712 !important;
              --color-brand-primary: #141414 !important;
              --color-brand-accent: #3b82f6 !important;
              --color-emerald-500: #10b981 !important;
              --color-red-500: #ef4444 !important;
              --color-orange-500: #f97316 !important;
            }
            * {
              /* Fallback for anything that might still be using oklch/oklab interpolation */
              color-interpolation-filters: sRGB !important;
            }
          `;
          clonedDoc.head.appendChild(style);
        }
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${selectedJob?.title || 'Report'}_Analysis.pdf`);
    } catch (error) {
      console.error("PDF Export failed:", error);
      alert("Failed to export PDF. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row font-sans">
      {/* Sidebar */}
      <aside className="w-full md:w-80 bg-brand-primary text-white flex flex-col p-6 shrink-0 h-screen sticky top-0 overflow-y-auto">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-8 h-8 bg-brand-accent rounded-lg rotate-12 flex items-center justify-center font-bold text-lg italic">C</div>
          <h1 className="font-bold text-xl tracking-tight">Catalyst</h1>
        </div>

        <nav className="flex-1 space-y-2">
          <button 
            onClick={() => setActiveTab("dashboard")}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all",
              activeTab === "dashboard" ? "bg-white/10 text-white shadow-inner" : "text-white/50 hover:text-white"
            )}
          >
            <LayoutDashboard className="w-4 h-4" />
            Dashboard
          </button>
          <button 
            onClick={() => setActiveTab("add")}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all",
              activeTab === "add" ? "bg-white/10 text-white shadow-inner" : "text-white/50 hover:text-white"
            )}
          >
            <Plus className="w-4 h-4" />
            Add Job Description
          </button>
        </nav>

        <div className="mt-10 border-t border-white/10 pt-6">
          <div className="flex items-center justify-between px-4 mb-4">
            <h3 className="text-[10px] uppercase font-bold text-white/30 tracking-widest">Tracked Opportunities</h3>
            {applications.length > 0 && (
              <div className="flex items-center">
                {showResetConfirm ? (
                  <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-2 duration-200">
                    <span className="text-[8px] font-bold text-red-400 uppercase tracking-tighter">Wipe all data?</span>
                    <button 
                      onClick={() => {
                        onClearAll();
                        setShowResetConfirm(false);
                      }}
                      className="text-[9px] font-bold text-white bg-red-500/20 hover:bg-red-500/40 px-1.5 py-0.5 rounded transition-all"
                    >
                      Yes
                    </button>
                    <button 
                      onClick={() => setShowResetConfirm(false)}
                      className="text-[9px] font-bold text-white/40 hover:text-white transition-colors"
                    >
                      No
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={() => setShowResetConfirm(true)}
                    className="text-[9px] uppercase font-bold text-red-400/60 hover:text-red-400 transition-colors flex items-center gap-1"
                    title="Clear all entries"
                  >
                    <Trash2 className="w-2.5 h-2.5" />
                    Reset
                  </button>
                )}
              </div>
            )}
          </div>
          <div className="space-y-1">
            {applications.map((app, index) => (
              <div key={app.id} className="group relative">
                <div className="absolute left-1 top-1/2 -translate-y-1/2 flex flex-col items-center opacity-0 group-hover:opacity-100 transition-all z-10">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onReorderJob(app.id, "up");
                    }}
                    disabled={index === 0}
                    className="p-1 text-white/40 hover:text-white disabled:opacity-0 transition-all"
                    title="Move up"
                  >
                    <ChevronUp className="w-3 h-3" />
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onReorderJob(app.id, "down");
                    }}
                    disabled={index === applications.length - 1}
                    className="p-1 text-white/40 hover:text-white disabled:opacity-0 transition-all"
                    title="Move down"
                  >
                    <ChevronDown className="w-3 h-3" />
                  </button>
                </div>

                <button
                  onClick={() => {
                    setSelectedJobId(app.id);
                    setActiveTab("dashboard");
                  }}
                  className={cn(
                    "w-full text-left px-4 pl-8 py-3 rounded-xl text-xs flex flex-col gap-1 transition-all pr-12",
                    selectedJobId === app.id && activeTab === "dashboard" ? "bg-brand-accent text-white" : "text-white/60 hover:bg-white/5"
                  )}
                >
                  <span className="font-bold truncate">{app.title}</span>
                  <span className={cn("text-[9px] uppercase tracking-wider font-bold opacity-60", selectedJobId === app.id && activeTab === "dashboard" ? "text-white" : "text-brand-accent")}>{app.company}</span>
                </button>
                
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center">
                  {deletingId === app.id ? (
                    <div className="flex items-center gap-1.5 animate-in fade-in slide-in-from-right-1 duration-200">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteJob(app.id);
                          setDeletingId(null);
                        }}
                        className="p-1.5 text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeletingId(null);
                        }}
                        className="text-[9px] font-bold text-white/40 hover:text-white transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeletingId(app.id);
                      }}
                      className="p-2 text-white/20 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                      title="Remove entry"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-auto border-t border-white/10 pt-6">
          <div className="p-4 bg-white/5 rounded-xl border border-white/10">
            <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest mb-1">Status</p>
            <p className="text-xs font-medium text-emerald-400 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Local Sync Active
            </p>
          </div>
        </div>
      </aside>


      {/* Main Content */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          {activeTab === "add" ? (
            <div className="max-w-4xl mx-auto py-12">
              <JobInput onParsed={(parsed) => {
                const newJob = onAddJob(parsed);
                setSelectedJobId(newJob.id);
                setActiveTab("dashboard");
              }} />
            </div>
          ) : (
            <div className="space-y-12">
              {/* Header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <h2 className="text-3xl font-bold tracking-tighter text-brand-primary mb-2">Opportunity Matrix</h2>
                  <p className="text-gray-400 text-sm">Visualizing {applications.length} active applications</p>
                  <p className="text-gray-400 text-sm mt-1">Start by clicking on 'Add Job Description' on the left sidebar.</p>
                </div>
                  <div className="flex items-center gap-3">
                    <a 
                      href="https://forms.gle/cTTYQzaCadg6hxmd6" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-lg text-xs font-bold transition-all shadow-sm hover:border-gray-400 hover:bg-gray-50 hover:text-brand-primary active:scale-95"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      Feedback
                    </a>
                    <button 
                      onClick={handleExportExcel}
                      disabled={isExcelExporting}
                      className={cn(
                        "flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-xs font-bold transition-all shadow-sm active:scale-95",
                        isExcelExporting ? "opacity-50 cursor-not-allowed" : "hover:border-gray-400 hover:bg-gray-50"
                      )}
                    >
                      {isExcelExporting ? (
                        <div className="w-3.5 h-3.5 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
                      ) : (
                        <Download className="w-3.5 h-3.5 text-emerald-500" />
                      )}
                      {isExcelExporting ? "Generating..." : "Excel Download"}
                    </button>
                   {/* PDF Export hidden due to bugs with modern CSS color functions (oklch/oklab) in html2canvas - house-keeping for future fix */}
                   {/* 
                   <button 
                    onClick={handleExportPDF}
                    disabled={isExporting}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-xs font-bold transition-all shadow-sm",
                      isExporting ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-50"
                    )}
                   >
                     {isExporting ? (
                       <div className="w-3.5 h-3.5 border-2 border-red-500/20 border-t-red-500 rounded-full animate-spin" />
                     ) : (
                       <FileText className="w-3.5 h-3.5 text-red-500" />
                     )}
                     {isExporting ? "Generating..." : "PDF Summary"}
                   </button>
                   */}
                </div>
              </div>

              {/* Chart Section */}
              <JobChart 
                applications={applications} 
                onSelectJob={(job) => setSelectedJobId(job.id)} 
                onDeleteJob={onDeleteJob}
                onClearAll={onClearAll}
              />

              <JobStatusGraph applications={applications} />

              {/* Details Section */}
              {selectedJob ? (
                <div id="active-job-details" className="pt-12 border-t border-gray-100">
                  <div className="flex flex-col gap-2 mb-8">
                    <div>
                      <h3 className="text-2xl font-bold tracking-tight mb-2">Detail Analysis</h3>
                      <p className="text-sm text-gray-400 italic">Adjust the scores to update the matrix position in real-time. Data are automatically saved to your current browser, and you can continue where you left off even if you close this website.</p>
                      
                      <div className="mt-3 flex flex-wrap gap-4">
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-500 uppercase tracking-wider bg-gray-50 px-2 py-1 rounded-md border border-gray-100">
                          <HelpCircle className="w-3 h-3 text-brand-accent" />
                          <span>Competence: How good you are at this job</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-500 uppercase tracking-wider bg-gray-50 px-2 py-1 rounded-md border border-gray-100">
                          <HelpCircle className="w-3 h-3 text-orange-500" />
                          <span>Interest: How much you enjoy this job</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <JobTable 
                    job={selectedJob} 
                    onUpdate={(updates) => onUpdateJob(selectedJob.id, updates)}
                    onDelete={() => onDeleteJob(selectedJob.id)}
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-24 text-gray-400 bg-white rounded-3xl border border-dashed border-gray-200">
                  <LayoutDashboard className="w-12 h-12 mb-4 opacity-10" />
                  <p className="text-sm font-medium">Add a job application to start your analysis</p>
                  <button 
                    onClick={() => setActiveTab("add")}
                    className="mt-4 text-xs font-bold text-brand-accent hover:underline"
                  >
                    + Add your first job description
                  </button>
                </div>
              )}
            </div>
          )}
          
          {/* Main Area Footer */}
          <footer className="mt-12 pt-6 border-t border-gray-100/50 pb-8">
            <p className="text-[9px] text-gray-400 font-medium">
              Made by Merlin Cheng <span className="opacity-70">(<a href="https://www.linkedin.com/in/merlinkun/" target="_blank" rel="noopener noreferrer" className="hover:text-brand-primary underline transition-colors">LinkedIn</a> | <a href="https://merlinkun.figma.site/" target="_blank" rel="noopener noreferrer" className="hover:text-brand-primary underline transition-colors">Portfolio</a>)</span>, 2026. &nbsp; • &nbsp; Created using Google AI Studio. &nbsp; • &nbsp; App is in development (V 1.0). &nbsp; • &nbsp; Based on JD Review V6 Excel Sheet.
            </p>
          </footer>
        </div>
      </main>
    </div>
  );
}
