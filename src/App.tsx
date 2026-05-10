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
import Landing from "./components/Landing";
import { ParsedJob } from "./services/geminiService";
import { Loader2 } from "lucide-react";
import { useAuth } from "./context/AuthContext";
import { 
  db, 
  handleFirestoreError, 
  OperationType 
} from "./lib/firebase";
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  writeBatch
} from "firebase/firestore";

const STORAGE_KEY = "career_catalyst_data";

export default function App() {
  const { user, loading: authLoading } = useAuth();
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMigrating, setIsMigrating] = useState(false);

  // Load from Firestore when user is logged in
  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      setApplications([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, "applications"),
      where("userId", "==", user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const apps = snapshot.docs.map(doc => ({
        ...doc.data() as JobApplication
      })).sort((a, b) => b.createdAt - a.createdAt);
      
      setApplications(apps);
      setLoading(false);

      // Check for local data to migrate if cloud is empty
      if (apps.length === 0) {
        const local = localStorage.getItem(STORAGE_KEY);
        if (local) {
          try {
            const parsed = JSON.parse(local);
            if (Array.isArray(parsed) && parsed.length > 0) {
              handleAutoMigration(parsed);
            }
          } catch (e) {
            console.error("Local data parse error during migration check:", e);
          }
        }
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, "applications");
    });

    return () => unsubscribe();
  }, [user, authLoading]);

  const handleAutoMigration = async (localApps: JobApplication[]) => {
    if (!user || isMigrating) return;
    
    if (confirm(`We found ${localApps.length} entries in your local storage. Would you like to sync them to your cloud account?`)) {
      setIsMigrating(true);
      try {
        const batch = writeBatch(db);
        localApps.forEach(app => {
          const appRef = doc(collection(db, "applications"), app.id);
          batch.set(appRef, {
            ...app,
            userId: user.uid, // Ensure it owns to current user
            workArrangement: app.workArrangement || WorkArrangement.NA
          });
        });
        await batch.commit();
        localStorage.removeItem(STORAGE_KEY);
        alert("Migration successful! Your data is now in the cloud.");
      } catch (err) {
        console.error("Migration failed:", err);
        alert("Cloud sync failed. Your data remains in local storage.");
      } finally {
        setIsMigrating(false);
      }
    } else {
      // If they refuse, we keep it in local storage, but won't ask again this session
      // or we could mark it as "don't ask again"
    }
  };

  const handleAddJob = async (parsed: ParsedJob): Promise<JobApplication | null> => {
    if (!user) return null;

    const newJobId = crypto.randomUUID();
    const now = Date.now();
    
    const requirements = parsed.requirements.map(text => ({
      id: crypto.randomUUID(),
      text,
      competencyScore: 0,
      interestScore: 0
    }));

    const newJob: JobApplication = {
      id: newJobId,
      userId: user.uid,
      title: parsed.title,
      company: parsed.company,
      url: parsed.url,
      sourceType: parsed.sourceType,
      status: JobStatus.NOT_APPLIED,
      notes: "",
      requirements,
      avgCompetency: 0,
      avgInterest: 0,
      overallScore: 0,
      createdAt: now,
      updatedAt: now
    };

    try {
      await setDoc(doc(db, "applications", newJobId), newJob);
      return newJob;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `applications/${newJobId}`);
      return null;
    }
  };

  const handleUpdateJob = async (id: string, updates: Partial<JobApplication>) => {
    try {
      await updateDoc(doc(db, "applications", id), {
        ...updates,
        updatedAt: Date.now()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `applications/${id}`);
    }
  };

  const handleDeleteJob = async (id: string) => {
    // Note: Dashboard and JobTable already have UI-level confirmations.
    // Removing browser confirm() to avoid blocking in iframe environments.
    try {
      await deleteDoc(doc(db, "applications", id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `applications/${id}`);
    }
  };

  const handleReorderJob = async (id: string, direction: "up" | "down") => {
    // Reordering in Firestore is complex if we rely on createdAt.
    // For now, let's just swap createdAt if needed, but simple reorder is tricky with real-time sync.
    // We'll leave it as a local-only or sophisticated implementation later.
    // For now, let's just warn that manual reordering is currently limited in cloud mode.
    console.warn("Manual reordering is limited in cloud mode.");
  };

  const handleClearAll = async () => {
    if (!user || applications.length === 0) return;
    
    // Note: Dashboard already has UI-level confirmation.
    try {
      const batch = writeBatch(db);
      applications.forEach(app => {
        batch.delete(doc(db, "applications", app.id));
      });
      await batch.commit();
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, "applications/batch");
    }
  };

  const handleImportData = async (data: JobApplication[]) => {
    if (!user) return;
    try {
      const batch = writeBatch(db);
      data.forEach(app => {
        const newId = app.id || crypto.randomUUID();
        const appRef = doc(collection(db, "applications"), newId);
        batch.set(appRef, {
          ...app,
          id: newId,
          userId: user.uid
        });
      });
      await batch.commit();
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, "applications/import");
    }
  };

  if (authLoading || (user && loading) || isMigrating) {
    return (
      <div className="min-h-screen bg-brand-secondary flex flex-col items-center justify-center gap-6">
        <Loader2 className="w-12 h-12 animate-spin text-brand-accent shadow-brand-accent/50" />
        <p className="text-brand-primary/40 font-black uppercase tracking-[0.3em] text-xs">
          {isMigrating ? "Syncing your data..." : "Waking up the cloud..."}
        </p>
      </div>
    );
  }

  if (!user) {
    return <Landing />;
  }

  return (
    <Dashboard 
      applications={applications}
      onAddJob={handleAddJob}
      onUpdateJob={handleUpdateJob}
      onDeleteJob={handleDeleteJob}
      onReorderJob={handleReorderJob}
      onClearAll={handleClearAll}
      onImportData={handleImportData}
    />
  );
}

