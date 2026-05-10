import React from 'react';
import { LogIn, Rocket, Shield, Zap, Globe } from 'lucide-react';
import { loginWithGoogle } from '../lib/firebase';
import { motion } from 'motion/react';

export default function Landing() {
  return (
    <div className="min-h-screen bg-brand-secondary selection:bg-brand-accent selection:text-white font-sans overflow-hidden">
      {/* Background blobs for mood */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-brand-accent/5 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute top-[60%] -right-[5%] w-[30%] h-[30%] bg-emerald-400/5 rounded-full blur-[100px]" />
      </div>

      <nav className="relative z-10 flex items-center justify-between px-8 py-10 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-brand-primary rounded-2xl flex items-center justify-center shadow-lg transform rotate-3">
            <Rocket className="w-6 h-6 text-brand-accent animate-bounce" />
          </div>
          <div>
            <span className="text-2xl font-black tracking-tighter text-brand-primary">CATALYST</span>
            <div className="h-1 w-full bg-brand-accent rounded-full -mt-1 opacity-50" />
          </div>
        </div>
      </nav>

      <main className="relative z-10 max-w-7xl mx-auto px-8 pt-12 pb-32 grid md:grid-cols-2 gap-20 items-center">
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-10"
        >
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-brand-accent/10 rounded-full border border-brand-accent/20">
              <span className="w-2 h-2 bg-brand-accent rounded-full animate-ping" />
              <span className="text-[10px] font-black uppercase tracking-widest text-brand-accent">Now with Cloud Sync</span>
            </div>
            <h1 className="text-7xl lg:text-8xl font-black text-brand-primary tracking-tight leading-[0.9]">
              Own Your <br/> 
              <span className="text-brand-accent italic font-serif">Career</span> <br/>
              Momentum.
            </h1>
            <p className="text-xl text-brand-primary/60 max-w-lg font-medium leading-relaxed">
              Stop drowning in spreadsheets. Catalyst intelligently tracks, scores, and optimizes your job search pipeline in real-time.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-5">
            <button 
              onClick={loginWithGoogle}
              className="group relative flex items-center justify-center gap-4 bg-brand-primary text-white px-10 py-6 rounded-3xl text-xl font-black shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <div className="absolute inset-0 bg-brand-accent opacity-0 group-hover:opacity-10 rounded-3xl transition-opacity" />
              <LogIn className="w-6 h-6 text-brand-accent" />
              Secure Login with Google
            </button>
          </div>

          <div className="grid grid-cols-2 gap-8 pt-10 border-t border-brand-primary/10">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <Globe className="w-5 h-5 text-brand-accent" />
                <span className="text-sm font-bold text-brand-primary uppercase tracking-wider">Cloud Native</span>
              </div>
              <p className="text-sm text-brand-primary/40 font-medium leading-tight">Access your data from anywhere, on any device.</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-brand-accent" />
                <span className="text-sm font-bold text-brand-primary uppercase tracking-wider">Privacy First</span>
              </div>
              <p className="text-sm text-brand-primary/40 font-medium leading-tight">Your search data is encrypted and visible only to you.</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="relative hidden md:block"
        >
          <div className="absolute inset-0 bg-brand-accent/20 blur-[150px] -z-10" />
          <div className="bg-white p-6 rounded-[2.5rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.1)] border border-white transform rotate-3 hover:rotate-0 transition-transform duration-700">
             <div className="space-y-4">
                <div className="flex items-center justify-between mb-8">
                  <div className="w-12 h-3 bg-gray-100 rounded-full" />
                  <div className="flex gap-2">
                    <div className="w-2 h-2 bg-red-400 rounded-full" />
                    <div className="w-2 h-2 bg-amber-400 rounded-full" />
                    <div className="w-2 h-2 bg-emerald-400 rounded-full" />
                  </div>
                </div>
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-16 bg-brand-secondary/50 rounded-2xl border border-gray-100 flex items-center gap-4 px-6">
                    <div className="w-8 h-8 bg-white rounded-lg shadow-sm" />
                    <div className="flex-1 space-y-2">
                      <div className="w-1/2 h-3 bg-brand-primary/10 rounded-full" />
                      <div className="w-1/4 h-2 bg-brand-primary/5 rounded-full" />
                    </div>
                  </div>
                ))}
             </div>
          </div>
          
          <div className="absolute -bottom-10 -left-10 bg-brand-accent text-white p-8 rounded-3xl shadow-2xl transform -rotate-6">
            <Zap className="w-8 h-8 mb-4 " />
            <p className="text-2xl font-black -tracking-tighter">10x Faster Search</p>
            <p className="text-white/60 text-xs font-bold uppercase tracking-widest mt-2">AI-Powered Optimization</p>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
