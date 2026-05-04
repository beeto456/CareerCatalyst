/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  JobApplication, 
  JobStatus,
  WorkArrangement 
} from "./types";
import Dashboard from "./components/Dashboard";
import { ParsedJob } from "./services/geminiService";
import { Loader2 } from "lucide-react";

const STORAGE_KEY = "career_catalyst_data";

export default function App() {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);

  // Load from LocalStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed: JobApplication[] = JSON.parse(saved);
        // Migration: Add workArrangement to old records
        const migrated = parsed.map(app => ({
          ...app,
          workArrangement: app.workArrangement || WorkArrangement.NA
        }));
        setApplications(migrated);
      } catch (e) {
        console.error("Failed to load saved data", e);
      }
    }
    setLoading(false);
  }, []);

  // Save to LocalStorage whenever applications change
  useEffect(() => {
    if (!loading) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(applications));
    }
  }, [applications, loading]);

  const handleAddJob = (parsed: ParsedJob): JobApplication => {
    const newJobId = crypto.randomUUID();
    const now = Date.now();
    
    const requirements = parsed.requirements.map(text => ({
      id: crypto.randomUUID(),
      text,
      competencyScore: 5,
      interestScore: 5
    }));

    const newJob: JobApplication = {
      id: newJobId,
      userId: "local-user",
      title: parsed.title,
      company: parsed.company,
      url: parsed.url,
      sourceType: parsed.sourceType,
      status: JobStatus.NOT_APPLIED,
      notes: "",
      requirements,
      avgCompetency: 5,
      avgInterest: 5,
      overallScore: 5,
      createdAt: now,
      updatedAt: now
    };

    setApplications(prev => [newJob, ...prev]);
    return newJob;
  };

  const handleUpdateJob = (id: string, updates: Partial<JobApplication>) => {
    setApplications(prev => prev.map(app => 
      app.id === id ? { ...app, ...updates, updatedAt: Date.now() } : app
    ));
  };

  const handleDeleteJob = (id: string) => {
    setApplications(prev => prev.filter(app => app.id !== id));
  };

  const handleReorderJob = (id: string, direction: "up" | "down") => {
    setApplications(prev => {
      const index = prev.findIndex(app => app.id === id);
      if (index === -1) return prev;
      
      const newApps = [...prev];
      if (direction === "up" && index > 0) {
        [newApps[index - 1], newApps[index]] = [newApps[index], newApps[index - 1]];
      } else if (direction === "down" && index < newApps.length - 1) {
        [newApps[index + 1], newApps[index]] = [newApps[index], newApps[index + 1]];
      }
      return newApps;
    });
  };

  const handleClearAll = () => {
    setApplications([]);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-secondary flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-brand-primary/20" />
      </div>
    );
  }

  return (
    <Dashboard 
      applications={applications}
      onAddJob={handleAddJob}
      onUpdateJob={handleUpdateJob}
      onDeleteJob={handleDeleteJob}
      onReorderJob={handleReorderJob}
      onClearAll={handleClearAll}
    />
  );
}

