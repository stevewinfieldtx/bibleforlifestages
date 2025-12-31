"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

type SubscriptionTier = "free" | "trial" | "core" | "premium"

interface VoiceUsage {
  checkInsUsed: number
  checkInsLimit: number
  lastResetDate: string
}

interface SubscriptionContextType {
  tier: SubscriptionTier
  trialEndsAt: number | null
  isTrialActive: boolean
  daysLeftInTrial: number
  canAccessPremium: boolean
  canAccessCore: boolean
  canSearchCustomVerse: boolean
  voiceUsage: VoiceUsage
  canUseVoice: boolean
  useVoiceCheckIn: () => boolean
  startTrial: () => void
  upgradeToPaid: (plan: "core" | "premium") => void
  downgrade: () => void
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined)

// Voice check-in limits by tier
const VOICE_LIMITS = {
  free: { weekly: 1 }, // 1 per week = ~4 per month
  trial: { monthly: 20 }, // Same as core during trial
  core: { monthly: 20 },
  premium: { monthly: Infinity }, // Unlimited
}

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const [tier, setTier] = useState<SubscriptionTier>("free")
  const [trialEndsAt, setTrialEndsAt] = useState<number | null>(null)
  const [voiceUsage, setVoiceUsage] = useState<VoiceUsage>({
    checkInsUsed: 0,
    checkInsLimit: VOICE_LIMITS.free.weekly,
    lastResetDate: new Date().toISOString().split("T")[0],
  })

  // Load subscription state from localStorage
  useEffect(() => {
    const savedTier = localStorage.getItem("subscriptionTier")
    const savedTrialEnd = localStorage.getItem("trialEndsAt")
    const savedVoiceUsage = localStorage.getItem("voiceUsage")

    if (savedTier) {
      setTier(savedTier as SubscriptionTier)
    }

    if (savedTrialEnd) {
      const endTime = Number.parseInt(savedTrialEnd)
      setTrialEndsAt(endTime)

      // Check if trial has expired
      if (endTime < Date.now()) {
        setTier("free")
        localStorage.setItem("subscriptionTier", "free")
        localStorage.removeItem("trialEndsAt")
      }
    }

    if (savedVoiceUsage) {
      const parsed = JSON.parse(savedVoiceUsage)
      // Check if we need to reset the counter
      const today = new Date().toISOString().split("T")[0]
      const lastReset = parsed.lastResetDate
      
      // Reset weekly for free tier, monthly for others
      const shouldReset = tier === "free" 
        ? isNewWeek(lastReset, today)
        : isNewMonth(lastReset, today)
      
      if (shouldReset) {
        const newUsage = {
          checkInsUsed: 0,
          checkInsLimit: getVoiceLimit(tier as SubscriptionTier),
          lastResetDate: today,
        }
        setVoiceUsage(newUsage)
        localStorage.setItem("voiceUsage", JSON.stringify(newUsage))
      } else {
        setVoiceUsage({
          ...parsed,
          checkInsLimit: getVoiceLimit(tier as SubscriptionTier),
        })
      }
    }
  }, [])

  // Update voice limits when tier changes
  useEffect(() => {
    const newLimit = getVoiceLimit(tier)
    setVoiceUsage(prev => {
      const updated = { ...prev, checkInsLimit: newLimit }
      localStorage.setItem("voiceUsage", JSON.stringify(updated))
      return updated
    })
  }, [tier])

  const isTrialActive = tier === "trial" && trialEndsAt !== null && trialEndsAt > Date.now()
  const daysLeftInTrial = trialEndsAt ? Math.ceil((trialEndsAt - Date.now()) / (1000 * 60 * 60 * 24)) : 0
  
  // Premium access = premium tier or active trial
  const canAccessPremium = tier === "premium" || isTrialActive
  
  // Core access = core tier, premium tier, or active trial
  const canAccessCore = tier === "core" || tier === "premium" || isTrialActive
  
  const canSearchCustomVerse = canAccessCore

  // Check if user can use voice
  const canUseVoice = tier === "premium" || voiceUsage.checkInsUsed < voiceUsage.checkInsLimit

  // Use a voice check-in
  const useVoiceCheckIn = (): boolean => {
    if (tier === "premium") return true // Unlimited for premium
    
    if (voiceUsage.checkInsUsed >= voiceUsage.checkInsLimit) {
      return false
    }
    
    const newUsage = {
      ...voiceUsage,
      checkInsUsed: voiceUsage.checkInsUsed + 1,
    }
    setVoiceUsage(newUsage)
    localStorage.setItem("voiceUsage", JSON.stringify(newUsage))
    return true
  }

  const startTrial = () => {
    const endTime = Date.now() + 7 * 24 * 60 * 60 * 1000 // 7 days from now
    setTier("trial")
    setTrialEndsAt(endTime)
    localStorage.setItem("subscriptionTier", "trial")
    localStorage.setItem("trialEndsAt", endTime.toString())
  }

  const upgradeToPaid = (plan: "core" | "premium") => {
    // In a real app, this would integrate with Stripe
    setTier(plan)
    localStorage.setItem("subscriptionTier", plan)
    localStorage.removeItem("trialEndsAt")
    setTrialEndsAt(null)
  }

  const downgrade = () => {
    setTier("free")
    localStorage.setItem("subscriptionTier", "free")
    localStorage.removeItem("trialEndsAt")
    setTrialEndsAt(null)
  }

  return (
    <SubscriptionContext.Provider
      value={{
        tier,
        trialEndsAt,
        isTrialActive,
        daysLeftInTrial,
        canAccessPremium,
        canAccessCore,
        canSearchCustomVerse,
        voiceUsage,
        canUseVoice,
        useVoiceCheckIn,
        startTrial,
        upgradeToPaid,
        downgrade,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  )
}

export function useSubscription() {
  const context = useContext(SubscriptionContext)
  if (!context) {
    throw new Error("useSubscription must be used within a SubscriptionProvider")
  }
  return context
}

// Helper functions
function getVoiceLimit(tier: SubscriptionTier): number {
  switch (tier) {
    case "premium":
      return Infinity
    case "core":
    case "trial":
      return VOICE_LIMITS.core.monthly
    case "free":
    default:
      return VOICE_LIMITS.free.weekly
  }
}

function isNewWeek(lastDate: string, currentDate: string): boolean {
  const last = new Date(lastDate)
  const current = new Date(currentDate)
  
  // Get the Monday of each week
  const lastMonday = new Date(last)
  lastMonday.setDate(last.getDate() - last.getDay() + 1)
  
  const currentMonday = new Date(current)
  currentMonday.setDate(current.getDate() - current.getDay() + 1)
  
  return currentMonday > lastMonday
}

function isNewMonth(lastDate: string, currentDate: string): boolean {
  const last = new Date(lastDate)
  const current = new Date(currentDate)
  
  return current.getMonth() !== last.getMonth() || current.getFullYear() !== last.getFullYear()
}
