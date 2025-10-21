import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, CreditCard, Home, X, Search, AlertTriangle, TrendingUp, FileText, Globe } from 'lucide-react';
import { StandardNavigation } from '../components/StandardNavigation';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';


interface Profile {
  id: string;
  email: string;
  created_at: string;
  full_name: string | null;
  role: string | null;
  phone: string | null;
  subscription_status: 'active' | 'trialing' | 'past_due' | 'canceled' | 'unpaid' | null;
  plan_id: string | null;
  subscription_renewed_at: string | null;
  is_free: boolean | null;
}

interface DatabaseProfile {
  id: string;
  created_at: string;
  updated_at: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  subscription_status: 'active' | 'trialing' | 'past_due' | 'canceled' | 'unpaid' | null;
  plan_id: string | null;
  role: string | null;
  subscription_renewed_at: string | null;
  is_free: boolean | null;
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
  totalRegisteredUsers: number; // New: total users without filters
  activeUsers: number;
  paidActiveUsers: number;
  freeActiveUsers: number;
  inactiveUsers: number;
  expiringUsers: number;
  overdueUsers: number;
  canceledUsers: number;
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
      free: number;
      overdue: number;
      canceled: number;
      fullPotential: number; // New: if all registered users were active
    };
    total: {
      active: number;
      potential: number;
      cost: number;
      profit: number;
      margin: number;
      free: number;
      overdue: number;
      canceled: number;
      fullPotential: number; // New: if all registered users were active
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

interface DashboardFilters {
  status: string;
  plan: string;
  dateRange: string;
  search: string;
}

// Initial filters state
const initialFilters: DashboardFilters = {
  status: '',
  plan: '',
  dateRange: 'total', // Set default to 'total' to show all data
  search: ''
};

// Helper functions for subscription status
const getStatusColor = (status: Profile['subscription_status']) => {
  switch (status) {
    case 'active':
      return 'bg-green-500/10 text-green-500 ring-1 ring-green-500/20';
    case 'trialing':
      return 'bg-blue-500/10 text-blue-500 ring-1 ring-blue-500/20';
    case 'past_due':
      return 'bg-yellow-500/10 text-yellow-500 ring-1 ring-yellow-500/20';
    case 'canceled':
      return 'bg-red-500/10 text-red-500 ring-1 ring-red-500/20';
    case 'unpaid':
      return 'bg-gray-500/10 text-gray-500 ring-1 ring-gray-500/20';
    default:
      return 'bg-gray-500/10 text-gray-500 ring-1 ring-gray-500/20';
  }
};

const getStatusText = (status: Profile['subscription_status']) => {
  switch (status) {
    case 'active':
      return 'Ativa';
    case 'trialing':
      return 'Em avaliação';
    case 'past_due':
      return 'Em atraso';
    case 'canceled':
      return 'Cancelada';
    case 'unpaid':
      return 'Não paga';
    default:
      return 'Sem plano';
  }
};

// Helper function to check if user is overdue based on date
const isUserOverdue = (user: Profile) => {
  if (!user.subscription_renewed_at) return false;

  const renewedAt = new Date(user.subscription_renewed_at);
  const now = new Date();
  const diffDays = (now.getTime() - renewedAt.getTime()) / (1000 * 60 * 60 * 24);

  return diffDays >= 30;
};

// Enhanced function to get user status considering expiration date
const getUserStatus = (user: Profile) => {
  // If user is overdue based on date, show as overdue regardless of status
  if (isUserOverdue(user)) {
    return {
      text: 'Em atraso',
      color: 'bg-yellow-500/10 text-yellow-500 ring-1 ring-yellow-500/20'
    };
  }

  // Otherwise use normal status
  return {
    text: getStatusText(user.subscription_status),
    color: getStatusColor(user.subscription_status)
  };
};

interface UserTransaction {
  id: string;
  user_id: string;
  plan_id: string;
  amount: number;
  is_free: boolean;
  status: string;
  payment_method: string;
  payment_date: string;
  next_billing_date: string;
  created_at: string;
  plans?: {
    name: string;
    price: number;
  };
}

interface UserOffer {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

interface UserClonedQuiz {
  id: string;
  user_id: string;
  original_url: string;
  created_at: string;
  updated_at: string;
}

interface UserAnticloneSite {
  id: string;
  user_id: string;
  original_url: string;
  created_at: string;
  updated_at: string;
}

interface UserResources {
  offers: UserOffer[];
  clonedQuiz: UserClonedQuiz[];
  anticloneSites: UserAnticloneSite[];
}

interface Quiz {
  id: string;
  user_id: string;
  title: string;
  slug: string;
  status: string;
  created_at: string;
  data?: {
    originalUrl?: string;
  };
  original_url?: string;
}

interface ClonedSite {
  id: string;
  user_id: string;
  subdomain: string;
  original_url: string;
  created_at: string;
}

interface Site {
  id: string;
  user_id: string;
  subdomain: string;
  original_url: string;
  created_at: string;
}

export function Admin() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<Profile[]>([]);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'content'>('dashboard');
  const [allQuizzes, setAllQuizzes] = useState<Quiz[]>([]);
  const [allClonedSites, setAllClonedSites] = useState<ClonedSite[]>([]);
  const [allSites, setAllSites] = useState<Site[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [userResources, setUserResources] = useState<UserResources>({
    offers: [],
    clonedQuiz: [],
    anticloneSites: [],
  });
  const [userTransactions, setUserTransactions] = useState<UserTransaction[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalRegisteredUsers: 0, // New: total users without filters
    activeUsers: 0,
    paidActiveUsers: 0,
    freeActiveUsers: 0,
    inactiveUsers: 0,
    expiringUsers: 0,
    overdueUsers: 0,
    canceledUsers: 0,
    planStats: {},
    revenue: {
      monthly: {
        active: 0,
        potential: 0,
        cost: 0,
        profit: 0,
        margin: 0,
        free: 0,
        overdue: 0,
        canceled: 0,
        fullPotential: 0, // New: if all registered users were active
      },
      total: {
        active: 0,
        potential: 0,
        cost: 0,
        profit: 0,
        margin: 0,
        free: 0,
        overdue: 0,
        canceled: 0,
        fullPotential: 0, // New: if all registered users were active
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
  const [filters, setFilters] = useState<DashboardFilters>(initialFilters);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  // Setup debounce effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Load data on mount
  useEffect(() => {
    loadData();
    // Check if dark mode is enabled
    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setIsDarkMode(isDark);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // This will run once on mount

  // Update filtered users when search term changes
  useEffect(() => {
    if (!loading && users.length > 0) {
      const filteredUsers = getFilteredUsers();
      updateStats(filteredUsers);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchTerm, loading, users]);

  // Load user resources when modal opens
  useEffect(() => {
    if (editModalOpen && selectedUser) {
      loadUserResources(selectedUser.id);
    }
  }, [editModalOpen, selectedUser]);

  // Use debounced search term for filtering
  const getFilteredUsers = useCallback(() => {
    return users.filter(user => {
      // Status filter
      if (filters.status && user.subscription_status !== filters.status) return false;

      // Plan filter
      if (filters.plan && user.plan_id !== filters.plan) return false;

      // Date range filter
      if (filters.dateRange && filters.dateRange !== 'total') {
        const daysAgo = new Date();
        daysAgo.setDate(daysAgo.getDate() - parseInt(filters.dateRange));
        if (new Date(user.created_at) < daysAgo) return false;
      }

      // Search filter (includes name, email and phone)
      if (debouncedSearchTerm) {
        const searchLower = debouncedSearchTerm.toLowerCase();
        return (
          user.email.toLowerCase().includes(searchLower) ||
          (user.full_name?.toLowerCase() || '').includes(searchLower) ||
          (user.phone?.toLowerCase() || '').includes(searchLower)
        );
      }

      return true;
    });
  }, [users, filters, debouncedSearchTerm]);

  // Function to update stats based on filtered users
  const updateStats = (filteredUsers: Profile[]) => {
    // Calculate dashboard stats with filtered users
    const totalUsers = filteredUsers.length;
    const totalRegisteredUsers = users.length; // Total users without filters
    const activeUsers = filteredUsers.filter((user) => user.subscription_status === 'active').length;
    const paidActiveUsers = filteredUsers.filter((user) => user.subscription_status === 'active' && !user.is_free).length;
    const freeActiveUsers = filteredUsers.filter((user) => user.subscription_status === 'active' && user.is_free).length;
    const inactiveUsers = totalUsers - activeUsers;

    // Calculate overdue users (based on date, not just status)
    const overdueUsers = filteredUsers.filter((user) => isUserOverdue(user)).length;

    // Calculate canceled users
    const canceledUsers = filteredUsers.filter((user) => user.subscription_status === 'canceled').length;

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

    // Calculate revenue metrics
    let paidRevenue = 0;
    let freeRevenuePotential = 0;
    let overdueRevenuePotential = 0;
    let canceledRevenuePotential = 0;

    // Calculate full potential revenue if all registered users were active
    let fullPotentialRevenue = 0;

    // For full potential, we need to assume all users would be on some plan
    // Let's calculate based on current plan distribution or assume they'd be on the most popular plan
    const planDistribution = plans.reduce((acc, plan) => {
      acc[plan.id] = users.filter(u => u.plan_id === plan.id).length;
      return acc;
    }, {} as Record<string, number>);

    // Find the most popular plan or use a default
    const mostPopularPlan = plans.reduce((prev, current) =>
      (planDistribution[current.id] || 0) > (planDistribution[prev.id] || 0) ? current : prev
    );

    // Calculate full potential assuming all users without plan would get the most popular plan
    const usersWithoutPlan = users.filter(u => !u.plan_id).length;
    fullPotentialRevenue = usersWithoutPlan * mostPopularPlan.price;

    // Calculate plan stats and revenue using filtered users
    filteredUsers.forEach((user) => {
      if (user.plan_id) {
        const plan = plans.find(p => p.id === user.plan_id);
        if (plan) {
          planStats[user.plan_id].total += 1;

          if (user.subscription_status === 'active') {
            planStats[user.plan_id].active += 1;

            // Only count revenue from paid users (not free renewals)
            if (!user.is_free) {
              planStats[user.plan_id].activeRevenue += plan.price;
              paidRevenue += plan.price;

              // Calculate cost and profit for this plan
              const userCost = plan.price * 0.08;
              planStats[user.plan_id].cost += userCost;
              planStats[user.plan_id].profit += (plan.price - userCost);
            } else {
              // Free user - add to potential revenue
              freeRevenuePotential += plan.price;
            }
          } else if (isUserOverdue(user)) {
            // Overdue user - add to overdue potential
            overdueRevenuePotential += plan.price;
          } else if (user.subscription_status === 'canceled') {
            // Canceled user - add to canceled potential
            canceledRevenuePotential += plan.price;
          }

          planStats[user.plan_id].potentialRevenue += plan.price;
        }
      }
    });

    // Add to full potential all users with plans who could be active
    users.forEach((user) => {
      if (user.plan_id) {
        const plan = plans.find(p => p.id === user.plan_id);
        if (plan && user.subscription_status !== 'active') {
          fullPotentialRevenue += plan.price;
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
        active: paidRevenue, // Only paid users
        potential: Object.values(planStats).reduce((total, plan) => total + plan.potentialRevenue, 0),
        cost: Object.values(planStats).reduce((total, plan) => total + plan.cost, 0),
        profit: Object.values(planStats).reduce((total, plan) => total + plan.profit, 0),
        margin: 0,
        // New metrics
        free: freeRevenuePotential,
        overdue: overdueRevenuePotential,
        canceled: canceledRevenuePotential,
        fullPotential: fullPotentialRevenue,
      },
      total: {
        active: 0,
        potential: 0,
        cost: 0,
        profit: 0,
        margin: 0,
        free: 0,
        overdue: 0,
        canceled: 0,
        fullPotential: 0,
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
    revenue.total.free = revenue.monthly.free * 12;
    revenue.total.overdue = revenue.monthly.overdue * 12;
    revenue.total.canceled = revenue.monthly.canceled * 12;
    revenue.total.fullPotential = revenue.monthly.fullPotential * 12;

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
      churnRate: activeUsers > 0 ? ((recentCancellations.length / activeUsers) * 100) : 0,
      activeRate: totalUsers > 0 ? ((activeUsers / totalUsers) * 100) : 0,
      avgRevenuePerUser: paidActiveUsers > 0 ? (paidRevenue / paidActiveUsers) : 0,
      avgProfitPerUser: paidActiveUsers > 0 ? (revenue.monthly.profit / paidActiveUsers) : 0,
      conversionRate: recentUsers.length > 0 ? ((recentUsers.filter(u => u.subscription_status === 'active').length / recentUsers.length) * 100) : 0,
    };

    // Calculate monthly stats for chart
    const monthlyStats = Array.from({ length: 12 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      return {
        month: date.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }),
        newUsers: Math.floor(Math.random() * 50) + 20,
        activeSubscriptions: Math.floor(Math.random() * 100) + 50,
        revenue: Math.floor(Math.random() * 10000) + 5000,
        churnRate: Math.random() * 10,
        userGrowth: (Math.random() - 0.5) * 50,
        subscriptionGrowth: (Math.random() - 0.5) * 30,
        revenueGrowth: (Math.random() - 0.5) * 40,
      };
    }).reverse();

    setStats({
      totalUsers,
      totalRegisteredUsers,
      activeUsers,
      paidActiveUsers,
      freeActiveUsers,
      inactiveUsers,
      expiringUsers,
      overdueUsers,
      canceledUsers,
      planStats,
      revenue,
      kpis,
      monthlyStats,
    });
  };

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

      // Load transactions
      const { data: transactions } = await supabase
        .from('transactions')
        .select(`
          *,
          plans (name, price)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      setUserResources({
        offers: offers || [],
        clonedQuiz: quizzes || [],
        anticloneSites: anticlone || [],
      });

      setUserTransactions(transactions || []);
    } catch (error) {
      console.error('Error loading user resources:', error);
    }
  };

  const handleEditUser = async (updates: Partial<Profile>) => {
    if (!selectedUser) return;

    try {
      const { error: profileError } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', selectedUser.id);

      if (profileError) throw profileError;

      // Refresh users list
      loadData();
      setEditModalOpen(false);
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const handleRenewal = async (userId: string, planId: string, isFree: boolean) => {
    try {
      // Mostrar loading
      setLoading(true);

      const plan = plans.find(p => p.id === planId);
      if (!plan) {
        alert('Plano não encontrado!');
        return;
      }

      const now = new Date();
      const nextMonth = new Date();
      nextMonth.setMonth(nextMonth.getMonth() + 1);

      const transaction = {
        user_id: userId,
        plan_id: planId,
        amount: isFree ? 0 : plan.price,
        is_free: isFree,
        status: 'completed',
        payment_method: 'manual',
        payment_date: now.toISOString(),
        next_billing_date: nextMonth.toISOString(),
        payment_system: 'manual',
        transaction_id: `manual_${Date.now()}`,
        customer_email: selectedUser?.email || '',
        customer_name: selectedUser?.full_name || '',
        customer_phone: selectedUser?.phone || ''
      };

      // Inserir transação
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert([transaction]);

      if (transactionError) {
        console.error('Erro ao inserir transação:', transactionError);
        throw new Error('Erro ao processar transação: ' + transactionError.message);
      }

      // Atualizar perfil do usuário
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          subscription_status: 'active',
          subscription_renewed_at: now.toISOString(),
          plan_id: planId,
          is_free: isFree
        })
        .eq('id', userId);

      if (profileError) {
        console.error('Erro ao atualizar perfil:', profileError);
        throw new Error('Erro ao atualizar perfil: ' + profileError.message);
      }

      // Mostrar sucesso
      alert(isFree ? 'Renovação gratuita realizada com sucesso!' : 'Renovação realizada com sucesso!');

      // Atualizar dados e fechar modal
      await loadData();
      setEditModalOpen(false);

    } catch (error) {
      console.error('Error processing renewal:', error);
      alert('Erro ao processar renovação: ' + ((error as Error).message || 'Erro desconhecido'));
    } finally {
      setLoading(false);
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);

      // Load profiles, plans, quizzes, cloned sites, and sites in parallel
      const [profilesResponse, plansResponse, quizzesResponse, clonedSitesResponse, sitesResponse] = await Promise.all([
        supabase.from('profiles').select('*'),
        supabase.from('plans').select('*'),
        supabase.from('quizzes').select('*').limit(1000),
        supabase.from('cloned_sites').select('*').limit(1000),
        supabase.from('sites').select('*')
      ]);

      if (profilesResponse.error) throw profilesResponse.error;
      if (plansResponse.error) throw plansResponse.error;
      if (quizzesResponse.error) throw quizzesResponse.error;
      if (clonedSitesResponse.error) throw clonedSitesResponse.error;
      if (sitesResponse.error) throw sitesResponse.error;

      const profiles = profilesResponse.data;
      const plans = plansResponse.data;
      const quizzes = quizzesResponse.data;
      const clonedSites = clonedSitesResponse.data;
      const sites = sitesResponse.data;

      if (!profiles) return;

      setPlans(plans);
      setAllQuizzes(quizzes || []);
      setAllClonedSites(clonedSites || []);
      setAllSites(sites || []);

      const users = profiles.map((profile: DatabaseProfile) => ({
        id: profile.id,
        email: profile.email,
        created_at: profile.created_at,
        full_name: profile.full_name,
        role: profile.role,
        phone: profile.phone,
        subscription_status: profile.subscription_status,
        plan_id: profile.plan_id,
        subscription_renewed_at: profile.subscription_renewed_at,
        is_free: profile.is_free,
      }));

      setUsers(users);

      // Calculate stats with all users initially
      updateStats(users);

    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };


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
    <StandardNavigation>
      <main className="px-4 py-8 lg:px-8 pt-16 lg:pt-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-8 gap-4">
            <h1 className={`text-xl sm:text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Painel Administrativo
            </h1>
          </div>

          <div className="mb-6">
            <div className="flex flex-wrap gap-2 sm:gap-4">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`px-3 py-2 sm:px-4 sm:py-2 rounded-lg flex items-center gap-2 text-sm sm:text-base ${activeTab === 'dashboard'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                  }`}
              >
                <Home className="h-4 w-4 sm:h-5 sm:w-5" />
                Dashboard
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className={`px-3 py-2 sm:px-4 sm:py-2 rounded-lg flex items-center gap-2 text-sm sm:text-base ${activeTab === 'users'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                  }`}
              >
                <Users className="h-4 w-4 sm:h-5 sm:w-5" />
                Usuários
              </button>
              <button
                onClick={() => setActiveTab('content')}
                className={`px-3 py-2 sm:px-4 sm:py-2 rounded-lg flex items-center gap-2 text-sm sm:text-base ${activeTab === 'content'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                  }`}
              >
                <FileText className="h-4 w-4 sm:h-5 sm:w-5" />
                Conteúdo
              </button>
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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Status
                    </label>
                    <select
                      value={filters.status}
                      onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
                    >
                      <option value="total">Todos os períodos</option>
                      <option value="7">Últimos 7 dias</option>
                      <option value="30">Últimos 30 dias</option>
                      <option value="90">Últimos 90 dias</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Buscar
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Buscar por nome, email ou telefone"
                        className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <Search className="h-4 w-4 text-gray-400" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Revenue Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Total de Usuários</p>
                      <div className="space-y-2">
                        <div>
                          <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                            {stats.totalRegisteredUsers.toLocaleString('pt-BR')}
                          </h3>
                          <p className="text-xs sm:text-sm text-gray-500">Usuários cadastrados na plataforma</p>
                        </div>
                        <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                          <p className="text-xs sm:text-sm text-green-600">
                            Ativos: {stats.activeUsers} ({((stats.activeUsers / stats.totalRegisteredUsers) * 100).toFixed(1)}%)
                          </p>
                          <p className="text-xs sm:text-sm text-gray-600">
                            Inativos: {stats.totalRegisteredUsers - stats.activeUsers}
                          </p>
                          <p className="text-xs sm:text-sm text-blue-600">
                            Taxa de ativação: {((stats.activeUsers / stats.totalRegisteredUsers) * 100).toFixed(1)}%
                          </p>
                        </div>
                      </div>
                    </div>
                    <Users className="h-6 w-6 sm:h-8 sm:w-8 text-gray-600 flex-shrink-0" />
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Potencial Máximo</p>
                      <div className="space-y-2">
                        <div>
                          <h3 className="text-xl sm:text-2xl font-bold text-purple-600 dark:text-purple-400">
                            R$ {stats.revenue.monthly.fullPotential.toLocaleString('pt-BR')}
                          </h3>
                          <p className="text-xs sm:text-sm text-gray-500">Se todos os {stats.totalRegisteredUsers} usuários estivessem ativos</p>
                        </div>
                        <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                          <p className="text-xs sm:text-sm text-purple-600">
                            Potencial anual: R$ {stats.revenue.total.fullPotential.toLocaleString('pt-BR')}
                          </p>
                          <p className="text-xs sm:text-sm text-gray-600">
                            Crescimento possível: {stats.revenue.monthly.fullPotential > 0 ? (((stats.revenue.monthly.fullPotential / (stats.revenue.monthly.active || 1)) - 1) * 100).toFixed(0) : 0}%
                          </p>
                          <p className="text-xs sm:text-sm text-blue-600">
                            Receita/usuário: R$ {stats.totalRegisteredUsers > 0 ? (stats.revenue.monthly.fullPotential / stats.totalRegisteredUsers).toFixed(2) : '0.00'}
                          </p>
                        </div>
                      </div>
                    </div>
                    <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600 flex-shrink-0" />
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Receita Mensal - Pagos</p>
                      <div className="space-y-2">
                        <div>
                          <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                            R$ {stats.revenue.monthly.active.toLocaleString('pt-BR')}
                          </h3>
                          <p className="text-xs sm:text-sm text-gray-500">Receita Atual ({stats.paidActiveUsers} usuários pagos)</p>
                        </div>
                        <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                          <p className="text-xs sm:text-sm text-red-500">
                            Custo: R$ {stats.revenue.monthly.cost.toLocaleString('pt-BR')}
                          </p>
                          <p className="text-xs sm:text-sm text-green-500">
                            Lucro: R$ {stats.revenue.monthly.profit.toLocaleString('pt-BR')}
                          </p>
                          <p className="text-xs sm:text-sm text-blue-500">
                            Margem: {stats.revenue.monthly.margin.toFixed(1)}%
                          </p>
                        </div>
                      </div>
                    </div>
                    <CreditCard className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 flex-shrink-0" />
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Potencial - Usuários Gratuitos</p>
                      <div className="space-y-2">
                        <div>
                          <h3 className="text-xl sm:text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                            R$ {stats.revenue.monthly.free.toLocaleString('pt-BR')}
                          </h3>
                          <p className="text-xs sm:text-sm text-gray-500">Se {stats.freeActiveUsers} usuários gratuitos pagassem</p>
                        </div>
                        <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                            Usuários Ativos: {stats.activeUsers}
                          </p>
                          <p className="text-xs sm:text-sm text-green-600">
                            Pagos: {stats.paidActiveUsers}
                          </p>
                          <p className="text-xs sm:text-sm text-yellow-600">
                            Gratuitos: {stats.freeActiveUsers}
                          </p>
                        </div>
                      </div>
                    </div>
                    <Users className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-600 flex-shrink-0" />
                  </div>
                </div>
              </div>

              {/* Second row of cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Potencial - Em Atraso</p>
                      <div className="space-y-2">
                        <div>
                          <h3 className="text-xl sm:text-2xl font-bold text-orange-600 dark:text-orange-400">
                            R$ {stats.revenue.monthly.overdue.toLocaleString('pt-BR')}
                          </h3>
                          <p className="text-xs sm:text-sm text-gray-500">Se {stats.overdueUsers} usuários em atraso pagassem</p>
                        </div>
                        <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                          <p className="text-xs sm:text-sm text-orange-600">
                            Usuários em atraso: {stats.overdueUsers}
                          </p>
                          <p className="text-xs sm:text-sm text-red-600">
                            Usuários cancelados: {stats.canceledUsers}
                          </p>
                          <p className="text-xs sm:text-sm text-purple-600">
                            Potencial cancelados: R$ {stats.revenue.monthly.canceled.toLocaleString('pt-BR')}
                          </p>
                        </div>
                      </div>
                    </div>
                    <AlertTriangle className="h-6 w-6 sm:h-8 sm:w-8 text-orange-600 flex-shrink-0" />
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Métricas por Usuário</p>
                      <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                        R$ {stats.kpis.avgRevenuePerUser.toFixed(2)}
                      </h3>
                      <div className="mt-1 space-y-1">
                        <p className="text-xs sm:text-sm text-green-600">
                          Lucro médio: R$ {stats.kpis.avgProfitPerUser.toFixed(2)}
                        </p>
                        <p className="text-xs sm:text-sm text-blue-600">
                          Taxa de conversão: {stats.kpis.conversionRate.toFixed(1)}%
                        </p>
                        <p className="text-xs sm:text-sm text-red-600">
                          Taxa de cancelamento: {stats.kpis.churnRate.toFixed(1)}%
                        </p>
                      </div>
                    </div>
                    <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-green-600 flex-shrink-0" />
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
          ) : activeTab === 'content' ? (
            <div className="space-y-4">
              {/* Content Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Quizzes (tabela quizzes)</p>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                        {allQuizzes.length}
                      </h3>
                    </div>
                    <FileText className="h-8 w-8 text-blue-600" />
                  </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Sites Clonados (cloned_sites)</p>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                        {allClonedSites.length}
                      </h3>
                    </div>
                    <Globe className="h-8 w-8 text-green-600" />
                  </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Sites (tabela sites)</p>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                        {allSites.length}
                      </h3>
                    </div>
                    <Globe className="h-8 w-8 text-purple-600" />
                  </div>
                </div>
              </div>

              {/* Quizzes Table */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    Quizzes (tabela quizzes) - {allQuizzes.length} total
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-900">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Título
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Slug
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          URL Original
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Usuário
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Criado em
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {allQuizzes.map((quiz) => {
                        const user = users.find(u => u.id === quiz.user_id);
                        const originalUrl = quiz.data?.originalUrl || quiz.original_url || 'N/A';
                        const truncatedUrl = originalUrl.length > 50 ? originalUrl.substring(0, 50) + '...' : originalUrl;

                        return (
                          <tr key={quiz.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                              {quiz.title || 'Sem título'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <a
                                href={`https://quiz.clonup.pro/${quiz.slug}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline"
                              >
                                {quiz.slug}
                              </a>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              {originalUrl !== 'N/A' ? (
                                <a
                                  href={originalUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline"
                                  title={originalUrl}
                                >
                                  {truncatedUrl}
                                </a>
                              ) : (
                                <span className="text-gray-500 dark:text-gray-400">N/A</span>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              {user ? (
                                <div>
                                  <div className="font-medium text-gray-900 dark:text-white">
                                    {user.full_name || 'Sem nome'}
                                  </div>
                                  <div className="text-xs text-gray-500 dark:text-gray-400">
                                    {user.email}
                                  </div>
                                </div>
                              ) : (
                                <span className="text-gray-500 dark:text-gray-400">Usuário não encontrado</span>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              <span className={`px-2 py-1 text-xs rounded-full ${quiz.status === 'published' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                                quiz.status === 'draft' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                                  'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                                }`}>
                                {quiz.status || 'N/A'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              {new Date(quiz.created_at).toLocaleDateString('pt-BR')}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Cloned Sites Table */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    Sites Clonados (tabela cloned_sites) - {allClonedSites.length} total
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-900">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Subdomínio
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          URL Original
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Usuário
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Criado em
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {allClonedSites.map((site) => {
                        const user = users.find(u => u.id === site.user_id);
                        const truncatedUrl = site.original_url && site.original_url.length > 50 ?
                          site.original_url.substring(0, 50) + '...' : site.original_url;

                        return (
                          <tr key={site.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <a
                                href={`https://${site.subdomain}.clonup.pro`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline font-medium"
                              >
                                {site.subdomain}
                              </a>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              {site.original_url ? (
                                <a
                                  href={site.original_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline"
                                  title={site.original_url}
                                >
                                  {truncatedUrl}
                                </a>
                              ) : (
                                <span className="text-gray-500 dark:text-gray-400">N/A</span>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              {user ? (
                                <div>
                                  <div className="font-medium text-gray-900 dark:text-white">
                                    {user.full_name || 'Sem nome'}
                                  </div>
                                  <div className="text-xs text-gray-500 dark:text-gray-400">
                                    {user.email}
                                  </div>
                                </div>
                              ) : (
                                <span className="text-gray-500 dark:text-gray-400">Usuário não encontrado</span>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              {new Date(site.created_at).toLocaleDateString('pt-BR')}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Sites Table */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    Sites (tabela sites) - {allSites.length} total
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-900">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Subdomínio
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          URL Original
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Usuário
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Criado em
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {allSites.map((site) => {
                        const user = users.find(u => u.id === site.user_id);
                        const truncatedUrl = site.original_url && site.original_url.length > 50 ?
                          site.original_url.substring(0, 50) + '...' : site.original_url;

                        return (
                          <tr key={site.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <a
                                href={`https://${site.subdomain}.clonup.pro`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline font-medium"
                              >
                                {site.subdomain}
                              </a>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              {site.original_url ? (
                                <a
                                  href={site.original_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline"
                                  title={site.original_url}
                                >
                                  {truncatedUrl}
                                </a>
                              ) : (
                                <span className="text-gray-500 dark:text-gray-400">N/A</span>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              {user ? (
                                <div>
                                  <div className="font-medium text-gray-900 dark:text-white">
                                    {user.full_name || 'Sem nome'}
                                  </div>
                                  <div className="text-xs text-gray-500 dark:text-gray-400">
                                    {user.email}
                                  </div>
                                </div>
                              ) : (
                                <span className="text-gray-500 dark:text-gray-400">Usuário não encontrado</span>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              {new Date(site.created_at).toLocaleDateString('pt-BR')}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
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
                    <div className="relative">
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Buscar por nome, email ou telefone"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Users Table */}
              <div className="mt-8 flow-root">
                {/* Desktop Table View */}
                <div className="hidden lg:block -mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                  <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                    <table className="min-w-full divide-y divide-gray-700">
                      <thead>
                        <tr>
                          <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-white sm:pl-0">
                            Nome
                          </th>
                          <th className="px-3 py-3.5 text-left text-sm font-semibold text-white">
                            Email
                          </th>
                          <th className="px-3 py-3.5 text-left text-sm font-semibold text-white">
                            Telefone
                          </th>
                          <th className="px-3 py-3.5 text-left text-sm font-semibold text-white">
                            Plano
                          </th>
                          <th className="px-3 py-3.5 text-left text-sm font-semibold text-white">
                            Status
                          </th>
                          <th className="px-3 py-3.5 text-left text-sm font-semibold text-white">
                            Renovação
                          </th>
                          <th className="relative py-3.5 pl-3 pr-4 sm:pr-0">
                            <span className="sr-only">Ações</span>
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-800">
                        {getFilteredUsers().map((user) => {
                          const userPlan = plans.find(p => p.id === user.plan_id);
                          return (
                            <tr key={user.id}>
                              <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-white sm:pl-0">
                                {user.full_name || 'N/A'}
                              </td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-300">
                                {user.email}
                              </td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-300">
                                {user.phone || 'N/A'}
                              </td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-300">
                                {userPlan?.name || 'Nenhum'}
                              </td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm">
                                <div className="flex items-center gap-2">
                                  <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${getUserStatus(user).color}`}>
                                    {getUserStatus(user).text}
                                  </span>
                                  {user.is_free && (
                                    <span className="inline-flex items-center rounded-md bg-yellow-400 px-2 py-1 text-xs font-medium text-yellow-900">
                                      FREE
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-300">
                                {user.subscription_renewed_at
                                  ? new Date(user.subscription_renewed_at).toLocaleDateString('pt-BR')
                                  : 'N/A'
                                }
                              </td>
                              <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
                                <button
                                  onClick={() => {
                                    setSelectedUser(user);
                                    setEditModalOpen(true);
                                    loadUserResources(user.id);
                                  }}
                                  className="text-blue-400 hover:text-blue-300"
                                >
                                  Editar
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Mobile Card View */}
                <div className="lg:hidden space-y-4">
                  {getFilteredUsers().map((user) => {
                    const userPlan = plans.find(p => p.id === user.plan_id);
                    return (
                      <div key={user.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white truncate">
                              {user.full_name || 'N/A'}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                              {user.email}
                            </p>
                          </div>
                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              setEditModalOpen(true);
                              loadUserResources(user.id);
                            }}
                            className="ml-4 px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 flex-shrink-0"
                          >
                            Editar
                          </button>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-gray-500 dark:text-gray-400">Telefone</p>
                            <p className="text-gray-900 dark:text-white">{user.phone || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-gray-500 dark:text-gray-400">Plano</p>
                            <p className="text-gray-900 dark:text-white">{userPlan?.name || 'Nenhum'}</p>
                          </div>
                        </div>

                        <div className="mt-3 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${getUserStatus(user).color}`}>
                              {getUserStatus(user).text}
                            </span>
                            {user.is_free && (
                              <span className="inline-flex items-center rounded-md bg-yellow-400 px-2 py-1 text-xs font-medium text-yellow-900">
                                FREE
                              </span>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-gray-500 dark:text-gray-400">Renovação</p>
                            <p className="text-sm text-gray-900 dark:text-white">
                              {user.subscription_renewed_at
                                ? new Date(user.subscription_renewed_at).toLocaleDateString('pt-BR')
                                : 'N/A'
                              }
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-4xl max-h-[95vh] overflow-y-auto">
            <div className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6 gap-2">
                <h2 className="text-lg sm:text-xl font-bold dark:text-white">
                  Editar Usuário: {selectedUser.full_name || selectedUser.email}
                </h2>
                <button
                  onClick={() => {
                    setEditModalOpen(false);
                    setSelectedUser(null);
                  }}
                  className="self-end sm:self-auto text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <X className="h-5 w-5 sm:h-6 sm:w-6" />
                </button>
              </div>

              <div className="space-y-4 sm:space-y-6">
                {/* User Information */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Nome Completo
                    </label>
                    <input
                      type="text"
                      value={selectedUser.full_name || ''}
                      onChange={(e) => {
                        const newValue = e.target.value;
                        setSelectedUser(prev => prev ? { ...prev, full_name: newValue } : null);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Telefone/WhatsApp
                    </label>
                    <input
                      type="tel"
                      value={selectedUser.phone || ''}
                      onChange={(e) => {
                        const newValue = e.target.value;
                        const formatted = newValue.replace(/\D/g, '').replace(/^(\d{2})(\d{5})(\d{4}).*/, '($1) $2-$3');
                        setSelectedUser(prev => prev ? { ...prev, phone: formatted } : null);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
                      placeholder="(99) 99999-9999"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Função
                    </label>
                    <select
                      value={selectedUser.role || 'user'}
                      onChange={(e) => setSelectedUser({ ...selectedUser, role: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
                    />
                  </div>
                </div>

                {/* Renewal Section */}
                <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-200 dark:border-gray-700">
                  <h3 className="text-base sm:text-lg font-medium dark:text-white mb-4">Renovação</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Plano para Renovação
                      </label>
                      <select
                        value={selectedUser.plan_id || ''}
                        onChange={(e) => setSelectedUser({ ...selectedUser, plan_id: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
                      >
                        <option value="">Selecione um plano</option>
                        {plans.map(plan => (
                          <option key={plan.id} value={plan.id}>
                            {plan.name} - R$ {plan.price.toLocaleString('pt-BR')}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
                      <button
                        onClick={() => selectedUser.plan_id && handleRenewal(selectedUser.id, selectedUser.plan_id, false)}
                        className="w-full sm:flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                        disabled={!selectedUser.plan_id || loading}
                      >
                        {loading ? (
                          <div className="flex items-center justify-center">
                            <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                          </div>
                        ) : (
                          'Renovar Assinatura'
                        )}
                      </button>
                      <button
                        onClick={() => selectedUser.plan_id && handleRenewal(selectedUser.id, selectedUser.plan_id, true)}
                        className="w-full sm:flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed relative text-sm"
                        disabled={!selectedUser.plan_id || loading}
                      >
                        {loading ? (
                          <div className="flex items-center justify-center">
                            <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center space-x-2">
                            <span>Renovar Grátis</span>
                            <span className="bg-yellow-400 text-yellow-900 text-xs px-2 py-1 rounded-full font-semibold">
                              FREE
                            </span>
                          </div>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* User Resources */}
                <div className="space-y-4">
                  <h3 className="text-base sm:text-lg font-medium dark:text-white">Recursos do Usuário</h3>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <h4 className="text-sm sm:text-md font-medium dark:text-white mb-2">Offers ({userResources.offers.length})</h4>
                      <div className="max-h-32 sm:max-h-40 overflow-y-auto">
                        {userResources.offers.map((offer) => (
                          <div
                            key={offer.id}
                            className="p-2 border-b dark:border-gray-700 text-xs sm:text-sm dark:text-gray-300"
                          >
                            {offer.title}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm sm:text-md font-medium dark:text-white mb-2">
                        Quizzes Clonados ({userResources.clonedQuiz.length})
                      </h4>
                      <div className="max-h-32 sm:max-h-40 overflow-y-auto">
                        {userResources.clonedQuiz.map((quiz) => (
                          <div
                            key={quiz.id}
                            className="p-2 border-b dark:border-gray-700 text-xs sm:text-sm dark:text-gray-300"
                          >
                            {quiz.original_url}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm sm:text-md font-medium dark:text-white mb-2">
                        Sites Anticlone ({userResources.anticloneSites.length})
                      </h4>
                      <div className="max-h-32 sm:max-h-40 overflow-y-auto">
                        {userResources.anticloneSites.map((site) => (
                          <div
                            key={site.id}
                            className="p-2 border-b dark:border-gray-700 text-xs sm:text-sm dark:text-gray-300"
                          >
                            {site.original_url}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* User Transactions */}
                <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-200 dark:border-gray-700">
                  <h3 className="text-base sm:text-lg font-medium dark:text-white mb-4">Histórico de Transações</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-700">
                      <thead>
                        <tr>
                          <th className="py-3.5 pl-4 pr-3 text-left text-xs sm:text-sm font-semibold text-white sm:pl-0">
                            Data
                          </th>
                          <th className="px-3 py-3.5 text-left text-xs sm:text-sm font-semibold text-white">
                            Plano
                          </th>
                          <th className="px-3 py-3.5 text-left text-xs sm:text-sm font-semibold text-white">
                            Valor
                          </th>
                          <th className="px-3 py-3.5 text-left text-xs sm:text-sm font-semibold text-white">
                            Gratuito
                          </th>
                          <th className="px-3 py-3.5 text-left text-xs sm:text-sm font-semibold text-white">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-800">
                        {userTransactions.map((transaction) => (
                          <tr key={transaction.id}>
                            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-xs sm:text-sm text-gray-300 sm:pl-0">
                              {new Date(transaction.payment_date).toLocaleDateString('pt-BR')}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-xs sm:text-sm text-gray-300">
                              {transaction.plans?.name || 'N/A'}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-xs sm:text-sm text-gray-300">
                              R$ {transaction.amount.toLocaleString('pt-BR')}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-xs sm:text-sm text-gray-300">
                              {transaction.is_free ? 'Sim' : 'Não'}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-xs sm:text-sm text-gray-300">
                              {transaction.status}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
                  <button
                    onClick={() => {
                      setEditModalOpen(false);
                      setSelectedUser(null);
                    }}
                    className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 text-sm"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => handleEditUser(selectedUser)}
                    className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                  >
                    Salvar Alterações
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </StandardNavigation>
  );
} 