import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/useDebounce";
import type { PostWithAuthor } from "@shared/schema";
import { Link } from "wouter";

interface SearchBarProps {
  placeholder?: string;
  className?: string;
}

export default function SearchBar({ placeholder = "Search posts...", className }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 300);

  const { data: searchResults = [] } = useQuery<PostWithAuthor[]>({
    queryKey: ["/api/posts/search", { q: debouncedQuery }],
    enabled: debouncedQuery.length > 0,
  });

  return (
    <div className="mb-6 relative">
      <div className="relative">
        <Input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className={`w-full bg-gray-100 rounded-full py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white border-0 ${className || ''}`}
        />
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
      </div>
      
      {/* Search Results Dropdown */}
      {debouncedQuery && searchResults.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-2xl shadow-lg z-50 max-h-96 overflow-y-auto">
          {searchResults.slice(0, 5).map((post) => (
            <Link key={post.id} href={`/tweet/${post.id}`}>
              <div className="p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0">
                <div className="flex items-center space-x-3">
                  <img
                    src={post.author?.profileImageUrl || `https://i.pravatar.cc/32?u=${post.author?.id}`}
                    alt={post.author?.username || 'User'}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 text-sm">
                      <span className="font-medium">{post.author?.firstName} {post.author?.lastName}</span>
                      <span className="text-gray-500">@{post.author?.username}</span>
                    </div>
                    <p className="text-sm text-gray-700 truncate mt-1">
                      {post.content}
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
