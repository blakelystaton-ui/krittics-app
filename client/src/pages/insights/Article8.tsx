import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";

export default function Article8() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-4xl px-4 py-12">
        <Link href="/insights">
          <button className="flex items-center gap-2 text-primary hover:underline mb-6" data-testid="link-back-insights">
            <ArrowLeft className="h-4 w-4" />
            Back to Krittics Insights
          </button>
        </Link>

        <article className="prose prose-invert max-w-none">
          <h1 className="font-display text-4xl font-bold text-foreground mb-2">
            Why Mobile Matters: Optimizing AVOD for the On-the-Go Viewer
          </h1>
          <p className="text-muted-foreground mb-8"><em>Published: November 18, 2025</em></p>

          <p className="text-foreground mb-6">
            The screen that matters most to any modern streaming service is the one that fits in the user's pocket. Mobile devices now account for roughly 66.88% of all global digital traffic, with platforms like YouTube reporting that over 70% of their video consumption occurs on mobile devices. This mobile-first reality dictates that any successful AVOD platform must be designed and engineered around the mobile user experience.
          </p>
          <p className="text-foreground mb-6">
            For Krittics, capturing the mobile audience is essential. The convenience of "on-the-go" viewing not only increases total consumption time but also drives the high frequency of visits necessary to sustain the <strong>Krossfire</strong> competitive loop.
          </p>

          <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">I. Technical Foundation: Adaptive Streaming and Efficiency</h2>
          <p className="text-foreground mb-4">
            Mobile networks are inherently less stable than fixed broadband, requiring highly flexible video delivery systems. Our engineering choices directly address this challenge:
          </p>
          <ul className="list-disc list-inside space-y-2 text-foreground mb-4">
            <li><strong>Adaptive Bitrate Streaming (ABR):</strong> We utilize ABR technology—breaking video files into small chunks and encoding them at multiple bitrates (e.g., 360p, 720p, 1080p). This technique, supported by our <strong>Video.js</strong> player, allows the video stream to automatically adjust quality based on the user's available bandwidth. This prevents buffering and ensures smooth playback, whether the user is on a fast Wi-Fi network or a slower cellular connection.</li>
            <li><strong>Optimal Codecs and Compression:</strong> We rely on efficient video codecs like <strong>H.264 or H.265</strong> (also known as HEVC) and strategic compression techniques to reduce file size without sacrificing noticeable quality. This ensures videos load faster and consume less of the user's mobile data plan, reducing a major source of friction for mobile viewers.</li>
            <li><strong>Frontend Responsiveness:</strong> The <strong>Video.js</strong> framework is utilized in its <strong>fluid and responsive</strong> mode, ensuring the player automatically scales to fit any screen size (from a small phone to a large tablet) while maintaining the correct aspect ratio (16:9 for traditional content).</li>
          </ul>

          <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">II. Design and Engagement for the Mobile User</h2>
          <p className="text-foreground mb-4">
            Mobile users have shorter attention spans, use touch controls, and often consume content in public environments. Krittics' design is optimized for these behaviors:
          </p>
          <ul className="list-disc list-inside space-y-2 text-foreground mb-4">
            <li><strong>Touch-First UI:</strong> All video controls, navigation elements (<code>Browse</code>, <code>Krossfire</code>, <code>Queue</code>), and the <strong>Krossfire</strong> trivia buttons are large, clear, and designed for touch interaction. This eliminates the frustration of fiddly menus common in poorly optimized desktop-first interfaces.</li>
            <li><strong>Captions and Accessibility:</strong> Recognizing that <strong>92% of videos on social media are watched without sound</strong>, we prioritize clear, high-quality subtitles and captions. This ensures that a user waiting in a quiet public space (like a cafe or lobby) can still fully engage with the content and participate in the Krossfire loop.</li>
            <li><strong>Vertical-Friendly Engagement:</strong> While our primary movies are 16:9, the <strong>Krossfire Quick Match</strong> interface is designed to be fully functional and engaging in a <strong>vertical-screen orientation</strong>. This utilizes the full display area of a mobile device for competitive interaction, driving higher participation rates.</li>
          </ul>

          <p className="text-foreground mt-6">
            By designing for the mobile screen first, Krittics guarantees a reliable, high-quality viewing experience that maximizes user satisfaction and encourages the frequent, sustained usage necessary for our high-LTV, ad-supported model.
          </p>
        </article>
      </div>
    </div>
  );
}
