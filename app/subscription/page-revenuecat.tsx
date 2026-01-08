"use client"

import { useRouter } from "next/navigation"
import { useSubscription } from "@/context/subscription-context"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useRef, useState } from "react"

export default function SubscriptionPage() {
  const router = useRouter()
  const { 
    tier, 
    isTrialActive, 
    daysLeftInTrial, 
    voiceUsage,
    offerings,
    isLoading,
    purchase,
    restore,
    isPremium,
  } = useSubscription()
  
  const [isPurchasing, setIsPurchasing] = useState(false)
  const [isRestoring, setIsRestoring] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const purchaseContainerRef = useRef<HTMLDivElement>(null)

  const freeFeatures = [
    "Daily verse with friendly description",
    "1 voice check-in per week",
  ]

  const premiumFeatures = [
    "All free features",
    "Personalized Stories",
    "Inspiring Poetry & Hymns",
    "Visual Imagery & Symbols",
    "Worship Songs & Music",
    "Biblical Context & Backstory",
    "Life Situations",
    "Deep Dive topics",
    "Unlimited text chat",
    "Unlimited voice conversations",
    "Thoughtful Customization",
    "AI that truly knows you",
  ]

  const currentTierLabel = {
    free: "Free Account",
    trial: "Trial Active",
    premium: "Premium Member",
  }

  const currentTierColor = {
    free: "bg-gray-100 text-gray-700",
    trial: "bg-gradient-to-r from-amber-100 to-amber-200 text-amber-900",
    premium: "bg-gradient-to-r from-green-100 to-emerald-200 text-green-900",
  }

  // Get packages from offerings
  const monthlyPackage = offerings?.current?.monthly
  const annualPackage = offerings?.current?.annual

  const handlePurchase = async (isYearly: boolean) => {
    const pkg = isYearly ? annualPackage : monthlyPackage
    if (!pkg) {
      setError("Package not available. Please try again later.")
      return
    }

    setIsPurchasing(true)
    setError(null)

    try {
      const success = await purchase(pkg)
      if (success) {
        router.push("/")
      }
    } catch (err) {
      setError("Purchase failed. Please try again.")
      console.error(err)
    } finally {
      setIsPurchasing(false)
    }
  }

  const handleRestore = async () => {
    setIsRestoring(true)
    setError(null)

    try {
      const success = await restore()
      if (success && isPremium) {
        router.push("/")
      } else if (!isPremium) {
        setError("No previous purchases found.")
      }
    } catch (err) {
      setError("Failed to restore purchases.")
      console.error(err)
    } finally {
      setIsRestoring(false)
    }
  }

  if (isLoading) {
    return (
      <div className="relative flex min-h-screen w-full flex-col max-w-md mx-auto bg-gradient-to-b from-amber-50 via-background to-background items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <p className="mt-4 text-muted-foreground">Loading...</p>
      </div>
    )
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
          {tier === "free" && (
            <div className="text-sm text-muted-foreground">
              Voice check-ins: {voiceUsage.checkInsUsed} / {voiceUsage.checkInsLimit === Infinity ? "∞" : voiceUsage.checkInsLimit}
              <span className="text-xs ml-1">(per week)</span>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Pricing Cards */}
        <div className="space-y-4">
          {/* Free Tier */}
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

          {/* Premium Tier */}
          <Card className={`p-5 border-2 ${tier === "premium" ? "border-green-500" : "border-primary"} bg-gradient-to-br from-amber-50/50 to-orange-50/50`}>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-bold text-primary">Premium</h3>
                <div className="flex items-baseline gap-2">
                  <p className="text-2xl font-bold text-primary">
                    ${monthlyPackage?.webBillingProduct?.normalPeriodDuration === "P1M" 
                      ? (monthlyPackage.webBillingProduct.currentPrice.amountMicros / 1000000).toFixed(0) 
                      : "5"}
                    <span className="text-sm font-normal text-muted-foreground">/month</span>
                  </p>
                </div>
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
              <div className="space-y-2">
                <Button
                  onClick={() => handlePurchase(false)}
                  disabled={isPurchasing || !monthlyPackage}
                  className="w-full bg-gradient-to-r from-primary to-amber-500 hover:from-primary/90 hover:to-amber-500/90"
                >
                  {isPurchasing ? "Processing..." : "Subscribe Monthly — $5/mo"}
                </Button>
                <Button
                  onClick={() => handlePurchase(true)}
                  disabled={isPurchasing || !annualPackage}
                  variant="outline"
                  className="w-full border-primary text-primary hover:bg-primary/5"
                >
                  <span className="flex items-center gap-2">
                    Subscribe Yearly — $45/yr
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">Save 25%</span>
                  </span>
                </Button>
              </div>
            )}
          </Card>

          {/* RevenueCat purchase container - for embedded checkout */}
          <div ref={purchaseContainerRef} id="revenuecat-purchase-container" />
        </div>

        {/* Restore Purchases */}
        {tier === "free" && (
          <div className="mt-6 text-center">
            <button
              onClick={handleRestore}
              disabled={isRestoring}
              className="text-sm text-muted-foreground hover:text-foreground underline"
            >
              {isRestoring ? "Restoring..." : "Restore Purchases"}
            </button>
          </div>
        )}

        {/* Already Premium */}
        {tier === "premium" && (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">Thank you for supporting Bible for Life Stages!</p>
            <Button onClick={() => router.push("/")} variant="outline">
              Back to Home
            </Button>
          </div>
        )}

        {/* Trial Banner */}
        {isTrialActive && (
          <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-sm text-amber-800 text-center">
              <strong>Trial ends in {daysLeftInTrial} days.</strong> Subscribe now to keep your premium access!
            </p>
          </div>
        )}
      </main>
    </div>
  )
}
