import React from 'react';

interface BottomTabBarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  pendingInboxCount: number;
  pendingChatsCount?: number;
  matchesCount?: number;
}

const iconProps = {
  xmlns: 'http://www.w3.org/2000/svg',
  width: 24,
  height: 24,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
};

const RadarNavIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg {...iconProps} strokeWidth="1.8" className={className}>
    <circle cx="12" cy="12" r="9" />
    <circle cx="12" cy="12" r="4.5" />
    <circle cx="12" cy="12" r="1" fill="currentColor" />
  </svg>
);

const MatchesNavIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg {...iconProps} strokeWidth="1.8" strokeLinejoin="round" className={className}>
    <path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z" />
  </svg>
);

const ChatsNavIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg {...iconProps} strokeWidth="1.8" strokeLinejoin="round" className={className}>
    <path d="M4 5h16v11H9l-5 4z" />
  </svg>
);

const HistoryNavIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg {...iconProps} strokeWidth="1.8" strokeLinecap="round" className={className}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </svg>
);

const MeNavIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg {...iconProps} strokeWidth="1.8" strokeLinecap="round" className={className}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 20c1.5-4 4.5-6 8-6s6.5 2 8 6" />
  </svg>
);

export const BottomTabBar: React.FC<BottomTabBarProps> = ({
  activeTab,
  setActiveTab,
  pendingInboxCount,
  pendingChatsCount = 0,
  matchesCount = 0
}) => {
  const tabs = [
    { id: 'discovery', label: 'Radar', icon: RadarNavIcon },
    { id: 'matchmaking', label: 'Matches', icon: MatchesNavIcon, badge: matchesCount },
    { id: 'chat', label: 'Chats', icon: ChatsNavIcon, badge: pendingChatsCount },
    { id: 'inbox', label: 'History', icon: HistoryNavIcon, badge: pendingInboxCount },
    { id: 'profile', label: 'Me', icon: MeNavIcon }
  ];

  return (
    <nav
      aria-label="Bottom Navigation"
      className="fixed bottom-0 left-0 right-0 z-50 bg-[#FFFFFF]/95 backdrop-blur-md border-t border-[#D8D8D3] max-w-[430px] w-full mx-auto shadow-sm transition-colors duration-200"
    >
      <div className="grid grid-cols-5 h-16 items-center px-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id || (tab.id === 'profile' && activeTab === 'activity-log') || (tab.id === 'discovery' && activeTab === 'home');

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center min-h-[48px] py-1 transition-all relative cursor-pointer ${
                isActive
                  ? 'text-[#16171A]'
                  : 'text-[#8E9097] hover:text-[#16171A]'
              }`}
            >
              <div className="relative flex items-center justify-center">
                <Icon
                  className={`w-4.5 h-4.5 transition-transform ${
                    isActive ? 'stroke-[2.3] scale-105 text-[#16171A]' : 'stroke-[1.7]'
                  }`}
                />

                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 min-w-[16px] h-4 px-1 bg-[#16171A] text-[#F6F6F3] text-[9.5px] font-semibold rounded-full flex items-center justify-center shadow-xs">
                    {tab.badge}
                  </span>
                )}
              </div>

              <span
                className={`text-[10px] tracking-tight mt-1 transition-all ${
                  isActive
                    ? 'font-semibold text-[#16171A]'
                    : 'font-medium text-[#8E9097]'
                }`}
              >
                {tab.label}
              </span>

              {/* Clean minimal active indicator dot */}
              {isActive && (
                <span className="w-1 h-1 rounded-full bg-[#16171A] mt-0.5"></span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
