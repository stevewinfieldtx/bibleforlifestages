"use client"

import { useRouter } from "next/navigation"

export default function PrivacyPage() {
  const router = useRouter()

  return (
    <div className="relative flex min-h-screen w-full flex-col max-w-md mx-auto bg-background shadow-2xl">
      {/* Header */}
      <div className="sticky top-0 z-50 flex items-center bg-background/95 backdrop-blur-md p-4 justify-between border-b border-border">
        <button
          onClick={() => router.back()}
          className="flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-muted transition-colors"
        >
          <span className="material-symbols-outlined">arrow_back_ios_new</span>
        </button>
        <h2 className="text-base font-bold">Privacy Policy</h2>
        <div className="w-10"></div>
      </div>

      <main className="flex-1 px-6 py-8 prose prose-sm max-w-none">
        <p className="text-muted-foreground text-sm mb-6">Last updated: January 2025</p>

        <h2 className="text-lg font-bold mt-6 mb-3">Overview</h2>
        <p>
          Bible for Life Stages ("we", "our", or "the app") respects your privacy. This policy explains 
          what information we collect and how we use it.
        </p>

        <h2 className="text-lg font-bold mt-6 mb-3">Information We Collect</h2>
        
        <h3 className="text-base font-semibold mt-4 mb-2">Profile Information</h3>
        <p>
          When you set up your profile, you may provide:
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Your name (optional)</li>
          <li>Age range</li>
          <li>Life situation/season</li>
          <li>Content style preference</li>
        </ul>
        <p>
          This information is stored locally on your device and used to personalize your devotional content. 
          It is not transmitted to our servers or shared with third parties.
        </p>

        <h3 className="text-base font-semibold mt-4 mb-2">Usage Data</h3>
        <p>
          We may collect anonymous usage statistics to improve the app, such as which features are most 
          popular. This data cannot be used to identify you personally.
        </p>

        <h3 className="text-base font-semibold mt-4 mb-2">AI-Generated Content</h3>
        <p>
          When you request devotional content, your profile preferences (age range, life situation) are 
          sent to our AI service to generate personalized content. We do not store your conversations 
          or generated content on our servers beyond what's needed to deliver the service.
        </p>

        <h2 className="text-lg font-bold mt-6 mb-3">How We Use Your Information</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>To personalize devotional content for your life stage</li>
          <li>To provide AI-powered features like chat and Deep Dive reflections</li>
          <li>To improve app performance and features</li>
          <li>To process subscriptions (handled by Apple/Google)</li>
        </ul>

        <h2 className="text-lg font-bold mt-6 mb-3">Data Storage</h2>
        <p>
          Your profile and preferences are stored locally on your device using browser storage. 
          Cached devotional content is also stored locally to reduce loading times and API costs.
        </p>

        <h2 className="text-lg font-bold mt-6 mb-3">Third-Party Services</h2>
        <p>We use the following third-party services:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>OpenRouter/Google AI</strong> - For generating personalized devotional content</li>
          <li><strong>Bible.com (YouVersion)</strong> - For daily verse content</li>
          <li><strong>Apple App Store / Google Play</strong> - For subscription processing</li>
        </ul>

        <h2 className="text-lg font-bold mt-6 mb-3">Children's Privacy</h2>
        <p>
          The app includes content appropriate for teenagers (13+). We do not knowingly collect 
          personal information from children under 13.
        </p>

        <h2 className="text-lg font-bold mt-6 mb-3">Your Rights</h2>
        <p>You can:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Clear your local data at any time through your device settings</li>
          <li>Delete your profile from within the app</li>
          <li>Contact us with questions about your data</li>
        </ul>

        <h2 className="text-lg font-bold mt-6 mb-3">Changes to This Policy</h2>
        <p>
          We may update this policy from time to time. We will notify you of significant changes 
          through the app.
        </p>

        <h2 className="text-lg font-bold mt-6 mb-3">Contact Us</h2>
        <p>
          Questions about this privacy policy? Contact us at:<br />
          <a href="mailto:support@bibleforlifestages.com" className="text-primary">support@bibleforlifestages.com</a>
        </p>
      </main>
    </div>
  )
}
