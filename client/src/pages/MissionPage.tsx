import { Card } from "@/components/ui/card";
import { Target } from "lucide-react";

export default function MissionPage() {
  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Hero Section */}
      <div 
        className="relative px-6 py-16 text-center"
        style={{
          background: 'linear-gradient(135deg, rgba(27, 169, 175, 0.3) 0%, rgba(27, 169, 175, 0.1) 50%, rgba(0, 0, 0, 0.8) 100%)'
        }}
      >
        <Target className="h-16 w-16 mx-auto mb-4" style={{ color: '#1ba9af' }} />
        <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
          Our Mission and Vision
        </h1>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
          Pioneering the future of AVOD where viewers are rewarded for their engagement
        </p>
      </div>

      {/* Mission Content */}
      <div className="max-w-4xl mx-auto px-6 py-12 space-y-8">
        {/* What is Krittics */}
        <Card className="p-8">
          <p className="text-foreground leading-relaxed mb-6">
            Krittics is an Ad-Supported Video On Demand (AVOD) platform built on the belief that viewers deserve a share in the success they help create. We are pioneering a new model where user engagement directly fuels both the content ecosystem and your rewards.
          </p>
          <p className="text-foreground leading-relaxed">
            Our mission is simple: To provide high-quality movie and video content while creating a mutually beneficial environment where viewers are rewarded for their time and attention. We aim to grow our dedicated community, targeting 20,000 Monthly Active Users (MAUs) in our first phase to achieve operational stability. The ultimate goal is 200,000 MAUs, which triggers the launch of our unique rewards distribution program for our dedicated users.
          </p>
        </Card>

        {/* The Krittics Difference */}
        <Card className="p-8">
          <h2 className="font-display text-2xl font-bold text-foreground mb-6">
            The Krittics Difference: How it Works
          </h2>
          <p className="text-foreground leading-relaxed mb-6">
            Krittics is pioneering the future of AVOD. We believe the value created by your attention and engagement should be shared with you.
          </p>
          <p className="text-foreground leading-relaxed mb-6">
            Our unique system is designed to reward you directly for your time:
          </p>
          
          <div className="space-y-4 pl-4 border-l-4" style={{ borderColor: '#1ba9af' }}>
            <div>
              <h3 className="font-semibold text-foreground mb-2">Watch and Engage</h3>
              <p className="text-muted-foreground">
                By watching our growing library of content and participating in unique interactive features like End-of-Movie Trivia and Krossfire, you are constantly generating and accumulating a share of our ad revenue.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-foreground mb-2">The 200K MAU Distribution Trigger</h3>
              <p className="text-muted-foreground">
                As our platform achieves the milestone of 200,000 Monthly Active Users (MAUs), we will initiate the process of securing a trusted financial distribution partner to formally facilitate the regulated payout of a percentage of ad revenue back to our users.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-foreground mb-2">A Shared Future</h3>
              <p className="text-muted-foreground">
                Reward accumulation begins now through engagement, but distribution is contingent upon reaching the 200,000 MAU threshold and establishing this formal, regulated partnership.
              </p>
            </div>
          </div>
          
          <p className="text-foreground font-semibold mt-6 text-center text-lg">
            You watch. You engage. You build the incentive.
          </p>
        </Card>

        {/* Technology & Trust */}
        <Card className="p-8">
          <h2 className="font-display text-2xl font-bold text-foreground mb-6">
            Powered by Technology & Our Commitment to Trust
          </h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-foreground mb-2">Powered by Technology</h3>
              <p className="text-muted-foreground">
                Krittics is built on modern, secure technology, utilizing Firebase for reliable authentication and backend operations, and the Gemini API to enhance the user experience.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-foreground mb-2">Our Commitment to Trust</h3>
              <p className="text-muted-foreground">
                As a platform funded by advertising, we are committed to transparency and compliance. We work with trusted partners like Google Ad Manager and AdMob to ensure a high standard of ad quality. We value your privacy and encourage you to review our Privacy Policy and Terms of Service to understand how we operate and how your data is handled.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
