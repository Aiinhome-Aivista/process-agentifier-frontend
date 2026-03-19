import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell
} from 'recharts'

const getBarColor = (value) => {
  if (value >= 80) return '#1d9e75'
  if (value >= 50) return '#f59e0b'
  return '#f87171'
}

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  const d = payload[0]
  return (
    <div className="bg-white border border-gray-100 shadow-lg rounded-xl px-4 py-3 text-sm">
      <p className="font-semibold text-gray-800">{d.payload.title}</p>
      <p className="text-brand-500 font-bold mt-0.5">{d.value}% automation potential</p>
      <p className="text-gray-400 text-xs mt-0.5">{d.payload.actor}</p>
    </div>
  )
}

const CustomLabel = ({ x, y, width, value }) => (
  <text x={x + width / 2} y={y - 5} textAnchor="middle"
    fontSize={10} fill={getBarColor(value)} fontWeight="600">
    {value}%
  </text>
)

export default function AutomationChart({ steps }) {
  if (!steps?.length) return null

  const data = steps.map(s => ({
    title: s.title?.length > 16 ? s.title.slice(0, 14) + '…' : s.title,
    fullTitle: s.title,
    actor: s.actor,
    value: s.automation_potential,
  }))

  return (
    <div className="card p-6 mt-6">
      <h3 className="text-sm font-semibold text-gray-700 mb-6">
        Automation Potential Analysis
      </h3>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data} margin={{ top: 20, right: 16, left: -10, bottom: 40 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
          <XAxis
            dataKey="title"
            tick={{ fontSize: 10, fill: '#9ca3af' }}
            angle={-40}
            textAnchor="end"
            interval={0}
            height={60}
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fontSize: 10, fill: '#9ca3af' }}
            tickFormatter={v => `${v}%`}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f9fafb' }} />
          <Bar dataKey="value" radius={[6, 6, 0, 0]} label={<CustomLabel />}>
            {data.map((d, i) => (
              <Cell key={i} fill={getBarColor(d.value)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      {/* Legend */}
      <div className="flex items-center gap-5 mt-2 justify-center">
        {[['#1d9e75', '≥ 80% High'], ['#f59e0b', '50–79% Medium'], ['#f87171', '< 50% Low']].map(([c, l]) => (
          <div key={l} className="flex items-center gap-1.5 text-xs text-gray-500">
            <span className="w-3 h-3 rounded-sm inline-block" style={{ background: c }} />
            {l}
          </div>
        ))}
      </div>
    </div>
  )
}
