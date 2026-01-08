"use client"

import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"

export default function SupportPage() {
  const router = useRouter()

  const faqs = [
    {
      q: "How does personalization work?",
      a: "When you set up your profile, you tell us your age range, life situation, and content style preference. Our AI uses this to generate devotional content that speaks directly to where you are in life."
    },
    {
      q: "Is my data private?",
      a: "Yes! Your profile is stored locally on your device. We don't store your personal information or conversations on our servers."
    },
    {
      q: "What's included in Premium?",
      a: "Premium ($5/month or $45/year) includes personalized Stories, Poetry, Imagery, Songs, Biblical Context, all 33 Deep Dive topics, unlimited chat, and voice features."
    },
    {
      q: "How do I cancel my subscription?",
      a: "Subscriptions are managed through the App Store (iOS) or Google Play (Android). Go to your device's subscription settings to cancel."
    },
    {
      q: "Can I change my profile?",
      a: "Yes! Tap the profile icon on the home screen to update your age range, life situation, or content style at any time."
    },
    {
      q: "Is the AI content accurate?",
      a: "Our AI generates thoughtful devotional content, but it's meant to complement—not replace—traditional Bible study and guidance from pastors or counselors."
    },
    {
      q: "What Bible translations do you use?",
      a: "We primarily use the World English Bible (WEB), a public domain modern English translation. Daily verses come from Bible.com (YouVersion)."
    },
  ]

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
        <h2 className="text-base font-bold">Help & Support</h2>
        <div className="w-10"></div>
      </div>

      <main className="flex-1 px-5 py-6">
        {/* Contact Card */}
        <Card className="p-5 mb-6 bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
          <div className="flex items-start gap-4">
            <div className="size-12 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-amber-600">mail</span>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-1">Contact Us</h3>
              <p className="text-sm text-gray-600 mb-3">
                Have a question or feedback? We'd love to hear from you.
              </p>
              <a 
                href="mailto:support@bibleforlifestages.com"
                className="inline-flex items-center gap-2 text-sm font-semibold text-amber-700 hover:text-amber-800"
              >
                support@bibleforlifestages.com
                <span className="material-symbols-outlined text-base">arrow_forward</span>
              </a>
            </div>
          </div>
        </Card>

        {/* Quick Links */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button
            onClick={() => router.push("/privacy")}
            className="flex items-center gap-3 p-4 bg-card rounded-xl border border-border hover:bg-muted transition-colors"
          >
            <span className="material-symbols-outlined text-muted-foreground">shield</span>
            <span className="text-sm font-medium">Privacy Policy</span>
          </button>
          <button
            onClick={() => router.push("/terms")}
            className="flex items-center gap-3 p-4 bg-card rounded-xl border border-border hover:bg-muted transition-colors"
          >
            <span className="material-symbols-outlined text-muted-foreground">description</span>
            <span className="text-sm font-medium">Terms of Service</span>
          </button>
        </div>

        {/* FAQs */}
        <h3 className="font-bold text-lg mb-4">Frequently Asked Questions</h3>
        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <Card key={idx} className="p-4">
              <h4 className="font-semibold text-sm text-foreground mb-2">{faq.q}</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
            </Card>
          ))}
        </div>

        {/* App Info */}
        <div className="mt-8 pt-6 border-t border-border text-center">
          <p className="text-xs text-muted-foreground mb-1">Bible for Life Stages</p>
          <p className="text-xs text-muted-foreground">Version 1.0.0</p>
          <p className="text-xs text-muted-foreground mt-2">Made with ❤️ for your spiritual journey</p>
        </div>
      </main>
    </div>
  )
}
