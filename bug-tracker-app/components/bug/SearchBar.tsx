"use client";

import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Search, Sparkles, Loader2 } from "lucide-react";
import { aiService, AISearchResult } from "@/lib/services/AiService";

interface SearchBarProps {
  query: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onAISearch?: (results: AISearchResult) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  query,
  onChange,
  placeholder = "Search with AI...",
  onAISearch,
}) => {
  const [isAISearching, setIsAISearching] = useState(false);
  const [aiSuggestions, setAISuggestions] = useState<string[]>([]);
  const [searchConfidence, setSearchConfidence] = useState<number | null>(null);

  const handleAISearch = async () => {
    if (!query.trim()) return;

    setIsAISearching(true);

    try {
      // Mock data for AI search
      const mockData = [
        {
          id: 1,
          title: "Login bug",
          priority: "critical",
          assignee: "John Doe",
          createdAt: new Date(),
        },
        {
          id: 2,
          title: "UI issue",
          priority: "high",
          assignee: "Jane Smith",
          createdAt: new Date(),
        },
        {
          id: 3,
          title: "Performance problem",
          priority: "medium",
          assignee: "Alice Johnson",
          createdAt: new Date(),
        },
      ];

      const searchResult = await aiService.searchWithAI(query, mockData);
      setSearchConfidence(searchResult.confidence);
      setAISuggestions(searchResult.suggestions.slice(0, 3));

      if (onAISearch) onAISearch(searchResult);
    } catch (error) {
      console.error("AI search failed:", error);
    } finally {
      setIsAISearching(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    onChange(suggestion);
    setAISuggestions([]);
  };

  useEffect(() => {
    if (!query) {
      setSearchConfidence(null);
      setAISuggestions([]);
    }
  }, [query]);

  return (
    <div className="space-y-3">
      {/* Input & AI Button */}
      <div className="relative">
        <div className="flex items-center relative">
          <Search className="absolute left-3 w-4 h-4 text-slate-400" />
          <Input
            type="text"
            placeholder={placeholder}
            value={query}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAISearch()}
            className="pl-10 pr-20"
          />
          <Button
            onClick={handleAISearch}
            disabled={isAISearching || !query.trim()}
            size="sm"
            className="absolute right-1 h-8 bg-accent-500 hover:bg-accent-600 text-white"
          >
            {isAISearching ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>

      {/* AI Confidence & Suggestions */}
      {searchConfidence !== null && (
        <div className="flex items-center gap-2">
          <Badge variant="outline">
            AI Confidence: {(searchConfidence * 100).toFixed(1)}%
          </Badge>
        </div>
      )}

      {aiSuggestions.length > 0 && (
        <div className="flex flex-col gap-2">
          {aiSuggestions.map((suggestion, index) => (
            <Button
              key={index}
              variant="ghost"
              className="justify-start text-left text-sm px-2"
              onClick={() => handleSuggestionClick(suggestion)}
            >
              🔍 {suggestion}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
};
