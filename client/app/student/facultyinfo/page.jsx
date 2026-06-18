// import facultyData from "@/data/faculty.json";
// import Link from "next/link";
// import {
//   ArrowLeft,
//   Mail,
//   MapPin,
//   Building2,
//   Briefcase,
//   GraduationCap,
//   Clock,
// } from "lucide-react";
// import { notFound } from "next/navigation";

// export default function FacultyInfoPage({ params }) {
//   const faculty = facultyData.find(
//     (item) => String(item.id) === String(params.id)
//   );

//   if (!faculty) {
//     notFound();
//   }

//   return (
//     <main className="min-h-screen bg-slate-50 pt-28 pb-16">
//       <div className="max-w-6xl mx-auto px-6">

//         {/* Back Button */}
//         <Link
//           href="/faculty"
//           className="inline-flex items-center gap-2 mb-6 text-blue-900 font-semibold hover:gap-3 transition-all"
//         >
//           <ArrowLeft className="w-4 h-4" />
//           Back to Faculty Directory
//         </Link>

//         {/* Main Card */}
//         <div className="bg-white rounded-3xl overflow-hidden shadow-xl border border-slate-200">

//           {/* Hero Section */}
//           <div className="bg-gradient-to-r from-blue-950 via-blue-900 to-blue-800 px-8 py-10">
//             <div className="flex flex-col md:flex-row gap-8 items-center">

//               <img
//                 src={faculty.image}
//                 alt={faculty.name}
//                 className="w-44 h-44 rounded-2xl object-cover border-4 border-white/20"
//               />

//               <div className="text-white">
//                 <h1 className="text-4xl font-bold">
//                   {faculty.name}
//                 </h1>

//                 <p className="text-xl text-blue-100 mt-2">
//                   {faculty.designation}
//                 </p>

//                 <span className="inline-block mt-4 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md text-sm font-medium">
//                   {faculty.department}
//                 </span>
//               </div>
//             </div>
//           </div>

//           {/* Info Cards */}
//           <div className="grid md:grid-cols-2 gap-5 p-8">

//             <div className="bg-slate-50 rounded-2xl p-5">
//               <div className="flex items-center gap-3 mb-2">
//                 <Mail className="w-5 h-5 text-blue-900" />
//                 <h3 className="font-semibold">Email</h3>
//               </div>
//               <p>{faculty.email}</p>
//             </div>

//             <div className="bg-slate-50 rounded-2xl p-5">
//               <div className="flex items-center gap-3 mb-2">
//                 <MapPin className="w-5 h-5 text-blue-900" />
//                 <h3 className="font-semibold">Cabin Number</h3>
//               </div>
//               <p>{faculty.cabin}</p>
//             </div>

//             <div className="bg-slate-50 rounded-2xl p-5">
//               <div className="flex items-center gap-3 mb-2">
//                 <Briefcase className="w-5 h-5 text-blue-900" />
//                 <h3 className="font-semibold">Experience</h3>
//               </div>
//               <p>{faculty.experience}</p>
//             </div>

//             <div className="bg-slate-50 rounded-2xl p-5">
//               <div className="flex items-center gap-3 mb-2">
//                 <Building2 className="w-5 h-5 text-blue-900" />
//                 <h3 className="font-semibold">Department</h3>
//               </div>
//               <p>{faculty.department}</p>
//             </div>

//             {faculty.qualification && (
//               <div className="bg-slate-50 rounded-2xl p-5">
//                 <div className="flex items-center gap-3 mb-2">
//                   <GraduationCap className="w-5 h-5 text-blue-900" />
//                   <h3 className="font-semibold">Qualification</h3>
//                 </div>
//                 <p>{faculty.qualification}</p>
//               </div>
//             )}

//             {faculty.officeHours && (
//               <div className="bg-slate-50 rounded-2xl p-5">
//                 <div className="flex items-center gap-3 mb-2">
//                   <Clock className="w-5 h-5 text-blue-900" />
//                   <h3 className="font-semibold">Office Hours</h3>
//                 </div>
//                 <p>{faculty.officeHours}</p>
//               </div>
//             )}
//           </div>

//           {/* About Section */}
//           <div className="px-8 pb-8">
//             <div className="bg-slate-50 rounded-2xl p-6">
//               <h2 className="text-2xl font-bold mb-4">
//                 About Faculty
//               </h2>

//               <p className="text-slate-600 leading-relaxed">
//                 {faculty.bio}
//               </p>
//             </div>
//           </div>

//           {/* Subjects */}
//           {faculty.subjects && faculty.subjects.length > 0 && (
//             <div className="px-8 pb-8">
//               <div className="bg-slate-50 rounded-2xl p-6">
//                 <h2 className="text-2xl font-bold mb-4">
//                   Subjects Taught
//                 </h2>

//                 <div className="flex flex-wrap gap-3">
//                   {faculty.subjects.map((subject, index) => (
//                     <span
//                       key={index}
//                       className="px-4 py-2 rounded-full bg-blue-100 text-blue-900 font-medium"
//                     >
//                       {subject}
//                     </span>
//                   ))}
//                 </div>
//               </div>
//             </div>
//           )}

//         </div>
//       </div>
//     </main>
//   );
// }


export default function FacultyInfoPage() {
  return (
    <div>
      <h1>Faculty Info Working</h1>
    </div>
  );
}