/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Loader2, Plus, Globe, FileText } from "lucide-react";
import { ParsedJob } from "../services/geminiService";

interface JobInputProps {
  onParsed: (job: ParsedJob) => void;
}

export default function JobInput({ onParsed }: JobInputProps) {
  const [inputValue, setInputValue] = useState("");
  const [manualTitle, setManualTitle] = useState("");
  const [manualCompany, setManualCompany] = useState("");
  const [manualUrl, setManualUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      // Split by lines and filter empty ones
      const rawLines = inputValue.split(/\r?\n/).map(line => line.trim()).filter(line => line.length > 0);
      
      const trimmedUrl = manualUrl.trim();
      const parsed: ParsedJob = {
        title: manualTitle.trim() || 'Untitled Job',
        company: manualCompany.trim() || 'Unknown Company',
        requirements: rawLines,
        url: trimmedUrl || undefined,
        sourceType: trimmedUrl ? "URL" : "Manual Input"
      };

      onParsed(parsed);
      
      setInputValue("");
      setManualTitle("");
      setManualCompany("");
      setManualUrl("");
    } catch (err: any) {
      console.error("Job Addition Error:", err);
      setError(err.message || "Something went wrong while adding the job.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold">Add New Job</h3>
          <p className="text-sm text-gray-400 max-w-md">Fill in the text box and click on the 'Add Job' button below.</p>
        </div>
        <div className="flex bg-gray-100 p-1 rounded-lg shrink-0 w-fit">
          <button
            type="button"
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-all bg-white text-brand-primary shadow-sm"
          >
            <FileText className="w-3.5 h-3.5" />
            Text
          </button>
          <button
            type="button"
            disabled
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-all text-gray-300 cursor-not-allowed"
          >
            <Globe className="w-3.5 h-3.5" />
            URL (Coming Soon)
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Job Title</label>
              <input
                type="text"
                placeholder="e.g. UX Designer"
                value={manualTitle}
                onChange={(e) => setManualTitle(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-brand-accent/20 focus:border-brand-accent outline-none transition-all text-sm"
                disabled={isLoading}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Company's Name</label>
              <input
                type="text"
                placeholder="e.g. Google"
                value={manualCompany}
                onChange={(e) => setManualCompany(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-brand-accent/20 focus:border-brand-accent outline-none transition-all text-sm"
                disabled={isLoading}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-2">URL of the Job Description (Optional)</label>
            <input
              type="url"
              placeholder="https://..."
              value={manualUrl}
              onChange={(e) => setManualUrl(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-brand-accent/20 focus:border-brand-accent outline-none transition-all text-sm"
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Paste Job Description</label>
            <textarea
              placeholder="Paste the requirements, responsibilities, and job details here. Each line is a bullet point on the list."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-brand-accent/20 focus:border-brand-accent outline-none transition-all text-sm resize-none"
              disabled={isLoading}
            />
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-50 text-red-600 text-xs rounded-lg border border-red-100 italic">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading || !inputValue.trim()}
          className="w-full bg-brand-primary text-white py-3 rounded-lg font-bold hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 group"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-white/50" />
              Adding...
            </>
          ) : (
            <>
              <Plus className="w-4 h-4 group-hover:scale-110 transition-transform" />
              Add Job
            </>
          )}
        </button>
      </form>
    </div>
  );
}
