import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { ShieldCheck, Zap, BookOpen, GraduationCap, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';

export const Home = () => {
  return (
    <div className="space-y-20 pb-12">
      {/* Hero Section */}
      <section className="relative pt-24 pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-brand-50 via-white to-white -z-10" />
        
        <div className="max-w-5xl mx-auto text-center px-4 space-y-8 animate-slide-up">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-brand-100 text-brand-700 text-sm font-semibold shadow-sm mb-4">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-brand-500"></span>
            </span>
            Live LMS Integration
          </div>
          
          <h1 className="text-5xl md:text-7xl font-serif font-black text-slate-900 tracking-tight leading-[1.1]">
            Accurate <span className="text-brand-600">UAF CGPA</span> <br/> Calculator
          </h1>
          
          <p className="text-xl md:text-2xl text-slate-600 max-w-2xl mx-auto leading-relaxed font-light">
            Stop calculating manually. Fetch your exact results from UAF LMS & Attendance System in seconds.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
            <Link to="/calculator">
              <Button size="lg" className="h-16 px-10 text-xl rounded-full shadow-xl shadow-brand-500/20 hover:shadow-brand-500/40 transition-all hover:-translate-y-1">
                Check Result
                <ArrowRight className="ml-2 w-5 h-5"/>
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8">
          <FeatureCard 
            icon={<Zap className="w-8 h-8 text-yellow-500" />}
            title="Automatic Fetching"
            desc="No manual entry. Just enter your Registration Number to pull data directly from UAF servers."
          />
          <FeatureCard 
            icon={<ShieldCheck className="w-8 h-8 text-brand-500" />}
            title="100% Secure"
            desc="We use a secure proxy. Your password (if used) is never stored on our servers."
          />
          <FeatureCard 
            icon={<GraduationCap className="w-8 h-8 text-blue-500" />}
            title="Official Formula"
            desc="Uses UAF's exact linear interpolation formula for marks-to-GPA conversion."
          />
        </div>
      </section>

      {/* Info Section - Ported from old HTML */}
      <section className="max-w-4xl mx-auto px-4 space-y-12">
        <div className="bg-white p-10 rounded-3xl shadow-lg border border-slate-100">
          <h2 className="text-3xl font-serif font-bold mb-6 flex items-center gap-3 text-slate-800">
            <AlertCircle className="text-brand-500 w-8 h-8"/> Why use this tool?
          </h2>
          <div className="prose prose-lg text-slate-600 leading-loose">
            <p className="mb-6">
              Calculating GPA manually is prone to errors because UAF uses a specific 
              <strong> Linear Interpolation</strong> method. 
              For example, 48 marks in a 3-credit course is a 2.66 GPA, but 49 marks is 2.75. 
              Standard calculators miss these details.
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              <li className="flex items-start gap-3 bg-slate-50 p-3 rounded-lg">
                <CheckCircle2 className="w-5 h-5 text-brand-500 shrink-0 mt-1"/>
                <span>Supports BS, MSc, M.Phil, PhD</span>
              </li>
              <li className="flex items-start gap-3 bg-slate-50 p-3 rounded-lg">
                <CheckCircle2 className="w-5 h-5 text-brand-500 shrink-0 mt-1"/>
                <span><strong>B.Ed Mode:</strong> Separate Education logic</span>
              </li>
              <li className="flex items-start gap-3 bg-slate-50 p-3 rounded-lg">
                <CheckCircle2 className="w-5 h-5 text-brand-500 shrink-0 mt-1"/>
                <span><strong>Forecast:</strong> Add hypothetical semesters</span>
              </li>
              <li className="flex items-start gap-3 bg-slate-50 p-3 rounded-lg">
                <CheckCircle2 className="w-5 h-5 text-brand-500 shrink-0 mt-1"/>
                <span><strong>Attendance:</strong> Check subject-wise attendance</span>
              </li>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

const FeatureCard = ({ icon, title, desc }: { icon: any, title: string, desc: string }) => (
  <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-xl hover:border-brand-100 transition-all duration-300 group">
    <div className="bg-slate-50 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-brand-50 transition-colors">
      {icon}
    </div>
    <h3 className="text-xl font-serif font-bold text-slate-900 mb-3">{title}</h3>
    <p className="text-slate-500 leading-relaxed">{desc}</p>
  </div>
);
