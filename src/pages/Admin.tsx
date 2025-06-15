import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Layout, UserCog, Settings as SettingsIcon, LogOut, Circle, Users, Wrench, CreditCard, BarChart2, Home, X } from 'lucide-react';
import { SidebarBody, SidebarLink, Sidebar } from '../components/ui/sidebar';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

import LogoBranco from '../assets/logo-branco.png';
import LogoIconImage from '../assets/ico-branco.png';

const Logo = () => {
  return (
    <Link
      to="/"
      className="font-normal flex space-x-2 items-center text-sm text-black py-1 relative z-20"
    >
      <img src={LogoBranco} alt="" />
      <span className="font-medium text-black dark:text-white whitespace-pre opacity-100 transition-opacity duration-200">
        Clonup
      </span>
    </Link>
  );
};

const LogoIcon = () => {
  return (
    <Link
      to="/"
      className="font-normal flex space-x-2 items-center text-sm text-black py-1 relative z-20"
    >
      <img src={LogoIconImage} alt="" />
    </Link>
  );
};

interface Profile {
  id: string;
  email: string;
  created_at: string;
  full_name: string | null;
  role: string | null;
  subscription_status: 'active' | 'trialing' | 'past_due' | 'canceled' | 'unpaid' | null;
  plan_id: string | null;
  subscription_renewed_at: string | null;
}

interface DatabaseProfile {
  id: string;
  created_at: string;
  updated_at: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  subscription_status: 'active' | 'trialing' | 'past_due' | 'canceled' | 'unpaid' | null;
  plan_id: string | null;
  role: string | null;
  subscription_renewed_at: string | null;
}

interface MonthlyStats {
  month: string;
  newUsers: number;
  activeSubscriptions: number;
  revenue: number;
  churnRate: number;
  userGrowth: number;
  subscriptionGrowth: number;
  revenueGrowth: number;
}

interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  expiringUsers: number;
  planStats: {
    [key: string]: {
      total: number;
      active: number;
      name: string;
      price: number;
      activeRevenue: number;
      potentialRevenue: number;
      cost: number;
      profit: number;
      margin: number;
    };
  };
  revenue: {
    monthly: {
      active: number;
      potential: number;
      cost: number;
      profit: number;
      margin: number;
    };
    total: {
      active: number;
      potential: number;
      cost: number;
      profit: number;
      margin: number;
    };
  };
  kpis: {
    churnRate: number;
    activeRate: number;
    avgRevenuePerUser: number;
    avgProfitPerUser: number;
    conversionRate: number;
  };
  monthlyStats: MonthlyStats[];
}

interface Offer {
  id: string;
  title: string;
  offer_url: string;
  landing_page_url: string;
  description: string | null;
  user_id: string;
  created_at: string;
  updated_at: string;
  tags: string[];
  status: 'waiting' | 'testing' | 'approved' | 'invalid';
  metrics: Record<string, unknown>[];
}

interface ClonedQuiz {
  id: string;
  user_id: string;
  original_url: string;
  checkout_url: string;
  subdomain: string | null;
  url: string | null;
  created_at: string;
}

interface AnticloneSite {
  id: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  original_url: string;
  original_host: string;
  action_type: 'redirect';
  action_data: string;
}

interface UserResources {
  offers: Offer[];
  clonedQuiz: ClonedQuiz[];
  anticloneSites: AnticloneSite[];
}

interface Plan {
  id: string;
  name: string;
  price: number;
  max_libraries: number;
  max_clones: number;
  max_anticlone: number;
  max_cloaker_requests: number | null;
  features: string[];
  checkout_url: string;
  max_quizzes: number | null;
  quiz_extra_price: number | null;
}

// Add this interface after the other interfaces
interface DashboardFilters {
  status: string;
  plan: string;
  dateRange: string;
  search: string;
}

