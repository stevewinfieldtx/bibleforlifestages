export function getAgePrompt(ageRange: string): string {
  const prompts: Record<string, string> = {
    teens: `Write a reflection on [scripture] that a teenager might share. Use contemporary but not exaggerated teen language. Include relevant examples from school, social media, friendships, and family dynamics. Avoid slang that would sound forced. Don't use first-person perspective or directly address a reader. Keep sentences shorter and ideas relatable to teenage experiences while maintaining depth.`,

    university: `Write a reflection on [scripture] using language familiar to college-aged young adults. Reference experiences like independence, finding identity, early career concerns, and navigating adult relationships. Use moderately complex vocabulary but keep the style conversational. Include some nuance about wrestling with deeper meanings while avoiding academic terminology. No first-person or direct address.`,

    adult: `Write a thoughtful reflection on [scripture] using balanced, mature language that resonates with working adults. Include references to career, family responsibilities, and life's complexities. Use moderately sophisticated vocabulary and sentence structure with occasional metaphors drawn from everyday adult experiences. Maintain depth without becoming academic. Avoid first-person perspective or addressing the reader.`,

    senior: `Write a reflection on [scripture] using language that resonates with older adults. Include references to life's accumulated wisdom and long-term perspective. Use slightly more traditional phrasing and established metaphors while avoiding outdated expressions. The tone should be thoughtful and measured, acknowledging life's complexities without cynicism. No first-person perspective or direct address to the reader.`,
  }

  return prompts[ageRange] || prompts.adult
}

export function getSituationPrompt(situation: string): string {
  const prompts: Record<string, string> = {
    "Getting married": `Include subtle references to partnership, commitment, shared futures, and balancing independence with togetherness. Reference the blend of excitement and adjustment that comes with merging lives.`,

    "Having a baby": `Weave in themes of new responsibility, overwhelming love, exhaustion, identity shifts, and wonder at new life. Reference the contrast between preparation and the reality of parenting.`,

    "Having young children": `Include references to the beautiful chaos of daily routines, constant demands, finding moments of connection amid busyness, and the tension between nurturing others while maintaining self.`,

    "Having teens": `Incorporate themes of evolving relationships, watching independence emerge, communication challenges, pride mixed with worry, and navigating when to hold tight versus when to release.`,

    "Becoming an empty nester": `Reference the rediscovery of personal identity, the bittersweetness of accomplishment mixed with absence, new rhythms of household life, and recalibration of purpose and relationship.`,

    "Getting a divorce": `Acknowledge themes of broken expectations, processing grief while finding strength, rebuilding identity, navigating practical changes, and finding hope amid disappointment.`,

    "Grieving a loss": `Gently incorporate references to the disorientation of absence, conflicting emotions, changed perspectives on what matters, and finding meaning amid pain.`,

    "Starting a new job": `Include references to adaptation, proving oneself, balancing optimism with uncertainty, establishing new routines, and reconciling expectations with reality.`,

    "Going through health challenges": `Weave in themes of vulnerability, dependence on others, adjusting expectations, finding strength in limitation, and shifting perspectives on time and priorities.`,

    "Struggling financially": `Reference the weight of uncertainty, managing competing needs, finding worth beyond material stability, practical creativity, and maintaining dignity amid constraints.`,

    "Feeling lonely or isolated": `Incorporate subtle references to the hunger for meaningful connection, the gap between social interaction and true belonging, self-discovery in solitude, and seeking community.`,

    "Nothing special": ``,
  }

  return prompts[situation] || ""
}

export function buildPersonalizationContext(ageRange: string, gender: string, stageSituation: string): string {
  const parts: string[] = []

  // Add age-specific prompt
  if (ageRange) {
    parts.push(getAgePrompt(ageRange))
  }

  // Add gender context if specified
  if (gender && gender !== "other") {
    parts.push(`The reader identifies as ${gender}.`)
  }

  // Add situation-specific prompt
  if (stageSituation && stageSituation !== "Nothing special") {
    const situationPrompt = getSituationPrompt(stageSituation)
    if (situationPrompt) {
      parts.push(situationPrompt)
    }
  }

  return parts.length > 0 ? `\n\nPERSONALIZATION INSTRUCTIONS:\n${parts.join("\n\n")}` : ""
}
