import videosData from "@/data/videos.json";

export default function VideosPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">
            Video Gallery
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl">
            Watch the latest highlights and events from our campus. To add more videos, simply update the <code className="bg-slate-200 px-2 py-1 rounded text-sm">data/videos.json</code> file with your video IDs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {videosData.map((video) => (
            <div key={video.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-200 flex flex-col">
              <div className="relative w-full pt-[56.25%] bg-slate-100">
                <iframe
                  className="absolute top-0 left-0 w-full h-full"
                  src={video.url}
                  title={video.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
              <div className="p-6">
                <span className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 block">
                  Video ID: {video.id}
                </span>
                <h3 className="text-xl font-bold text-slate-900">
                  {video.title}
                </h3>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
