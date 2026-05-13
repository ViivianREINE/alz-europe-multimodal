"use client";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from "recharts";

interface MasteryData {
  subject: string;
  score: number;
  fullMark: number;
}

export default function MasteryRadar({ data }: { data: MasteryData[] }) {
  return (
    <div className="w-full h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
          <PolarGrid stroke="rgba(255,255,255,0.1)" />
          <PolarAngleAxis 
            dataKey="subject" 
            tick={{ fill: "rgba(148, 163, 184, 1)", fontSize: 12, fontWeight: 500 }}
          />
          <Radar
            name="Mastery"
            dataKey="score"
            stroke="#6C63FF"
            fill="#6C63FF"
            fillOpacity={0.3}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
