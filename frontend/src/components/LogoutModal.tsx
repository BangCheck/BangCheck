import { ConfirmModal } from '@/components/ui/Modal';

interface LogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
}

export default function LogoutModal({ isOpen, onClose, onLogout }: LogoutModalProps) {
  return (
    <ConfirmModal
      isOpen={isOpen}
      onClose={onClose}
      title="로그아웃 하시겠습니까?"
      leftButtonText="취소"
      rightButtonText="로그아웃"
      onLeftClick={onClose}
      onRightClick={onLogout}
    />
  );
}
