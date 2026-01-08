"use client"

import { createContext, useContext, useState, useEffect, useCallback, useMemo, type ReactNode } from "react"
import { 
  configureRevenueCat, 
  getCustomerInfo, 
  getOfferings,
  purchasePackage,
  restorePurchases,
  ENTITLEMENTS,
} from "@/lib/revenuecat"
import type { CustomerInfo, Offerings, Package } from "@revenuecat/purchases-js"

type SubscriptionTier = "free" | "trial" | "core" | "premium"

interface VoiceUsage {
  checkInsUsed: number
  checkInsLimit: number
  lastResetDate: string
}

interface SubscriptionContextType {
  // Subscription state
  tier: SubscriptionTier
  isLoading: boolean
  customerInfo: CustomerInfo | null
  offerings: Offerings | null
  
  // Computed properties
  isPremium: boolean
  canAccessPremium: boolean
  canAccessCore: boolean
  canSearchCustomVerse: boolean
  
  // Voice usage
  voiceUsage: VoiceUsage
  canUseVoice: boolean
  useVoiceCheckIn: () => boolean
  
  // Trial state
  isTrialActive: boolean
  daysLeftInTrial: number
  trialEndsAt: number | null
  
  // Actions - RevenueCat
  purchase: (pkg: Package) => Promise<boolean>
  restore: () => Promise<boolean>
  refreshCustomerInfo: () => Promise<void>
  
  // Legacy actions (for backwards compatibility - redirect to subscription page)
  startTrial: () => void
  upgradeToPaid: (plan: "core" | "premium" | "premium-yearly") => void
  downgrade: () => void
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined)

// Voice check-in limits by tier
const VOICE_LIMITS = {
  free: 1,      // 1 per week
  trial: 999,   // Essentially unlimited during trial
  core: 20,     // 20 per month
  premium: 999, // Unlimited
}

// Helper function to get voice limit
function getVoiceLimit(tier: SubscriptionTier): number {
  return VOICE_LIMITS[tier] ?? VOICE_LIMITS.free
}

// Helper function to check if new week
function isNewWeek(lastDate: string, currentDate: string): boolean {
  const last = new Date(lastDate)
  const current = new Date(currentDate)
  
  const lastMonday = new Date(last)
  lastMonday.setDate(last.getDate() - last.getDay() + 1)
  
  const currentMonday = new Date(current)
  currentMonday.setDate(current.getDate() - current.getDay() + 1)
  
  return currentMonday > lastMonday
}

