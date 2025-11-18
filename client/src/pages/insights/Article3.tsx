import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";

export default function Article3() {
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
            Choosing Your Tech Stack: Why Firebase, Gemini, and Node.js Power the Next Generation of Streaming
          </h1>
          <p className="text-muted-foreground mb-8"><em>Published: November 18, 2025</em></p>

          <p className="text-foreground mb-6">
            Building a modern, highly interactive AVOD platform like Krittics requires more than just video delivery; it demands <strong>scalability, personalized engagement, and financial efficiency.</strong> We approached our technology stack by prioritizing serverless architecture and cutting-edge AI to ensure we could deliver on our mission without the high overhead of traditional streaming providers.
          </p>
          <p className="text-foreground mb-6">
            Here is a breakdown of the core components that power the Krittics experience:
          </p>

          <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">I. Backend and Scalability: The Firebase Ecosystem</h2>
          <p className="text-foreground mb-4">
            For the backend, we chose <strong>Firebase (Google's serverless platform)</strong> coupled with <strong>Cloud Functions (Node.js)</strong> to handle everything from user accounts to Krossfire scores. This choice is critical for operational stability and cost efficiency.
          </p>
          <ul className="list-disc list-inside space-y-2 text-foreground mb-4">
            <li><strong>Serverless Efficiency (Cloud Functions):</strong> Krittics utilizes <strong>Firebase Cloud Functions</strong> written in <strong>Node.js</strong>. This is a serverless solution, meaning we only pay for the compute time consumed when a function is executed (e.g., when a user submits a Krossfire score or logs in). This event-driven model provides instant scaling to handle massive user spikes—a necessity for any high-traffic video platform—while keeping infrastructure costs optimized.</li>
            <li><strong>Real-Time Data (Firestore/Realtime DB):</strong> We use a combination of <strong>Firebase Firestore</strong> and the <strong>Realtime Database</strong> to manage user data, competitive rankings, and application states. These NoSQL databases are designed for rapid, real-time synchronization, which is essential for the instantaneous scoring and leaderboards required by Krossfire.</li>
            <li><strong>Seamless Authentication:</strong> <strong>Firebase Authentication</strong> provides a secure, integrated solution for user login and management, saving immense development time and ensuring a high standard of security for all user accounts.</li>
          </ul>

          <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">II. The Intelligence Layer: Gemini API</h2>
          <p className="text-foreground mb-4">
            The <strong>Gemini API</strong> integrates advanced machine learning directly into our backend logic, enabling the kind of intelligent, data-driven features that define a next-generation platform.
          </p>
          <ul className="list-disc list-inside space-y-2 text-foreground mb-4">
            <li><strong>Intelligent Trivia Generation:</strong> The multimodal capabilities of the Gemini models are leveraged to <strong>analyze the AVOD content</strong> (including video frames and metadata) and automatically generate the challenging and contextually relevant trivia questions needed for Krossfire. This capability ensures a constant supply of fresh, high-quality trivia without the high manual labor costs.</li>
            <li><strong>Metadata Extraction and Content Tagging:</strong> Gemini models can process video files to <strong>extract detailed insights</strong>, which include transcribing audio and describing visual elements. This automatically enriches our content catalog, providing better search functionality and helping users discover new movies.</li>
            <li><strong>Personalization Engine (Future):</strong> The API's reasoning capabilities will ultimately allow Krittics to process user engagement data (e.g., Krossfire scores, genre preferences) to deliver <strong>personalized content recommendations</strong>, making the platform highly sticky and maximizing user retention.</li>
          </ul>

          <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">III. The Frontend Experience: Customization with Video.js</h2>
          <p className="text-foreground mb-4">
            On the frontend, the viewing experience is driven by <strong>Video.js</strong>, the open-source HTML5 video player framework.
          </p>
          <ul className="list-disc list-inside space-y-2 text-foreground mb-4">
            <li><strong>Custom Plugin Architecture:</strong> Video.js provides a robust, developer-friendly <strong>plugin system</strong> that was essential for Krittics. This architecture allows us to build and integrate highly customized features, most notably our proprietary <strong>Trivia Trigger Plugin</strong> (which manages the timing and delivery of the Krossfire prompt at the end of a movie).</li>
            <li><strong>Cross-Browser Consistency:</strong> Using Video.js ensures a <strong>uniform, high-quality playback experience</strong> across all devices (desktop, mobile, tablet), eliminating the cross-browser inconsistencies often found when relying solely on the native HTML5 <code>&lt;video&gt;</code> tag.</li>
            <li><strong>Ad Integration Readiness:</strong> Video.js is fully compatible with advanced ad technology standards like the Google Interactive Media Ads (IMA) SDK, which is necessary for seamless integration with platforms like Google Ad Manager and AdSense.</li>
          </ul>

          <p className="text-foreground mt-6">
            By combining the <strong>serverless scalability of Firebase</strong>, the <strong>intelligence of the Gemini API</strong>, and the <strong>customization of Video.js</strong>, Krittics has built a powerful, cost-effective, and future-proof platform ready to handle massive growth.
          </p>
        </article>
      </div>
    </div>
  );
}
