import { useState, useEffect } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { useReveal } from './hooks/useReveal.js';
import { useAuth } from './context/AuthContext.jsx';
import {
  Logo, MenuIcon, CloseIcon, ArrowRightIcon, CheckIcon,
  ZapIcon, BarChartIcon, ShieldIcon, GlobeIcon, UsersIcon,
  StarIcon, QuoteIcon, TwitterIcon, LinkedInIcon, GithubIcon,
  ChevronDownIcon
} from './components/Icons.jsx';
import DemoRequestForm from './components/DemoRequestForm.jsx';
import Login from './components/auth/Login.jsx';
import Signup from './components/auth/Signup.jsx';
import ProtectedRoute from './components/auth/ProtectedRoute.jsx';
import Dashboard from './pages/Dashboard.jsx';
import ProjectsPage from './pages/ProjectsPage.jsx';
import ProjectBoardPage from './pages/ProjectBoardPage.jsx';
import MarketPage from './pages/MarketPage.jsx';
import BillingPage from './pages/BillingPage.jsx';
import WelcomePage from './pages/WelcomePage.jsx';
import { TIERS } from './tiers.js';

// ============================================
// COMPONENT: Navbar
// ============================================
function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { isAuthenticated, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Features', href: '#features' },
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'Testimonials', href: '#testimonials' },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? 'bg-dark-950/80 backdrop-blur-xl border-b border-dark-800/50' : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          <a href="#" className="flex items-center gap-3 group">
            <Logo />
            <span className="text-xl font-bold text-white tracking-tight group-hover:text-brand-400 transition-colors">
              NexusAI
            </span>
          </a>

          <div className="hidden md:flex items-center gap-8">
            {navLinks.map(link => (
              <a 
                key={link.label}
                href={link.href}
                className="text-sm font-medium text-dark-300 hover:text-white transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="text-sm font-medium text-dark-300 hover:text-white transition-colors">
                  Dashboard
                </Link>
                <button
                  onClick={logout}
                  className="px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-brand-500 to-brand-600 rounded-lg hover:from-brand-400 hover:to-brand-500 transition-all shadow-lg shadow-brand-500/20"
                >
                  Log Out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-sm font-medium text-dark-300 hover:text-white transition-colors">
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-brand-500 to-brand-600 rounded-lg hover:from-brand-400 hover:to-brand-500 transition-all shadow-lg shadow-brand-500/20"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          <button 
            className="md:hidden p-2 text-dark-300 hover:text-white transition-colors"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </div>

      <div className={`mobile-menu fixed top-0 right-0 bottom-0 w-80 bg-dark-900 border-l border-dark-800 z-50 md:hidden ${isOpen ? 'open' : ''}`}>
        <div className="p-6">
          <div className="flex justify-between items-center mb-8">
            <span className="text-lg font-bold text-white">Menu</span>
            <button onClick={() => setIsOpen(false)} className="text-dark-400 hover:text-white">
              <CloseIcon />
            </button>
          </div>
          <div className="flex flex-col gap-4">
            {navLinks.map(link => (
              <a 
                key={link.label}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="text-lg font-medium text-dark-300 hover:text-white py-2 transition-colors"
              >
                {link.label}
              </a>
            ))}
            <hr className="border-dark-800 my-4" />
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" onClick={() => setIsOpen(false)} className="text-lg font-medium text-dark-300 hover:text-white py-2">Dashboard</Link>
                <button
                  onClick={() => { setIsOpen(false); logout(); }}
                  className="mt-4 px-5 py-3 text-center font-semibold text-white bg-gradient-to-r from-brand-500 to-brand-600 rounded-lg"
                >
                  Log Out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setIsOpen(false)} className="text-lg font-medium text-dark-300 hover:text-white py-2">Sign In</Link>
                <Link
                  to="/signup"
                  onClick={() => setIsOpen(false)}
                  className="mt-4 px-5 py-3 text-center font-semibold text-white bg-gradient-to-r from-brand-500 to-brand-600 rounded-lg"
                >
                  Get Started Free
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </nav>
  );
}