// Helper function to determine tier from customer info
function getTierFromCustomerInfo(customerInfo: CustomerInfo | null): SubscriptionTier {
  if (!customerInfo) return "free"
  
  const premiumEntitlement = customerInfo.entitlements.active[ENTITLEMENTS.PREMIUM]
  if (!premiumEntitlement) return "free"
  
  // Check if it's a trial
  if (premiumEntitlement.periodType === "trial") return "trial"
  
  return "premium"
}

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null)
  const [offerings, setOfferings] = useState<Offerings | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [voiceUsage, setVoiceUsage] = useState<VoiceUsage>({
    checkInsUsed: 0,
    checkInsLimit: VOICE_LIMITS.free,
    lastResetDate: new Date().toISOString().split("T")[0],
  })

  // Determine subscription tier from customer info
  const tier = useMemo(() => getTierFromCustomerInfo(customerInfo), [customerInfo])

  // Computed properties
  const isPremium = tier === "premium"
  const isTrialActive = tier === "trial"
  const canAccessPremium = isPremium || isTrialActive
  const canAccessCore = canAccessPremium || tier === "core"
  const canSearchCustomVerse = canAccessCore

  // Trial ends at - calculate from customer info
  const trialEndsAt = useMemo(() => {
    if (!isTrialActive || !customerInfo) return null
    const premiumEntitlement = customerInfo.entitlements.active[ENTITLEMENTS.PREMIUM]
    if (!premiumEntitlement?.expirationDate) return null
    return new Date(premiumEntitlement.expirationDate).getTime()
  }, [isTrialActive, customerInfo])

  // Calculate days left in trial
  const daysLeftInTrial = useMemo(() => {
    if (!trialEndsAt) return 0
    const msLeft = trialEndsAt - Date.now()
    return Math.max(0, Math.ceil(msLeft / (1000 * 60 * 60 * 24)))
  }, [trialEndsAt])

  // Initialize RevenueCat and fetch customer info
  useEffect(() => {
    async function initialize() {
      try {
        // Configure RevenueCat (will use anonymous ID if no user logged in)
        configureRevenueCat()
        
        // Fetch customer info and offerings in parallel
        const [info, offers] = await Promise.all([
          getCustomerInfo(),
          getOfferings(),
        ])
        
        setCustomerInfo(info)
        setOfferings(offers)
      } catch (error) {
        console.error('Failed to initialize RevenueCat:', error)
      } finally {
        setIsLoading(false)
      }
    }

    initialize()
  }, [])

  // Load voice usage from localStorage on mount
  useEffect(() => {
    const savedVoiceUsage = localStorage.getItem("voiceUsage")
    if (savedVoiceUsage) {
      try {
        const parsed = JSON.parse(savedVoiceUsage)
        const today = new Date().toISOString().split("T")[0]
        
        // Reset if it's a new week
        if (isNewWeek(parsed.lastResetDate, today)) {
          const newUsage = {
            checkInsUsed: 0,
            checkInsLimit: VOICE_LIMITS.free,
            lastResetDate: today,
          }
          setVoiceUsage(newUsage)
          localStorage.setItem("voiceUsage", JSON.stringify(newUsage))
        } else {
          setVoiceUsage(parsed)
        }
      } catch {
        // Invalid JSON, use defaults
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

  // Voice usage
  const canUseVoice = isPremium || isTrialActive || voiceUsage.checkInsUsed < voiceUsage.checkInsLimit

  const useVoiceCheckIn = useCallback((): boolean => {
    if (isPremium || isTrialActive) return true
    
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
  }, [isPremium, isTrialActive, voiceUsage])

  // Refresh customer info
  const refreshCustomerInfo = useCallback(async () => {
    const info = await getCustomerInfo()
    setCustomerInfo(info)
  }, [])

  // Purchase a package
  const purchase = useCallback(async (pkg: Package): Promise<boolean> => {
    try {
      const result = await purchasePackage(pkg)
      if (result?.customerInfo) {
        setCustomerInfo(result.customerInfo)
        return true
      }
      return false
    } catch (error) {
      console.error('Purchase failed:', error)
      return false
    }
  }, [])

  // Restore purchases
  const restore = useCallback(async (): Promise<boolean> => {
    try {
      const info = await restorePurchases()
      if (info) {
        setCustomerInfo(info)
        return true
      }
      return false
    } catch (error) {
      console.error('Restore failed:', error)
      return false
    }
  }, [])

  // Legacy functions - redirect to subscription page
  const startTrial = useCallback(() => {
    // Redirect to subscription page where RevenueCat handles trials
    window.location.href = '/subscription'
  }, [])

  const upgradeToPaid = useCallback((plan: "core" | "premium" | "premium-yearly") => {
    // Redirect to subscription page
    window.location.href = '/subscription'
  }, [])

  const downgrade = useCallback(() => {
    // In RevenueCat, users manage subscriptions through Stripe customer portal
    // or through the app settings
    console.log('Downgrade requested - user should manage subscription through settings')
  }, [])

  return (
    <SubscriptionContext.Provider
      value={{
        tier,
        isLoading,
        customerInfo,
        offerings,
        isPremium,
        canAccessPremium,
        canAccessCore,
        canSearchCustomVerse,
        voiceUsage,
        canUseVoice,
        useVoiceCheckIn,
        isTrialActive,
        daysLeftInTrial,
        trialEndsAt,
        purchase,
        restore,
        refreshCustomerInfo,
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
