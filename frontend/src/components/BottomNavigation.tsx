import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { ROUTES } from '@/lib/routes';

const IconRoomList = ({ active }: { active: boolean }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M19 3H5C3.89543 3 3 3.89543 3 5V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V5C21 3.89543 20.1046 3 19 3Z" stroke={active ? '#0A607D' : '#A0A0A0'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M9 7H15" stroke={active ? '#0A607D' : '#A0A0A0'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M9 12H15" stroke={active ? '#0A607D' : '#A0A0A0'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M9 17H13" stroke={active ? '#0A607D' : '#A0A0A0'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IconCustom = ({ active }: { active: boolean }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke={active ? '#0A607D' : '#A0A0A0'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M19.4 15L20.6 13.4C20.7 13.2 20.7 12.8 20.5 12.6L19.4 11.2C19.3 11.1 19.2 11 19.1 11L17.3 10.8C17 10.8 16.7 10.6 16.6 10.3L15.8 8.7C15.7 8.5 15.4 8.4 15.2 8.4L13.6 8.8C13.3 8.9 13 8.8 12.8 8.6L11.2 7.4C11 7.3 10.7 7.3 10.5 7.5L9.1 8.6C9 8.7 8.9 8.8 8.9 8.9L8.7 10.7C8.7 11 8.5 11.3 8.2 11.4L6.6 12.2C6.4 12.3 6.3 12.6 6.3 12.8L6.7 14.4C6.8 14.7 6.7 15 6.5 15.2L5.3 16.8C5.2 17 5.2 17.3 5.4 17.5L6.5 18.9C6.6 19 6.7 19.1 6.8 19.1L8.6 19.3C8.9 19.3 9.2 19.5 9.3 19.8L10.1 21.4C10.2 21.6 10.5 21.7 10.7 21.7L12.3 21.3C12.6 21.2 12.9 21.3 13.1 21.5L14.7 22.7C14.9 22.8 15.2 22.8 15.4 22.6L16.8 21.5C16.9 21.4 17 21.3 17 21.2L17.2 19.4C17.2 19.1 17.4 18.8 17.7 18.7L19.3 17.9C19.5 17.8 19.6 17.5 19.6 17.3L19.2 15.7C19.1 15.4 19.2 15.1 19.4 15.1V15Z" stroke={active ? '#0A607D' : '#A0A0A0'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IconUser = ({ active }: { active: boolean }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke={active ? '#0A607D' : '#A0A0A0'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" stroke={active ? '#0A607D' : '#A0A0A0'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const BottomNavigation = () => {
  const { pathname } = useLocation();

  const navItems = [
    { label: '방 목록', icon: IconRoomList, href: ROUTES.HOME },
    { label: '시작', icon: null, href: ROUTES.CHECKLIST_NEW, isCenter: true },
    { label: '커스텀', icon: IconCustom, href: ROUTES.SETTINGS },
    { label: '마이', icon: IconUser, href: '/my' },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-[80px] bg-white border-t border-[#E2E2E2] px-2 flex items-center justify-around z-50 pb-safe">
      {navItems.map((item, idx) => {
        const isActive = pathname === item.href;

        if (item.isCenter) {
          return (
            <Link key={idx} to={item.href} className="relative -top-5 flex flex-col items-center">
              <div className="w-[60px] h-[60px] bg-[#404040] rounded-lg border-[3px] border-white flex flex-col items-center justify-center shadow-lg active:scale-95 transition-transform">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 5V19M5 12H19" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="text-white text-[12px] font-medium mt-0.5">시작</span>
              </div>
            </Link>
          );
        }

        const Icon = item.icon!;
        return (
          <Link key={idx} to={item.href} className="flex flex-col items-center gap-1 min-w-[64px] active:opacity-70 transition-opacity">
            <Icon active={isActive} />
            <span className={cn('text-[12px] font-medium', isActive ? 'text-text-caption' : 'text-border-light')}>
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
};

export default BottomNavigation;
