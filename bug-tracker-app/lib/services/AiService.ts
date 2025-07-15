// lib/services/AiService.ts - Production-Ready Version
import { getFeatureExtractor } from "@/lib/ai/featureExtractor";
import connectDB from "@/lib/db/Connect";
import BugModel from "@/models/bugModel";

export interface AIAnalyticsData {
  insights: string[];
  recommendations: string[];
  trends: string[];
  predictions: string[];
  confidence: number;
  generatedAt: Date;
}

export interface AISearchResult {
  query: string;
  results: any[];
  confidence: number;
  suggestions: string[];
  processingTime: number;
  metadata: {
    totalResults: number;
    searchQuality: string;
    hasHighPriorityResults: boolean;
  };
}

export interface AIBugAnalysis {
  duplicates: any[];
  severity: string;
  priority: string;
  assignee: string;
  tags: string[];
  estimatedTime: string;
  confidence: number;
  reasoning: string[];
  suggestedSolution?: string;
  relatedBugs?: any[];
}

export interface AITeamInsights {
  performanceAnalysis: string[];
  workloadRecommendations: string[];
  skillGaps: string[];
  productivityTrends: string[];
  confidence: number;
  dataPoints: number;
}

// Enhanced caching with TTL, size limits, and memory management
class AICache {
  private cache: Map<
    string,
    { data: any; timestamp: number; ttl: number; size: number }
  > = new Map();
  private maxSize: number = 100; // Max cache entries
  private maxMemory: number = 50 * 1024 * 1024; // 50MB max memory
  private currentMemory: number = 0;

  set(key: string, data: any, ttlMinutes: number = 30): boolean {
    try {
      const dataString = JSON.stringify(data);
      const dataSize = new Blob([dataString]).size;

      // Check memory and size limits
      if (
        this.currentMemory + dataSize > this.maxMemory ||
        this.cache.size >= this.maxSize
      ) {
        this.evictLRU();
      }

      this.cache.set(key, {
        data,
        timestamp: Date.now(),
        ttl: ttlMinutes * 60 * 1000,
        size: dataSize,
      });

      this.currentMemory += dataSize;
      return true;
    } catch (error) {
      console.error("Cache set error:", error);
      return false;
    }
  }

  get(key: string): any | null {
    try {
      const cached = this.cache.get(key);
      if (!cached) return null;

      if (Date.now() - cached.timestamp > cached.ttl) {
        this.currentMemory -= cached.size;
        this.cache.delete(key);
        return null;
      }

      return cached.data;
    } catch (error) {
      console.error("Cache get error:", error);
      return null;
    }
  }

  private evictLRU(): void {
    try {
      const oldestKey = Array.from(this.cache.keys())[0];
      if (oldestKey) {
        const cached = this.cache.get(oldestKey);
        if (cached) {
          this.currentMemory -= cached.size;
          this.cache.delete(oldestKey);
        }
      }
    } catch (error) {
      console.error("Cache eviction error:", error);
    }
  }

  clear(): void {
    try {
      this.cache.clear();
      this.currentMemory = 0;
    } catch (error) {
      console.error("Cache clear error:", error);
    }
  }

  getStats(): {
    size: number;
    memoryUsage: number;
    maxMemory: number;
    keys: string[];
  } {
    try {
      return {
        size: this.cache.size,
        memoryUsage: this.currentMemory,
        maxMemory: this.maxMemory,
        keys: Array.from(this.cache.keys()),
      };
    } catch (error) {
      console.error("Cache stats error:", error);
      return { size: 0, memoryUsage: 0, maxMemory: this.maxMemory, keys: [] };
    }
  }
}

export class AIService {
  private static instance: AIService;
  private cache = new AICache();
  private isInitialized = false;
  private featureExtractor: any = null;

  static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  async initialize(): Promise<boolean> {
    if (this.isInitialized) return true;

    try {
      await connectDB();
      this.featureExtractor = await getFeatureExtractor();
      this.isInitialized = true;
      console.log("AI Service initialized successfully");
      return true;
    } catch (error) {
      console.error("AI Service initialization failed:", error);
      this.isInitialized = false;
      return false;
    }
  }

  // ========== Embedding Management ==========
  async generateEmbedding(text: string): Promise<number[] | null> {
    try {
      await this.initialize();
      if (!this.featureExtractor)
        throw new Error("Feature extractor not initialized");
      return Array.from((await this.featureExtractor(text))[0].data);
    } catch (error) {
      console.error("Embedding generation error:", error);
      return null;
    }
  }

