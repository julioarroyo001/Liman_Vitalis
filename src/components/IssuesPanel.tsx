import { useEffect, useState } from 'react';
import { AlertCircle, MapPin, Clock, CheckCircle, Filter } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Issue {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  latitude: number;
  longitude: number;
  created_at: string;
  ai_classified: boolean;
  ai_confidence: number | null;
}

export function IssuesPanel() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadIssues();

    const subscription = supabase
      .channel('issues_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'issues' }, () => {
        loadIssues();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const loadIssues = async () => {
    setLoading(true);

    let query = supabase
      .from('issues')
      .select('*')
      .order('created_at', { ascending: false });

    if (filterStatus !== 'all') {
      query = query.eq('status', filterStatus);
    }

    if (filterPriority !== 'all') {
      query = query.eq('priority', filterPriority);
    }

    const { data } = await query;

    if (data) {
      setIssues(data);
    }

    setLoading(false);
  };

  useEffect(() => {
    loadIssues();
  }, [filterStatus, filterPriority]);

  const updateStatus = async (id: string, newStatus: string) => {
    const updates: any = { status: newStatus };
    if (newStatus === 'resolved') {
      updates.resolved_at = new Date().toISOString();
    }

    const { error } = await supabase
      .from('issues')
      .update(updates)
      .eq('id', id);

    if (!error) {
      loadIssues();
    }
  };

  const priorityColors = {
    low: 'bg-green-100 text-green-800 border-green-200',
    medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    high: 'bg-orange-100 text-orange-800 border-orange-200',
    critical: 'bg-red-100 text-red-800 border-red-200',
  };

  const statusColors = {
    reported: 'bg-blue-100 text-blue-800',
    in_progress: 'bg-purple-100 text-purple-800',
    resolved: 'bg-green-100 text-green-800',
    closed: 'bg-gray-100 text-gray-800',
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Urban Issues</h1>
          <p className="text-gray-600">Track and manage reported issues</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
          <div className="flex items-center gap-4">
            <Filter className="w-5 h-5 text-gray-500" />
            <div className="flex gap-4 flex-1">
              <div>
                <label className="text-xs font-medium text-gray-500 block mb-1">Status</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="reported">Reported</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-500 block mb-1">Priority</label>
                <select
                  value={filterPriority}
                  onChange={(e) => setFilterPriority(e.target.value)}
                  className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Priorities</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
            </div>

            <div className="text-sm text-gray-600">
              {issues.length} issue{issues.length !== 1 ? 's' : ''}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {issues.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-100">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No issues found</h3>
              <p className="text-gray-600">Try adjusting your filters or report a new issue on the map</p>
            </div>
          ) : (
            issues.map((issue) => (
              <div key={issue.id} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-start gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{issue.title}</h3>
                      {issue.ai_classified && (
                        <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-md font-medium">
                          AI Classified
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 mb-3">{issue.description}</p>

                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className={`px-3 py-1 text-xs font-medium rounded-full border ${priorityColors[issue.priority as keyof typeof priorityColors]}`}>
                        {issue.priority.toUpperCase()}
                      </span>
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${statusColors[issue.status as keyof typeof statusColors]}`}>
                        {issue.status.replace('_', ' ').toUpperCase()}
                      </span>
                      <span className="px-3 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                        {issue.category}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        <span>{issue.latitude.toFixed(4)}, {issue.longitude.toFixed(4)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{new Date(issue.created_at).toLocaleDateString()}</span>
                      </div>
                      {issue.ai_confidence && (
                        <span className="text-purple-600">
                          Confidence: {(issue.ai_confidence * 100).toFixed(0)}%
                        </span>
                      )}
                    </div>
                  </div>

                  {issue.status !== 'resolved' && issue.status !== 'closed' && (
                    <div className="flex gap-2 ml-4">
                      {issue.status === 'reported' && (
                        <button
                          onClick={() => updateStatus(issue.id, 'in_progress')}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
                        >
                          Start Progress
                        </button>
                      )}
                      {issue.status === 'in_progress' && (
                        <button
                          onClick={() => updateStatus(issue.id, 'resolved')}
                          className="flex items-center gap-1 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition-colors"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Resolve
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