export function Admin() {
  const [open, setOpen] = useState(false);
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<Profile[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [userResources, setUserResources] = useState<UserResources>({
    offers: [],
    clonedQuiz: [],
    anticloneSites: [],
  });
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    activeUsers: 0,
    inactiveUsers: 0,
    expiringUsers: 0,
    planStats: {},
    revenue: {
      monthly: {
        active: 0,
        potential: 0,
        cost: 0,
        profit: 0,
        margin: 0,
      },
      total: {
        active: 0,
        potential: 0,
        cost: 0,
        profit: 0,
        margin: 0,
      },
    },
    kpis: {
      churnRate: 0,
      activeRate: 0,
      avgRevenuePerUser: 0,
      avgProfitPerUser: 0,
      conversionRate: 0,
    },
    monthlyStats: [],
  });
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Update filters state with proper type
  const [filters, setFilters] = useState<DashboardFilters>({
    status: '',
    plan: '',
    dateRange: '30',
    search: '',
  });

  const COST_PERCENTAGE = 0.08; // 8% de custo médio por usuário

  // Verifica se o usuário é admin
  useEffect(() => {
    if (!profile || profile.role !== 'admin') {
      navigate('/dashboard');
    }
  }, [profile, navigate]);

  const loadUserResources = async (userId: string) => {
    try {
      // Load offers
      const { data: offers } = await supabase
        .from('offers')
        .select('*')
        .eq('user_id', userId);

      // Load cloned quizzes
      const { data: quizzes } = await supabase
        .from('cloned_quiz')
        .select('*')
        .eq('user_id', userId);

      // Load anticlone sites
      const { data: anticlone } = await supabase
        .from('anticlone_sites')
        .select('*')
        .eq('user_id', userId);

      setUserResources({
        offers: offers || [],
        clonedQuiz: quizzes || [],
        anticloneSites: anticlone || [],
      });
    } catch (error) {
      console.error('Error loading user resources:', error);
    }
  };

  const handleEditUser = async (updates: Partial<Profile>) => {
    if (!selectedUser) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', selectedUser.id);

      if (error) throw error;

      // Refresh users list
      loadData();
      setEditModalOpen(false);
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  // Update getFilteredUsers function signature
  const getFilteredUsers = (users: Profile[], filters: DashboardFilters) => {
    return users.filter(user => {
      // Status filter
      if (filters.status && user.subscription_status !== filters.status) return false;

      // Plan filter
      if (filters.plan && user.plan_id !== filters.plan) return false;

      // Date range filter
      if (filters.dateRange) {
        const daysAgo = new Date();
        daysAgo.setDate(daysAgo.getDate() - parseInt(filters.dateRange));
        if (new Date(user.created_at) < daysAgo) return false;
      }

      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        return (
          user.email.toLowerCase().includes(searchLower) ||
          (user.full_name && user.full_name.toLowerCase().includes(searchLower))
        );
      }

      return true;
    });
  };

  const loadData = async () => {
    try {
      setLoading(true);
      console.log('Loading data...');

      // Load profiles and plans in parallel
      const [profilesResponse, plansResponse] = await Promise.all([
        supabase.from('profiles').select('*'),
        supabase.from('plans').select('*')
      ]);

      if (profilesResponse.error) {
        console.error('Error loading profiles:', profilesResponse.error);
        throw profilesResponse.error;
      }

      if (plansResponse.error) {
        console.error('Error loading plans:', plansResponse.error);
        throw plansResponse.error;
      }

      const profiles = profilesResponse.data;
      const plans = plansResponse.data;

      console.log('Loaded profiles:', profiles);
      console.log('Loaded plans:', plans);

      if (!profiles) {
        console.log('No profiles found');
        return;
      }

      setPlans(plans);

      const users = profiles.map((profile: DatabaseProfile) => ({
        id: profile.id,
        email: profile.email,
        created_at: profile.created_at,
        full_name: profile.full_name,
        role: profile.role,
        subscription_status: profile.subscription_status,
        plan_id: profile.plan_id,
        subscription_renewed_at: profile.subscription_renewed_at,
      }));

      console.log('Processed users:', users);

      setUsers(users);

      // Get filtered users for calculations
      const filteredUsers = getFilteredUsers(users, filters);
      console.log('Filtered users:', filteredUsers);

      // Calculate dashboard stats with filtered users
      const totalUsers = filteredUsers.length;
      const activeUsers = filteredUsers.filter((user) => user.subscription_status === 'active').length;
      const inactiveUsers = totalUsers - activeUsers;

      // Calculate expiring users (within next 7 days)
      const now = new Date();
      const sevenDaysFromNow = new Date();
      sevenDaysFromNow.setDate(now.getDate() + 7);

      const expiringUsers = filteredUsers.filter((user) => {
        if (!user.subscription_renewed_at) return false;
        const renewalDate = new Date(user.subscription_renewed_at);
        renewalDate.setMonth(renewalDate.getMonth() + 1); // Assuming monthly renewals
        return renewalDate <= sevenDaysFromNow && renewalDate >= now;
      }).length;

      // Initialize plan stats with all plans
      const planStats = plans.reduce((acc: DashboardStats['planStats'], plan) => {
        acc[plan.id] = {
          total: 0,
          active: 0,
          name: plan.name,
          price: plan.price,
          activeRevenue: 0,
          potentialRevenue: 0,
          cost: 0,
          profit: 0,
          margin: 0,
        };
        return acc;
      }, {});

      // Calculate plan stats and revenue using filtered users
      filteredUsers.forEach((user) => {
        if (user.plan_id) {
          const plan = plans.find(p => p.id === user.plan_id);
          if (plan) {
            planStats[user.plan_id].total += 1;

            if (user.subscription_status === 'active') {
              planStats[user.plan_id].active += 1;
              planStats[user.plan_id].activeRevenue += plan.price;

              // Calculate cost and profit for this plan
              const userCost = plan.price * COST_PERCENTAGE;
              planStats[user.plan_id].cost += userCost;
              planStats[user.plan_id].profit += (plan.price - userCost);
            }

            planStats[user.plan_id].potentialRevenue += plan.price;
          }
        }
      });

      // Calculate margins for each plan
      Object.values(planStats).forEach(plan => {
        plan.margin = plan.activeRevenue > 0 ? ((plan.profit / plan.activeRevenue) * 100) : 0;
      });

      // Calculate total revenue and costs
      const revenue = {
        monthly: {
          active: Object.values(planStats).reduce((total, plan) => total + plan.activeRevenue, 0),
          potential: Object.values(planStats).reduce((total, plan) => total + plan.potentialRevenue, 0),
          cost: Object.values(planStats).reduce((total, plan) => total + plan.cost, 0),
          profit: Object.values(planStats).reduce((total, plan) => total + plan.profit, 0),
          margin: 0,
        },
        total: {
          active: 0,
          potential: 0,
          cost: 0,
          profit: 0,
          margin: 0,
        },
      };

      // Calculate monthly margin
      revenue.monthly.margin = revenue.monthly.active > 0
        ? ((revenue.monthly.profit / revenue.monthly.active) * 100)
        : 0;

      // Calculate annual projections
      revenue.total.active = revenue.monthly.active * 12;
      revenue.total.potential = revenue.monthly.potential * 12;
      revenue.total.cost = revenue.monthly.cost * 12;
      revenue.total.profit = revenue.monthly.profit * 12;
      revenue.total.margin = revenue.monthly.margin;

      // Calculate additional KPIs with filtered data
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const recentUsers = filteredUsers.filter(user => new Date(user.created_at) >= thirtyDaysAgo);
      const recentCancellations = filteredUsers.filter(
        user => user.subscription_status === 'canceled' &&
          user.subscription_renewed_at &&
          new Date(user.subscription_renewed_at) >= thirtyDaysAgo
      );

      const kpis = {
        churnRate: activeUsers > 0 ? (recentCancellations.length / activeUsers) * 100 : 0,
        activeRate: totalUsers > 0 ? (activeUsers / totalUsers) * 100 : 0,
        avgRevenuePerUser: activeUsers > 0 ? revenue.monthly.active / activeUsers : 0,
        avgProfitPerUser: activeUsers > 0 ? revenue.monthly.profit / activeUsers : 0,
        conversionRate: recentUsers.length > 0
          ? (recentUsers.filter(u => u.subscription_status === 'active').length / recentUsers.length) * 100
          : 0,
      };

      // Calculate monthly stats for the last 12 months
      const last12Months = Array.from({ length: 12 }, (_, i) => {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        return date.toISOString().slice(0, 7); // Format: YYYY-MM
      }).reverse();

      // First step: Calculate basic monthly stats
      const basicMonthlyStats = last12Months.map(monthStr => {
        const [year, month] = monthStr.split('-');
        const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
        const endDate = new Date(parseInt(year), parseInt(month), 0);

        const monthUsers = filteredUsers.filter(user => {
          const createdAt = new Date(user.created_at);
          return createdAt >= startDate && createdAt <= endDate;
        });

        const activeInMonth = filteredUsers.filter(user => {
          const createdAt = new Date(user.created_at);
          return createdAt <= endDate && user.subscription_status === 'active';
        });

        const canceledInMonth = filteredUsers.filter(user => {
          if (!user.subscription_renewed_at) return false;
          const renewalDate = new Date(user.subscription_renewed_at);
          return renewalDate >= startDate &&
            renewalDate <= endDate &&
            user.subscription_status === 'canceled';
        });

        const monthRevenue = activeInMonth.reduce((total, user) => {
          const userPlan = plans.find(p => p.id === user.plan_id);
          return total + (userPlan?.price || 0);
        }, 0);

        return {
          month: new Date(startDate).toLocaleString('pt-BR', { month: 'short', year: 'numeric' }),
          newUsers: monthUsers.length,
          activeSubscriptions: activeInMonth.length,
          revenue: monthRevenue,
          churnRate: activeInMonth.length > 0 ? (canceledInMonth.length / activeInMonth.length) * 100 : 0,
          userGrowth: 0,
          subscriptionGrowth: 0,
          revenueGrowth: 0,
        };
      });

      // Second step: Calculate growth rates
      const monthlyStats = basicMonthlyStats.map((currentMonth, index) => {
        if (index === 0) return currentMonth;

        const prevMonth = basicMonthlyStats[index - 1];
        const userGrowth = prevMonth.newUsers > 0
          ? ((currentMonth.newUsers - prevMonth.newUsers) / prevMonth.newUsers) * 100
          : 0;
        const subscriptionGrowth = prevMonth.activeSubscriptions > 0
          ? ((currentMonth.activeSubscriptions - prevMonth.activeSubscriptions) / prevMonth.activeSubscriptions) * 100
          : 0;
        const revenueGrowth = prevMonth.revenue > 0
          ? ((currentMonth.revenue - prevMonth.revenue) / prevMonth.revenue) * 100
          : 0;

        return {
          ...currentMonth,
          userGrowth,
          subscriptionGrowth,
          revenueGrowth,
        };
      });

      const newStats = {
        totalUsers,
        activeUsers,
        inactiveUsers,
        expiringUsers,
        planStats,
        revenue,
        kpis,
        monthlyStats,
      };

      console.log('Calculated stats:', newStats);
      setStats(newStats);

    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Update useEffect to reload data when filters change
  useEffect(() => {
    loadData();
  }, [filters]);

  // Load data on mount
  useEffect(() => {
    loadData();
    // Check if dark mode is enabled
    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setIsDarkMode(isDark);
  }, []);

  // Filter users based on current filters
  const filteredUsers = users.filter(user => {
    if (filters.status && user.subscription_status !== filters.status) return false;
    if (filters.plan && user.plan_id !== filters.plan) return false;
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      return (
        user.email.toLowerCase().includes(searchLower) ||
        (user.full_name && user.full_name.toLowerCase().includes(searchLower))
      );
    }
    return true;
  });

  const links = [
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: (
        <Layout className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
    {
      label: "Ferramentas",
      href: "#",
      icon: <Wrench className="text-neutral-700 dark:text-neutral-200 h-5 w-5" />,
      subLinks: [
        { label: "Criptografar Texto", href: "/tools/encrypt", icon: <Circle className="h-4 w-4" /> },
        { label: "Remover Metadados", href: "/tools/removemetadados", icon: <Circle className="h-4 w-4" /> },
        { label: "Anticlone", href: "/tools/anticlone", icon: <Circle className="h-4 w-4" /> },
        { label: "Clonar Sites", href: "/tools/clonesites", icon: <Circle className="h-4 w-4" /> },
        { label: "Clonar Quiz", href: "/tools/clonequiz", icon: <Circle className="h-4 w-4" /> },
      ],
    },
    {
      label: "Profile",
      href: "/profile",
      icon: (
        <UserCog className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
    {
      label: "Settings",
      href: "/settings",
      icon: (
        <SettingsIcon className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
    {
      label: "Logout",
      href: "#",
      icon: (
        <LogOut className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
  ];

  const EvolutionCharts = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-white">Evolução Mensal</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-80">
            <h4 className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Usuários e Assinaturas</h4>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.monthlyStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis
                  dataKey="month"
                  stroke="#9CA3AF"
                  tick={{ fill: '#9CA3AF' }}
                />
                <YAxis
                  stroke="#9CA3AF"
                  tick={{ fill: '#9CA3AF' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#F3F4F6'
                  }}
                  itemStyle={{ color: '#F3F4F6' }}
                  labelStyle={{ color: '#F3F4F6' }}
                />
                <Legend
                  wrapperStyle={{ color: '#9CA3AF' }}
                />
                <Line
                  type="monotone"
                  dataKey="newUsers"
                  name="Novos Usuários"
                  stroke="#3b82f6"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="activeSubscriptions"
                  name="Assinaturas Ativas"
                  stroke="#10b981"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="h-80">
            <h4 className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Crescimento Mensal (%)</h4>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.monthlyStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis
                  dataKey="month"
                  stroke="#9CA3AF"
                  tick={{ fill: '#9CA3AF' }}
                />
                <YAxis
                  stroke="#9CA3AF"
                  tick={{ fill: '#9CA3AF' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#F3F4F6'
                  }}
                  itemStyle={{ color: '#F3F4F6' }}
                  labelStyle={{ color: '#F3F4F6' }}
                  formatter={(value: number) => `${value > 0 ? '+' : ''}${value.toFixed(1)}%`}
                />
                <Legend
                  wrapperStyle={{ color: '#9CA3AF' }}
                />
                <Line
                  type="monotone"
                  dataKey="userGrowth"
                  name="Crescimento de Usuários"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="subscriptionGrowth"
                  name="Crescimento de Assinaturas"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="h-80">
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Receita Mensal (R$)</h4>
              {stats.monthlyStats.length > 1 && (
                <div>
                  <span className="text-gray-500 dark:text-gray-400 mr-2">Crescimento:</span>
                  <span className={`text-sm ${stats.monthlyStats[stats.monthlyStats.length - 1].revenueGrowth >= 0
                    ? 'text-green-500'
                    : 'text-red-500'}`}>
                    {stats.monthlyStats[stats.monthlyStats.length - 1].revenueGrowth > 0 ? '+' : ''}
                    {stats.monthlyStats[stats.monthlyStats.length - 1].revenueGrowth.toFixed(1)}%
                  </span>
                </div>
              )}
            </div>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.monthlyStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis
                  dataKey="month"
                  stroke="#9CA3AF"
                  tick={{ fill: '#9CA3AF' }}
                />
                <YAxis
                  stroke="#9CA3AF"
                  tick={{ fill: '#9CA3AF' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#F3F4F6'
                  }}
                  itemStyle={{ color: '#F3F4F6' }}
                  labelStyle={{ color: '#F3F4F6' }}
                  formatter={(value: number, name: string) => {
                    if (name === 'Crescimento') {
                      return [`${value > 0 ? '+' : ''}${value.toFixed(1)}%`, name];
                    }
                    return [`R$ ${Number(value).toLocaleString('pt-BR')}`, name];
                  }}
                />
                <Legend
                  wrapperStyle={{ color: '#9CA3AF' }}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  name="Receita"
                  stroke="#6366f1"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="revenueGrowth"
                  name="Crescimento"
                  stroke="#ec4899"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="h-80">
            <h4 className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Taxa de Churn (%)</h4>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.monthlyStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis
                  dataKey="month"
                  stroke="#9CA3AF"
                  tick={{ fill: '#9CA3AF' }}
                />
                <YAxis
                  stroke="#9CA3AF"
                  tick={{ fill: '#9CA3AF' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#F3F4F6'
                  }}
                  itemStyle={{ color: '#F3F4F6' }}
                  labelStyle={{ color: '#F3F4F6' }}
                  formatter={(value) => `${Number(value).toFixed(1)}%`}
                />
                <Legend
                  wrapperStyle={{ color: '#9CA3AF' }}
                />
                <Line
                  type="monotone"
                  dataKey="churnRate"
                  name="Churn Rate"
                  stroke="#ef4444"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      <Sidebar open={open} setOpen={setOpen}>
        <SidebarBody className={`w-64 ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'} border-r h-screen fixed left-0 top-0`}>
          <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
            {open ? <Logo /> : <LogoIcon />}
            <div className="mt-8 flex flex-col gap-2">
              {links.map((link, idx) => (
                <SidebarLink key={idx} link={link} />
              ))}
            </div>
          </div>
          <div>
            <SidebarLink
              link={{
                label: profile?.full_name || user?.email || 'Usuário',
                href: "/profile",
                icon: (
                  <img
                    src={profile?.avatar_url || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(profile?.full_name || user?.email || 'U')}
                    className="h-7 w-7 flex-shrink-0 rounded-full"
                    alt="Avatar"
                  />
                ),
              }}
            />
          </div>
        </SidebarBody>
      </Sidebar>

      <main className={`${open ? 'pl-72' : 'pl-24'} transition-all duration-300 p-8`}>
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Painel Administrativo
            </h1>
          </div>

          <div className="mb-6">
            <div className="flex space-x-4">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 ${activeTab === 'dashboard'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                  }`}
              >
                <Home className="h-5 w-5" />
                Dashboard
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 ${activeTab === 'users'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                  }`}
              >
                <Users className="h-5 w-5" />
                Usuários
              </button>
              {/* <button
                onClick={() => setActiveTab('financial')}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 ${activeTab === 'financial'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                  }`}
              >
                <CreditCard className="h-5 w-5" />
                Financeiro
              </button> */}
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : activeTab === 'dashboard' ? (
            <div className="space-y-8">
              {/* Filters */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Status
                    </label>
                    <select
                      value={filters.status}
                      onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    >
                      <option value="">Todos</option>
                      <option value="active">Ativo</option>
                      <option value="trialing">Em avaliação</option>
                      <option value="past_due">Pagamento em atraso</option>
                      <option value="canceled">Cancelado</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Plano
                    </label>
                    <select
                      value={filters.plan}
                      onChange={(e) => setFilters({ ...filters, plan: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    >
                      <option value="">Todos</option>
                      {plans.map(plan => (
                        <option key={plan.id} value={plan.id}>{plan.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Período
                    </label>
                    <select
                      value={filters.dateRange}
                      onChange={(e) => setFilters({ ...filters, dateRange: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    >
                      <option value="">Total</option>
                      <option value="7">Últimos 7 dias</option>
                      <option value="30">Últimos 30 dias</option>
                      <option value="90">Últimos 90 dias</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Buscar
                    </label>
                    <input
                      type="text"
                      value={filters.search}
                      onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                      placeholder="Buscar por nome ou email"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Revenue Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Receita Mensal</p>
                      <div className="space-y-2">
                        <div>
                          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                            R$ {stats.revenue.monthly.active.toLocaleString('pt-BR')}
                          </h3>
                          <p className="text-sm text-gray-500">Receita Atual (usuários ativos)</p>
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400">
                            R$ {stats.revenue.monthly.potential.toLocaleString('pt-BR')}
                          </h3>
                          <p className="text-sm text-gray-500">Receita Potencial (todos os usuários)</p>
                        </div>
                        <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                          <p className="text-sm text-red-500">
                            Custo: R$ {stats.revenue.monthly.cost.toLocaleString('pt-BR')}
                          </p>
                          <p className="text-sm text-green-500">
                            Lucro: R$ {stats.revenue.monthly.profit.toLocaleString('pt-BR')}
                          </p>
                          <p className="text-sm text-blue-500">
                            Margem: {stats.revenue.monthly.margin.toFixed(1)}%
                          </p>
                        </div>
                      </div>
                    </div>
                    <CreditCard className="h-8 w-8 text-blue-600" />
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Métricas por Usuário</p>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                        R$ {stats.kpis.avgRevenuePerUser.toFixed(2)}
                      </h3>
                      <div className="mt-1 space-y-1">
                        <p className="text-sm text-gray-500">Receita Média</p>
                        <p className="text-sm text-green-500">
                          Lucro Médio: R$ {stats.kpis.avgProfitPerUser.toFixed(2)}
                        </p>
                      </div>
                    </div>
                    <Users className="h-8 w-8 text-blue-600" />
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Taxas de Conversão</p>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {stats.kpis.activeRate.toFixed(1)}%
                      </h3>
                      <div className="mt-1 space-y-1">
                        <p className="text-sm text-gray-500">
                          Taxa de Ativos
                        </p>
                        <p className="text-sm text-green-500">
                          Conversão: {stats.kpis.conversionRate.toFixed(1)}%
                        </p>
                        <p className="text-sm text-red-500">
                          Churn: {stats.kpis.churnRate.toFixed(1)}%
                        </p>
                      </div>
                    </div>
                    <BarChart2 className="h-8 w-8 text-blue-600" />
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Usuários</p>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {stats.activeUsers} ativos
                      </h3>
                      <div className="mt-1 space-y-1">
                        <p className="text-sm text-gray-500">
                          Total: {stats.totalUsers}
                        </p>
                        <p className="text-sm text-yellow-500">
                          Expirando: {stats.expiringUsers}
                        </p>
                      </div>
                    </div>
                    <Users className="h-8 w-8 text-blue-600" />
                  </div>
                </div>
              </div>

              {/* Plan Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                  <h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-white">Planos Ativos</h3>
                  <div className="space-y-4">
                    {Object.entries(stats.planStats).map(([planId, planData]) => (
                      <div key={planId} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600 dark:text-gray-300">{planData.name}</span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {planData.active} ativos / {planData.total} total
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">Receita Atual</span>
                            <p className="text-gray-900 dark:text-white">
                              R$ {planData.activeRevenue.toLocaleString('pt-BR')}
                            </p>
                            <span className="text-gray-500 dark:text-gray-400">Receita Potencial</span>
                            <p className="text-gray-600 dark:text-gray-400">
                              R$ {planData.potentialRevenue.toLocaleString('pt-BR')}
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">Lucro</span>
                            <p className="text-green-500">
                              R$ {planData.profit.toLocaleString('pt-BR')}
                            </p>
                            <span className="text-gray-500 dark:text-gray-400">Margem</span>
                            <p className="text-blue-500">
                              {planData.margin.toFixed(1)}%
                            </p>
                          </div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                          <div
                            className="bg-blue-600 h-2.5 rounded-full"
                            style={{ width: `${(planData.active / planData.total) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                  <h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-white">KPIs Detalhados</h3>
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-md font-medium mb-2 text-gray-700 dark:text-gray-300">Métricas de Receita</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Receita Mensal</p>
                          <p className="text-lg font-medium text-gray-900 dark:text-white">
                            R$ {stats.revenue.monthly.active.toLocaleString('pt-BR')}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Lucro Mensal</p>
                          <p className="text-lg font-medium text-green-500">
                            R$ {stats.revenue.monthly.profit.toLocaleString('pt-BR')}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-md font-medium mb-2 text-gray-700 dark:text-gray-300">Métricas de Usuário</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Receita/Usuário</p>
                          <p className="text-lg font-medium text-gray-900 dark:text-white">
                            R$ {stats.kpis.avgRevenuePerUser.toFixed(2)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Lucro/Usuário</p>
                          <p className="text-lg font-medium text-green-500">
                            R$ {stats.kpis.avgProfitPerUser.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-md font-medium mb-2 text-gray-700 dark:text-gray-300">Taxas de Conversão</h4>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Taxa de Ativos</p>
                          <p className="text-lg font-medium text-blue-500">
                            {stats.kpis.activeRate.toFixed(1)}%
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Conversão</p>
                          <p className="text-lg font-medium text-green-500">
                            {stats.kpis.conversionRate.toFixed(1)}%
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Churn Rate</p>
                          <p className="text-lg font-medium text-red-500">
                            {stats.kpis.churnRate.toFixed(1)}%
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Evolution Charts */}
              <EvolutionCharts />
            </div>
          ) : activeTab === 'users' ? (
            <div className="space-y-4">
              {/* User Filters */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Status
                    </label>
                    <select
                      value={filters.status}
                      onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    >
                      <option value="">Todos</option>
                      <option value="active">Ativo</option>
                      <option value="trialing">Em avaliação</option>
                      <option value="past_due">Pagamento em atraso</option>
                      <option value="canceled">Cancelado</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Plano
                    </label>
                    <select
                      value={filters.plan}
                      onChange={(e) => setFilters({ ...filters, plan: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    >
                      <option value="">Todos</option>
                      {plans.map(plan => (
                        <option key={plan.id} value={plan.id}>{plan.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Buscar
                    </label>
                    <input
                      type="text"
                      value={filters.search}
                      onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                      placeholder="Buscar por nome ou email"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Users Table */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-900">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Usuário
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Função
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Plano
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Renovação
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Ações
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {filteredUsers.map((user) => (
                        <tr key={user.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {user.full_name || 'N/A'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500 dark:text-gray-300">{user.email}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.role === 'admin'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                              }`}>
                              {user.role || 'user'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.subscription_status === 'active'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                              }`}>
                              {user.subscription_status || 'Sem plano'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm text-gray-500 dark:text-gray-300">
                              {plans.find(p => p.id === user.plan_id)?.name || 'N/A'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                            {user.subscription_renewed_at
                              ? new Date(user.subscription_renewed_at).toLocaleDateString()
                              : 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                            <button
                              onClick={() => {
                                setSelectedUser(user);
                                loadUserResources(user.id);
                                setEditModalOpen(true);
                              }}
                              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                            >
                              Editar
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h2 className={`text-lg font-semibold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Relatório Financeiro
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-white">Receita por Plano</h3>
                    <div className="space-y-4">
                      {Object.entries(stats.planStats).map(([planId, planData]) => (
                        <div key={planId} className="flex justify-between items-center">
                          <span className="text-gray-600 dark:text-gray-300">{planData.name}</span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {planData.active} ativos / {planData.total} total
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-white">Métricas Financeiras</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 dark:text-gray-300">Receita Mensal</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          R$ {stats.revenue.monthly.active.toLocaleString('pt-BR')}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 dark:text-gray-300">Receita Anual Projetada</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          R$ {stats.revenue.total.active.toLocaleString('pt-BR')}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 dark:text-gray-300">Média por Usuário</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          R$ {(stats.activeUsers ? stats.revenue.monthly.active / stats.activeUsers : 0).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Edit User Modal */}
      {editModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold dark:text-white">
                  Editar Usuário: {selectedUser.full_name || selectedUser.email}
                </h2>
                <button
                  onClick={() => setEditModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* User Information */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Nome Completo
                    </label>
                    <input
                      type="text"
                      value={selectedUser.full_name || ''}
                      onChange={(e) => setSelectedUser({ ...selectedUser, full_name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Função
                    </label>
                    <select
                      value={selectedUser.role || 'user'}
                      onChange={(e) => setSelectedUser({ ...selectedUser, role: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    >
                      <option value="user">Usuário</option>
                      <option value="admin">Administrador</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Status da Assinatura
                    </label>
                    <select
                      value={selectedUser.subscription_status || ''}
                      onChange={(e) =>
                        setSelectedUser({
                          ...selectedUser,
                          subscription_status: e.target.value as Profile['subscription_status']
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    >
                      <option value="">Sem plano</option>
                      <option value="active">Ativa</option>
                      <option value="trialing">Em avaliação</option>
                      <option value="past_due">Pagamento em atraso</option>
                      <option value="canceled">Cancelada</option>
                      <option value="unpaid">Não paga</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Plano
                    </label>
                    <select
                      value={selectedUser.plan_id || ''}
                      onChange={(e) => setSelectedUser({ ...selectedUser, plan_id: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    >
                      <option value="">Sem plano</option>
                      {plans.map(plan => (
                        <option key={plan.id} value={plan.id}>
                          {plan.name} - R$ {plan.price.toLocaleString('pt-BR')}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Data de Renovação
                    </label>
                    <input
                      type="date"
                      value={
                        selectedUser.subscription_renewed_at
                          ? new Date(selectedUser.subscription_renewed_at).toISOString().split('T')[0]
                          : ''
                      }
                      onChange={(e) =>
                        setSelectedUser({
                          ...selectedUser,
                          subscription_renewed_at: e.target.value
                            ? new Date(e.target.value).toISOString()
                            : null,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                </div>

                {/* User Resources */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium dark:text-white">Recursos do Usuário</h3>

                  <div>
                    <h4 className="text-md font-medium dark:text-white mb-2">Offers ({userResources.offers.length})</h4>
                    <div className="max-h-40 overflow-y-auto">
                      {userResources.offers.map((offer) => (
                        <div
                          key={offer.id}
                          className="p-2 border-b dark:border-gray-700 text-sm dark:text-gray-300"
                        >
                          {offer.title}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-md font-medium dark:text-white mb-2">
                      Quizzes Clonados ({userResources.clonedQuiz.length})
                    </h4>
                    <div className="max-h-40 overflow-y-auto">
                      {userResources.clonedQuiz.map((quiz) => (
                        <div
                          key={quiz.id}
                          className="p-2 border-b dark:border-gray-700 text-sm dark:text-gray-300"
                        >
                          {quiz.original_url}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-md font-medium dark:text-white mb-2">
                      Sites Anticlone ({userResources.anticloneSites.length})
                    </h4>
                    <div className="max-h-40 overflow-y-auto">
                      {userResources.anticloneSites.map((site) => (
                        <div
                          key={site.id}
                          className="p-2 border-b dark:border-gray-700 text-sm dark:text-gray-300"
                        >
                          {site.original_url}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setEditModalOpen(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => handleEditUser(selectedUser)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Salvar Alterações
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 