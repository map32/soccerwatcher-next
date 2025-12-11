'use client';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

// Color palette for lines
const COLORS = ['#2563eb', '#dc2626', '#16a34a', '#d97706', '#9333ea', '#db2777'];

export default function MultiEloChart({ teamsData }: { teamsData: any[] }) {
  // teamsData is array of { teamName, data: [{ from: '2020-01-01', elo: 1200 }, ...] }

  // We need to display these. 
  // Since dates might not align perfectly, Recharts is flexible if we provide `allowDuplicatedCategory={false}` on XAxis 
  // but it's cleaner to just map over the lines if we aren't doing strict X-axis merging.
  // Actually, for multiple lines with different X-points, we usually merge data.
  // HOWEVER, Recharts 2.x allows multiple data arrays if we use specific `data` prop on <Line>.

  return (
    <div className="w-full h-[500px] bg-white rounded-xl p-4 shadow-sm border border-zinc-100">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          
          {/* We use 'type="number"' for XAxis with a domain to handle time properly 
             so lines with different dates align correctly 
          */}
          <XAxis 
            dataKey="dateTimestamp" 
            type="number" 
            domain={['auto', 'auto']}
            tickFormatter={(unixTime) => new Date(unixTime).toLocaleDateString()}
            tick={{fontSize: 12}}
          />
          <YAxis domain={['auto', 'auto']} />
          <Tooltip 
             labelFormatter={(t) => new Date(t).toLocaleDateString()}
             contentStyle={{ borderRadius: '8px' }}
          />
          <Legend />

          {teamsData.map((teamObj, index) => (
             <Line 
               key={teamObj.teamName}
               data={teamObj.data.map((d: any) => ({ ...d, dateTimestamp: new Date(d.from).getTime() }))}
               type="monotone" 
               dataKey="elo" 
               name={teamObj.teamName} // Legend name
               stroke={COLORS[index % COLORS.length]} 
               strokeWidth={2} 
               dot={false}
             />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}