import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { useTheme } from '../../../context/ThemeContext';
import { useDashboardStats } from '../shared/useDashboardStats';
import { LogOut, Palette, Plus, ShieldCheck, Briefcase, Bolt, Home, Eye, MessageSquare } from 'lucide-react';
import SwipeableTabs from './SwipeableTabs';
import MobileNav from './MobileNav';
import BottomSheet from './BottomSheet';
import HomeView from './views/HomeView';
import InboxView from './views/InboxView';
import ContentView from './views/ContentView';
import SystemView from './views/SystemView';

const TAB_TO_CATEGORY = {
  home: 'home',
  messages: 'inbox',
  chats: 'inbox',
  projects: 'content',
  testimonials: 'content',
  updates: 'content',
  skills: 'content',
  experience: 'content',
  education: 'content',
  certifications: 'content',
  preview: 'content',
  theme: 'system',
  settings: 'system',
};

export default function MobileShell() {
  const navigate = useNavigate();
  const { tab } = useParams();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const stats = useDashboardStats();

  const currentTab = tab || 'home';
  const activeCategory = TAB_TO_CATEGORY[currentTab] || 'home';

  const [categorySubTabs, setCategorySubTabs] = useState({
    home: 'home',
    inbox: 'messages',
    content: 'projects',
    system: 'settings',
  });

  const [isQuickActionsOpen, setIsQuickActionsOpen] = useState(false);

  useEffect(() => {
    if (!tab || !TAB_TO_CATEGORY[tab]) {
      navigate('/admin/dashboard/home', { replace: true });
    } else {
      const cat = TAB_TO_CATEGORY[tab];
      setCategorySubTabs((prev) => {
        if (prev[cat] === tab) return prev;
        return { ...prev, [cat]: tab };
      });
    }
  }, [tab, navigate]);

  const handleSelectCategory = (cat) => {
    const targetTab = categorySubTabs[cat] || (cat === 'home' ? 'home' : cat === 'inbox' ? 'messages' : cat === 'content' ? 'projects' : 'settings');
    navigate(`/admin/dashboard/${targetTab}`);
  };

  const handleSelectSubTab = (newSubTab) => {
    navigate(`/admin/dashboard/${newSubTab}`);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  return (
    <div className="admin-mobile-shell">
      {/* Top Bar */}
      <header className="admin-mobile-topbar">
        <div className="admin-mobile-logo">
          <div className="admin-logo-icon">
            <i className="ti ti-command" style={{ fontSize: 16, color: '#fff' }} />
          </div>
          <div>
            <h1 className="admin-mobile-title">Portfolio CMS</h1>
            <p className="admin-mobile-subtitle">Admin Mobile</p>
          </div>
        </div>

        <div className="admin-mobile-top-actions">
          {/* Quick Actions Button */}
          <button
            className="admin-mobile-action-btn"
            onClick={() => setIsQuickActionsOpen(true)}
            aria-label="Quick Actions"
            title="Quick Actions"
          >
            <Plus size={18} />
          </button>

          {/* Theme Toggle */}
          <button
            className="admin-mobile-action-btn"
            onClick={toggleTheme}
            aria-label="Toggle Theme"
          >
            <Palette size={18} />
          </button>

          {/* Logout Button */}
          <button
            className="admin-mobile-action-btn logout"
            onClick={handleLogout}
            aria-label="Log Out"
          >
            <LogOut size={18} />
          </button>
        </div>
      </header>

      {/* Main Swipeable Content */}
      <main className="admin-mobile-content">
        <SwipeableTabs
          activeCategory={activeCategory}
          onCategoryChange={handleSelectCategory}
          childrenMap={{
            home: <HomeView />,
            inbox: (
              <InboxView
                activeSubTab={categorySubTabs.inbox}
                onSelectSubTab={handleSelectSubTab}
                unreadMessagesCount={stats.unreadMessages}
              />
            ),
            content: (
              <ContentView
                activeSubTab={categorySubTabs.content}
                onSelectSubTab={handleSelectSubTab}
              />
            ),
            system: (
              <SystemView
                activeSubTab={categorySubTabs.system}
                onSelectSubTab={handleSelectSubTab}
              />
            ),
          }}
        />
      </main>

      {/* Bottom Navigation */}
      <MobileNav
        activeCategory={activeCategory}
        onSelectCategory={handleSelectCategory}
        unreadMessagesCount={stats.unreadMessages}
      />

      {/* Quick Actions Bottom Sheet */}
      <BottomSheet
        isOpen={isQuickActionsOpen}
        onClose={() => setIsQuickActionsOpen(false)}
        title="Quick Actions"
      >
        <div className="admin-quick-actions-grid">
          <button
            className="admin-quick-action-card"
            onClick={() => {
              setIsQuickActionsOpen(false);
              navigate('/admin/dashboard/projects');
            }}
          >
            <div className="quick-action-icon" style={{ background: '#10b98120', color: '#10b981' }}>
              <Briefcase size={22} />
            </div>
            <span>New Project</span>
          </button>

          <button
            className="admin-quick-action-card"
            onClick={() => {
              setIsQuickActionsOpen(false);
              navigate('/admin/dashboard/messages');
            }}
          >
            <div className="quick-action-icon" style={{ background: '#6366f120', color: '#6366f1' }}>
              <MessageSquare size={22} />
            </div>
            <span>Messages</span>
          </button>

          <button
            className="admin-quick-action-card"
            onClick={() => {
              setIsQuickActionsOpen(false);
              navigate('/admin/dashboard/updates');
            }}
          >
            <div className="quick-action-icon" style={{ background: '#f59e0b20', color: '#f59e0b' }}>
              <i className="ti ti-bolt" style={{ fontSize: 22 }} />
            </div>
            <span>New Update</span>
          </button>

          <button
            className="admin-quick-action-card"
            onClick={() => {
              setIsQuickActionsOpen(false);
              navigate('/admin/dashboard/skills');
            }}
          >
            <div className="quick-action-icon" style={{ background: '#06b6d420', color: '#06b6d4' }}>
              <i className="ti ti-star" style={{ fontSize: 22 }} />
            </div>
            <span>Add Skill</span>
          </button>

          <button
            className="admin-quick-action-card"
            onClick={() => {
              setIsQuickActionsOpen(false);
              navigate('/admin/dashboard/preview');
            }}
          >
            <div className="quick-action-icon" style={{ background: '#8b5cf620', color: '#8b5cf6' }}>
              <Eye size={22} />
            </div>
            <span>Live Preview</span>
          </button>
        </div>
      </BottomSheet>
    </div>
  );
}
