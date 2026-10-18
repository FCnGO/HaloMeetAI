import React, { Component, ErrorInfo, ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean; error?: Error }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: undefined };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('App render error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#090A0F] text-white flex flex-col items-center justify-center p-6 text-center">
          <div className="max-w-md w-full bg-[#121317] border border-zinc-800 rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="w-10 h-10 rounded-full bg-rose-950/60 border border-rose-800 flex items-center justify-center mx-auto text-rose-400 font-semibold">
              !
            </div>
            <h1 className="text-base font-semibold">HoloMeet AI Encountered a Display Issue</h1>
            <p className="text-xs text-zinc-400">
              {this.state.error?.message || 'A script error occurred during rendering.'}
            </p>
            <button
              type="button"
              onClick={() => {
                try { localStorage.clear(); } catch {}
                window.location.reload();
              }}
              className="w-full py-2.5 px-4 bg-[#0066FF] hover:bg-[#0052CC] text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
            >
              Reset & Reload App
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
