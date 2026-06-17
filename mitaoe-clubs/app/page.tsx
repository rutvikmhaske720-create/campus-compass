import Link from "next/link";
import { ArrowRight, Video, Box, Users, HelpCircle, Send } from "lucide-react";
import faqData from "@/data/faq.json";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50 overflow-hidden">
      {/* HERO SECTION - Solid Colors */}
      <section className="bg-slate-900 text-white pt-32 pb-24 px-6 md:px-12 relative">
        <div className="max-w-7xl mx-auto flex flex-col items-center text-center relative z-10">
          <span className="px-4 py-1.5 text-xs font-bold tracking-widest uppercase rounded-full bg-slate-800 text-slate-300 mb-6">
            MIT Academy of Engineering
          </span>
          <h1 className="font-display font-extrabold text-5xl sm:text-6xl lg:text-7xl tracking-tight mb-6 leading-tight max-w-4xl">
            Welcome to the Campus Hub
          </h1>
          <p className="max-w-2xl text-lg text-slate-300 mb-12 leading-relaxed">
            Discover our vibrant campus life. Explore student clubs, watch the latest event highlights, and immerse yourself in our interactive 3D campus tour.
          </p>

          {/* Action Buttons Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full max-w-5xl">
            {/* Signup Button */}
            <Link
              href="/signup"
              className="flex items-center justify-center gap-3 px-6 py-5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm uppercase tracking-wider transition-colors shadow-lg"
            >
              <Users className="w-5 h-5" />
              Sign Up
            </Link>

            {/* 3D Campus Button */}
            <Link
              href="https://xyz-wheat-sigma.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 px-6 py-5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 font-bold text-sm uppercase tracking-wider transition-colors shadow-lg"
            >
              <Box className="w-5 h-5" />
              3D Campus Tour
            </Link>

            {/* Clubs Information Button */}
            <Link
              href="/clubs-info"
              className="flex items-center justify-center gap-3 px-6 py-5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 font-bold text-sm uppercase tracking-wider transition-colors shadow-lg"
            >
              <Users className="w-5 h-5" />
              Clubs Info
            </Link>

            {/* Videos Button */}
            <Link
              href="/videos"
              className="flex items-center justify-center gap-3 px-6 py-5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 font-bold text-sm uppercase tracking-wider transition-colors shadow-lg"
            >
              <Video className="w-5 h-5" />
              Watch Videos
            </Link>
          </div>
        </div>
      </section>

      {/* QUICK INFO SECTION */}
      <section className="py-24 px-6 md:px-12 bg-slate-50">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="text-xl font-bold text-slate-900 mb-4">Engaging Community</h3>
            <p className="text-slate-600 leading-relaxed">
              Join thousands of students participating in diverse activities ranging from technical innovation to cultural arts.
            </p>
          </div>
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="text-xl font-bold text-slate-900 mb-4">Skill Development</h3>
            <p className="text-slate-600 leading-relaxed">
              Enhance your soft and hard skills by taking active leadership roles within our active club clusters.
            </p>
          </div>
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="text-xl font-bold text-slate-900 mb-4">Memorable Events</h3>
            <p className="text-slate-600 leading-relaxed">
              Experience grand annual fests, technical hackathons, and sports tournaments year-round.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section className="py-24 px-6 md:px-12 bg-white border-t border-slate-100">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-slate-600 text-lg">
              Got questions? We've got answers about campus life and clubs.
            </p>
          </div>

          <div className="space-y-6 mb-16">
            {faqData.map((faq) => (
              <div key={faq.id} className="bg-slate-50 p-6 md:p-8 rounded-2xl border border-slate-200">
                <h3 className="text-lg md:text-xl font-bold text-slate-900 mb-3 flex items-start gap-3">
                  <HelpCircle className="w-6 h-6 text-blue-600 shrink-0 mt-0.5" />
                  {faq.question}
                </h3>
                <p className="text-slate-600 pl-9 leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>

          {/* Ask a Question Form */}
          <div className="bg-slate-900 rounded-3xl p-8 md:p-12 text-white shadow-xl">
            <div className="max-w-2xl mx-auto text-center">
              <h3 className="text-2xl font-bold mb-4">Still have questions?</h3>
              <p className="text-slate-400 mb-8">
                Drop your question below and our student council will get back to you.
              </p>
              
              <form className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  placeholder="Your Email"
                  className="px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:max-w-[200px]"
                  required
                />
                <input
                  type="text"
                  placeholder="Type your question here..."
                  className="flex-1 px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <button
                  type="button"
                  className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 font-bold transition-colors flex items-center justify-center gap-2"
                >
                  Ask <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
