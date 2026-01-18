import React from 'react';
import { useApp } from '../context/AppContext';
import { Button } from '../components/ui/Button';
import { useNavigate } from 'react-router-dom';
import { Trash2, User, Check, Plus } from 'lucide-react';

export const Profiles = () => {
  const { savedProfiles, activeProfile, setActiveProfile, deleteProfile } = useApp();
  const navigate = useNavigate();
  const profiles = Object.values(savedProfiles);

  const handleSelect = (profile: any) => {
    setActiveProfile(profile);
    navigate('/calculator');
  };

  return (
    <div className="pt-24 pb-12 px-4 max-w-4xl mx-auto space-y-8 animate-in fade-in">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Saved Profiles</h1>
        <Button onClick={() => navigate('/')} variant="secondary" size="sm">
          <Plus className="w-4 h-4 mr-2" /> New Search
        </Button>
      </div>

      {profiles.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
            <User size={32} />
          </div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">No Profiles Found</h2>
          <p className="text-slate-600 dark:text-slate-400 mt-2 mb-6">Fetch a result from the home page to save a profile.</p>
          <Button onClick={() => navigate('/')}>Go Home</Button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {profiles.map((profile) => (
            <div key={profile.id} className={`relative overflow-hidden p-6 rounded-2xl border transition-all ${
              activeProfile?.id === profile.id 
                ? 'border-brand-500 ring-1 ring-brand-500 bg-brand-50/30 dark:bg-brand-900/10' 
                : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:shadow-lg hover:border-brand-200 dark:hover:border-brand-800'
            }`}>
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl flex items-center justify-center ${
                     activeProfile?.id === profile.id 
                     ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/30' 
                     : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                  }`}>
                    <User size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-slate-900 dark:text-white leading-tight">
                        {profile.studentInfo.name}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 font-mono mt-1">
                        {profile.studentInfo.registration}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3 mt-4">
                <Button 
                  variant={activeProfile?.id === profile.id ? 'primary' : 'secondary'} 
                  className="flex-1"
                  onClick={() => handleSelect(profile)}
                  disabled={activeProfile?.id === profile.id}
                >
                  {activeProfile?.id === profile.id ? (
                      <><Check className="w-4 h-4 mr-2" /> Active</>
                  ) : 'Select Profile'}
                </Button>
                <Button 
                  variant="ghost" 
                  className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 px-3"
                  onClick={(e) => { e.stopPropagation(); deleteProfile(profile.id); }}
                >
                  <Trash2 size={20} />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};