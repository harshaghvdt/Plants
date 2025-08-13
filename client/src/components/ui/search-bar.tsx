import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/useDebounce";
import type { TweetWithAuthor } from "@shared/schema";
import { Link } from "wouter";

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 300);

  const { data: searchResults = [] } = useQuery<TweetWithAuthor[]>({
    queryKey: ["/api/tweets/search", { q: debouncedQuery }],
    enabled: debouncedQuery.length > 0,
  });

  return (
    <div className="mb-6 relative">
      <div className="relative">
        <Input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search Twitter"
          className="w-full bg-twitter-light-gray rounded-full py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-twitter-blue focus:bg-white border-0"
        />
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
      </div>
      
      {/* Search Results Dropdown */}
      {debouncedQuery && searchResults.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-2xl shadow-lg z-50 max-h-96 overflow-y-auto">
          {searchResults.slice(0, 5).map((tweet) => (
            <Link key={tweet.id} href={`/tweet/${tweet.id}`}>
              <div className="p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0">
                <div className="flex items-center space-x-3">
                  <img
                    src={tweet.author.profileImageUrl || `https://i.pravatar.cc/32?u=${tweet.author.id}`}
                    alt={tweet.author.username}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 text-sm">
                      <span className="font-medium">{tweet.author.firstName} {tweet.author.lastName}</span>
                      <span className="text-gray-500">@{tweet.author.username}</span>
                    </div>
                    <p className="text-sm text-gray-700 truncate mt-1">
                      {tweet.content}
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
