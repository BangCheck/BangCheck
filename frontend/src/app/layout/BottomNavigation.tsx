import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { ROUTES } from '@/lib/routes';
import { useAuthStore } from '@/store/use-auth-store';
import { useGuestRoomStore } from '@/store/use-guest-room-store';
import { useRoomsList } from '@/features/rooms/hooks/use-rooms-query';

const IconRoomList = ({ active }: { active: boolean }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="3" width="18" height="18" rx="2" stroke={active ? '#0A607D' : '#A0A0A0'} strokeWidth="2" />
    <path d="M7 8H17" stroke={active ? '#0A607D' : '#A0A0A0'} strokeWidth="1.5" strokeLinecap="round" />
    <path d="M7 12H17" stroke={active ? '#0A607D' : '#A0A0A0'} strokeWidth="1.5" strokeLinecap="round" />
    <path d="M7 16H13" stroke={active ? '#0A607D' : '#A0A0A0'} strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const IconMap = ({ active }: { active: boolean }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M9 4L3 7V20L9 17L15 20L21 17V4L15 7L9 4Z" fill={active ? '#0A607D' : '#A0A0A0'} />
    <path d="M9 4V17M15 7V20" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const IconCompare = ({ active }: { active: boolean }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M14 2H6C4.89543 2 4 2.89543 4 4V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V8L14 2Z" fill={active ? '#0A607D' : '#A0A0A0'} />
    <path d="M14 2V8H20" fill={active ? '#0A607D' : '#A0A0A0'} stroke={active ? '#0A607D' : '#A0A0A0'} strokeWidth="1" strokeLinejoin="round" />
    <path d="M8 13H16M8 17H13" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const IconCustom = ({ active }: { active: boolean }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C10.3431 2 9 3.34315 9 5H5C3.89543 5 3 5.89543 3 7V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V7C21 5.89543 20.1046 5 19 5H15C15 3.34315 13.6569 2 12 2ZM12 4C12.5523 4 13 4.44772 13 5H11C11 4.44772 11.4477 4 12 4ZM12 10C10.8954 10 10 10.8954 10 12C10 13.1046 10.8954 14 12 14C13.1046 14 14 13.1046 14 12C14 10.8954 13.1046 10 12 10ZM8 12C8 9.79086 9.79086 8 12 8C14.2091 8 16 9.79086 16 12C16 14.2091 14.2091 16 12 16C9.79086 16 8 14.2091 8 12Z" fill={active ? '#0A607D' : '#A0A0A0'} />
  </svg>
);

const BottomNavigation = () => {
  const { pathname } = useLocation();
  const { isLoggedIn } = useAuthStore();
  const { guestRooms } = useGuestRoomStore();
  const { data: apiRooms } = useRoomsList();

  if (pathname.startsWith('/checklist/')) return null;

  const roomsCount = isLoggedIn ? (apiRooms?.length ?? 0) : guestRooms.length;
  const isCompareDisabled = roomsCount < 2;

  const navItems = [
    { label: '방 목록', icon: IconRoomList, href: ROUTES.HOME },
    { label: '지도', icon: IconMap, href: ROUTES.MAP },
    { label: '시작', icon: null, href: ROUTES.CHECKLIST_NEW, isCenter: true },
    { label: '비교 리포트', icon: IconCompare, href: ROUTES.REPORT, disabled: isCompareDisabled },
    { label: '커스텀', icon: IconCustom, href: ROUTES.SETTINGS },
  ];

  return (
    <nav className="touch-device-only sm:hidden sticky bottom-0 w-full h-[80px] bg-white border-t border-border-light px-2 flex items-center justify-around z-50 pb-safe">
      {navItems.map((item, idx) => {
        const isActive = pathname === item.href;

        if (item.isCenter) {
          return (
            <Link key={idx} to={item.href} className="relative -top-5 flex flex-col items-center">
              <div className="w-[60px] h-[60px] bg-btn-dark rounded-lg border-[3px] border-white flex flex-col items-center justify-center shadow-lg active:scale-95 transition-transform">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 5V19M5 12H19" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="text-white text-[12px] font-medium mt-0.5">시작</span>
              </div>
            </Link>
          );
        }

        const Icon = item.icon!;
        const isDisabled = item.disabled;

        if (isDisabled) {
          return (
            <div
              key={idx}
              aria-disabled="true"
              className="flex flex-col items-center gap-1 min-w-[64px] opacity-40 pointer-events-none"
            >
              <Icon active={false} />
              <span className="text-[12px] font-medium text-text-caption">
                {item.label}
              </span>
            </div>
          );
        }

        return (
          <Link key={idx} to={item.href} className="flex flex-col items-center gap-1 min-w-[64px] active:opacity-70 transition-opacity">
            <Icon active={isActive} />
            <span className={cn('text-[12px] font-medium', isActive ? 'text-brand-primary' : 'text-text-caption')}>
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
};

export default BottomNavigation;
