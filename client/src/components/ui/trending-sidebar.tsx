import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const trendingTopics = [
  {
    category: "Technology",
    hashtag: "#WebDevelopment",
    tweets: "42.1K",
  },
  {
    category: "Business",
    hashtag: "#RemoteWork",
    tweets: "28.7K",
  },
  {
    category: "Trending",
    hashtag: "Artificial Intelligence",
    tweets: "156K",
  },
  {
    category: "Design",
    hashtag: "#UXDesign",
    tweets: "19.3K",
  },
  {
    category: "Trending",
    hashtag: "#StartupLife",
    tweets: "87.5K",
  },
];

export default function TrendingSidebar() {
  return (
    <Card className="mb-6 bg-twitter-light-gray border-0">
      <CardHeader>
        <CardTitle className="text-xl font-bold">Trending for you</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="space-y-0">
          {trendingTopics.map((topic, index) => (
            <div
              key={index}
              className="hover:bg-gray-200 p-4 cursor-pointer transition-colors"
            >
              <p className="text-sm text-gray-500">Trending in {topic.category}</p>
              <p className="font-bold text-gray-900">{topic.hashtag}</p>
              <p className="text-sm text-gray-500">{topic.tweets} Tweets</p>
            </div>
          ))}
          <div className="p-4">
            <button className="text-twitter-blue hover:underline text-sm">
              Show more
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
