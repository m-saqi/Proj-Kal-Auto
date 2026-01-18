import React from 'react';
import { Github, Linkedin, Twitter } from 'lucide-react';

export const About = () => {
  return (
    <div className="pt-24 pb-12 px-4 max-w-3xl mx-auto text-center space-y-8 animate-in fade-in">
        <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-xl shadow-brand-500/5 border border-slate-100 dark:border-slate-700">
            <div className="h-24 w-24 bg-gradient-to-tr from-brand-400 to-indigo-500 rounded-full mx-auto mb-6 flex items-center justify-center text-3xl text-white font-bold shadow-lg">
                MS
            </div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">M Saqlain</h1>
            <p className="text-brand-600 dark:text-brand-400 font-medium mb-6">UAF Alumnus (2020-2024)</p>
            
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-8">
                Passionate software developer and Chemist committed to simplifying academic life for UAF students. 
                This tool was created to provide a modern, accurate, and privacy-focused alternative to manual calculation.
            </p>

            <div className="flex justify-center gap-4">
                <SocialLink href="https://github.com/m-saqi" icon={<Github size={20} />} label="GitHub" />
                <SocialLink href="https://www.linkedin.com/in/muhammad-saqlain-akbar/" icon={<Linkedin size={20} />} label="LinkedIn" />
                <SocialLink href="https://x.com/M_Saqlain_Akbar" icon={<Twitter size={20} />} label="Twitter" />
            </div>
        </div>

        <div className="text-sm text-slate-500">
            <p>© 2025 Muhammad Saqlain. All rights reserved.</p>
            <p className="mt-2">Not affiliated with University of Agriculture Faisalabad.</p>
        </div>
    </div>
  );
};

const SocialLink = ({ href, icon, label }: { href: string, icon: React.ReactNode, label: string }) => (
    <a 
        href={href} 
        target="_blank" 
        rel="noopener noreferrer"
        className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-50 dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors text-slate-700 dark:text-slate-200 text-sm font-medium"
    >
        {icon} {label}
    </a>
);