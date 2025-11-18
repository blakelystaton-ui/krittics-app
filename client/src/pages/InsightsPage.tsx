import { Link } from "wouter";
import { BookOpen } from "lucide-react";
import { Card } from "@/components/ui/card";

export default function InsightsPage() {
  const articles = [
    {
      id: 1,
      title: "The Future of Viewer Rewards: Why Interactive AVOD is Dominating the Market",
      date: "November 18, 2025",
    },
    {
      id: 2,
      title: "The Engagement Economy: How Real-Time Trivia (Krossfire) Revolutionizes Content Retention",
      date: "November 18, 2025",
    },
    {
      id: 3,
      title: "Choosing Your Tech Stack: Why Firebase, Gemini, and Node.js Power the Next Generation of Streaming",
      date: "November 18, 2025",
    },
    {
      id: 4,
      title: "Licensing 101 for AVOD Startups: Navigating Content Rights for Sustainable Growth",
      date: "November 18, 2025",
    },
    {
      id: 5,
      title: "Monetization Metrics That Matter: Tracking Engagement to Drive Profitability",
      date: "November 18, 2025",
    },
    {
      id: 6,
      title: "Securing and Scaling the Backend: Best Practices for Firebase in a High-Traffic Application",
      date: "November 18, 2025",
    },
    {
      id: 7,
      title: "The Critical Role of Beta Testing: Launching a New AVOD Service with Firebase & Gemini",
      date: "November 18, 2025",
    },
    {
      id: 8,
      title: "Why Mobile Matters: Optimizing AVOD for the On-the-Go Viewer",
      date: "November 18, 2025",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div 
        className="py-16 px-4"
        style={{
          background: 'linear-gradient(135deg, rgba(27, 169, 175, 0.15) 0%, rgba(27, 169, 175, 0.05) 50%, rgba(0, 0, 0, 0) 100%)'
        }}
      >
        <div className="container mx-auto max-w-4xl">
          <div className="flex items-center gap-3 mb-4">
            <BookOpen className="h-10 w-10 text-primary" />
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground">
              Krittics Insights & Analysis
            </h1>
          </div>
          <p className="text-lg text-muted-foreground">
            Welcome to Krittics Insights, where we explore the strategies, technology, and economic trends driving the next generation of Ad-Supported Video On Demand (AVOD) and interactive content.
          </p>
        </div>
      </div>

      {/* Articles List */}
      <div className="container mx-auto max-w-4xl px-4 py-12">
        <h2 className="font-display text-2xl font-bold text-foreground mb-6">Recent Articles</h2>
        <div className="space-y-4">
          {articles.map((article) => (
            <Link key={article.id} href={`/insights/article-${article.id}`}>
              <Card className="p-6 hover-elevate cursor-pointer transition-all" data-testid={`article-link-${article.id}`}>
                <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                  {article.title}
                </h3>
                <p className="text-sm text-muted-foreground">{article.date}</p>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
