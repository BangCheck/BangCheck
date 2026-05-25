import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { ROUTES } from '@/lib/routes';
import { useAuthStore } from '@/store/use-auth-store';
import { useGuestRoomStore } from '@/store/use-guest-room-store';
import { useRoomsList } from '@/features/rooms/hooks/use-rooms-query';

const IconRoomList = ({ active }: { active: boolean }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M19 3H5C3.89543 3 3 3.89543 3 5V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V5C21 3.89543 20.1046 3 19 3Z" stroke={active ? '#0A607D' : '#A0A0A0'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M9 7H15" stroke={active ? '#0A607D' : '#A0A0A0'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M9 12H15" stroke={active ? '#0A607D' : '#A0A0A0'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M9 17H13" stroke={active ? '#0A607D' : '#A0A0A0'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IconCompare = ({ active }: { active: boolean }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M14 2H6C4.89543 2 4 2.89543 4 4V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V8L14 2Z" stroke={active ? '#0A607D' : '#A0A0A0'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M14 2V8H20" stroke={active ? '#0A607D' : '#A0A0A0'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M8 13H16" stroke={active ? '#0A607D' : '#A0A0A0'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M8 17H16" stroke={active ? '#0A607D' : '#A0A0A0'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IconCustom = ({ active }: { active: boolean }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke={active ? '#0A607D' : '#A0A0A0'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M19.4 15L20.6 13.4C20.7 13.2 20.7 12.8 20.5 12.6L19.4 11.2C19.3 11.1 19.2 11 19.1 11L17.3 10.8C17 10.8 16.7 10.6 16.6 10.3L15.8 8.7C15.7 8.5 15.4 8.4 15.2 8.4L13.6 8.8C13.3 8.9 13 8.8 12.8 8.6L11.2 7.4C11 7.3 10.7 7.3 10.5 7.5L9.1 8.6C9 8.7 8.9 8.8 8.9 8.9L8.7 10.7C8.7 11 8.5 11.3 8.2 11.4L6.6 12.2C6.4 12.3 6.3 12.6 6.3 12.8L6.7 14.4C6.8 14.7 6.7 15 6.5 15.2L5.3 16.8C5.2 17 5.2 17.3 5.4 17.5L6.5 18.9C6.6 19 6.7 19.1 6.8 19.1L8.6 19.3C8.9 19.3 9.2 19.5 9.3 19.8L10.1 21.4C10.2 21.6 10.5 21.7 10.7 21.7L12.3 21.3C12.6 21.2 12.9 21.3 13.1 21.5L14.7 22.7C14.9 22.8 15.2 22.8 15.4 22.6L16.8 21.5C16.9 21.4 17 21.3 17 21.2L17.2 19.4C17.2 19.1 17.4 18.8 17.7 18.7L19.3 17.9C19.5 17.8 19.6 17.5 19.6 17.3L19.2 15.7C19.1 15.4 19.2 15.1 19.4 15.1V15Z" stroke={active ? '#0A607D' : '#A0A0A0'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IconMy = ({ active }: { active: boolean }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 12C14.2091 12 16 10.2091 16 8C16 5.79086 14.2091 4 12 4C9.79086 4 8 5.79086 8 8C8 10.2091 9.79086 12 12 12Z" stroke={active ? '#0A607D' : '#A0A0A0'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M4 21C4 16.5817 7.58172 13 12 13C16.4183 13 20 16.5817 20 21" stroke={active ? '#0A607D' : '#A0A0A0'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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
    { label: '비교 리포트', icon: IconCompare, href: ROUTES.REPORT, disabled: isCompareDisabled },
    { label: '시작', icon: null, href: ROUTES.CHECKLIST_NEW, isCenter: true },
    { label: '커스텀', icon: IconCustom, href: ROUTES.SETTINGS },
    { label: '마이', icon: IconMy, href: ROUTES.MY },
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
