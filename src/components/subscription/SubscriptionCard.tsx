import { useAuthStore } from '../../store/authStore'

export function SubscriptionCard() {
  const { profile } = useAuthStore()
  const isActive = profile?.subscription_status === 'active' || profile?.subscription_status === 'trialing'
  const tier = profile?.subscription_tier || 'free'

  const features = {
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
    }
  }

  const currentFeatures = features[tier as keyof typeof features]

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Your Subscription</h2>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
          {profile?.subscription_status || 'inactive'}
        </span>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Current Plan: {tier.toUpperCase()}</h3>
        <p className="text-gray-600">
          {isActive
            ? 'Your subscription is active and all features are available.'
            : 'Your subscription is inactive. Upgrade to access more features.'}
        </p>
      </div>

      <div className="space-y-4">
        <h4 className="font-medium">Plan Features:</h4>
        <ul className="space-y-2">
          <li className="flex items-center">
            <span className="mr-2">•</span>
            Up to {currentFeatures.maxProjects} projects
          </li>
          <li className="flex items-center">
            <span className="mr-2">•</span>
            Up to {currentFeatures.maxCollaborators} collaborators
          </li>
          <li className="flex items-center">
            <span className="mr-2">•</span>
            {currentFeatures.customDomain ? 'Custom domain support' : 'No custom domain support'}
          </li>
          <li className="flex items-center">
            <span className="mr-2">•</span>
            {currentFeatures.analytics ? 'Advanced analytics' : 'Basic analytics'}
          </li>
          <li className="flex items-center">
            <span className="mr-2">•</span>
            {currentFeatures.prioritySupport ? 'Priority support' : 'Standard support'}
          </li>
        </ul>
      </div>

      {!isActive && (
        <button className="mt-6 w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
          Upgrade Plan
        </button>
      )}
    </div>
  )
} 