export default function WatchDemo() {
  return (
    <section className="py-16 bg-white/60 backdrop-blur-sm border-t border-teal-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-teal-800 mb-3">
            Watch Demo
          </h2>
        </div>

        <div className="rounded-2xl overflow-hidden shadow-lg border border-teal-200 bg-black">
          <video
            controls
            className="w-full max-h-[500px]"
            preload="metadata"
          >
            <source src="/video/demoofmoodel.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>

      </div>
    </section>
  )
}