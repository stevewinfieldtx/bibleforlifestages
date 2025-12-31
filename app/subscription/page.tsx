"use client"

import { useRouter } from "next/navigation"
import { useSubscription } from "@/context/subscription-context"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export default function SubscriptionPage() {
  const router = useRouter()
  const { tier, isTrialActive, daysLeftInTrial, voiceUsage, startTrial, upgradeToPaid } = useSubscription()

  const freeFeatures = [
    "Daily verse with friendly description",
    "1 voice check-in per week",
  ]

  const coreFeatures = [
    "All free features",
    "Personalized Stories",
    "Inspiring Poetry & Hymns",
    "Visual Imagery & Symbols",
    "Worship Songs & Music",
    "Biblical Context & Backstory",
    "Life Situations",
    "1 Deep Dive topic",
    "Unlimited text chat",
    "20 voice check-ins per month",
  ]

  const premiumFeatures = [
    "All Core features",
    "Thoughtful Customization (6 dimensions)",
    "Up to 5 Deep Dive topics",
    "Unlimited voice conversations",
    "Voice onboarding interview",
    "AI that truly knows you",
  ]

  const currentTierLabel = {
    free: "Free Account",
    trial: "Trial Active",
    core: "Core Member",
    premium: "Premium Member",
  }

  const currentTierColor = {
    free: "bg-gray-100 text-gray-700",
    trial: "bg-gradient-to-r from-amber-100 to-amber-200 text-amber-900",
    core: "bg-gradient-to-r from-indigo-100 to-violet-200 text-indigo-900",
    premium: "bg-gradient-to-r from-green-100 to-emerald-200 text-green-900",
  }

  return (
    <div className="relative flex min-h-screen w-full flex-col max-w-md mx-auto bg-gradient-to-b from-amber-50 via-background to-background shadow-2xl pb-20">
      {/* Header */}
      <div className="sticky top-0 z-50 flex items-center bg-background/95 backdrop-blur-md p-4 justify-between border-b border-border">
        <button
          onClick={() => router.push("/")}
          className="flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-muted transition-colors"
        >
          <span className="material-symbols-outlined">arrow_back_ios_new</span>
        </button>
        <h2 className="text-base font-bold">Choose Your Plan</h2>
        <div className="w-10"></div>
      </div>

      <main className="flex-1 px-6 py-8">
        {/* Current Status */}
        <div className="mb-8 text-center">
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4 ${currentTierColor[tier]}`}>
            <span className="material-symbols-outlined text-current">
              {tier === "free" ? "person" : tier === "trial" ? "verified" : "workspace_premium"}
            </span>
            <span className="text-sm font-semibold">
              {currentTierLabel[tier]}
              {isTrialActive && `: ${daysLeftInTrial} ${daysLeftInTrial === 1 ? "day" : "days"} left`}
            </span>
          </div>
          
          {/* Voice Usage */}
          {tier !== "premium" && (
            <div className="text-sm text-muted-foreground">
              Voice check-ins: {voiceUsage.checkInsUsed} / {voiceUsage.checkInsLimit === Infinity ? "∞" : voiceUsage.checkInsLimit}
              <span className="text-xs ml-1">
                ({tier === "free" ? "per week" : "per month"})
              </span>
            </div>
          )}
        </div>

        {/* Pricing Cards */}
        <div className="space-y-4">
          {/* Free Tier - Always shown for reference */}
          <Card className={`p-5 ${tier === "free" ? "border-2 border-gray-300" : "opacity-60"}`}>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-bold">Free</h3>
                <p className="text-2xl font-bold text-gray-600">$0</p>
              </div>
              {tier === "free" && (
                <span className="px-2 py-1 bg-gray-200 rounded text-xs font-semibold">Current</span>
              )}
            </div>
            <ul className="space-y-2 mb-4">
              {freeFeatures.map((feature, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm">
                  <span className="material-symbols-outlined text-gray-500 text-base mt-0.5">check</span>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </Card>

          {/* Start Trial Button */}
          {tier === "free" && (
            <Card className="p-5 border-2 border-amber-400 bg-gradient-to-br from-amber-50 to-orange-50">
              <div className="text-center mb-4">
                <div className="inline-flex items-center gap-1 px-3 py-1 bg-amber-200 rounded-full mb-2">
                  <span className="text-xs font-bold text-amber-900">TRY FREE</span>
                </div>
                <h3 className="text-xl font-bold mb-1">7-Day Free Trial</h3>
                <p className="text-sm text-muted-foreground">Try all Premium features free</p>
              </div>
              <Button
                onClick={startTrial}
                className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700"
              >
                Start Free Trial
              </Button>
            </Card>
          )}

          {/* Core Tier */}
          <Card className={`p-5 ${tier === "core" ? "border-2 border-indigo-500" : ""}`}>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-bold text-indigo-700">Core</h3>
                <p className="text-2xl font-bold text-indigo-600">$5<span className="text-sm font-normal text-muted-foreground">/month</span></p>
              </div>
              {tier === "core" && (
                <span className="px-2 py-1 bg-indigo-200 rounded text-xs font-semibold text-indigo-800">Current</span>
              )}
            </div>
            <ul className="space-y-2 mb-4">
              {coreFeatures.map((feature, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm">
                  <span className="material-symbols-outlined text-indigo-500 text-base mt-0.5">check</span>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            {tier !== "core" && tier !== "premium" && (
              <Button
                onClick={() => upgradeToPaid("core")}
                variant="outline"
                className="w-full border-indigo-500 text-indigo-700 hover:bg-indigo-50"
              >
                {isTrialActive ? "Subscribe to Core" : "Upgrade to Core"}
              </Button>
            )}
          </Card>

          {/* Premium Tier */}
          <Card className={`p-5 border-2 ${tier === "premium" ? "border-green-500" : "border-primary"} bg-gradient-to-br from-amber-50/50 to-orange-50/50`}>
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary/10 rounded-full mb-2">
                  <span className="text-[10px] font-bold text-primary">BEST VALUE</span>
                </div>
                <h3 className="text-lg font-bold text-primary">Premium</h3>
                <p className="text-2xl font-bold text-primary">$10<span className="text-sm font-normal text-muted-foreground">/month</span></p>
              </div>
              {tier === "premium" && (
                <span className="px-2 py-1 bg-green-200 rounded text-xs font-semibold text-green-800">Current</span>
              )}
            </div>
            <ul className="space-y-2 mb-4">
              {premiumFeatures.map((feature, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm">
                  <span className="material-symbols-outlined text-primary text-base mt-0.5">check</span>
                  <span className="font-medium">{feature}</span>
                </li>
              ))}
            </ul>
            {tier !== "premium" && (
              <Button
                onClick={() => upgradeToPaid("premium")}
                className="w-full bg-gradient-to-r from-primary to-amber-500 hover:from-primary/90 hover:to-amber-500/90"
              >
                {isTrialActive ? "Subscribe to Premium" : "Upgrade to Premium"}
              </Button>
            )}
          </Card>

          {/* Yearly Option */}
          {tier !== "premium" && (
            <div className="text-center text-sm text-muted-foreground mt-4">
              <p>Annual plans coming soon — save 50%!</p>
            </div>
          )}
        </div>

        {(tier === "core" || tier === "premium") && (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">Thank you for supporting Bible for Life Stages!</p>
            <Button onClick={() => router.push("/")} variant="outline">
              Back to Home
            </Button>
          </div>
        )}
      </main>
    </div>
  )
}
