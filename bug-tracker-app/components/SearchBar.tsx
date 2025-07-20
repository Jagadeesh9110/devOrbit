"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation"; // Add useRouter for redirect
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Search, Sparkles, Loader2 } from "lucide-react";
import { aiService, AISearchResult } from "@/lib/services/AiService";
import { TokenPayload } from "@/lib/auth"; // Import TokenPayload type

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
  const router = useRouter(); // Initialize router
  const [isAISearching, setIsAISearching] = useState<boolean>(false);
  const [aiSuggestions, setAISuggestions] = useState<string[]>([]);
  const [searchConfidence, setSearchConfidence] = useState<number | null>(null);
  const [payload, setPayload] = useState<TokenPayload | null>(null); // State for payload
  const [authError, setAuthError] = useState<string | null>(null); // State for auth errors

  // Fetch payload on mount
  useEffect(() => {
    const fetchPayload = async () => {
      try {
        const response = await fetch("/api/auth/payload", {
          method: "GET",
          credentials: "include",
        });
        const data = await response.json();
        if (data.error) {
          throw new Error(data.error);
        }
        setPayload(data.payload);
      } catch (error: any) {
        console.error("Error fetching payload:", error.message);
        setAuthError("Authentication failed. Please log in again.");
        router.push("/auth/login");
      }
    };

    fetchPayload();
  }, [router]);

  const handleAISearch = async (): Promise<void> => {
    if (!value.trim() || !payload?.userId) {
      console.error("Missing query or userId");
      if (!payload?.userId) {
        setAuthError("Authentication required for AI search");
        router.push("/auth/login");
      }
      return;
    }

    setIsAISearching(true);
    console.log("Performing AI-powered search...");

    try {
      const searchResult: AISearchResult = await aiService.searchWithAI(
        value,
        payload.userId,
        { limit: 10, threshold: 0.3 }
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

  if (authError) {
    return <div className="text-red-500 text-center">{authError}</div>;
  }

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
            disabled={isAISearching || !value.trim() || !payload?.userId}
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

        {searchConfidence !== null && (
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
                className="block w-full text-left text-sm text-slate-7
System: 00 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
              >
                "{suggestion}"
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-2 text-xs text-slate-600 dark:text-slate-400">
        <span>Try: "critical bugs last week"</span>
        <span>•</span>
        <span>"assigned to John"</span>
        <span>•</span>
        <span>"frontend issues"</span>
      </div>
    </div>
  );
};

export default SearchBar;