  // ========== Enhanced Analytics Report ==========
  async generateIntelligentReport(
    data: any,
    timeRange: string,
    userId: string
  ): Promise<string> {
    const startTime = Date.now();
    const cacheKey = `report_${userId}_${JSON.stringify(data).slice(
      0,
      100
    )}_${timeRange}`;

    const cached = this.cache.get(cacheKey);
    if (cached) {
      console.log("Using cached analytics report");
      return cached;
    }

    try {
      if (!(await this.initialize()))
        throw new Error("AI Service not initialized");

      const enhancedData = await this.getEnhancedAnalyticsData(
        userId,
        timeRange
      );
      const combinedData = { ...data, ...enhancedData };

      const insights = await this.analyzeMetricsAdvanced(combinedData);
      const recommendations = await this.generateRecommendationsAdvanced(
        combinedData
      );
      const trends = await this.generateTrendAnalysisAdvanced(combinedData);
      const predictions = await this.generatePredictions(combinedData);

      const report = `
# AI-Powered Bug Analytics Report
Generated on: ${new Date().toLocaleDateString()}
Time Range: ${timeRange}
Processing Time: ${Date.now() - startTime}ms

## 🔍 Key Insights
${insights.map((i, idx) => `${idx + 1}. ${i}`).join("\n")}

## 🎯 AI Recommendations
${recommendations.map((r, idx) => `${idx + 1}. ${r}`).join("\n")}

## 📊 Metrics Summary
- Total Bugs: ${combinedData.totalBugs || 0}
- Resolution Rate: ${this.calculateResolutionRate(combinedData)}%
- Average Resolution Time: ${combinedData.avgResolutionTime || "N/A"}
- Critical Issues: ${combinedData.criticalIssues || 0}
- Team Productivity Score: ${this.calculateProductivityScore(combinedData)}/100

## 📈 Trend Analysis
${trends.join("\n")}

## 🔮 Predictions
${predictions.map((p, idx) => `${idx + 1}. ${p}`).join("\n")}

## 🏆 Team Performance
${await this.generateTeamPerformanceSection(combinedData, userId)}

---
*Report generated using AI-powered analytics with ${this.calculateConfidenceLevel(
        combinedData
      )}% confidence*
      `;

      this.cache.set(cacheKey, report, 15);
      return report;
    } catch (error) {
      console.error("Error generating report:", error);
      return this.generateFallbackReport(data, timeRange);
    }
  }

  // ========== Enhanced Semantic Search ==========
  async searchWithAI(
    query: string,
    userId: string,
    options: any = {}
  ): Promise<AISearchResult> {
    const startTime = Date.now();
    const cacheKey = `search_${userId}_${query
      .toLowerCase()
      .trim()}_${JSON.stringify(options).slice(0, 50)}`;

    const cached = this.cache.get(cacheKey);
    if (cached) {
      return { ...cached, processingTime: Date.now() - startTime };
    }

    try {
      if (!(await this.initialize()))
        throw new Error("AI Service not initialized");

      const queryVector = await this.generateEmbedding(query);
      if (!queryVector) throw new Error("Failed to generate query embedding");

      const bugs = await BugModel.find({
        createdBy: userId,
        embedding: { $exists: true, $ne: [] },
        ...(options.status && { status: options.status }),
        ...(options.component && { component: options.component }),
      }).select(
        "embedding title description status priority createdAt tags component"
      );

      const results = bugs
        .map((bug) => {
          const similarity = this.computeCosineSimilarity(
            queryVector,
            bug.embedding
          );
          return {
            _id: bug._id,
            title: bug.title,
            description: bug.description,
            status: bug.status,
            priority: bug.priority,
            createdAt: bug.createdAt,
            tags: bug.tags,
            component: bug.component,
            similarity,
            relevanceScore: similarity * 100,
            isHighPriority:
              bug.priority === "Critical" || bug.priority === "High",
            isRecent:
              new Date(bug.createdAt) >
              new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          };
        })
        .filter((result) => result.similarity > (options.threshold || 0.3))
        .sort((a, b) => {
          if (Math.abs(a.similarity - b.similarity) < 0.1) {
            if (a.isHighPriority !== b.isHighPriority)
              return a.isHighPriority ? -1 : 1;
            return b.isRecent ? 1 : -1;
          }
          return b.similarity - a.similarity;
        })
        .slice(0, options.limit || 10);

      const avgSimilarity =
        results.length > 0
          ? results.reduce((sum, r) => sum + r.similarity, 0) / results.length
          : 0;

      const result: AISearchResult = {
        query,
        results,
        confidence: Math.round(avgSimilarity * 100),
        suggestions: this.generateSmartSearchSuggestions(query, results),
        processingTime: Date.now() - startTime,
        metadata: {
          totalResults: results.length,
          searchQuality: this.getSearchQuality(avgSimilarity),
          hasHighPriorityResults: results.some((r) => r.isHighPriority),
        },
      };

      this.cache.set(cacheKey, result, 10);
      return result;
    } catch (error: any) {
      console.error("searchWithAI error:", error.message);
      return {
        query,
        results: [],
        confidence: 0,
        suggestions: this.generateFallbackSuggestions(query),
        processingTime: Date.now() - startTime,
        metadata: {
          totalResults: 0,
          searchQuality: "Failed",
          hasHighPriorityResults: false,
        },
      };
    }
  }

