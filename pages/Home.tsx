import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { fetchResults } from '../services/api';
import { Button } from '../components/ui/Button';
import { useNavigate } from 'react-router-dom';
import { Search, Loader2 } from 'lucide-react';

export const Home = () => {
  const { saveProfile, setIsLoading, isLoading } = useApp();
  const [regNum, setRegNum] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleFetch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regNum.trim()) return;

    setIsLoading(true);
    setError('');

    try {
      const profile = await fetchResults(regNum);
      if (profile) {
        saveProfile(profile);
        navigate('/calculator');
      } else {
        setError('No results found. Please check the registration number.');
      }
    } catch (err) {
      setError('Failed to fetch results. Ensure LMS is accessible.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 pt-16">
      <div className="max-w-3xl w-full text-center space-y-8">
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <span className="inline-block px-4 py-1.5 rounded-full bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 font-medium text-sm">
            University of Agriculture Faisalabad
          </span>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            UAF <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-indigo-500">CGPA Calculator</span>
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Automatically fetch your results, calculate accurate CGPA, forecast future grades, and export transcripts. 
          </p>
        </div>

        <div className="w-full max-w-md mx-auto bg-white dark:bg-slate-800 p-2 rounded-2xl shadow-xl shadow-brand-500/10 border border-slate-100 dark:border-slate-700 transform transition-all hover:scale-[1.01]">
          <form onSubmit={handleFetch} className="relative flex items-center">
            <Search className="absolute left-4 text-slate-400 h-5 w-5" />
            <input
              type="text"
              placeholder="e.g. 2020-ag-1234"
              value={regNum}
              onChange={(e) => setRegNum(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-transparent border-none outline-none text-slate-900 dark:text-white placeholder-slate-400 text-lg"
            />
            <Button 
              type="submit" 
              disabled={isLoading || !regNum}
              className="mr-2 rounded-lg"
            >
              {isLoading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Fetch'}
            </Button>
          </form>
        </div>
        
        {error && (
          <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm font-medium animate-in fade-in">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-8 text-center text-sm text-slate-500 dark:text-slate-400">
            <div>
                <strong className="block text-slate-900 dark:text-white text-lg">Auto</strong>
                Fetch Results
            </div>
            <div>
                <strong className="block text-slate-900 dark:text-white text-lg">100%</strong>
                Accurate
            </div>
            <div>
                <strong className="block text-slate-900 dark:text-white text-lg">PDF</strong>
                Export
            </div>
            <div>
                <strong className="block text-slate-900 dark:text-white text-lg">Dark</strong>
                Mode
            </div>
        </div>
      </div>
    </div>
  );
};