export default function StatCard({ title, value, icon: IconComponent }) {
  return (
    <div className="bg-white border-2 border-gray-200 rounded-2xl p-4 shadow-sm hover:shadow-lg hover:border-blue-300 transition-all duration-300">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-primary text-sm font-medium mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className="text-primary">
          {IconComponent && <IconComponent className="h-6 w-6" />}
        </div>
      </div>
    </div>
  )
}