  // ========== Enhanced Bug Analysis ==========
  async analyzeBug(bugData: any, userId: string): Promise<AIBugAnalysis> {
    const cacheKey = `bug_analysis_${userId}_${JSON.stringify(bugData).slice(
      0,
      100
    )}`;

    const cached = this.cache.get(cacheKey);
    if (cached) {
      console.log("Using cached bug analysis");
      return cached;
    }

    try {
      if (!(await this.initialize()))
        throw new Error("AI Service not initialized");

      const duplicates = await this.findDuplicateBugs(
        bugData.description,
        userId
      );
      const severity = this.predictSeverity(bugData);
      const priority = this.predictPriority(bugData);
      const assignee = this.suggestAssignee(bugData);
      const tags = this.generateTags(bugData);
      const estimatedTime = this.estimateResolutionTime(bugData);
      const suggestedSolution = await this.generateSuggestedSolution(bugData);
      const relatedBugs = await this.findRelatedBugs(bugData, userId);

      const analysis: AIBugAnalysis = {
        duplicates,
        severity,
        priority,
        assignee,
        tags,
        estimatedTime,
        suggestedSolution,
        relatedBugs,
        confidence: this.calculateAnalysisConfidence({
          duplicates,
          severity,
          tags,
        }),
        reasoning: this.generateReasoningExplanation(bugData, {
          duplicates,
          severity,
          tags,
        }),
      };

      this.cache.set(cacheKey, analysis, 30);
      return analysis;
    } catch (error: any) {
      console.error("analyzeBug error:", error.message);
      return this.generateFallbackAnalysis(bugData);
    }
  }

  // ========== Enhanced Team Insights ==========
  async generateTeamInsights(
    userId: string,
    timeRange: string = "30d"
  ): Promise<AITeamInsights> {
    const cacheKey = `team_insights_${userId}_${timeRange}`;

    const cached = this.cache.get(cacheKey);
    if (cached) {
      console.log("Using cached team insights");
      return cached;
    }

    try {
      if (!(await this.initialize()))
        throw new Error("AI Service not initialized");

      const teamData = await this.getTeamData(userId, timeRange);
      const performanceAnalysis = await this.generatePerformanceAnalysis(
        teamData
      );
      const workloadRecommendations =
        await this.generateWorkloadRecommendations(teamData);
      const skillGaps = await this.identifySkillGaps(teamData);
      const productivityTrends = await this.analyzeProductivityTrends(teamData);

      const insights: AITeamInsights = {
        performanceAnalysis,
        workloadRecommendations,
        skillGaps,
        productivityTrends,
        confidence: this.calculateConfidenceLevel({ teamData }),
        dataPoints: teamData.length,
      };

      this.cache.set(cacheKey, insights, 60);
      return insights;
    } catch (error: any) {
      console.error("Error generating team insights:", error.message);
      return this.generateFallbackTeamInsights([]);
    }
  }

  // ========== Private Helper Methods ==========
  private async getEnhancedAnalyticsData(
    userId: string,
    timeRange: string
  ): Promise<any> {
    try {
      const dateRange = this.parseTimeRange(timeRange);

      const [
        totalBugs,
        resolvedBugs,
        criticalBugs,
        avgResolutionData,
        weeklyBugs,
      ] = await Promise.all([
        BugModel.countDocuments({
          createdBy: userId,
          createdAt: { $gte: dateRange.start, $lte: dateRange.end },
        }),
        BugModel.countDocuments({
          createdBy: userId,
          status: "resolved",
          createdAt: { $gte: dateRange.start, $lte: dateRange.end },
        }),
        BugModel.countDocuments({
          createdBy: userId,
          priority: "Critical",
          createdAt: { $gte: dateRange.start, $lte: dateRange.end },
        }),
        this.getAverageResolutionTime(userId, dateRange),
        this.getWeeklyBugCounts(userId, dateRange),
      ]);

      return {
        totalBugs,
        resolved: resolvedBugs,
        criticalIssues: criticalBugs,
        avgResolutionTime: avgResolutionData,
        weeklyBugs,
        total: totalBugs,
      };
    } catch (error) {
      console.error("Error fetching enhanced analytics data:", error);
      return {
        totalBugs: 0,
        resolved: 0,
        criticalIssues: 0,
        avgResolutionTime: "N/A",
        weeklyBugs: [],
      };
    }
  }

