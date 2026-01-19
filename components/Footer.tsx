import React from 'react';

export const Footer = () => {
  return (
    <footer className="bg-white border-t border-slate-100 mt-20">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-slate-500 text-sm">
            © {new Date().getFullYear()} UAF CGPA Calculator
          </div>
          <div className="flex items-center gap-6">
             <a href="https://github.com/m-saqi" target="_blank" className="text-slate-400 hover:text-brand-500 transition-colors text-sm font-medium">
                Developed by <span className="text-slate-700">M Saqlain</span>
             </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
