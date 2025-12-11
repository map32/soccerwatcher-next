'use client';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, Tooltip } from 'recharts';

const COLORS = ['#2563eb', '#dc2626', '#16a34a', '#d97706', '#9333ea'];

export default function MultiPlayerRadar({ players }: { players: any[] }) {
  if (players.length === 0) return null;

  // 1. Get all available stat keys from the first player (assuming same position = same stats)
  const statKeys = Object.keys(players[0].stats).slice(0, 8); // Slice for readability

  // 2. Transform Data for Recharts
  // Structure: [{ subject: 'Goals', Messi: 99, Ronaldo: 95 }, ...]
  const chartData = statKeys.map(key => {
    const point: any = { subject: key, fullMark: 100 };
    players.forEach(p => {
        point[p.name] = p.stats[key].percentile || 0;
        // We store the raw value in a hidden field for the custom tooltip
        point[`${p.name}_raw`] = p.stats[key].value; 
    });
    return point;
  });

  // 3. Custom Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/95 p-3 border border-zinc-200 shadow-xl rounded-lg text-sm">
          <p className="font-bold mb-2 border-b pb-1">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} style={{ color: entry.color }} className="flex justify-between gap-4 mb-1">
               <span>{entry.name}:</span>
               <span>
                 {/* Show Rank and Raw Value */}
                 Rank: {entry.value} | Raw: {entry.payload[`${entry.name}_raw`]}
               </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-[600px] bg-white dark:bg-zinc-900 rounded-xl p-4 shadow-sm border border-zinc-200">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
          <PolarGrid />
          <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11 }} />
          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
          
          {players.map((p, index) => (
            <Radar
              key={p.player_id}
              name={p.name}
              dataKey={p.name}
              stroke={COLORS[index % COLORS.length]}
              fill={COLORS[index % COLORS.length]}
              fillOpacity={0.1}
            />
          ))}
          
          <Tooltip content={<CustomTooltip />} />
          <Legend />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}