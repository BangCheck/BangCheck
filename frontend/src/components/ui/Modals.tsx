'use client';

import { ConfirmModal } from './Modal';

interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * 01_로그인/비로그인 안내 모달
 */
export function LoginRequiredModal({ 
  isOpen, 
  onClose, 
  onContinueAsGuest, 
  onLogin 
}: BaseModalProps & { 
  onContinueAsGuest: () => void; 
  onLogin: () => void; 
}) {
  return (
    <ConfirmModal
      isOpen={isOpen}
      onClose={onClose}
      title="로그인 후 이용해주세요"
      description="비로그인 상태에서는 데이터가 저장되지 않으며&#10;최대 2개의 체크리스트만 등록할 수 있어요."
      leftButtonText="비로그인으로 진행하기"
      rightButtonText="로그인하기"
      onLeftClick={onContinueAsGuest}
      onRightClick={onLogin}
    />
  );
}

/**
 * 01_로그아웃 안내 모달
 */
export function LogoutConfirmModal({ 
  isOpen, 
  onClose, 
  onLogout 
}: BaseModalProps & { 
  onLogout: () => void; 
}) {
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

/**
 * 01_비교리포트 비활성화 안내 모달
 */
export function ComparisonDisabledModal({ 
  isOpen, 
  onClose, 
  onStartChecklist 
}: BaseModalProps & { 
  onStartChecklist: () => void; 
}) {
  return (
    <ConfirmModal
      isOpen={isOpen}
      onClose={onClose}
      title="비교리포트를 확인하시겠어요?"
      description="매물이 1개 이하인 경우,&#10;비교리포트를 확인하실 수 없습니다. 매물을 등록하시겠어요?"
      leftButtonText="취소"
      rightButtonText="체크리스트 시작하기"
      onLeftClick={onClose}
      onRightClick={onStartChecklist}
    />
  );
}

/**
 * 맞춤 체크리스트 설정 모달 (Screenshot 2 context)
 */
export function CustomChecklistModal({ 
  isOpen, 
  onClose, 
  onLater, 
  onSetup 
}: BaseModalProps & { 
  onLater: () => void; 
  onSetup: () => void; 
}) {
  return (
    <ConfirmModal
      isOpen={isOpen}
      onClose={onClose}
      title="맞춤 체크리스트 설정해볼까요?"
      description="나에게 중요한 항목만 골라서&#10;나만의 체크리스트를 만들 수 있어요."
      leftButtonText="나중에 하기"
      rightButtonText="설정하기"
      onLeftClick={onLater}
      onRightClick={onSetup}
    />
  );
}

/**
 * 01_비로그인 수정 제한 안내 모달
 */
export function GuestEditDisabledModal({ 
  isOpen, 
  onClose, 
  onLogin 
}: BaseModalProps & { 
  onLogin: () => void; 
}) {
  return (
    <ConfirmModal
      isOpen={isOpen}
      onClose={onClose}
      title="수정할 수 없어요"
      description="비로그인 상태에서는 수정이 불가능합니다.&#10;로그인해서 수정 기능을 이용해보세요!"
      leftButtonText="취소"
      rightButtonText="로그인하기"
      onLeftClick={onClose}
      onRightClick={onLogin}
    />
  );
}
