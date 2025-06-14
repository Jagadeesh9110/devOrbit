"use client";

import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Search, Sparkles, Loader2 } from "lucide-react";
import { aiService, AISearchResult } from "@/lib/services/AiService";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onAISearch?: (results: AISearchResult) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  placeholder = "Search with AI...",
  onAISearch,
}) => {
  const [isAISearching, setIsAISearching] = useState<boolean>(false);
  const [aiSuggestions, setAISuggestions] = useState<string[]>([]);
  const [searchConfidence, setSearchConfidence] = useState<number | null>(null);

  const handleAISearch = async (): Promise<void> => {
    if (!value.trim()) return;

    setIsAISearching(true);
    console.log("Performing AI-powered search...");

    try {
      // Mock data for AI search
      const mockData = [
        {
          id: 1,
          title: "Login bug",
          priority: "critical",
          assignee: "John Doe",
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        },
        {
          id: 2,
          title: "UI issue",
          priority: "high",
          assignee: "Jane Smith",
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        },
        {
          id: 3,
          title: "Performance problem",
          priority: "medium",
          assignee: "Alice Johnson",
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        },
      ];

      const searchResult: AISearchResult = await aiService.searchWithAI(
        value,
        mockData
      );
      setSearchConfidence(searchResult.confidence);
      setAISuggestions(searchResult.suggestions.slice(0, 3));

      if (onAISearch) {
        onAISearch(searchResult);
      }

      console.log(
        `AI search completed with ${searchResult.confidence * 100}% confidence`
      );
    } catch (error) {
      console.error("AI search error:", error);
    } finally {
      setIsAISearching(false);
    }
  };

  const handleSuggestionClick = (suggestion: string): void => {
    onChange(suggestion);
    setAISuggestions([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === "Enter") {
      handleAISearch();
    }
  };

  useEffect(() => {
    if (!value) {
      setSearchConfidence(null);
      setAISuggestions([]);
    }
  }, [value]);

  return (
    <div className="space-y-3">
      <div className="relative">
        <div className="relative flex items-center">
          <Search className="absolute left-3 w-4 h-4 text-slate-400" />
          <Input
            type="text"
            placeholder={placeholder}
            value={value}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              onChange(e.target.value)
            }
            className="pl-10 pr-20"
            onKeyDown={handleKeyDown}
          />
          <Button
            onClick={handleAISearch}
            disabled={isAISearching || !value.trim()}
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

        {searchConfidence && (
          <div className="absolute top-full left-0 mt-1 z-10">
            <Badge variant="outline" className="text-xs">
              AI Confidence: {Math.round(searchConfidence * 100)}%
            </Badge>
          </div>
        )}
      </div>

      {aiSuggestions.length > 0 && (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 shadow-lg">
          <p className="text-xs text-slate-600 dark:text-slate-400 mb-2 flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            AI Suggestions:
          </p>
          <div className="space-y-2">
            {aiSuggestions.map((suggestion: string, index: number) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className="block w-full text-left text-sm text-slate-700 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
              >
                &quot;{suggestion}&quot;
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-2 text-xs text-slate-600 dark:text-slate-400">
        <span>Try: &quot;critical bugs last week&quot;</span>
        <span>•</span>
        <span>&quot;assigned to John&quot;</span>
        <span>•</span>
        <span>&quot;frontend issues&quot;</span>
      </div>
    </div>
  );
};

export default SearchBar;
