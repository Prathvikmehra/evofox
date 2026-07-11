import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="w-full bg-[var(--surface)] border-t border-[var(--card-border)] py-12 mt-auto">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Brand */}
        <div className="md:col-span-1">
          <Link to="/" className="echo-title text-2xl font-semibold tracking-tight text-[var(--foreground)] mb-4 block">
            Echo<span className="text-[var(--primary)]">Mind</span>
          </Link>
          <p className="text-[13px] text-[var(--foreground-muted)] font-sans leading-relaxed">
            Your second mind. Clone your texting style, reflect on your past, and communicate with your digital self.
          </p>
        </div>

        {/* Product */}
        <div>
          <h3 className="font-heading font-semibold text-sm text-[var(--foreground)] uppercase tracking-wider mb-4">Product</h3>
          <ul className="space-y-3">
            <li><Link to="/upload" className="text-[13px] text-[var(--foreground-muted)] hover:text-[var(--primary)] transition-colors font-sans">Create Clone</Link></li>
            <li><Link to="/dashboard" className="text-[13px] text-[var(--foreground-muted)] hover:text-[var(--primary)] transition-colors font-sans">Dashboard</Link></li>
            <li><Link to="/about" className="text-[13px] text-[var(--foreground-muted)] hover:text-[var(--primary)] transition-colors font-sans">How it works</Link></li>
          </ul>
        </div>

        {/* Resources */}
        <div>
          <h3 className="font-heading font-semibold text-sm text-[var(--foreground)] uppercase tracking-wider mb-4">Resources</h3>
          <ul className="space-y-3">
            <li><Link to="/feedback" className="text-[13px] text-[var(--foreground-muted)] hover:text-[var(--primary)] transition-colors font-sans">Support</Link></li>
            <li><a href="#" className="text-[13px] text-[var(--foreground-muted)] hover:text-[var(--primary)] transition-colors font-sans">Privacy Policy</a></li>
            <li><a href="#" className="text-[13px] text-[var(--foreground-muted)] hover:text-[var(--primary)] transition-colors font-sans">Terms of Service</a></li>
          </ul>
        </div>

        {/* Social / Contact */}
        <div>
          <h3 className="font-heading font-semibold text-sm text-[var(--foreground)] uppercase tracking-wider mb-4">Connect</h3>
          <ul className="space-y-3">
            <li><a href="https://github.com/Prathvikmehra/evofox" target="_blank" rel="noreferrer" className="text-[13px] text-[var(--foreground-muted)] hover:text-[var(--primary)] transition-colors font-sans">GitHub</a></li>
            <li><a href="#" className="text-[13px] text-[var(--foreground-muted)] hover:text-[var(--primary)] transition-colors font-sans">Twitter</a></li>
            <li><a href="#" className="text-[13px] text-[var(--foreground-muted)] hover:text-[var(--primary)] transition-colors font-sans">Discord</a></li>
          </ul>
        </div>

      </div>
      
      <div className="max-w-7xl mx-auto px-6 mt-12 pt-8 border-t border-[var(--card-border)] flex flex-col md:flex-row justify-between items-center">
        <p className="text-[12px] text-[var(--foreground-muted)] font-sans">
          &copy; {new Date().getFullYear()} EchoMind / Evofox. All rights reserved.
        </p>
        <p className="text-[12px] text-[var(--foreground-muted)] font-sans mt-4 md:mt-0 flex items-center gap-1">
          Built with <span className="text-[var(--primary)] font-bold">♥</span> using local AI
        </p>
      </div>
    </footer>
  );
}