// ============================================
// COMPONENT: Hero
// ============================================
function Hero() {
  const ref = useReveal();

  return (
    <section className="relative min-h-screen flex items-center justify-center pt-20 pb-16 px-4 overflow-hidden">
      <div className="absolute inset-0 hero-glow" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl animate-pulse-slow" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse-slow" style={{animationDelay: '2s'}} />

      <div ref={ref} className="reveal relative z-10 max-w-5xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-dark-800/80 border border-dark-700/50 mb-8">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-sm text-dark-300">Now with GPT-4 powered insights</span>
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white leading-tight tracking-tight mb-6">
          Turn Data Into
          <br />
          <span className="gradient-text">Actionable Intelligence</span>
        </h1>

        <p className="text-lg sm:text-xl text-dark-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          NexusAI combines advanced machine learning with intuitive dashboards to help teams 
          make faster, smarter decisions — no data science degree required.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <a 
            href="#pricing"
            className="w-full sm:w-auto px-8 py-4 text-base font-semibold text-white bg-gradient-to-r from-brand-500 to-brand-600 rounded-xl hover:from-brand-400 hover:to-brand-500 transition-all shadow-xl shadow-brand-500/25 flex items-center justify-center gap-2"
          >
            Start Free Trial
            <ArrowRightIcon />
          </a>
          <a 
            href="#how-it-works"
            className="w-full sm:w-auto px-8 py-4 text-base font-semibold text-dark-200 bg-dark-800/80 border border-dark-700 rounded-xl hover:bg-dark-800 hover:border-dark-600 transition-all flex items-center justify-center gap-2"
          >
            Watch Demo
          </a>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-dark-400">
          <div className="flex -space-x-3">
            {[1,2,3,4].map(i => (
              <div key={i} className="w-10 h-10 rounded-full bg-gradient-to-br from-dark-700 to-dark-600 border-2 border-dark-950 flex items-center justify-center text-xs font-bold text-white">
                {['JD','SK','AR','ML'][i-1]}
              </div>
            ))}
          </div>
          <div className="text-sm">
            <span className="text-white font-semibold">2,500+</span> teams trust NexusAI
          </div>
          <div className="hidden sm:block w-px h-4 bg-dark-700" />
          <div className="flex items-center gap-1">
            {[1,2,3,4,5].map(i => (
              <StarIcon key={i} />
            ))}
            <span className="ml-2 text-sm">4.9/5 on G2</span>
          </div>
        </div>

        <div className="mt-16 relative animate-float">
          <div className="relative rounded-2xl overflow-hidden border border-dark-800/50 shadow-2xl shadow-brand-500/5 bg-dark-900/50 backdrop-blur-sm">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-dark-800/50 bg-dark-900/80">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
              </div>
              <div className="flex-1 text-center">
                <span className="text-xs text-dark-500">nexusai.app/dashboard</span>
              </div>
            </div>
            <div className="p-4 sm:p-6 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              <div className="col-span-2 bg-dark-800/50 rounded-xl p-4 border border-dark-700/30">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs text-dark-400">Revenue Growth</span>
                  <span className="text-xs text-green-400 font-medium">+24.5%</span>
                </div>
                <div className="flex items-end gap-1 h-20">
                  {[40, 55, 45, 70, 60, 85, 75, 90, 80, 95, 88, 100].map((h, i) => (
                    <div key={i} className="flex-1 rounded-t-sm bg-gradient-to-t from-brand-600 to-brand-400" style={{height: `${h}%`, opacity: 0.3 + (i * 0.06)}} />
                  ))}
                </div>
              </div>
              <div className="bg-dark-800/50 rounded-xl p-4 border border-dark-700/30">
                <span className="text-xs text-dark-400">Active Users</span>
                <p className="text-2xl font-bold text-white mt-1">12.4K</p>
                <div className="mt-2 h-8 flex items-end gap-0.5">
                  {[30,50,40,60,55,70,65,80].map((h,i) => (
                    <div key={i} className="flex-1 bg-purple-500/60 rounded-t-sm" style={{height: `${h}%`}} />
                  ))}
                </div>
              </div>
              <div className="bg-dark-800/50 rounded-xl p-4 border border-dark-700/30">
                <span className="text-xs text-dark-400">Conversion</span>
                <p className="text-2xl font-bold text-white mt-1">3.2%</p>
                <div className="mt-3 space-y-2">
                  <div className="h-2 bg-dark-700 rounded-full overflow-hidden">
                    <div className="h-full w-3/4 bg-gradient-to-r from-brand-400 to-brand-500 rounded-full" />
                  </div>
                  <div className="h-2 bg-dark-700 rounded-full overflow-hidden">
                    <div className="h-full w-1/2 bg-gradient-to-r from-purple-400 to-purple-500 rounded-full" />
                  </div>
                </div>
              </div>
              <div className="col-span-2 bg-dark-800/50 rounded-xl p-4 border border-dark-700/30">
                <span className="text-xs text-dark-400">AI Insights</span>
                <div className="mt-3 space-y-2">
                  {['Traffic spike detected on Product Page', 'Churn risk: 3 enterprise accounts', 'Recommend: A/B test CTA color'].map((insight, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-dark-300">
                      <div className={`w-1.5 h-1.5 rounded-full ${i === 0 ? 'bg-green-400' : i === 1 ? 'bg-yellow-400' : 'bg-brand-400'}`} />
                      {insight}
                    </div>
                  ))}
                </div>
              </div>
              <div className="col-span-2 bg-dark-800/50 rounded-xl p-4 border border-dark-700/30">
                <span className="text-xs text-dark-400">Geographic Distribution</span>
                <div className="mt-2 flex items-center gap-4">
                  <div className="flex-1 space-y-1.5">
                    {[{c:'US',p:45},{c:'EU',p:30},{c:'APAC',p:20},{c:'Other',p:5}].map((item,i) => (
                      <div key={i} className="flex items-center gap-2">
                        <span className="text-xs text-dark-400 w-8">{item.c}</span>
                        <div className="flex-1 h-1.5 bg-dark-700 rounded-full overflow-hidden">
                          <div className="h-full rounded-full bg-gradient-to-r from-brand-400 to-purple-400" style={{width: `${item.p}%`}} />
                        </div>
                        <span className="text-xs text-dark-300 w-8 text-right">{item.p}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="absolute -inset-4 bg-gradient-to-r from-brand-500/5 via-purple-500/5 to-brand-500/5 rounded-3xl blur-2xl -z-10" />
        </div>
      </div>
    </section>
  );
}

// ============================================
// COMPONENT: Trusted By
// ============================================
function TrustedBy() {
  const ref = useReveal();
  const logos = ['Stripe', 'Notion', 'Figma', 'Vercel', 'Linear', 'Raycast'];

  return (
    <section className="py-12 border-y border-dark-800/50">
      <div ref={ref} className="reveal max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-center text-sm text-dark-500 uppercase tracking-widest mb-8">
          Trusted by innovative teams worldwide
        </p>
        <div className="flex flex-wrap justify-center items-center gap-8 sm:gap-12 lg:gap-16">
          {logos.map(logo => (
            <div key={logo} className="text-dark-600 font-bold text-lg sm:text-xl tracking-tight hover:text-dark-400 transition-colors cursor-default">
              {logo}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================
// COMPONENT: Features
// ============================================
function Features() {
  const ref = useReveal();

  const features = [
    {
      icon: <ZapIcon />,
      title: 'Real-Time Analytics',
      description: 'Process millions of events per second with sub-second latency. Watch your metrics update live as they happen.',
      color: 'from-yellow-500/20 to-orange-500/20',
      iconColor: 'text-yellow-400'
    },
    {
      icon: <BarChartIcon />,
      title: 'Predictive Insights',
      description: 'Our AI models forecast trends, detect anomalies, and surface opportunities before your competitors see them.',
      color: 'from-brand-500/20 to-cyan-500/20',
      iconColor: 'text-brand-400'
    },
    {
      icon: <ShieldIcon />,
      title: 'Enterprise Security',
      description: 'SOC 2 Type II certified with end-to-end encryption, SSO, and granular role-based access controls.',
      color: 'from-green-500/20 to-emerald-500/20',
      iconColor: 'text-green-400'
    },
    {
      icon: <GlobeIcon />,
      title: 'Global Infrastructure',
      description: 'Deploy across 30+ regions with automatic failover. 99.99% uptime SLA guaranteed for enterprise plans.',
      color: 'from-purple-500/20 to-pink-500/20',
      iconColor: 'text-purple-400'
    },
    {
      icon: <UsersIcon />,
      title: 'Team Collaboration',
      description: 'Share dashboards, annotate insights, and collaborate in real-time with built-in commenting and alerts.',
      color: 'from-orange-500/20 to-red-500/20',
      iconColor: 'text-orange-400'
    },
    {
      icon: <BarChartIcon />,
      title: 'Custom Integrations',
      description: 'Connect with 200+ data sources including Salesforce, HubSpot, Google Analytics, and custom APIs.',
      color: 'from-pink-500/20 to-rose-500/20',
      iconColor: 'text-pink-400'
    }
  ];

  return (
    <section id="features" className="py-20 sm:py-28 px-4">
      <div ref={ref} className="reveal max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-brand-500/10 text-brand-400 text-sm font-medium mb-4">
            Features
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
            Everything you need to
            <span className="gradient-text"> win with data</span>
          </h2>
          <p className="text-lg text-dark-400">
            Powerful features designed for modern data teams. From ingestion to insight, 
            NexusAI handles the complexity so you can focus on decisions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <div 
              key={i}
              className="group relative p-6 sm:p-8 rounded-2xl bg-dark-900/50 border border-dark-800/50 hover:border-dark-700/50 card-glow transition-all duration-300"
            >
              <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${feature.color} mb-5`}>
                <span className={feature.iconColor}>{feature.icon}</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-brand-400 transition-colors">
                {feature.title}
              </h3>
              <p className="text-dark-400 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================
// COMPONENT: How It Works
// ============================================
function HowItWorks() {
  const ref = useReveal();

  const steps = [
    {
      num: '01',
      title: 'Connect Your Data',
      description: 'Link your existing tools in minutes. We support databases, warehouses, APIs, and SaaS platforms with pre-built connectors.'
    },
    {
      num: '02',
      title: 'AI-Powered Analysis',
      description: 'Our ML engine automatically cleans, structures, and analyzes your data — identifying patterns humans might miss.'
    },
    {
      num: '03',
      title: 'Actionable Dashboards',
      description: 'Get beautiful, interactive dashboards that update in real-time. Share insights with one click across your organization.'
    }
  ];

  return (
    <section id="how-it-works" className="py-20 sm:py-28 px-4 bg-dark-900/30">
      <div ref={ref} className="reveal max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-purple-500/10 text-purple-400 text-sm font-medium mb-4">
            How It Works
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
            From raw data to
            <span className="gradient-text"> decisions in minutes</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          {steps.map((step, i) => (
            <div key={i} className="relative">
              <div className="text-6xl sm:text-7xl font-extrabold text-dark-800 mb-4">
                {step.num}
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">
                {step.title}
              </h3>
              <p className="text-dark-400 leading-relaxed">
                {step.description}
              </p>
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-12 right-0 translate-x-1/2">
                  <svg width="40" height="12" viewBox="0 0 40 12" fill="none">
                    <path d="M0 6H35M35 6L30 1M35 6L30 11" stroke="#2d2d35" strokeWidth="2" />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================
// COMPONENT: Pricing
// ============================================
function Pricing() {
  const ref = useReveal();
  const [billing, setBilling] = useState('month'); // 'month' | 'year'

  return (
    <section id="pricing" className="py-20 sm:py-28 px-4">
      <div ref={ref} className="reveal max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="inline-block px-4 py-1.5 rounded-full bg-green-500/10 text-green-400 text-sm font-medium mb-4">
            Pricing
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
            Simple, transparent
            <span className="gradient-text"> pricing</span>
          </h2>
          <p className="text-lg text-dark-400">
            Start free, scale as you grow. No hidden fees, no surprises.
          </p>
        </div>

        {/* Monthly / Yearly toggle */}
        <div className="flex items-center justify-center gap-4 mb-12">
          <span className={`text-sm font-medium transition-colors ${billing === 'month' ? 'text-white' : 'text-dark-500'}`}>
            Monthly
          </span>
          <button
            onClick={() => setBilling(billing === 'month' ? 'year' : 'month')}
            aria-label="Toggle billing period"
            className="relative w-14 h-7 rounded-full bg-dark-800 border border-dark-700 transition-colors"
          >
            <div className={`absolute top-0.5 w-6 h-6 rounded-full bg-brand-500 transition-transform duration-200 ${billing === 'year' ? 'translate-x-7' : 'translate-x-0.5'}`} />
          </button>
          <span className={`text-sm font-medium transition-colors ${billing === 'year' ? 'text-white' : 'text-dark-500'}`}>
            Yearly
          </span>
          <span className="hidden sm:inline-block px-2 py-1 rounded-md bg-green-500/10 text-green-400 text-xs font-medium">
            Save 20%
          </span>
        </div>

        {/* Tier cards — sourced from tiers.js (same data as BillingPage) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {TIERS.map((tier) => {
            const isFree = !tier.priceId.month && !tier.priceId.year;
            return (
              <div
                key={tier.name}
                className={`relative rounded-2xl p-6 sm:p-8 ${
                  tier.popular
                    ? 'bg-gradient-to-b from-brand-500/10 to-dark-900/50 border-2 border-brand-500/30'
                    : 'bg-dark-900/50 border border-dark-800/50'
                }`}
              >
                {tier.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-brand-500 to-brand-600 text-white text-xs font-semibold">
                    Most Popular
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="text-xl font-bold text-white mb-2">{tier.name}</h3>
                  <p className="text-sm text-dark-400">{tier.description}</p>
                </div>

                {/* Price placeholder — real prices load on /billing via Paddle PricePreview */}
                <div className="mb-6">
                  {isFree ? (
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold text-white">$0</span>
                      <span className="text-dark-500">/month</span>
                    </div>
                  ) : (
                    <Link
                      to="/billing"
                      className="inline-flex items-center gap-1.5 text-brand-400 hover:text-brand-300 text-sm font-medium transition-colors"
                    >
                      See localized pricing →
                    </Link>
                  )}
                </div>

                <ul className="space-y-3 mb-8">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-sm text-dark-300">
                      <span className="mt-0.5 text-brand-400 flex-shrink-0"><CheckIcon /></span>
                      {feature}
                    </li>
                  ))}
                </ul>

                <Link
                  to={isFree ? '/signup' : '/billing'}
                  className={`block w-full py-3 px-4 rounded-xl text-center font-semibold transition-all ${
                    tier.popular
                      ? 'bg-gradient-to-r from-brand-500 to-brand-600 text-white hover:from-brand-400 hover:to-brand-500 shadow-lg shadow-brand-500/20'
                      : 'bg-dark-800 text-white hover:bg-dark-700 border border-dark-700'
                  }`}
                >
                  {isFree ? 'Get started free' : `Subscribe to ${tier.name}`}
                </Link>
              </div>
            );
          })}
        </div>

        <p className="text-center text-sm text-dark-600 mt-10">
          Country-localized prices and secure checkout on the{' '}
          <Link to="/billing" className="text-dark-500 hover:text-dark-300 underline underline-offset-2 transition-colors">
            billing page
          </Link>.
        </p>
      </div>
    </section>
  );
}

// ============================================
// COMPONENT: Testimonials
// ============================================
function Testimonials() {
  const ref = useReveal();

  const testimonials = [
    {
      quote: "NexusAI cut our reporting time by 80%. What used to take our team a full day now happens automatically before we even log in.",
      author: "Sarah Chen",
      role: "VP of Data, Stripe",
      avatar: "SC"
    },
    {
      quote: "The AI insights feature is genuinely impressive. It caught a churn pattern we had been missing for months and saved us $2M in ARR.",
      author: "Marcus Johnson",
      role: "Head of Growth, Notion",
      avatar: "MJ"
    },
    {
      quote: "We evaluated 12 analytics tools. NexusAI was the only one our entire team — from engineers to executives — actually wanted to use.",
      author: "Elena Rodriguez",
      role: "CTO, Linear",
      avatar: "ER"
    }
  ];

  return (
    <section id="testimonials" className="py-20 sm:py-28 px-4 bg-dark-900/30">
      <div ref={ref} className="reveal max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-orange-500/10 text-orange-400 text-sm font-medium mb-4">
            Testimonials
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
            Loved by data teams
            <span className="gradient-text"> everywhere</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {testimonials.map((t, i) => (
            <div key={i} className="relative p-6 sm:p-8 rounded-2xl bg-dark-900/50 border border-dark-800/50">
              <div className="text-brand-500/30 mb-4">
                <QuoteIcon />
              </div>
              <p className="text-dark-200 leading-relaxed mb-6 text-lg">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                  {t.avatar}
                </div>
                <div>
                  <p className="font-semibold text-white">{t.author}</p>
                  <p className="text-sm text-dark-500">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { value: '2,500+', label: 'Active Teams' },
            { value: '99.99%', label: 'Uptime SLA' },
            { value: '<50ms', label: 'Query Latency' },
            { value: '4.9/5', label: 'G2 Rating' }
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <p className="text-3xl sm:text-4xl font-bold gradient-text mb-2">{stat.value}</p>
              <p className="text-sm text-dark-500">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================
// COMPONENT: CTA Section
// ============================================
function CTASection() {
  const ref = useReveal();

  return (
    <section className="py-20 sm:py-28 px-4">
      <div ref={ref} className="reveal max-w-4xl mx-auto">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-brand-600/20 via-purple-600/20 to-brand-600/20 border border-brand-500/20 p-8 sm:p-12 lg:p-16 text-center">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-brand-500/20 rounded-full blur-3xl" />

          <div className="relative z-10">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
              Ready to unlock your
              <br />
              <span className="gradient-text">data potential?</span>
            </h2>
            <p className="text-lg text-dark-300 max-w-xl mx-auto mb-10">
              Join 2,500+ teams already using NexusAI to make smarter, faster decisions. 
              Start your free 14-day trial today.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a 
                href="#pricing"
                className="w-full sm:w-auto px-8 py-4 text-base font-semibold text-white bg-gradient-to-r from-brand-500 to-brand-600 rounded-xl hover:from-brand-400 hover:to-brand-500 transition-all shadow-xl shadow-brand-500/25 flex items-center justify-center gap-2"
              >
                Start Free Trial
                <ArrowRightIcon />
              </a>
            </div>
            <p className="mt-6 text-sm text-dark-500">
              No credit card required. Cancel anytime.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

// ============================================
// COMPONENT: FAQ
// ============================================
function FAQ() {
  const ref = useReveal();
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      q: "How long does setup take?",
      a: "Most teams are up and running within 15 minutes. Our pre-built connectors handle the heavy lifting — just authenticate and select your data sources."
    },
    {
      q: "Can I connect my own data warehouse?",
      a: "Absolutely. NexusAI connects to Snowflake, BigQuery, Redshift, Databricks, and any PostgreSQL-compatible database out of the box."
    },
    {
      q: "Is my data secure?",
      a: "Security is our top priority. We are SOC 2 Type II certified, GDPR compliant, and use AES-256 encryption at rest and TLS 1.3 in transit."
    },
    {
      q: "Do you offer custom enterprise plans?",
      a: "Yes. Our enterprise plan includes custom AI model training, dedicated infrastructure, white-labeling, and a dedicated customer success manager."
    },
    {
      q: "What happens after my free trial?",
      a: "You will be prompted to choose a plan. If you do not subscribe, your data is securely deleted after a 30-day grace period. No surprises."
    }
  ];

  return (
    <section className="py-20 sm:py-28 px-4 bg-dark-900/30">
      <div ref={ref} className="reveal max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <span className="inline-block px-4 py-1.5 rounded-full bg-brand-500/10 text-brand-400 text-sm font-medium mb-4">
            FAQ
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-white">
            Frequently asked questions
          </h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <div 
              key={i}
              className="rounded-xl bg-dark-900/50 border border-dark-800/50 overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full flex items-center justify-between p-5 sm:p-6 text-left"
              >
                <span className="font-semibold text-white pr-4">{faq.q}</span>
                <span className={`text-dark-500 transition-transform flex-shrink-0 ${openIndex === i ? 'rotate-180' : ''}`}>
                  <ChevronDownIcon />
                </span>
              </button>
              <div className={`overflow-hidden transition-all duration-300 ${openIndex === i ? 'max-h-40' : 'max-h-0'}`}>
                <p className="px-5 sm:px-6 pb-5 sm:pb-6 text-dark-400 leading-relaxed">
                  {faq.a}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================
// COMPONENT: Footer
// ============================================
function Footer() {
  const footerLinks = {
    Product: ['Features', 'Integrations', 'Pricing', 'Changelog', 'Roadmap'],
    Company: ['About', 'Blog', 'Careers', 'Press', 'Contact'],
    Resources: ['Documentation', 'API Reference', 'Community', 'Status', 'Support'],
    Legal: ['Privacy', 'Terms', 'Security', 'Cookies']
  };

  return (
    <footer className="border-t border-dark-800/50 py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8 mb-12">
          <div className="col-span-2">
            <a href="#" className="flex items-center gap-3 mb-4">
              <Logo />
              <span className="text-xl font-bold text-white">NexusAI</span>
            </a>
            <p className="text-dark-500 text-sm leading-relaxed mb-6 max-w-xs">
              AI-powered analytics for modern teams. Turn your data into decisions that matter.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="text-dark-500 hover:text-white transition-colors"><TwitterIcon /></a>
              <a href="#" className="text-dark-500 hover:text-white transition-colors"><LinkedInIcon /></a>
              <a href="#" className="text-dark-500 hover:text-white transition-colors"><GithubIcon /></a>
            </div>
          </div>

          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="font-semibold text-white mb-4 text-sm">{category}</h4>
              <ul className="space-y-3">
                {links.map(link => (
                  <li key={link}>
                    <a href="#" className="text-sm text-dark-500 hover:text-white transition-colors">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="pt-8 border-t border-dark-800/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-dark-600">
            &copy; 2026 NexusAI, Inc. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-sm text-dark-600 hover:text-dark-400 transition-colors">Privacy Policy</a>
            <a href="#" className="text-sm text-dark-600 hover:text-dark-400 transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ============================================
// LANDING PAGE (all sections combined)
// ============================================
function LandingPage() {
  return (
    <div className="min-h-screen bg-dark-950">
      <Navbar />
      <Hero />
      <TrustedBy />
      <Features />
      <HowItWorks />
      <Pricing />
      <Testimonials />
      <CTASection />
      <DemoRequestForm />
      <FAQ />
      <Footer />
    </div>
  );
}

// ============================================
// MAIN APP (routing)
// ============================================
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/projects"
        element={
          <ProtectedRoute>
            <ProjectsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/projects/:id"
        element={
          <ProtectedRoute>
            <ProjectBoardPage />
          </ProtectedRoute>
        }
      />
    <Route
  path="/market"
  element={
    <ProtectedRoute>
      <MarketPage />
    </ProtectedRoute>
  }
/>
<Route
  path="/billing"
  element={
    <ProtectedRoute>
      <BillingPage />
    </ProtectedRoute>
  }
/>
<Route
  path="/welcome"
  element={
    <ProtectedRoute>
      <WelcomePage />
    </ProtectedRoute>
  }
/>
</Routes>
);
}
