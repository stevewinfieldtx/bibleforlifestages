"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useLanguage } from "@/context/language-context"
import { LanguageSelector } from "@/components/language-selector"
import { useSubscription } from "@/context/subscription-context"

interface ProfileData {
  fullName: string
  email: string
  ageRange: string
  stageSituation: string
  contentStyle: "casual" | "academic"
}

export default function ProfilePage() {
  const router = useRouter()
  const { t } = useLanguage()
  const { canAccessCore } = useSubscription()
  const [formData, setFormData] = useState<ProfileData>({
    fullName: "",
    email: "",
    ageRange: "",
    stageSituation: "General",
    contentStyle: "casual",
  })

  // Load from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem("userProfile")
    if (savedData) {
      const parsed = JSON.parse(savedData)
      setFormData({
        fullName: parsed.fullName || "",
        email: parsed.email || "",
        ageRange: parsed.ageRange || "",
        stageSituation: parsed.stageSituation || "General",
        contentStyle: parsed.contentStyle || "casual",
      })
    }
  }, [])

  // Save to localStorage whenever data changes
  const handleChange = (field: string, value: string) => {
    const updated = { ...formData, [field]: value }
    setFormData(updated)
    localStorage.setItem("userProfile", JSON.stringify(updated))
  }

  const handleSave = () => {
    router.push("/")
  }

  const ageRanges = [
    { value: "teens", label: "Teens (13-17)" },
    { value: "university", label: "University (18-23)" },
    { value: "adult", label: "Adult (24-64)" },
    { value: "senior", label: "Senior (65+)" },
  ]

  // Simplified to 4 core situations
  const coreSituations = [
    { value: "General", label: "General", icon: "sunny", desc: "Everyday faith journey" },
    { value: "New beginnings", label: "New Beginnings", icon: "rocket_launch", desc: "Marriage, baby, new job, moving" },
    { value: "Struggling", label: "Struggling", icon: "heart_broken", desc: "Health, finances, loneliness, loss" },
    { value: "Transitions", label: "Transitions", icon: "sync_alt", desc: "Empty nest, retirement, divorce" },
  ]

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden pb-24 mx-auto max-w-md shadow-2xl bg-background">
      {/* Header */}
      <div className="flex items-center px-4 py-4 justify-between sticky top-0 z-10 bg-background/95 backdrop-blur-sm">
        <button
          onClick={() => router.push("/")}
          className="flex size-10 items-center justify-center rounded-full hover:bg-muted transition-colors"
        >
          <span className="material-symbols-outlined" style={{ fontSize: "24px" }}>
            arrow_back_ios_new
          </span>
        </button>
        <h2 className="text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center">{t("profile")}</h2>
        <div className="w-10"></div>
      </div>

      {/* Header Section */}
      <div className="flex flex-col px-6 pt-4">
        <h1 className="text-[28px] font-bold leading-tight text-left pb-2">{t("letsGetToKnow")}</h1>
        <p className="text-base font-normal leading-normal text-muted-foreground">{t("personalizeDesc")}</p>
      </div>

      {/* Form Section */}
      <div className="flex flex-col gap-5 px-6 py-6">
        <label className="flex flex-col gap-1.5 w-full">
          <p className="text-sm font-medium leading-normal">{t("language")}</p>
          <LanguageSelector variant="full" />
        </label>

        {/* Name Input */}
        <label className="flex flex-col gap-1.5 w-full">
          <p className="text-sm font-medium leading-normal">{t("fullName")}</p>
          <input
            value={formData.fullName}
            onChange={(e) => handleChange("fullName", e.target.value)}
            className="flex w-full resize-none overflow-hidden rounded-xl focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-border bg-card h-14 placeholder:text-muted-foreground px-4 text-base font-normal leading-normal shadow-sm transition-all"
            placeholder="Enter your full name"
          />
        </label>

        {/* Email Input */}
        <label className="flex flex-col gap-1.5 w-full">
          <p className="text-sm font-medium leading-normal">{t("email")}</p>
          <input
            value={formData.email}
            onChange={(e) => handleChange("email", e.target.value)}
            className="flex w-full resize-none overflow-hidden rounded-xl focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-border bg-card h-14 placeholder:text-muted-foreground px-4 text-base font-normal leading-normal shadow-sm transition-all"
            placeholder="name@example.com"
            type="email"
          />
        </label>

        {/* Age Range */}
        <label className="flex flex-col gap-1.5 w-full">
          <p className="text-sm font-medium leading-normal">{t("ageRange")}</p>
          <div className="relative">
            <select
              value={formData.ageRange}
              onChange={(e) => handleChange("ageRange", e.target.value)}
              className="flex w-full resize-none overflow-hidden rounded-xl focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-border bg-card h-14 px-4 text-base font-normal leading-normal shadow-sm appearance-none transition-all"
            >
              <option disabled value="">
                Select your age range
              </option>
              {ageRanges.map((range) => (
                <option key={range.value} value={range.value}>
                  {range.label}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-muted-foreground">
              <span className="material-symbols-outlined">expand_more</span>
            </div>
          </div>
        </label>

        {/* Life Stage - 4 Core Situations */}
        <div className="pt-2">
          <div className="flex items-center gap-2 mb-3">
            <span className="material-symbols-outlined text-primary">spa</span>
            <h3 className="text-lg font-bold leading-tight">Life Stage</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Where are you in your journey right now?
          </p>
          
          <div className="grid grid-cols-2 gap-3">
            {coreSituations.map((situation) => (
              <button
                key={situation.value}
                onClick={() => handleChange("stageSituation", situation.value)}
                className={`flex flex-col items-start p-4 rounded-xl border transition-all ${
                  formData.stageSituation === situation.value
                    ? "border-primary bg-primary/10 shadow-md"
                    : "border-border bg-card hover:border-primary/50"
                }`}
              >
                <div className={`size-10 rounded-full flex items-center justify-center mb-2 ${
                  formData.stageSituation === situation.value
                    ? "bg-primary text-white"
                    : "bg-muted text-muted-foreground"
                }`}>
                  <span className="material-symbols-outlined">{situation.icon}</span>
                </div>
                <span className={`font-semibold text-sm ${
                  formData.stageSituation === situation.value ? "text-primary" : "text-foreground"
                }`}>
                  {situation.label}
                </span>
                <span className="text-xs text-muted-foreground mt-0.5">
                  {situation.desc}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Content Style Toggle - Paid Users Only */}
        {canAccessCore && (
          <div className="pt-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="material-symbols-outlined text-primary">style</span>
              <h3 className="text-lg font-bold leading-tight">Content Style</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              How would you like your devotional content written?
            </p>
            
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleChange("contentStyle", "casual")}
                className={`flex flex-col items-start p-4 rounded-xl border transition-all ${
                  formData.contentStyle === "casual"
                    ? "border-primary bg-primary/10 shadow-md"
                    : "border-border bg-card hover:border-primary/50"
                }`}
              >
                <div className={`size-10 rounded-full flex items-center justify-center mb-2 ${
                  formData.contentStyle === "casual"
                    ? "bg-primary text-white"
                    : "bg-muted text-muted-foreground"
                }`}>
                  <span className="material-symbols-outlined">chat_bubble</span>
                </div>
                <span className={`font-semibold text-sm ${
                  formData.contentStyle === "casual" ? "text-primary" : "text-foreground"
                }`}>
                  Casual
                </span>
                <span className="text-xs text-muted-foreground mt-0.5">
                  Warm, conversational, like a friend
                </span>
              </button>

              <button
                onClick={() => handleChange("contentStyle", "academic")}
                className={`flex flex-col items-start p-4 rounded-xl border transition-all ${
                  formData.contentStyle === "academic"
                    ? "border-primary bg-primary/10 shadow-md"
                    : "border-border bg-card hover:border-primary/50"
                }`}
              >
                <div className={`size-10 rounded-full flex items-center justify-center mb-2 ${
                  formData.contentStyle === "academic"
                    ? "bg-primary text-white"
                    : "bg-muted text-muted-foreground"
                }`}>
                  <span className="material-symbols-outlined">school</span>
                </div>
                <span className={`font-semibold text-sm ${
                  formData.contentStyle === "academic" ? "text-primary" : "text-foreground"
                }`}>
                  Academic
                </span>
                <span className="text-xs text-muted-foreground mt-0.5">
                  Scholarly, in-depth, theological
                </span>
              </button>
            </div>
          </div>
        )}

        {/* Deep Dive Info */}
        <div className="pt-4 rounded-xl border border-blue-200 bg-blue-50 p-4">
          <div className="flex items-start gap-3">
            <div className="size-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white shrink-0">
              <span className="material-symbols-outlined">explore</span>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-bold text-foreground mb-1">Deep Dives Available</h3>
              <p className="text-xs text-muted-foreground">
                When viewing your daily devotional, tap "Deep Dive" to access reflections for specific situations like caregiving, grief, health challenges, and more.
              </p>
            </div>
          </div>
        </div>

        <div className="pt-2 flex items-start gap-3">
          <span className="material-symbols-outlined text-muted-foreground mt-0.5" style={{ fontSize: "20px" }}>
            lock
          </span>
          <p className="text-xs text-muted-foreground leading-relaxed">{t("privacyNote")}</p>
        </div>

        {/* Legal & Support Links */}
        <div className="pt-6 border-t border-border mt-4">
          <div className="flex flex-col gap-2">
            <button
              onClick={() => router.push("/support")}
              className="flex items-center justify-between p-3 rounded-xl bg-card border border-border hover:bg-muted transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-muted-foreground">help</span>
                <span className="text-sm font-medium">Help & Support</span>
              </div>
              <span className="material-symbols-outlined text-muted-foreground">chevron_right</span>
            </button>
            <button
              onClick={() => router.push("/privacy")}
              className="flex items-center justify-between p-3 rounded-xl bg-card border border-border hover:bg-muted transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-muted-foreground">shield</span>
                <span className="text-sm font-medium">Privacy Policy</span>
              </div>
              <span className="material-symbols-outlined text-muted-foreground">chevron_right</span>
            </button>
            <button
              onClick={() => router.push("/terms")}
              className="flex items-center justify-between p-3 rounded-xl bg-card border border-border hover:bg-muted transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-muted-foreground">description</span>
                <span className="text-sm font-medium">Terms of Service</span>
              </div>
              <span className="material-symbols-outlined text-muted-foreground">chevron_right</span>
            </button>
          </div>
        </div>
      </div>

      {/* Sticky Footer Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t border-border z-20 mx-auto max-w-md">
        <button
          onClick={handleSave}
          className="flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-xl h-12 px-5 bg-primary text-primary-foreground text-base font-bold leading-normal tracking-[0.015em] hover:bg-primary/90 transition-colors shadow-lg"
        >
          <span className="truncate">{t("save")}</span>
        </button>
      </div>
    </div>
  )
}
