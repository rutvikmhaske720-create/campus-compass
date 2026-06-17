import Link from "next/link";
import { ArrowRight, Trophy, Calendar, Users, Sparkles, Code, Palette, Laptop } from "lucide-react";
import AnimatedCounter from "@/components/AnimatedCounter";
import MagneticButton from "@/components/MagneticButton";
import ClubCard from "@/components/ClubCard";
import SectionHeader from "@/components/SectionHeader";
import ParallaxSection from "@/components/ParallaxSection";

import clubsData from "@/data/clubs.json";
import contactData from "@/data/contact.json";
import achievementsData from "@/data/achievements.json";

// Cast JSON arrays to correct typings
import { Club, Achievement } from "@/lib/types";
const clubs = clubsData as Club[];
const contact = contactData;
const achievements = achievementsData as Achievement[];

// Feature a subset of iconic clubs on the homepage
const FEATURED_CLUB_IDS = ["codechef", "robotics", "autosports", "drama", "aalekh", "shutterbugs"];
const featuredClubs = clubs.filter(c => FEATURED_CLUB_IDS.includes(c.id));

export default function Home() {
  return (
    <div className="flex flex-col gap-24 overflow-hidden">
      {/* HERO SECTION */}
      <section className="relative min-h-[90vh] flex items-center justify-center pt-12">
        {/* Glowing backdrop ambient circle */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70vw] h-[70vw] max-w-[800px] max-h-[800px] bg-purple-500/5 rounded-full blur-[120px] pointer-events-none -z-10 animate-pulse" />

        <div className="max-w-7xl mx-auto px-6 md:px-12 text-center flex flex-col items-center relative z-10">
          {/* Badge */}
          <span className="px-4 py-1.5 text-xs font-bold tracking-widest uppercase rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-700 mb-6 animate-fade-in">
            MIT Academy of Engineering
          </span>

          {/* Heading */}
          <h1 className="font-display font-extrabold text-4xl sm:text-6xl lg:text-7xl tracking-tight text-slate-900 mb-6 leading-[1.15] max-w-4xl">
            Unleash Your Passion at{" "}
            <span className="text-[#0f2a4a]">MITAOE Student Clubs</span>
          </h1>

          {/* Description */}
          <p className="max-w-2xl text-base sm:text-lg text-slate-600 mb-10 leading-relaxed font-medium">
            {contact.clubsOverview.description}
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center gap-4 mb-16">
            <MagneticButton>
              <Link
                href="/clubs"
                className="px-8 py-4 rounded-full text-sm font-semibold uppercase tracking-wider bg-purple-600 hover:bg-purple-700 text-white shadow-xl flex items-center gap-2 group transition-all duration-300"
              >
                Explore Clubs
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </MagneticButton>
            <Link
              href="/events"
              className="px-8 py-4 rounded-full text-sm font-semibold uppercase tracking-wider bg-black/5 border border-black/10 hover:bg-black/10 text-slate-800 transition-all duration-300"
            >
              Upcoming Events
            </Link>
          </div>

          {/* Stats Bar */}
          <div className="w-full max-w-5xl grid grid-cols-2 md:grid-cols-4 gap-8 p-8 md:p-10 rounded-2xl glass-card border border-slate-200 relative">
            <div className="absolute inset-0 bg-purple-500/5 rounded-2xl pointer-events-none" />
            
            <div className="flex flex-col items-center">
              <div className="text-3xl md:text-5xl text-slate-900 font-extrabold font-display mb-2 text-glow flex items-center">
                <AnimatedCounter value={contact.stats.totalClubs} suffix="+" />
              </div>
              <span className="text-xs uppercase tracking-wider text-slate-500 font-bold">Total Clubs</span>
            </div>

            <div className="flex flex-col items-center">
              <div className="text-3xl md:text-5xl text-slate-900 font-extrabold font-display mb-2 text-glow flex items-center">
                <AnimatedCounter value={contact.stats.totalMembers} suffix="+" />
              </div>
              <span className="text-xs uppercase tracking-wider text-slate-500 font-bold">Active Members</span>
            </div>

            <div className="flex flex-col items-center">
              <div className="text-3xl md:text-5xl text-slate-900 font-extrabold font-display mb-2 text-glow flex items-center">
                <AnimatedCounter value={contact.stats.eventsPerYear} suffix="+" />
              </div>
              <span className="text-xs uppercase tracking-wider text-slate-500 font-bold">Events Annually</span>
            </div>

            <div className="flex flex-col items-center">
              <div className="text-3xl md:text-5xl text-slate-900 font-extrabold font-display mb-2 text-glow flex items-center">
                <AnimatedCounter value={contact.stats.awardsWon} suffix="+" />
              </div>
              <span className="text-xs uppercase tracking-wider text-slate-500 font-bold">Awards & Honors</span>
            </div>
          </div>
        </div>
      </section>

      {/* CLUBS CATEGORY INTRO SECTION */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 w-full">
        <SectionHeader
          badge="Club Clusters"
          title="Designed for Diverse Talents"
          subtitle="Our clubs are structured across three dynamic categories, nurturing technical skillsets, creative artistic fields, and active recreational interest spheres."
          theme="cyan"
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Tech cluster */}
          <div className="glass-card p-8 rounded-2xl border border-slate-200 relative flex flex-col justify-between group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-bl-full filter blur-md" />
            <div>
              <div className="w-12 h-12 rounded-xl bg-cyan-600/10 border border-cyan-500/20 flex items-center justify-center text-cyan-600 mb-6">
                <Code className="w-6 h-6" />
              </div>
              <h3 className="text-slate-900 font-display font-bold text-xl mb-3">Technical Cluster</h3>
              <p className="text-sm text-slate-600 font-medium leading-relaxed mb-6">
                Coding hackathons, robotic builds, aeromodelling design, and automotive prototyping. Sharpen your engineering edge.
              </p>
            </div>
            <span className="text-xs font-bold text-cyan-600 uppercase tracking-widest">{contact.stats.technicalClubs} Active Clubs</span>
          </div>

          {/* Cultural cluster */}
          <div className="glass-card p-8 rounded-2xl border border-slate-200 relative flex flex-col justify-between group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-bl-full filter blur-md" />
            <div>
              <div className="w-12 h-12 rounded-xl bg-purple-600/10 border border-purple-500/20 flex items-center justify-center text-purple-600 mb-6">
                <Palette className="w-6 h-6" />
              </div>
              <h3 className="text-slate-900 font-display font-bold text-xl mb-3">Cultural Cluster</h3>
              <p className="text-sm text-slate-600 font-medium leading-relaxed mb-6">
                Music ensembles, dramatic stages, street plays, sketching exhibitions, and creative poetry workshops. Celebrate artistic soul.
              </p>
            </div>
            <span className="text-xs font-bold text-purple-600 uppercase tracking-widest">{contact.stats.culturalClubs} Active Clubs</span>
          </div>

          {/* Recreational cluster */}
          <div className="glass-card p-8 rounded-2xl border border-slate-200 relative flex flex-col justify-between group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-bl-full filter blur-md" />
            <div>
              <div className="w-12 h-12 rounded-xl bg-emerald-600/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 mb-6">
                <Laptop className="w-6 h-6" />
              </div>
              <h3 className="text-slate-900 font-display font-bold text-xl mb-3">Recreational Cluster</h3>
              <p className="text-sm text-slate-600 font-medium leading-relaxed mb-6">
                Sports championships, nature treks, photography expos, language workshops, and wellness yoga practices. Unwind and connect.
              </p>
            </div>
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest">{contact.stats.recreationalClubs} Active Clubs</span>
          </div>
        </div>
      </section>

      {/* FEATURED CLUBS SECTION */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 w-full">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="max-w-xl">
            <span className="px-3.5 py-1 text-[10px] font-extrabold tracking-widest uppercase rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-700">
              Featured Societies
            </span>
            <h2 className="text-3xl md:text-5xl font-display font-extrabold text-slate-900 mt-4 tracking-tight leading-tight">
              Pioneering Student Communities
            </h2>
          </div>
          <Link
            href="/clubs"
            className="group shrink-0 text-purple-600 font-bold hover:text-purple-700 transition-colors flex items-center gap-1.5 text-sm"
          >
            Browse all 25 clubs
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredClubs.slice(0, 3).map((club, idx) => (
            <ClubCard key={club.id} club={club} index={idx} />
          ))}
        </div>
      </section>

      {/* PARALLAX CTA BANNER */}
      <ParallaxSection className="py-24 my-12" speed={0.15}>
        <div className="max-w-5xl mx-auto px-6 text-center relative z-10 glass-card p-12 md:p-16 rounded-3xl border border-slate-200 overflow-hidden">
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-purple-500/5 rounded-full blur-[60px]" />
          <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-cyan-500/5 rounded-full blur-[60px]" />

          <span className="text-xs font-bold uppercase tracking-widest text-cyan-600 mb-4 inline-block">Join the Legacy</span>
          <h2 className="text-2xl md:text-4xl font-display font-extrabold text-slate-900 mb-6 leading-snug">
            Ready to shape the campus culture?
          </h2>
          <p className="max-w-2xl mx-auto text-slate-600 font-medium text-sm md:text-base mb-8 leading-relaxed">
            {contact.clubsOverview.extendedDescription}
          </p>
          <MagneticButton className="inline-block mx-auto">
            <Link
              href="/contact"
              className="px-8 py-4 rounded-full text-sm font-semibold uppercase tracking-wider bg-purple-600 text-white hover:bg-purple-700 shadow-xl transition-all duration-300"
            >
              Get In Touch
            </Link>
          </MagneticButton>
        </div>
      </ParallaxSection>

      {/* LATEST ACHIEVEMENTS PREVIEW */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 w-full pb-16">
        <SectionHeader
          badge="Hall of Fame"
          title="Engineering & Creative Triumph"
          subtitle="Our student coordinators consistently bring laurels to MITAOE at national robotics, automobile racing, competitive programming, and theater arenas."
          theme="multicolor"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {achievements.slice(0, 4).map((achievement, idx) => (
            <div
              key={achievement.id}
              className="glass-card p-6 rounded-2xl border border-slate-200 flex gap-5 items-start"
            >
              <div className="w-12 h-12 rounded-xl bg-purple-600/10 border border-purple-500/20 flex items-center justify-center text-purple-600 shrink-0 shadow-lg">
                <Trophy className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-extrabold tracking-widest text-purple-600 uppercase">
                  AY {achievement.year} • {achievement.student || "Team Award"}
                </span>
                <h3 className="text-slate-900 font-display font-bold text-lg mt-1 mb-2 leading-snug">
                  {achievement.title}
                </h3>
                <p className="text-sm text-slate-600 font-medium leading-relaxed line-clamp-2">
                  {achievement.description}
                </p>
                <div className="flex items-center gap-2 mt-4 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                  <span>Category: {achievement.category}</span>
                  <span>•</span>
                  <span>Club: {achievement.club}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="text-center mt-12">
          <Link
            href="/achievements"
            className="inline-flex items-center gap-2 text-purple-600 font-bold hover:text-purple-700 transition-colors text-sm"
          >
            <span>View all achievements</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
