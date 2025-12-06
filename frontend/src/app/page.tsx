'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';
import { getHealth, getProjects, getScripts, type Project, type HealthStatus, type Script } from '@/lib/api';

export default function Dashboard() {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [scripts, setScripts] = useState<Script[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [healthData, projectsData, scriptsData] = await Promise.all([
          getHealth(),
          getProjects(),
          getScripts(),
        ]);
        setHealth(healthData);
        setProjects(projectsData);
        setScripts(scriptsData);
        if (projectsData.length > 0) {
          setCurrentProject(projectsData[0]);
        }
      } catch (err) {
        console.error('Failed to fetch data:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Sample trending keywords for display
  const trendingKeywords = [
    { text: '副業 在宅', color: 'tag-cyan' },
    { text: '月5万円', color: 'tag-yellow' },
    { text: '動画編集', color: 'tag-orange' },
    { text: '動画編集', color: 'tag-cyan' },
    { text: '稼ぎ費', color: 'tag-magenta' },
    { text: 'スニーツ', color: 'tag-green' },
  ];

  return (
    <div className="min-h-screen cyber-bg">
      <Sidebar />
      
      <main className="ml-56 p-6 relative z-10">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between animate-fade-in">
          <div>
            <h1 className="text-2xl font-bold text-[#f0f0ff]">
              Project: <span className="text-[#00d4ff]">{currentProject?.name || 'No Project'}</span>
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#00d4ff] to-[#ff00ff] flex items-center justify-center cursor-pointer hover:scale-105 transition-transform">
              <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-6 glass-card p-6 animate-fade-in stagger-1">
          <h2 className="text-lg font-semibold text-[#f0f0ff] mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-4">
            <Link
              href="/research"
              className="flex items-center justify-center gap-3 rounded-xl btn-cyber-cyan py-4 text-lg font-semibold"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
              新規リサーチ
            </Link>
            <Link
              href="/scripts"
              className="flex items-center justify-center gap-3 rounded-xl btn-cyber-magenta py-4 text-lg font-semibold"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
              台本を作成
            </Link>
          </div>
        </div>

        {/* Recent Research Insights */}
        <div className="mb-6 glass-card p-6 animate-fade-in stagger-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-[#f0f0ff]">Recent Research Insights</h2>
            <Link href="/research" className="text-sm text-[#00d4ff] hover:underline">
              リサーチ結果をすべて見る
            </Link>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Chart Area */}
            <div>
              <p className="text-sm text-[#8888aa] mb-2">Trending video views</p>
              <div className="h-48 relative">
                {/* Simplified chart visualization */}
                <svg className="w-full h-full" viewBox="0 0 400 150">
                  {/* Grid lines */}
                  <line x1="0" y1="30" x2="400" y2="30" stroke="rgba(100,200,255,0.1)" />
                  <line x1="0" y1="60" x2="400" y2="60" stroke="rgba(100,200,255,0.1)" />
                  <line x1="0" y1="90" x2="400" y2="90" stroke="rgba(100,200,255,0.1)" />
                  <line x1="0" y1="120" x2="400" y2="120" stroke="rgba(100,200,255,0.1)" />
                  
                  {/* Chart line */}
                  <path 
                    d="M 0 100 Q 50 90, 80 85 T 150 70 T 200 80 T 250 50 T 300 60 T 350 40 T 400 55" 
                    fill="none" 
                    stroke="url(#gradient)" 
                    strokeWidth="3"
                  />
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#00d4ff" />
                      <stop offset="100%" stopColor="#00ffaa" />
                    </linearGradient>
                  </defs>
                  
                  {/* Data points with stars */}
                  <circle cx="80" cy="85" r="4" fill="#fff" className="animate-pulse" />
                  <circle cx="150" cy="70" r="4" fill="#fff" className="animate-pulse" style={{animationDelay: '0.2s'}} />
                  <circle cx="200" cy="80" r="4" fill="#fff" className="animate-pulse" style={{animationDelay: '0.4s'}} />
                  <circle cx="250" cy="50" r="4" fill="#fff" className="animate-pulse" style={{animationDelay: '0.6s'}} />
                  <circle cx="300" cy="60" r="4" fill="#fff" className="animate-pulse" style={{animationDelay: '0.8s'}} />
                  <circle cx="350" cy="40" r="4" fill="#fff" className="animate-pulse" style={{animationDelay: '1s'}} />
                  
                  {/* Y-axis labels */}
                  <text x="5" y="35" fill="#8888aa" fontSize="10">40K</text>
                  <text x="5" y="65" fill="#8888aa" fontSize="10">30K</text>
                  <text x="5" y="95" fill="#8888aa" fontSize="10">20K</text>
                  <text x="5" y="125" fill="#8888aa" fontSize="10">10K</text>
                  
                  {/* X-axis labels */}
                  <text x="40" y="145" fill="#8888aa" fontSize="10">03:00</text>
                  <text x="100" y="145" fill="#8888aa" fontSize="10">06:00</text>
                  <text x="160" y="145" fill="#8888aa" fontSize="10">12:00</text>
                  <text x="220" y="145" fill="#8888aa" fontSize="10">12:00</text>
                  <text x="280" y="145" fill="#8888aa" fontSize="10">00:00</text>
                  <text x="340" y="145" fill="#8888aa" fontSize="10">03:00</text>
                </svg>
              </div>
            </div>
            
            {/* Trending Keywords */}
            <div>
              <p className="text-sm text-[#8888aa] mb-3">Top Trending Keywords</p>
              <div className="flex flex-wrap gap-2">
                {trendingKeywords.map((keyword, i) => (
                  <span 
                    key={i} 
                    className={`px-4 py-2 rounded-full text-sm font-medium ${keyword.color}`}
                  >
                    {keyword.text}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Generated Scripts */}
        <div className="glass-card p-6 animate-fade-in stagger-3">
          <h2 className="text-lg font-semibold text-[#f0f0ff] mb-4">Generated Scripts</h2>
          
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#00d4ff] border-t-transparent" />
            </div>
          ) : scripts.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-[#8888aa]">まだ台本がありません</p>
              <Link
                href="/scripts"
                className="mt-4 inline-flex items-center gap-2 rounded-lg btn-cyber-magenta px-4 py-2 text-sm font-medium"
              >
                台本を作成する
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[rgba(100,200,255,0.2)]">
                    <th className="text-left py-3 px-4 text-sm font-medium text-[#8888aa]">Title</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-[#8888aa]">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-[#8888aa]">Date</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-[#8888aa]"></th>
                  </tr>
                </thead>
                <tbody>
                  {scripts.slice(0, 5).map((script) => (
                    <tr key={script.id} className="border-b border-[rgba(100,200,255,0.1)] hover:bg-[rgba(0,212,255,0.05)]">
                      <td className="py-3 px-4 text-sm text-[#f0f0ff]">{script.title}</td>
                      <td className="py-3 px-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          script.status === 'published' ? 'status-completed' : 
                          script.status === 'analyzing' ? 'status-analyzing' : 'status-draft'
                        }`}>
                          {script.status === 'published' ? 'Completed' : 
                           script.status === 'analyzing' ? 'Analyzing' : 'Draft'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-[#8888aa]">
                        {new Date(script.created_at).toLocaleDateString('ja-JP')}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/scripts/${script.id}`}
                            className="px-3 py-1 rounded-lg border border-[rgba(100,200,255,0.3)] text-xs font-medium text-[#00d4ff] hover:bg-[rgba(0,212,255,0.1)]"
                          >
                            編集
                          </Link>
                          <button className="px-3 py-1 rounded-lg border border-[rgba(100,200,255,0.3)] text-xs font-medium text-[#f0f0ff] hover:bg-[rgba(255,255,255,0.05)]">
                            表示
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
