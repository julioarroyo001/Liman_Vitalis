import { supabase } from './supabase';

export interface AnalysisResult {
  severity: 'info' | 'warning' | 'critical';
  message: string;
  confidence: number;
  recommendations?: string[];
}

export class UrbanAIAnalyzer {
  private async getLayerData(layerId: string, limit: number = 100) {
    const { data, error } = await supabase
      .from('layer_data')
      .select('*')
      .eq('layer_id', layerId)
      .order('recorded_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  }

  private async getIssuesData(category?: string, limit: number = 100) {
    let query = supabase
      .from('issues')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (category) {
      query = query.eq('category', category);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  classifyIssuePriority(description: string, category: string): { priority: string; confidence: number } {
    const criticalKeywords = ['emergency', 'dangerous', 'urgent', 'severe', 'critical', 'immediate'];
    const highKeywords = ['serious', 'major', 'significant', 'important', 'concerning'];
    const mediumKeywords = ['moderate', 'noticeable', 'issue', 'problem'];

    const lowerDesc = description.toLowerCase();
    const lowerCat = category.toLowerCase();

    if (lowerCat === 'safety' || criticalKeywords.some(kw => lowerDesc.includes(kw))) {
      return { priority: 'critical', confidence: 0.85 };
    }

    if (highKeywords.some(kw => lowerDesc.includes(kw))) {
      return { priority: 'high', confidence: 0.75 };
    }

    if (mediumKeywords.some(kw => lowerDesc.includes(kw))) {
      return { priority: 'medium', confidence: 0.65 };
    }

    return { priority: 'low', confidence: 0.6 };
  }

  async detectAnomalies(layerId: string): Promise<AnalysisResult[]> {
    const data = await this.getLayerData(layerId);
    if (data.length < 10) {
      return [{
        severity: 'info',
        message: 'Insufficient data for anomaly detection',
        confidence: 0.5
      }];
    }

    const values = data.map(d => d.value);
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);

    const anomalies: AnalysisResult[] = [];

    data.forEach((point) => {
      const zScore = Math.abs((point.value - mean) / stdDev);

      if (zScore > 3) {
        anomalies.push({
          severity: 'critical',
          message: `Critical anomaly detected at (${point.latitude.toFixed(4)}, ${point.longitude.toFixed(4)}): value ${point.value.toFixed(2)} (${zScore.toFixed(2)}σ from mean)`,
          confidence: Math.min(0.95, 0.7 + (zScore - 3) * 0.05),
          recommendations: [
            'Immediate investigation required',
            'Deploy additional sensors in the area',
            'Alert local authorities'
          ]
        });
      } else if (zScore > 2) {
        anomalies.push({
          severity: 'warning',
          message: `Unusual reading at (${point.latitude.toFixed(4)}, ${point.longitude.toFixed(4)}): value ${point.value.toFixed(2)}`,
          confidence: 0.65 + (zScore - 2) * 0.1,
          recommendations: [
            'Monitor the area closely',
            'Verify sensor calibration'
          ]
        });
      }
    });

    if (anomalies.length === 0) {
      return [{
        severity: 'info',
        message: 'All readings within normal range',
        confidence: 0.8
      }];
    }

    return anomalies;
  }

  async analyzeTrends(layerId: string, days: number = 7): Promise<AnalysisResult> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const { data, error } = await supabase
      .from('layer_data')
      .select('*')
      .eq('layer_id', layerId)
      .gte('recorded_at', cutoffDate.toISOString())
      .order('recorded_at', { ascending: true });

    if (error || !data || data.length < 2) {
      return {
        severity: 'info',
        message: 'Insufficient data for trend analysis',
        confidence: 0.5
      };
    }

    const values = data.map(d => d.value);
    const firstHalf = values.slice(0, Math.floor(values.length / 2));
    const secondHalf = values.slice(Math.floor(values.length / 2));

    const firstMean = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const secondMean = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;

    const percentChange = ((secondMean - firstMean) / firstMean) * 100;

    if (Math.abs(percentChange) > 30) {
      return {
        severity: 'critical',
        message: `Significant ${percentChange > 0 ? 'increase' : 'decrease'} detected: ${Math.abs(percentChange).toFixed(1)}% change over ${days} days`,
        confidence: 0.85,
        recommendations: [
          'Investigate root causes',
          'Implement corrective measures',
          'Increase monitoring frequency'
        ]
      };
    } else if (Math.abs(percentChange) > 15) {
      return {
        severity: 'warning',
        message: `Moderate trend detected: ${percentChange > 0 ? '+' : ''}${percentChange.toFixed(1)}% change over ${days} days`,
        confidence: 0.75,
        recommendations: [
          'Continue monitoring',
          'Prepare contingency plans'
        ]
      };
    }

    return {
      severity: 'info',
      message: `Stable trend: ${percentChange > 0 ? '+' : ''}${percentChange.toFixed(1)}% change over ${days} days`,
      confidence: 0.8
    };
  }

  async predictQuality(layerId: string, hoursAhead: number = 24): Promise<{
    predictedValue: number;
    confidence: number;
    trend: 'improving' | 'stable' | 'declining';
  }> {
    const data = await this.getLayerData(layerId, 50);
    if (data.length < 5) {
      throw new Error('Insufficient data for prediction');
    }

    const values = data.map(d => d.value).reverse();
    const n = values.length;

    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;

    for (let i = 0; i < n; i++) {
      sumX += i;
      sumY += values[i];
      sumXY += i * values[i];
      sumX2 += i * i;
    }

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    const predictedValue = slope * (n + hoursAhead) + intercept;

    const residuals = values.map((y, i) => y - (slope * i + intercept));
    const mse = residuals.reduce((a, b) => a + b * b, 0) / n;
    const rmse = Math.sqrt(mse);

    const dataRange = Math.max(...values) - Math.min(...values);
    const confidence = Math.max(0.5, 1 - (rmse / dataRange));

    let trend: 'improving' | 'stable' | 'declining';
    if (Math.abs(slope) < 0.01) {
      trend = 'stable';
    } else if (slope < 0) {
      trend = 'improving';
    } else {
      trend = 'declining';
    }

    return {
      predictedValue: Math.max(0, predictedValue),
      confidence: Math.min(0.95, confidence),
      trend
    };
  }

  async analyzeIssuePatterns(): Promise<{
    hotspots: Array<{ latitude: number; longitude: number; count: number; categories: string[] }>;
    topCategories: Array<{ category: string; count: number; avgPriority: number }>;
  }> {
    const issues = await this.getIssuesData(undefined, 500);

    const gridSize = 0.01;
    const hotspotMap = new Map<string, { count: number; categories: Set<string>; lat: number; lng: number }>();

    issues.forEach(issue => {
      const gridLat = Math.floor(issue.latitude / gridSize) * gridSize;
      const gridLng = Math.floor(issue.longitude / gridSize) * gridSize;
      const key = `${gridLat},${gridLng}`;

      if (!hotspotMap.has(key)) {
        hotspotMap.set(key, { count: 0, categories: new Set(), lat: gridLat, lng: gridLng });
      }

      const hotspot = hotspotMap.get(key)!;
      hotspot.count++;
      hotspot.categories.add(issue.category);
    });

    const hotspots = Array.from(hotspotMap.values())
      .filter(h => h.count >= 3)
      .map(h => ({
        latitude: h.lat,
        longitude: h.lng,
        count: h.count,
        categories: Array.from(h.categories)
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const categoryMap = new Map<string, { count: number; totalPriority: number }>();
    const priorityValues = { low: 1, medium: 2, high: 3, critical: 4 };

    issues.forEach(issue => {
      if (!categoryMap.has(issue.category)) {
        categoryMap.set(issue.category, { count: 0, totalPriority: 0 });
      }
      const cat = categoryMap.get(issue.category)!;
      cat.count++;
      cat.totalPriority += priorityValues[issue.priority as keyof typeof priorityValues] || 2;
    });

    const topCategories = Array.from(categoryMap.entries())
      .map(([category, data]) => ({
        category,
        count: data.count,
        avgPriority: data.totalPriority / data.count
      }))
      .sort((a, b) => b.count - a.count);

    return { hotspots, topCategories };
  }

  async generateAutoAlerts(): Promise<Array<{
    title: string;
    message: string;
    severity: 'info' | 'warning' | 'critical';
    latitude?: number;
    longitude?: number;
  }>> {
    const alerts: Array<{
      title: string;
      message: string;
      severity: 'info' | 'warning' | 'critical';
      latitude?: number;
      longitude?: number;
    }> = [];

    const { hotspots, topCategories } = await this.analyzeIssuePatterns();

    hotspots.slice(0, 3).forEach(hotspot => {
      alerts.push({
        title: 'Issue Hotspot Detected',
        message: `High concentration of ${hotspot.count} issues detected. Categories: ${hotspot.categories.join(', ')}`,
        severity: hotspot.count > 10 ? 'critical' : 'warning',
        latitude: hotspot.latitude,
        longitude: hotspot.longitude
      });
    });

    topCategories.slice(0, 2).forEach(cat => {
      if (cat.avgPriority > 2.5) {
        alerts.push({
          title: `Rising ${cat.category} Issues`,
          message: `${cat.count} ${cat.category} issues reported with elevated priority`,
          severity: cat.avgPriority > 3 ? 'critical' : 'warning'
        });
      }
    });

    return alerts;
  }
}

export const aiAnalyzer = new UrbanAIAnalyzer();
