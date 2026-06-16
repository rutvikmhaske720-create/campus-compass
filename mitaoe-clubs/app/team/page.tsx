import SectionHeader from "@/components/SectionHeader";
import ProfileCard from "@/components/ProfileCard";
import teamData from "@/data/team.json";
import { TeamMember } from "@/lib/types";

export default function TeamPage() {
  const members = teamData as TeamMember[];

  const facultyAdvisors = members.filter((m) => m.type === "faculty");
  const studentCoordinators = members.filter((m) => m.type === "student");

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 py-12 flex flex-col gap-20">
      {/* Header */}
      <SectionHeader
        badge="Coordinators"
        title="Guiding Student Action"
        subtitle="The dedicated faculty mentors and student leaders driving collaboration, innovation, and campus activity across all MITAOE clubs."
        theme="purple"
      />

      {/* Faculty Section */}
      <div>
        <h2 className="text-2xl font-display font-extrabold text-slate-900 mb-8 pb-3 border-b border-slate-200 flex items-center gap-3">
          <span className="w-1.5 h-6 rounded bg-purple-600" />
          Faculty Advisors
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {facultyAdvisors.map((member, idx) => (
            <ProfileCard key={member.id} member={member} index={idx} />
          ))}
        </div>
      </div>

      {/* Student Section */}
      <div>
        <h2 className="text-2xl font-display font-extrabold text-slate-900 mb-8 pb-3 border-b border-slate-200 flex items-center gap-3">
          <span className="w-1.5 h-6 rounded bg-cyan-600" />
          Student Coordinators
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {studentCoordinators.map((member, idx) => (
            <ProfileCard key={member.id} member={member} index={idx} />
          ))}
        </div>
      </div>
    </div>
  );
}
