interface StatCardProps {
  title: string
  value: string | number
  icon?: React.ReactNode
  trend?: {
    value: string
    isPositive: boolean
  }
  color?: 'red' | 'blue' | 'green' | 'amber' | 'purple'
}

export default function StatCard({ title, value, icon, trend, color = 'red' }: StatCardProps) {
  const colorClasses = {
    red: 'bg-gradient-to-br from-red-50 to-red-100 text-[#FF1E25]',
    blue: 'bg-gradient-to-br from-blue-50 to-blue-100 text-blue-600',
    green: 'bg-gradient-to-br from-emerald-50 to-emerald-100 text-emerald-600',
    amber: 'bg-gradient-to-br from-amber-50 to-amber-100 text-amber-600',
    purple: 'bg-gradient-to-br from-purple-50 to-purple-100 text-purple-600',
  }

  return (
    <div className="stat-card group cursor-pointer">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">
            {title}
          </p>
          <p className="text-4xl font-bold text-gray-900 mb-1">
            {value}
          </p>
          {trend && (
            <div className="flex items-center space-x-1">
              <span className={`text-sm font-semibold ${trend.isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
                {trend.value}
              </span>
              <svg
                className={`w-4 h-4 ${trend.isPositive ? 'text-emerald-600' : 'text-rose-600 rotate-180'}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
            </div>
          )}
        </div>
        {icon && (
          <div className={`p-4 rounded-2xl ${colorClasses[color]} group-hover:scale-110 transition-transform duration-300`}>
            {icon}
          </div>
        )}
      </div>
    </div>
  )
}