  private async findDuplicateBugs(
    description: string,
    userId: string
  ): Promise<any[]> {
    try {
      const newVector = await this.generateEmbedding(description);
      if (!newVector) return [];

      const bugs = await BugModel.find({
        createdBy: userId,
        status: { $ne: "resolved" },
        embedding: { $exists: true, $ne: [] },
      })
        .select("embedding title description status priority createdAt")
        .limit(100);

      return bugs
        .map((bug) => ({
          id: bug._id.toString(),
          title: bug.title,
          description: bug.description.substring(0, 200) + "...",
          status: bug.status,
          priority: bug.priority,
          createdAt: bug.createdAt,
          similarity: this.computeCosineSimilarity(newVector, bug.embedding),
        }))
        .filter((bug) => bug.similarity > 0.75)
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, 5);
    } catch (error) {
      console.error("Error finding duplicates:", error);
      return [];
    }
  }

  private async findRelatedBugs(bugData: any, userId: string): Promise<any[]> {
    try {
      const tags = this.generateTags(bugData);
      const relatedBugs = await BugModel.find({
        createdBy: userId,
        $or: [{ component: bugData.component }, { tags: { $in: tags } }],
        _id: { $ne: bugData._id },
      })
        .select("title description status priority createdAt component tags")
        .limit(5);

      return relatedBugs.map((bug) => ({
        id: bug._id.toString(),
        title: bug.title,
        description: bug.description.substring(0, 150) + "...",
        status: bug.status,
        priority: bug.priority,
        component: bug.component,
        createdAt: bug.createdAt,
      }));
    } catch (error) {
      console.error("Error finding related bugs:", error);
      return [];
    }
  }

  private async generateSuggestedSolution(bugData: any): Promise<string> {
    try {
      const severity = this.predictSeverity(bugData);
      const tags = this.generateTags(bugData);
      const description = bugData.description?.toLowerCase() || "";

      if (tags.includes("frontend") && description.includes("ui")) {
        return "Check CSS styling, component rendering, and responsive design patterns.";
      }
      if (tags.includes("backend") && description.includes("api")) {
        return "Review API endpoints, verify database connections, and check authentication middleware.";
      }
      if (tags.includes("performance")) {
        return "Analyze performance metrics, check for memory leaks, and optimize database queries.";
      }
      if (severity === "high") {
        return "Immediate action required: review logs, verify system stability, and apply hotfix.";
      }
      return "Review code for edge cases, add unit tests, and verify implementation.";
    } catch (error) {
      console.error("Error generating suggested solution:", error);
      return "Unable to generate suggested solution due to processing error.";
    }
  }

  private computeCosineSimilarity(vecA: number[], vecB: number[]): number {
    try {
      if (!vecA || !vecB || vecA.length !== vecB.length) return 0;

      const dotProduct = vecA.reduce((sum, val, i) => sum + val * vecB[i], 0);
      const magnitudeA = Math.sqrt(
        vecA.reduce((sum, val) => sum + val * val, 0)
      );
      const magnitudeB = Math.sqrt(
        vecB.reduce((sum, val) => sum + val * val, 0)
      );
      return dotProduct / (magnitudeA * magnitudeB || 1);
    } catch (error) {
      console.error("Cosine similarity error:", error);
      return 0;
    }
  }

  private getSearchQuality(similarity: number): string {
    try {
      if (similarity > 0.7) return "High";
      if (similarity > 0.4) return "Medium";
      return "Low";
    } catch (error) {
      console.error("Search quality error:", error);
      return "Failed";
    }
  }

  private parseTimeRange(timeRange: string): { start: Date; end: Date } {
    try {
      const end = new Date();
      const start = new Date();

      if (timeRange.includes("d")) {
        const days = parseInt(timeRange.replace("d", ""));
        start.setDate(end.getDate() - days);
      } else if (timeRange.includes("w")) {
        const weeks = parseInt(timeRange.replace("w", ""));
        start.setDate(end.getDate() - weeks * 7);
      } else if (timeRange.includes("m")) {
        const months = parseInt(timeRange.replace("m", ""));
        start.setMonth(end.getMonth() - months);
      } else {
        start.setDate(end.getDate() - 30); // Default to 30 days
      }

      return { start, end };
    } catch (error) {
      console.error("Time range parsing error:", error);
      return {
        start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        end: new Date(),
      };
    }
  }

  private async getAverageResolutionTime(
    userId: string,
    dateRange: any
  ): Promise<string> {
    try {
      const resolvedBugs = await BugModel.find({
        createdBy: userId,
        status: "resolved",
        createdAt: { $gte: dateRange.start, $lte: dateRange.end },
        resolvedAt: { $exists: true },
      }).select("createdAt resolvedAt");

      if (resolvedBugs.length === 0) return "N/A";

      const totalTime = resolvedBugs.reduce((sum, bug) => {
        const resolutionTime =
          new Date(bug.resolvedAt).getTime() -
          new Date(bug.createdAt).getTime();
        return sum + resolutionTime;
      }, 0);

      const avgTimeMs = totalTime / resolvedBugs.length;
      const avgTimeHours = avgTimeMs / (1000 * 60 * 60);

      return avgTimeHours > 24
        ? `${Math.round(avgTimeHours / 24)} days`
        : `${Math.round(avgTimeHours)} hours`;
    } catch (error) {
      console.error("Error calculating average resolution time:", error);
      return "N/A";
    }
  }

  private async getWeeklyBugCounts(
    userId: string,
    dateRange: any
  ): Promise<number[]> {
    try {
      const weeks = Math.ceil(
        (dateRange.end - dateRange.start) / (7 * 24 * 60 * 60 * 1000)
      );
      const weeklyCounts: number[] = [];

      for (let i = 0; i < weeks; i++) {
        const weekStart = new Date(
          dateRange.start.getTime() + i * 7 * 24 * 60 * 60 * 1000
        );
        const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000);
        const count = await BugModel.countDocuments({
          createdBy: userId,
          createdAt: { $gte: weekStart, $lte: weekEnd },
        });
        weeklyCounts.push(count);
      }

      return weeklyCounts;
    } catch (error) {
      console.error("Error calculating weekly bug counts:", error);
      return [];
    }
  }

  // ========== Enhanced Helper Methods ==========
  private async analyzeMetricsAdvanced(data: any): Promise<string[]> {
    try {
      const insights: string[] = [];
      const resolutionRate = this.calculateResolutionRate(data);

      if (resolutionRate > 80) {
        insights.push(
          `Excellent resolution rate of ${resolutionRate}% indicates strong performance`
        );
      } else if (resolutionRate < 60) {
        insights.push(
          `Resolution rate of ${resolutionRate}% suggests need for process improvements`
        );
      }

      if (data.criticalIssues > 0) {
        const criticalRatio = (data.criticalIssues / data.totalBugs) * 100;
        insights.push(
          `${criticalRatio.toFixed(
            1
          )}% of bugs are critical - requires immediate attention`
        );
      }

      if (data.weeklyBugs?.length > 1) {
        const trend = this.calculateTrend(data.weeklyBugs);
        insights.push(
          `Bug reports ${trend > 0 ? "increased" : "decreased"} by ${Math.abs(
            trend
          ).toFixed(1)}%`
        );
      }

      return insights;
    } catch (error) {
      console.error("Error analyzing metrics:", error);
      return ["Unable to generate insights due to processing error"];
    }
  }

  private async generateRecommendationsAdvanced(data: any): Promise<string[]> {
    try {
      const recommendations: string[] = [];

      if (
        data.avgResolutionTime &&
        this.parseTimeToHours(data.avgResolutionTime) > 48
      ) {
        recommendations.push(
          "Implement priority triage system to reduce resolution time"
        );
      }

      if (data.criticalIssues > 3) {
        recommendations.push(
          "Implement automated testing to catch critical issues earlier"
        );
      }

      if (
        data.weeklyBugs?.length > 1 &&
        this.calculateTrend(data.weeklyBugs) > 10
      ) {
        recommendations.push(
          "Investigate root causes for increasing bug reports"
        );
      }

      return recommendations;
    } catch (error) {
      console.error("Error generating recommendations:", error);
      return ["Unable to generate recommendations due to processing error"];
    }
  }

  private async generateTrendAnalysisAdvanced(data: any): Promise<string[]> {
    try {
      const trends: string[] = [];

      trends.push(`• Total bugs processed: ${data.totalBugs || 0}`);
      trends.push(`• Resolution rate: ${this.calculateResolutionRate(data)}%`);
      trends.push(`• Critical issues: ${data.criticalIssues || 0}`);

      if (data.weeklyBugs?.length > 1) {
        const trend = this.calculateTrend(data.weeklyBugs);
        trends.push(
          `• Weekly bug trend: ${trend > 0 ? "upward" : "downward"} (${Math.abs(
            trend
          ).toFixed(1)}%)`
        );
      }

      return trends;
    } catch (error) {
      console.error("Error generating trend analysis:", error);
      return ["Unable to generate trend analysis due to processing error"];
    }
  }

  private async generatePredictions(data: any): Promise<string[]> {
    try {
      const predictions: string[] = [];

      if (data.weeklyBugs?.length >= 3) {
        const trend = this.calculateTrend(data.weeklyBugs);
        const lastWeek = data.weeklyBugs[data.weeklyBugs.length - 1];
        const predicted = lastWeek * (1 + trend / 100);
        predictions.push(
          `Expected ${Math.round(predicted)} bugs next week based on trends`
        );
      }

      if (data.avgResolutionTime) {
        const hours = this.parseTimeToHours(data.avgResolutionTime);
        if (hours > 0) {
          const predictedHours = hours * 0.95;
          predictions.push(
            `Resolution time expected to improve to ${predictedHours.toFixed(
              1
            )} hours`
          );
        }
      }

      return predictions;
    } catch (error) {
      console.error("Error generating predictions:", error);
      return ["Unable to generate predictions due to processing error"];
    }
  }

  private generateSmartSearchSuggestions(
    query: string,
    results: any[]
  ): string[] {
    try {
      const suggestions: string[] = [];

      if (query.toLowerCase().includes("critical")) {
        suggestions.push("Show all critical bugs from this month");
      }
      if (query.toLowerCase().includes("frontend")) {
        suggestions.push("Frontend bugs with high priority");
      }

      if (results.length > 0) {
        const commonComponents = Array.from(
          new Set(results.map((r) => r.component).filter(Boolean))
        );

        commonComponents.slice(0, 2).forEach((component) => {
          suggestions.push(`More bugs in ${component} component`);
        });

        const commonTags = this.extractCommonTags(results);
        commonTags.slice(0, 2).forEach((tag) => {
          suggestions.push(`Bugs tagged with ${tag}`);
        });
      }

      return suggestions.slice(0, 4);
    } catch (error) {
      console.error("Error generating search suggestions:", error);
      return this.generateFallbackSuggestions(query);
    }
  }

  private calculateAnalysisConfidence(analysis: any): number {
    try {
      let confidence = 50;

      if (analysis.duplicates?.length > 0) confidence += 20;
      if (analysis.tags?.length > 0) confidence += 15;
      if (analysis.severity !== "medium") confidence += 15;
      if (analysis.relatedBugs?.length > 0) confidence += 10;

      return Math.min(confidence, 100);
    } catch (error) {
      console.error("Error calculating analysis confidence:", error);
      return 50;
    }
  }

  private generateReasoningExplanation(bugData: any, analysis: any): string[] {
    try {
      const reasoning: string[] = [];

      if (analysis.severity === "high") {
        reasoning.push(
          "High severity assigned due to critical keywords in description"
        );
      }
      if (analysis.duplicates?.length > 0) {
        reasoning.push(
          `Found ${analysis.duplicates.length} potential duplicates based on semantic similarity`
        );
      }
      if (analysis.tags?.length > 0) {
        reasoning.push(
          `Auto-tagged based on description: ${analysis.tags.join(", ")}`
        );
      }
      if (analysis.relatedBugs?.length > 0) {
        reasoning.push(
          `Identified ${analysis.relatedBugs.length} related bugs based on component/tags`
        );
      }

      return reasoning;
    } catch (error) {
      console.error("Error generating reasoning explanation:", error);
      return ["Unable to generate reasoning due to processing error"];
    }
  }

  private async generatePerformanceAnalysis(
    teamData: any[]
  ): Promise<string[]> {
    try {
      const analysis: string[] = [];

      if (teamData.length > 0) {
        const topPerformer = teamData.reduce((best, current) =>
          (current.resolvedBugs || 0) > (best.resolvedBugs || 0)
            ? current
            : best
        );
        if (topPerformer) {
          analysis.push(
            `${topPerformer.name} leads with ${topPerformer.resolvedBugs} resolved bugs`
          );
        }

        const avgResolved =
          teamData.reduce(
            (sum, member) => sum + (member.resolvedBugs || 0),
            0
          ) / teamData.length;
        analysis.push(
          `Team average: ${avgResolved.toFixed(1)} bugs resolved per member`
        );
      }

      return analysis;
    } catch (error) {
      console.error("Error generating performance analysis:", error);
      return [
        "Unable to generate performance analysis due to processing error",
      ];
    }
  }

  private async generateWorkloadRecommendations(
    teamData: any[]
  ): Promise<string[]> {
    try {
      const recommendations: string[] = [];

      const overloaded = teamData.filter(
        (member) => (member.assignedBugs || 0) > 10
      );
      const underloaded = teamData.filter(
        (member) => (member.assignedBugs || 0) < 3
      );

      if (overloaded.length > 0 && underloaded.length > 0) {
        recommendations.push(
          `Redistribute workload from ${overloaded
            .map((m) => m.name)
            .join(", ")} to ${underloaded.map((m) => m.name).join(", ")}`
        );
      } else if (overloaded.length > 0) {
        recommendations.push(
          `Reduce workload for: ${overloaded.map((m) => m.name).join(", ")}`
        );
      }

      return recommendations;
    } catch (error) {
      console.error("Error generating workload recommendations:", error);
      return [
        "Unable to generate workload recommendations due to processing error",
      ];
    }
  }

  private async identifySkillGaps(teamData: any[]): Promise<string[]> {
    try {
      const skillGaps: string[] = [];

      const bugTypes = await BugModel.aggregate([
        {
          $match: {
            createdBy: teamData[0]?.userId,
            status: { $ne: "resolved" },
          },
        },
        { $unwind: "$tags" },
        { $group: { _id: "$tags", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 3 },
      ]);

      if (bugTypes.length > 0) {
        bugTypes.forEach((type) => {
          skillGaps.push(
            `Enhance skills in ${type._id} (found in ${type.count} bugs)`
          );
        });
      } else {
        skillGaps.push(
          "Consider training in automated testing and performance optimization"
        );
      }

      return skillGaps;
    } catch (error) {
      console.error("Error identifying skill gaps:", error);
      return ["Unable to identify skill gaps due to processing error"];
    }
  }

  private async analyzeProductivityTrends(teamData: any[]): Promise<string[]> {
    try {
      const trends: string[] = [];

      if (teamData.length > 0) {
        const avgResolutionRate =
          teamData.reduce(
            (sum, member) => sum + (member.resolutionRate || 0),
            0
          ) / teamData.length;
        trends.push(
          `Average resolution rate: ${avgResolutionRate.toFixed(1)}%`
        );

        const totalBugs = teamData.reduce(
          (sum, member) => sum + (member.assignedBugs || 0),
          0
        );
        trends.push(`Total bugs assigned: ${totalBugs}`);
      }

      return trends;
    } catch (error) {
      console.error("Error analyzing productivity trends:", error);
      return ["Unable to analyze productivity trends due to processing error"];
    }
  }

  private async generateTeamPerformanceSection(
    data: any,
    userId: string
  ): Promise<string> {
    try {
      const teamData = await this.getTeamData(userId, "30d");
      const topPerformer = teamData.reduce(
        (best, current) =>
          (current.resolvedBugs || 0) > (best.resolvedBugs || 0)
            ? current
            : best,
        { name: "N/A", resolvedBugs: 0 }
      );

      return `
- Most Active: ${topPerformer.name}
- Resolution Rate: ${this.calculateResolutionRate(data)}%
- Productivity Score: ${this.calculateProductivityScore(data)}/100
      `;
    } catch (error) {
      console.error("Error generating team performance section:", error);
      return "Team performance data unavailable";
    }
  }

  private async getTeamData(userId: string, timeRange: string): Promise<any[]> {
    try {
      const dateRange = this.parseTimeRange(timeRange);
      const teamMembers = await BugModel.aggregate([
        {
          $match: {
            createdBy: userId,
            createdAt: { $gte: dateRange.start, $lte: dateRange.end },
          },
        },
        {
          $group: {
            _id: "$assignee",
            assignedBugs: { $sum: 1 },
            resolvedBugs: {
              $sum: { $cond: [{ $eq: ["$status", "resolved"] }, 1, 0] },
            },
          },
        },
        {
          $project: {
            name: "$_id",
            assignedBugs: 1,
            resolvedBugs: 1,
            resolutionRate: {
              $cond: [
                { $eq: ["$assignedBugs", 0] },
                0,
                {
                  $multiply: [
                    { $divide: ["$resolvedBugs", "$assignedBugs"] },
                    100,
                  ],
                },
              ],
            },
            _id: 0,
            userId,
          },
        },
      ]);

      return teamMembers.length > 0
        ? teamMembers
        : [
            {
              userId,
              name: "Current User",
              assignedBugs: 0,
              resolvedBugs: 0,
              resolutionRate: 0,
            },
          ];
    } catch (error) {
      console.error("Error fetching team data:", error);
      return [
        {
          userId,
          name: "Current User",
          assignedBugs: 0,
          resolvedBugs: 0,
          resolutionRate: 0,
        },
      ];
    }
  }

  // ========== Utility Methods ==========
  private calculateResolutionRate(data: any): number {
    try {
      if (!data.total || data.total === 0) return 0;
      return Math.round(((data.resolved || 0) / data.total) * 100);
    } catch (error) {
      console.error("Error calculating resolution rate:", error);
      return 0;
    }
  }

  private calculateProductivityScore(data: any): number {
    try {
      let score = 50;
      const resolutionRate = this.calculateResolutionRate(data);
      score += (resolutionRate - 60) * 0.5;
      if (data.criticalIssues && data.criticalIssues / data.totalBugs < 0.1)
        score += 20;
      return Math.max(0, Math.min(100, Math.round(score)));
    } catch (error) {
      console.error("Error calculating productivity score:", error);
      return 50;
    }
  }

  private calculateConfidenceLevel(data: any): number {
    try {
      let confidence = 70;
      if (data.totalBugs > 50) confidence += 15;
      if (data.weeklyBugs?.length > 4) confidence += 10;
      if (data.criticalIssues > 0) confidence += 5;
      return Math.min(confidence, 100);
    } catch (error) {
      console.error("Error calculating confidence level:", error);
      return 70;
    }
  }

  private calculateTrend(data: number[]): number {
    try {
      if (data.length < 2) return 0;
      const recent = data.slice(-3).reduce((a, b) => a + b, 0) / 3;
      const older = data.slice(0, 3).reduce((a, b) => a + b, 0) / 3;
      return older === 0 ? 0 : ((recent - older) / older) * 100;
    } catch (error) {
      console.error("Error calculating trend:", error);
      return 0;
    }
  }

  private parseTimeToHours(timeString: string): number {
    try {
      if (!timeString) return 0;
      const match = timeString.match(/(\d+\.?\d*)\s*(hours?|days?)/i);
      if (!match) return 0;
      const value = parseFloat(match[1]);
      const unit = match[2].toLowerCase();
      return unit.includes("day") ? value * 24 : value;
    } catch (error) {
      console.error("Error parsing time to hours:", error);
      return 0;
    }
  }

  private extractCommonTags(results: any[]): string[] {
    try {
      const tagCount = new Map<string, number>();
      results.forEach((result) => {
        if (result.tags) {
          result.tags.forEach((tag: string) => {
            tagCount.set(tag, (tagCount.get(tag) || 0) + 1);
          });
        }
      });
      return Array.from(tagCount.entries())
        .sort((a, b) => b[1] - a[1])
        .map((entry) => entry[0])
        .slice(0, 3);
    } catch (error) {
      console.error("Error extracting common tags:", error);
      return [];
    }
  }

  private generateFallbackSuggestions(query: string): string[] {
    return [
      "Show recent bugs",
      "Critical bugs this week",
      "My assigned bugs",
      "Bugs by priority",
    ];
  }

  private generateFallbackReport(data: any, timeRange: string): string {
    try {
      return `
# Bug Analytics Report (Fallback Mode)
Generated on: ${new Date().toLocaleDateString()}
Time Range: ${timeRange}

## Summary
- Total Bugs: ${data.totalBugs || 0}
- Resolution Rate: ${this.calculateResolutionRate(data)}%
- Average Resolution Time: ${data.avgResolutionTime || "N/A"}

*Note: Advanced AI analysis unavailable. Basic report generated.*
      `;
    } catch (error) {
      console.error("Error generating fallback report:", error);
      return "Unable to generate report due to processing error.";
    }
  }

  private generateFallbackAnalysis(bugData: any): AIBugAnalysis {
    try {
      return {
        duplicates: [],
        severity: this.predictSeverity(bugData),
        priority: this.predictPriority(bugData),
        assignee: this.suggestAssignee(bugData),
        tags: this.generateTags(bugData),
        estimatedTime: this.estimateResolutionTime(bugData),
        suggestedSolution: "Review code and logs for manual analysis.",
        relatedBugs: [],
        confidence: 60,
        reasoning: [
          "Analysis performed using heuristic rules (AI service unavailable)",
        ],
      };
    } catch (error) {
      console.error("Error generating fallback analysis:", error);
      return {
        duplicates: [],
        severity: "medium",
        priority: "Medium",
        assignee: "Unassigned",
        tags: [],
        estimatedTime: "N/A",
        suggestedSolution:
          "Unable to generate solution due to processing error.",
        relatedBugs: [],
        confidence: 30,
        reasoning: ["Fallback analysis failed due to processing error"],
      };
    }
  }

  private generateFallbackTeamInsights(teamData: any[]): AITeamInsights {
    try {
      return {
        performanceAnalysis: ["Team performance analysis unavailable"],
        workloadRecommendations: ["Workload analysis unavailable"],
        skillGaps: ["Skill gap analysis unavailable"],
        productivityTrends: ["Productivity trend analysis unavailable"],
        confidence: 30,
        dataPoints: teamData.length,
      };
    } catch (error) {
      console.error("Error generating fallback team insights:", error);
      return {
        performanceAnalysis: ["Error in team insights generation"],
        workloadRecommendations: [],
        skillGaps: [],
        productivityTrends: [],
        confidence: 0,
        dataPoints: 0,
      };
    }
  }

  private predictSeverity(bugData: any): string {
    try {
      const text = bugData.description?.toLowerCase() || "";
      const keywords = {
        high: [
          "crash",
          "error",
          "failure",
          "critical",
          "urgent",
          "broken",
          "not working",
        ],
        medium: ["slow", "ui", "interface", "performance", "delay"],
        low: ["typo", "cosmetic", "minor", "suggestion", "enhancement"],
      };

      for (const [severity, words] of Object.entries(keywords)) {
        if (words.some((word) => text.includes(word))) {
          return severity;
        }
      }
      return "medium";
    } catch (error) {
      console.error("Error predicting severity:", error);
      return "medium";
    }
  }

  private predictPriority(bugData: any): string {
    try {
      const severity = this.predictSeverity(bugData);
      const affectedUsers = bugData.affectedUsers || 0;

      if (severity === "high" || affectedUsers > 1000) return "Critical";
      if (severity === "medium" || affectedUsers > 100) return "High";
      return "Medium";
    } catch (error) {
      console.error("Error predicting priority:", error);
      return "Medium";
    }
  }

  private suggestAssignee(bugData: any): string {
    try {
      const component = bugData.component?.toLowerCase() || "";
      const description = bugData.description?.toLowerCase() || "";

      if (
        component.includes("frontend") ||
        description.includes("ui") ||
        description.includes("react")
      ) {
        return "Frontend Team";
      }
      if (
        component.includes("backend") ||
        description.includes("api") ||
        description.includes("database")
      ) {
        return "Backend Team";
      }
      if (
        component.includes("mobile") ||
        description.includes("ios") ||
        description.includes("android")
      ) {
        return "Mobile Team";
      }
      return "Auto-assign based on workload";
    } catch (error) {
      console.error("Error suggesting assignee:", error);
      return "Unassigned";
    }
  }

  private generateTags(bugData: any): string[] {
    try {
      const tags: string[] = [];
      const text = (bugData.description || "").toLowerCase();
      const component = (bugData.component || "").toLowerCase();

      const tagPatterns = {
        frontend: ["frontend", "ui", "interface", "react", "css", "component"],
        backend: ["backend", "api", "server", "database", "endpoint"],
        mobile: ["mobile", "ios", "android", "app"],
        performance: ["slow", "performance", "lag", "timeout"],
        authentication: ["login", "auth", "password", "signin"],
        security: ["security", "vulnerability", "hack", "breach"],
        database: ["database", "db", "sql", "query"],
        integration: ["integration", "third-party", "api", "webhook"],
      };

      Object.entries(tagPatterns).forEach(([tag, patterns]) => {
        if (
          patterns.some(
            (pattern) => text.includes(pattern) || component.includes(pattern)
          )
        ) {
          tags.push(tag);
        }
      });

      return tags;
    } catch (error) {
      console.error("Error generating tags:", error);
      return [];
    }
  }

  private estimateResolutionTime(bugData: any): string {
    try {
      const severity = this.predictSeverity(bugData);
      const complexity = this.assessComplexity(bugData);

      if (severity === "high" && complexity === "high") return "1-2 days";
      if (severity === "high") return "4-8 hours";
      if (severity === "medium" && complexity === "high") return "2-3 days";
      if (severity === "medium") return "1-2 days";
      return "3-5 days";
    } catch (error) {
      console.error("Error estimating resolution time:", error);
      return "N/A";
    }
  }

  private assessComplexity(bugData: any): string {
    try {
      const description = bugData.description?.toLowerCase() || "";
      const complexKeywords = [
        "integration",
        "database",
        "performance",
        "security",
        "algorithm",
      ];
      return complexKeywords.some((keyword) => description.includes(keyword))
        ? "high"
        : "medium";
    } catch (error) {
      console.error("Error assessing complexity:", error);
      return "medium";
    }
  }

  // ========== Public Utility Methods ==========
  public clearCache(): void {
    try {
      this.cache.clear();
      console.log("AI Service cache cleared");
    } catch (error) {
      console.error("Error clearing cache:", error);
    }
  }

  public getCacheStats(): {
    size: number;
    memoryUsage: number;
    maxMemory: number;
    keys: string[];
  } {
    return this.cache.getStats();
  }
}

export const aiService = AIService.getInstance();
