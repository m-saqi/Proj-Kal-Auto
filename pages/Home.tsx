import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { ShieldCheck, Zap, BookOpen, GraduationCap, CheckCircle2, AlertCircle } from 'lucide-react';

export const Home = () => {
  return (
    <div className="space-y-16 pb-12">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-brand-50 to-white -z-10" />
        <div className="max-w-4xl mx-auto text-center px-4 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-100 text-brand-700 text-sm font-semibold mb-4 animate-fade-in-up">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-500"></span>
            </span>
            Live LMS Integration
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tight leading-tight">
            UAF <span className="text-brand-600">CGPA</span> Calculator
          </h1>
          
          <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            The most accurate, automatic, and secure calculator for UAF students. 
            Fetches your results directly from the LMS and Attendance system.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link to="/calculator">
              <Button size="lg" className="h-14 px-8 text-lg rounded-full shadow-xl shadow-brand-500/20 hover:shadow-brand-500/40 transition-all">
                Calculate Now
              </Button>
            </Link>
            <Link to="/about">
              <Button variant="outline" size="lg" className="h-14 px-8 text-lg rounded-full border-2">
                Learn More
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
            desc="No manual entry needed. Just enter your AG number and password (if required) to get instant results."
          />
          <FeatureCard 
            icon={<ShieldCheck className="w-8 h-8 text-brand-500" />}
            title="100% Secure"
            desc="Your data is processed locally or via secure proxy. We never store your passwords."
          />
          <FeatureCard 
            icon={<GraduationCap className="w-8 h-8 text-blue-500" />}
            title="Accurate Logic"
            desc="Uses the official UAF grading formula, including the complex linear interpolation for quality points."
          />
        </div>
      </section>

      {/* Info Section (Ported from old index.html) */}
      <section className="max-w-4xl mx-auto px-4 space-y-12">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <AlertCircle className="text-brand-500"/> Why use this tool?
          </h2>
          <div className="prose text-slate-600">
            <p className="mb-4">
              Calculating GPA manually is difficult because UAF uses a specific formula where marks are interpolated. 
              For example, 48 marks in a 3-credit course is a 2.66 GPA, but 49 marks is 2.75. 
              This tool handles all that math for you automatically.
            </p>
            <ul className="space-y-2 mt-4">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 text-brand-500 shrink-0 mt-0.5"/>
                <span>Supports BS, MSc, M.Phil, and PhD calculations.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 text-brand-500 shrink-0 mt-0.5"/>
                <span><b>B.Ed Mode:</b> Separate logic for Education courses.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 text-brand-500 shrink-0 mt-0.5"/>
                <span><b>Forecast Feature:</b> Predict your future CGPA by adding hypothetical semesters.</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="bg-slate-900 text-white p-8 rounded-3xl shadow-xl overflow-hidden relative">
          <div className="relative z-10">
            <h2 className="text-2xl font-bold mb-6">How to use?</h2>
            <div className="grid gap-6 md:grid-cols-2">
              <Step number="1" text="Enter your Registration Number (e.g., 2020-ag-1234)." />
              <Step number="2" text="Click 'Fetch Result'. If it's your first time, it might take a few seconds." />
              <Step number="3" text="View your detailed transcript, semester GPA, and total CGPA." />
              <Step number="4" text="Click 'Attendance' to fetch your attendance records automatically." />
            </div>
          </div>
          {/* Decorative circles */}
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-brand-500 rounded-full opacity-20 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-64 h-64 bg-blue-500 rounded-full opacity-20 blur-3xl"></div>
        </div>
      </section>
    </div>
  );
};

const FeatureCard = ({ icon, title, desc }: { icon: any, title: string, desc: string }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
    <div className="bg-slate-50 w-16 h-16 rounded-xl flex items-center justify-center mb-4">
      {icon}
    </div>
    <h3 className="text-xl font-bold text-slate-900 mb-2">{title}</h3>
    <p className="text-slate-500 leading-relaxed">{desc}</p>
  </div>
);

const Step = ({ number, text }: { number: string, text: string }) => (
  <div className="flex gap-4">
    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-brand-500 text-white font-bold flex items-center justify-center">
      {number}
    </span>
    <p className="text-slate-300">{text}</p>
  </div>
);
