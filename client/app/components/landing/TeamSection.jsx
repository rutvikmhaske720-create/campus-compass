'use client'

export default function TeamSection() {
  const teamMembers = [
    { name: 'Jayesh Jadhav', role: 'Project Manager', color: 'from-indigo-500 to-purple-600' },
    { name: 'Pranav Walunj', role: 'Data Analyst', color: 'from-blue-500 to-cyan-600' },
    { name: 'Laksh Sonwane', role: 'UI/UX', color: 'from-purple-500 to-pink-600' },
    { name: 'Omkar Waghmare', role: 'Developer', color: 'from-green-500 to-emerald-600' },
    { name: 'Harshini Bhandary', role: 'Developer', color: 'from-pink-500 to-rose-600' },
    { name: 'Madhura Patil', role: 'Research Analyst', color: 'from-orange-500 to-red-600' }
  ]

  return (
    <div className="pt-2 bg-transparent relative overflow-hidden">
      {/* Animated Background Circles */}
      <svg className="absolute inset-0 w-full h-full opacity-10" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice">
        <circle cx="180" cy="160" r="270" fill="#14b8a6" opacity="0.1">
          <animate attributeName="r" values="270;290;270" dur="8s" repeatCount="indefinite"/>
        </circle>
        <circle cx="1020" cy="640" r="330" fill="#10b981" opacity="0.1">
          <animate attributeName="r" values="330;350;330" dur="10s" repeatCount="indefinite"/>
        </circle>
      </svg>
      {/* Animated background */}
      <svg className="absolute inset-0 w-full h-full opacity-5" preserveAspectRatio="none">
        <defs>
          <linearGradient id="team-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="50%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#ec4899" />
          </linearGradient>
        </defs>
        <circle cx="10%" cy="20%" r="100" fill="url(#team-grad)">
          <animate attributeName="r" values="100;120;100" dur="4s" repeatCount="indefinite"/>
        </circle>
        <circle cx="90%" cy="80%" r="150" fill="url(#team-grad)">
          <animate attributeName="r" values="150;170;150" dur="5s" repeatCount="indefinite"/>
        </circle>
        <path d="M0 200 Q400 150 800 200 T1600 200" stroke="url(#team-grad)" strokeWidth="2" fill="none">
          <animate attributeName="d" dur="10s" repeatCount="indefinite" values="M0 200 Q400 150 800 200 T1600 200;M0 200 Q400 250 800 200 T1600 200;M0 200 Q400 150 800 200 T1600 200"/>
        </path>
      </svg>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Team network visualization */}
        <div className="relative mb-10">
          <svg className="w-full" viewBox="0 0 1200 700" preserveAspectRatio="xMidYMid meet">
            {/* Title above center image */}
            <text x="600" y="80" textAnchor="middle" className="fill-gray-900 font-bold text-4xl">Team Eklavya_01</text>
            <text x="600" y="115" textAnchor="middle" className="fill-gray-600 text-xl">Innovating the future of academic scheduling</text>
            <defs>
              {teamMembers.map((member, i) => (
                <linearGradient key={i} id={`member-grad-${i}`} x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor={i === 0 ? '#6366f1' : i === 1 ? '#3b82f6' : i === 2 ? '#8b5cf6' : i === 3 ? '#10b981' : i === 4 ? '#ec4899' : '#f97316'} />
                  <stop offset="100%" stopColor={i === 0 ? '#8b5cf6' : i === 1 ? '#06b6d4' : i === 2 ? '#ec4899' : i === 3 ? '#059669' : i === 4 ? '#f43f5e' : '#ef4444'} />
                </linearGradient>
              ))}
              <linearGradient id="mentor-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#8b5cf6" />
                <stop offset="100%" stopColor="#ec4899" />
              </linearGradient>
            </defs>

            {/* Connection lines from center to members */}
            <g opacity="0.25">
              <line x1="600" y1="350" x2="300" y2="200" stroke="url(#member-grad-0)" strokeWidth="2" strokeDasharray="5,5">
                <animate attributeName="stroke-dashoffset" from="0" to="10" dur="1s" repeatCount="indefinite"/>
              </line>
              <line x1="600" y1="350" x2="900" y2="200" stroke="url(#member-grad-1)" strokeWidth="2" strokeDasharray="5,5">
                <animate attributeName="stroke-dashoffset" from="0" to="10" dur="1s" repeatCount="indefinite"/>
              </line>
              <line x1="600" y1="350" x2="150" y2="350" stroke="url(#member-grad-2)" strokeWidth="2" strokeDasharray="5,5">
                <animate attributeName="stroke-dashoffset" from="0" to="10" dur="1s" repeatCount="indefinite"/>
              </line>
              <line x1="600" y1="350" x2="1050" y2="350" stroke="url(#member-grad-3)" strokeWidth="2" strokeDasharray="5,5">
                <animate attributeName="stroke-dashoffset" from="0" to="10" dur="1s" repeatCount="indefinite"/>
              </line>
              <line x1="600" y1="350" x2="300" y2="500" stroke="url(#member-grad-4)" strokeWidth="2" strokeDasharray="5,5">
                <animate attributeName="stroke-dashoffset" from="0" to="10" dur="1s" repeatCount="indefinite"/>
              </line>
              <line x1="600" y1="350" x2="900" y2="500" stroke="url(#member-grad-5)" strokeWidth="2" strokeDasharray="5,5">
                <animate attributeName="stroke-dashoffset" from="0" to="10" dur="1s" repeatCount="indefinite"/>
              </line>
            </g>

            {/* Neural connections between members */}
            <g opacity="0.15">
              <line x1="300" y1="200" x2="900" y2="200" stroke="url(#member-grad-0)" strokeWidth="1.5" strokeDasharray="3,3">
                <animate attributeName="stroke-dashoffset" from="0" to="6" dur="1.5s" repeatCount="indefinite"/>
              </line>
              <line x1="300" y1="200" x2="150" y2="350" stroke="url(#member-grad-1)" strokeWidth="1.5" strokeDasharray="3,3">
                <animate attributeName="stroke-dashoffset" from="0" to="6" dur="1.5s" repeatCount="indefinite"/>
              </line>
              <line x1="900" y1="200" x2="1050" y2="350" stroke="url(#member-grad-2)" strokeWidth="1.5" strokeDasharray="3,3">
                <animate attributeName="stroke-dashoffset" from="0" to="6" dur="1.5s" repeatCount="indefinite"/>
              </line>
              <line x1="150" y1="350" x2="300" y2="500" stroke="url(#member-grad-3)" strokeWidth="1.5" strokeDasharray="3,3">
                <animate attributeName="stroke-dashoffset" from="0" to="6" dur="1.5s" repeatCount="indefinite"/>
              </line>
              <line x1="1050" y1="350" x2="900" y2="500" stroke="url(#member-grad-4)" strokeWidth="1.5" strokeDasharray="3,3">
                <animate attributeName="stroke-dashoffset" from="0" to="6" dur="1.5s" repeatCount="indefinite"/>
              </line>
              <line x1="300" y1="500" x2="900" y2="500" stroke="url(#member-grad-5)" strokeWidth="1.5" strokeDasharray="3,3">
                <animate attributeName="stroke-dashoffset" from="0" to="6" dur="1.5s" repeatCount="indefinite"/>
              </line>
              <line x1="300" y1="200" x2="1050" y2="350" stroke="url(#member-grad-0)" strokeWidth="1" strokeDasharray="3,3">
                <animate attributeName="stroke-dashoffset" from="0" to="6" dur="2s" repeatCount="indefinite"/>
              </line>
              <line x1="900" y1="200" x2="150" y2="350" stroke="url(#member-grad-1)" strokeWidth="1" strokeDasharray="3,3">
                <animate attributeName="stroke-dashoffset" from="0" to="6" dur="2s" repeatCount="indefinite"/>
              </line>
              <line x1="150" y1="350" x2="900" y2="500" stroke="url(#member-grad-2)" strokeWidth="1" strokeDasharray="3,3">
                <animate attributeName="stroke-dashoffset" from="0" to="6" dur="2s" repeatCount="indefinite"/>
              </line>
              <line x1="1050" y1="350" x2="300" y2="500" stroke="url(#member-grad-3)" strokeWidth="1" strokeDasharray="3,3">
                <animate attributeName="stroke-dashoffset" from="0" to="6" dur="2s" repeatCount="indefinite"/>
              </line>
            </g>

            {/* Center hub (Team Photo) - BIGGER */}
            <g transform="translate(600, 350)">
              <circle r="180" fill="url(#member-grad-0)" opacity="0.1">
                <animate attributeName="r" values="180;190;180" dur="3s" repeatCount="indefinite"/>
              </circle>
              <circle r="160" fill="url(#member-grad-0)" opacity="0.2"/>
              <image href="/team_photo.jpg" x="-140" y="-140" width="280" height="280" clipPath="circle(140px at 140px 140px)" className="rounded-full"/>
              <circle r="140" fill="none" stroke="url(#member-grad-0)" strokeWidth="5"/>
            </g>

            {/* Team member nodes - PROJECT MANAGER */}
            <g transform="translate(300, 200)">
              <circle r="50" fill="url(#member-grad-0)" opacity="0.1"/>
              <circle r="40" fill="url(#member-grad-0)" opacity="0.2"/>
              <circle r="28" fill="url(#member-grad-0)"/>
              <circle cy="-8" r="6" fill="white"/>
              <path d="M-12 10 Q-12 2 -6 2 L6 2 Q12 2 12 10 L12 15 L-12 15 Z" fill="white"/>
              <text y="75" textAnchor="middle" className="fill-gray-900 font-bold text-sm">Jayesh Jadhav</text>
              <text y="90" textAnchor="middle" className="fill-indigo-600 font-bold text-xs">Project Manager</text>
              <circle cy="-35" r="14" fill="#fbbf24"/>
              <text y="-29" textAnchor="middle" className="fill-white font-bold text-sm">★</text>
            </g>

            <g transform="translate(900, 200)">
              <circle r="45" fill="url(#member-grad-1)" opacity="0.1"/>
              <circle r="35" fill="url(#member-grad-1)" opacity="0.2"/>
              <circle r="22" fill="url(#member-grad-1)"/>
              <circle cy="-8" r="5" fill="white"/>
              <path d="M-10 8 Q-10 2 -5 2 L5 2 Q10 2 10 8 L10 12 L-10 12 Z" fill="white"/>
              <text y="65" textAnchor="middle" className="fill-gray-900 font-bold text-sm">Pranav Walunj</text>
              <text y="80" textAnchor="middle" className="fill-blue-600 font-semibold text-xs">Data Analyst</text>
            </g>

            <g transform="translate(150, 350)">
              <circle r="45" fill="url(#member-grad-2)" opacity="0.1"/>
              <circle r="35" fill="url(#member-grad-2)" opacity="0.2"/>
              <circle r="22" fill="url(#member-grad-2)"/>
              <circle cy="-8" r="5" fill="white"/>
              <path d="M-10 8 Q-10 2 -5 2 L5 2 Q10 2 10 8 L10 12 L-10 12 Z" fill="white"/>
              <text y="65" textAnchor="middle" className="fill-gray-900 font-bold text-sm">Laksh Sonwane</text>
              <text y="80" textAnchor="middle" className="fill-purple-600 font-semibold text-xs">UI/UX</text>
            </g>

            <g transform="translate(1050, 350)">
              <circle r="45" fill="url(#member-grad-3)" opacity="0.1"/>
              <circle r="35" fill="url(#member-grad-3)" opacity="0.2"/>
              <circle r="22" fill="url(#member-grad-3)"/>
              <circle cy="-8" r="5" fill="white"/>
              <path d="M-10 8 Q-10 2 -5 2 L5 2 Q10 2 10 8 L10 12 L-10 12 Z" fill="white"/>
              <text y="65" textAnchor="middle" className="fill-gray-900 font-bold text-sm">Omkar Waghmare</text>
              <text y="80" textAnchor="middle" className="fill-green-600 font-semibold text-xs">Developer</text>
            </g>

            <g transform="translate(300, 500)">
              <circle r="45" fill="url(#member-grad-4)" opacity="0.1"/>
              <circle r="35" fill="url(#member-grad-4)" opacity="0.2"/>
              <circle r="22" fill="url(#member-grad-4)"/>
              <circle cy="-8" r="5" fill="white"/>
              <path d="M-10 8 Q-10 2 -5 2 L5 2 Q10 2 10 8 L10 12 L-10 12 Z" fill="white"/>
              <text y="65" textAnchor="middle" className="fill-gray-900 font-bold text-sm">Harshini Bhandary</text>
              <text y="80" textAnchor="middle" className="fill-pink-600 font-semibold text-xs">Developer</text>
            </g>

            <g transform="translate(900, 500)">
              <circle r="45" fill="url(#member-grad-5)" opacity="0.1"/>
              <circle r="35" fill="url(#member-grad-5)" opacity="0.2"/>
              <circle r="22" fill="url(#member-grad-5)"/>
              <circle cy="-8" r="5" fill="white"/>
              <path d="M-10 8 Q-10 2 -5 2 L5 2 Q10 2 10 8 L10 12 L-10 12 Z" fill="white"/>
              <text y="65" textAnchor="middle" className="fill-gray-900 font-bold text-sm">Madhura Patil</text>
              <text y="80" textAnchor="middle" className="fill-orange-600 font-semibold text-xs">Research Analyst</text>
            </g>

            {/* Mentor node */}
            <g transform="translate(600, 600)">
              <circle r="55" fill="url(#mentor-grad)" opacity="0.1"/>
              <circle r="45" fill="url(#mentor-grad)" opacity="0.2"/>
              <circle r="28" fill="url(#mentor-grad)"/>
              <path d="M-15 -5 L-10 -15 L-5 -5 M5 -5 L10 -15 L15 -5" stroke="white" strokeWidth="2" fill="none"/>
              <circle cy="-8" r="6" fill="white"/>
              <path d="M-12 10 Q-12 3 -6 3 L6 3 Q12 3 12 10 L12 15 L-12 15 Z" fill="white"/>
              <text y="70" textAnchor="middle" className="fill-gray-900 font-bold text-sm">Dr. Sunita Barve</text>
              <text y="85" textAnchor="middle" className="fill-purple-600 font-semibold text-xs">Mentor & Guide</text>
            </g>

            {/* Connecting line to mentor */}
            <line x1="600" y1="460" x2="600" y2="545" stroke="url(#mentor-grad)" strokeWidth="3" opacity="0.3" strokeDasharray="8,4">
              <animate attributeName="stroke-dashoffset" from="0" to="12" dur="1s" repeatCount="indefinite"/>
            </line>
          </svg>
        </div>
      </div>
    </div>
  )
}
