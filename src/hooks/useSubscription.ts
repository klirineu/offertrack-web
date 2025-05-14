import { useEffect, useState } from "react";
import { useAuthStore } from "../store/authStore";
import { Database } from "../types/supabase";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type SubscriptionTier = Profile["subscription_tier"];
type SubscriptionStatus = Profile["subscription_status"];

interface SubscriptionInfo {
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  isActive: boolean;
  features: {
    maxProjects: number;
    maxCollaborators: number;
    customDomain: boolean;
    analytics: boolean;
    prioritySupport: boolean;
  };
}

const TIER_FEATURES = {
  free: {
    maxProjects: 1,
    maxCollaborators: 1,
    customDomain: false,
    analytics: false,
    prioritySupport: false,
  },
  pro: {
    maxProjects: 10,
    maxCollaborators: 5,
    customDomain: true,
    analytics: true,
    prioritySupport: false,
  },
  enterprise: {
    maxProjects: 100,
    maxCollaborators: 20,
    customDomain: true,
    analytics: true,
    prioritySupport: true,
  },
};

export function useSubscription() {
  const { profile } = useAuthStore();
  const [subscriptionInfo, setSubscriptionInfo] = useState<SubscriptionInfo>({
    tier: "free",
    status: null,
    isActive: false,
    features: TIER_FEATURES.free,
  });

  useEffect(() => {
    if (profile) {
      const tier = profile.subscription_tier || "free";
      const status = profile.subscription_status;
      const isActive = status === "active" || status === "trialing";

      setSubscriptionInfo({
        tier,
        status,
        isActive,
        features: TIER_FEATURES[tier || "free"],
      });
    }
  }, [profile]);

  const canAccessFeature = (feature: keyof typeof TIER_FEATURES.free) => {
    return subscriptionInfo.isActive && subscriptionInfo.features[feature];
  };

  const getFeatureLimit = (feature: "maxProjects" | "maxCollaborators") => {
    return subscriptionInfo.features[feature];
  };

  return {
    ...subscriptionInfo,
    canAccessFeature,
    getFeatureLimit,
  };
}
