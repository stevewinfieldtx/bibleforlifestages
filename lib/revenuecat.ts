// RevenueCat Web SDK Configuration
// Documentation: https://www.revenuecat.com/docs/web/web-billing/web-sdk

import { Purchases, CustomerInfo, Offerings, Package, PurchasesError, ErrorCode } from '@revenuecat/purchases-js';

// Environment variables - add these to your .env.local
const REVENUECAT_API_KEY = process.env.NEXT_PUBLIC_REVENUECAT_API_KEY || '';

// Product identifiers - match these in RevenueCat dashboard
export const PRODUCT_IDS = {
  PREMIUM_MONTHLY: 'bible_premium_monthly',
  PREMIUM_YEARLY: 'bible_premium_yearly',
} as const;

// Entitlement identifiers - must match RevenueCat dashboard exactly
export const ENTITLEMENTS = {
  PREMIUM: 'Bible for Life Stages Pro',
} as const;

let isConfigured = false;

/**
 * Initialize RevenueCat SDK
 * Call this once when the app loads
 */
export function configureRevenueCat(appUserId?: string): typeof Purchases {
  if (isConfigured) {
    return Purchases.getSharedInstance();
  }

  if (!REVENUECAT_API_KEY) {
    console.warn('RevenueCat API key not configured. Using mock mode.');
    return Purchases;
  }

  const userId = appUserId || Purchases.generateRevenueCatAnonymousAppUserId();
  
  Purchases.configure({
    apiKey: REVENUECAT_API_KEY,
    appUserId: userId,
  });

  isConfigured = true;
  return Purchases.getSharedInstance();
}

/**
 * Get customer subscription info
 */
export async function getCustomerInfo(): Promise<CustomerInfo | null> {
  try {
    if (!isConfigured) {
      configureRevenueCat();
    }
    return await Purchases.getSharedInstance().getCustomerInfo();
  } catch (error) {
    console.error('Error fetching customer info:', error);
    return null;
  }
}

/**
 * Check if user has premium access
 */
export async function hasPremiumAccess(): Promise<boolean> {
  const customerInfo = await getCustomerInfo();
  if (!customerInfo) return false;
  
  return ENTITLEMENTS.PREMIUM in customerInfo.entitlements.active;
}

/**
 * Get available offerings
 */
export async function getOfferings(currency?: string): Promise<Offerings | null> {
  try {
    if (!isConfigured) {
      configureRevenueCat();
    }
    return await Purchases.getSharedInstance().getOfferings({
      currency: currency,
    });
  } catch (error) {
    console.error('Error fetching offerings:', error);
    return null;
  }
}

/**
 * Purchase a package
 */
export async function purchasePackage(
  pkg: Package,
  options?: {
    customerEmail?: string;
    htmlTarget?: HTMLElement;
  }
): Promise<{ customerInfo: CustomerInfo } | null> {
  try {
    if (!isConfigured) {
      configureRevenueCat();
    }

    const result = await Purchases.getSharedInstance().purchase({
      rcPackage: pkg,
      customerEmail: options?.customerEmail,
      htmlTarget: options?.htmlTarget,
    });

    return result;
  } catch (error) {
    if (error instanceof PurchasesError) {
      if (error.errorCode === ErrorCode.UserCancelledError) {
        console.log('User cancelled purchase');
        return null;
      }
    }
    console.error('Purchase error:', error);
    throw error;
  }
}

/**
 * Present the RevenueCat paywall
 */
export async function presentPaywall(
  htmlTarget: HTMLElement,
  offeringId?: string
): Promise<{ customerInfo: CustomerInfo } | null> {
  try {
    if (!isConfigured) {
      configureRevenueCat();
    }

    const offerings = await getOfferings();
    const offering = offeringId 
      ? offerings?.all[offeringId] 
      : offerings?.current;

    if (!offering) {
      console.error('No offering available');
      return null;
    }

    const result = await Purchases.getSharedInstance().presentPaywall({
      htmlTarget,
      offering,
    });

    return result;
  } catch (error) {
    console.error('Paywall error:', error);
    throw error;
  }
}

/**
 * Restore purchases (useful after reinstall or login)
 */
export async function restorePurchases(): Promise<CustomerInfo | null> {
  try {
    if (!isConfigured) {
      configureRevenueCat();
    }
    const result = await Purchases.getSharedInstance().restorePurchases();
    return result.customerInfo;
  } catch (error) {
    console.error('Error restoring purchases:', error);
    return null;
  }
}

/**
 * Log in with a user ID (for identified users)
 */
export async function login(appUserId: string): Promise<CustomerInfo | null> {
  try {
    if (!isConfigured) {
      configureRevenueCat();
    }
    const result = await Purchases.getSharedInstance().changeUser(appUserId);
    return result;
  } catch (error) {
    console.error('Error logging in:', error);
    return null;
  }
}

/**
 * Log out (switch to anonymous user)
 */
export async function logout(): Promise<CustomerInfo | null> {
  try {
    if (!isConfigured) {
      configureRevenueCat();
    }
    const anonymousId = Purchases.generateRevenueCatAnonymousAppUserId();
    const result = await Purchases.getSharedInstance().changeUser(anonymousId);
    return result;
  } catch (error) {
    console.error('Error logging out:', error);
    return null;
  }
}
