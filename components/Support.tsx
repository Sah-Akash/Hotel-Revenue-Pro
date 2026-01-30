
import React from 'react';
import { Mail, Linkedin, ExternalLink, ShieldCheck, Award, Code2, Heart, HelpCircle, MessageCircle, Quote } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const SUPPORT_EMAIL = "aayansah17@gmail.com";
const LINKEDIN_URL = "https://www.linkedin.com/in/aboutakashsah/";

const Support: React.FC = () => {
  const { user } = useAuth();

  const contactSupport = () => {
      window.location.href = `mailto:${SUPPORT_EMAIL}?subject=Support Request - RevenuePro&body=User ID: ${user?.uid}`;
  };

  return (
    <div className="p-6 md:p-12 max-w-6xl mx-auto pb-24 font-sans bg-slate-50 min-h-screen">
      <div className="max-w-xl mb-16">
        <h1 className="text-3xl font-bold text-slate-900 mb-3 tracking-tight">Help & Support</h1>
        <p className="text-slate-500 text-lg font-light">Connect with the team and learn about the philosophy behind the product.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-20">
        
        {/* Left Col: Contact & Disclaimer (Functional Side) */}
        <div className="lg:col-span-1 space-y-8">
            
            {/* Contact Card */}
            <div className="bg-white p-8 rounded-[24px] border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-900 mb-6">
                    <MessageCircle className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-slate-900 text-lg mb-2">Need Assistance?</h3>
                <p className="text-slate-500 mb-8 text-sm leading-relaxed">
                    Facing issues with calculations or have a feature request? Reach out directly to our support team.
                </p>
                <button 
                    onClick={contactSupport}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all text-sm"
                >
                    <Mail className="w-4 h-4" /> Contact Support
                </button>
            </div>

            {/* Legal / Disclaimer */}
            <div className="pl-2 border-l-2 border-slate-200">
                <h3 className="font-bold text-slate-900 text-sm mb-3 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-slate-400" /> Disclaimer
                </h3>
                <div className="space-y-3 text-xs text-slate-500 leading-relaxed text-justify">
                    <p>
                        Figures generated are estimates based on standard industry formulas. Not guaranteed results.
                    </p>
                    <p>
                        This tool does not constitute professional financial or legal advice.
                    </p>
                    <p>
                        Akash Sah accepts no liability for decisions made based on this software.
                    </p>
                </div>
            </div>

        </div>

        {/* Right Col: Founder Profile (Premium/Editorial Style) */}
        <div className="lg:col-span-2 pt-4 lg:pl-8 lg:border-l border-slate-200">
            
            {/* Header / Identity */}
            <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center mb-12">
                <div className="w-20 h-20 rounded-full bg-slate-200 grayscale overflow-hidden shrink-0">
                    {/* Placeholder for Profile Image - styled to be subtle/grayscale */}
                    <div className="w-full h-full bg-slate-300 flex items-center justify-center text-slate-500 font-serif text-2xl">
                        AS
                    </div>
                </div>
                <div>
                    <h2 className="text-3xl font-medium text-slate-900 tracking-tight mb-1">Akash Sah</h2>
                    <div className="flex items-center gap-3">
                        <span className="text-xs font-medium text-slate-400 uppercase tracking-[0.2em]">Founder & Chief Executive Officer</span>
                        <a href={LINKEDIN_URL} target="_blank" rel="noopener" className="text-slate-300 hover:text-slate-600 transition-colors">
                            <Linkedin className="w-4 h-4" />
                        </a>
                    </div>
                </div>
            </div>

            {/* Narrative Body */}
            <div className="space-y-8 text-lg font-light text-slate-600 leading-loose max-w-2xl">
                <p>
                    <strong className="font-medium text-slate-900">Hotel Revenue Pro</strong> is the result of a simple belief: good revenue decisions should be accessible, precise, and thoughtfully designed.
                </p>
                <p>
                    Founded by Akash Sah, Hotel Revenue Pro was created to bring clarity to hotel revenue management — an area often overcomplicated by tools that prioritize features over usability. The product is built with a deep respect for operational realities, focusing on accuracy, simplicity, and long-term value.
                </p>
                <p>
                    Akash leads Hotel Revenue Pro with a product-first mindset, personally shaping the platform to ensure it remains intuitive, reliable, and aligned with the needs of modern hospitality businesses. Every decision — from calculations to interface design — reflects a commitment to quality and restraint.
                </p>
                <p>
                    Hotel Revenue Pro is intentionally built to feel focused, dependable, and professional — a tool that earns trust quietly, through consistency and results.
                </p>
            </div>

            {/* Founder's Note */}
            <div className="mt-16 pt-10 border-t border-slate-200/60 max-w-2xl">
                <Quote className="w-8 h-8 text-slate-200 mb-4 fill-current" />
                <p className="font-serif text-2xl md:text-3xl text-slate-800 italic leading-snug">
                    “Software should feel calm. When the numbers are right, everything else becomes easier.”
                </p>
            </div>
            
        </div>

      </div>

      <div className="mt-24 pt-8 border-t border-slate-200 text-center">
        <p className="text-slate-400 text-xs font-medium tracking-wide">
            DESIGNED & DEVELOPED BY AKASH SAH • © {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
};

export default Support;
