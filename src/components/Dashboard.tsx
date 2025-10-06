import { useEffect, useState } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, AlertTriangle, CheckCircle, Activity, Zap, MapPin } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { aiAnalyzer, AnalysisResult } from '../lib/ai-analysis';

interface DashboardStats {
  totalIssues: number;
  activeIssues: number;
  resolvedIssues: number;
  criticalIssues: number;
}

export function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalIssues: 0,
    activeIssues: 0,
    resolvedIssues: 0,
    criticalIssues: 0,
  });
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [trendData, setTrendData] = useState<any[]>([]);
  const [priorityData, setPriorityData] = useState<any[]>([]);
  const [aiAnalysis, setAiAnalysis] = useState<AnalysisResult[]>([]);
  const [hotspots, setHotspots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);

    try {
      const { data: issues } = await supabase
        .from('issues')
        .select('*')
        .order('created_at', { ascending: false });

      if (issues) {
        setStats({
          totalIssues: issues.length,
          activeIssues: issues.filter(i => i.status === 'reported' || i.status === 'in_progress').length,
          resolvedIssues: issues.filter(i => i.status === 'resolved').length,
          criticalIssues: issues.filter(i => i.priority === 'critical').length,
        });

        const categoryCounts: { [key: string]: number } = {};
        issues.forEach(issue => {
          categoryCounts[issue.category] = (categoryCounts[issue.category] || 0) + 1;
        });

        setCategoryData(
          Object.entries(categoryCounts).map(([name, value]) => ({ name, value }))
        );

        const priorityCounts = {
          low: issues.filter(i => i.priority === 'low').length,
          medium: issues.filter(i => i.priority === 'medium').length,
          high: issues.filter(i => i.priority === 'high').length,
          critical: issues.filter(i => i.priority === 'critical').length,
        };

        setPriorityData([
          { name: 'Low', value: priorityCounts.low, color: '#10b981' },
          { name: 'Medium', value: priorityCounts.medium, color: '#f59e0b' },
          { name: 'High', value: priorityCounts.high, color: '#f97316' },
          { name: 'Critical', value: priorityCounts.critical, color: '#ef4444' },
        ]);

        const last7Days = Array.from({ length: 7 }, (_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - (6 - i));
          return date.toISOString().split('T')[0];
        });

        const trend = last7Days.map(date => {
          const count = issues.filter(i => i.created_at.startsWith(date)).length;
          return { date: date.slice(5), count };
        });

        setTrendData(trend);

        const patterns = await aiAnalyzer.analyzeIssuePatterns();
        setHotspots(patterns.hotspots.slice(0, 5));

        const alerts = await aiAnalyzer.generateAutoAlerts();
        setAiAnalysis(alerts.map(a => ({
          severity: a.severity,
          message: a.message,
          confidence: 0.85,
        })));
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="absolute right-0 top-0 w-96 h-full bg-white shadow-lg z-10 overflow-y-auto p-6">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Urban Analytics Dashboard</h1>
          <p className="text-gray-600">Real-time insights powered by AI</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Activity className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-sm font-medium text-blue-600">Total</span>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">{stats.totalIssues}</div>
            <div className="text-sm text-gray-600">Reported Issues</div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-yellow-600" />
              </div>
              <span className="text-sm font-medium text-yellow-600">Active</span>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">{stats.activeIssues}</div>
            <div className="text-sm text-gray-600">In Progress</div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <span className="text-sm font-medium text-green-600">Resolved</span>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">{stats.resolvedIssues}</div>
            <div className="text-sm text-gray-600">Completed</div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <span className="text-sm font-medium text-red-600">Critical</span>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">{stats.criticalIssues}</div>
            <div className="text-sm text-gray-600">High Priority</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Issue Trends (Last 7 Days)</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" stroke="#6b7280" fontSize={12} />
                <YAxis stroke="#6b7280" fontSize={12} />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Issues by Category</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" stroke="#6b7280" fontSize={12} />
                <YAxis stroke="#6b7280" fontSize={12} />
                <Tooltip />
                <Bar dataKey="value" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Priority Distribution</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={priorityData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {priorityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-5 h-5 text-yellow-600" />
              <h3 className="text-lg font-semibold text-gray-900">AI Insights</h3>
            </div>
            <div className="space-y-3 max-h-[250px] overflow-y-auto">
              {aiAnalysis.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-8">No alerts at this time</p>
              ) : (
                aiAnalysis.map((analysis, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-lg border ${
                      analysis.severity === 'critical'
                        ? 'bg-red-50 border-red-200'
                        : analysis.severity === 'warning'
                        ? 'bg-yellow-50 border-yellow-200'
                        : 'bg-blue-50 border-blue-200'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <AlertTriangle
                        className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                          analysis.severity === 'critical'
                            ? 'text-red-600'
                            : analysis.severity === 'warning'
                            ? 'text-yellow-600'
                            : 'text-blue-600'
                        }`}
                      />
                      <div className="flex-1">
                        <p className="text-sm text-gray-900">{analysis.message}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Confidence: {(analysis.confidence * 100).toFixed(0)}%
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {hotspots.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-5 h-5 text-red-600" />
              <h3 className="text-lg font-semibold text-gray-900">Issue Hotspots</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {hotspots.map((hotspot, idx) => (
                <div key={idx} className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-2xl font-bold text-red-600">{hotspot.count}</span>
                    <MapPin className="w-5 h-5 text-red-600" />
                  </div>
                  <p className="text-sm text-gray-700 mb-2">
                    {hotspot.latitude.toFixed(4)}, {hotspot.longitude.toFixed(4)}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {hotspot.categories.map((cat: string, cidx: number) => (
                      <span key={cidx} className="px-2 py-1 bg-white text-xs rounded">
                        {cat}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
