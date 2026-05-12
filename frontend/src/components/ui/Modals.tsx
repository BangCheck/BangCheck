'use client';

import { ConfirmModal, Modal } from './Modal';

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

/**
 * 방 카드 삭제 확인 모달 — Figma `373:19945` (E12-S03 SCR-HOME 모바일)
 */
export function DeleteRoomModal({
  isOpen,
  onClose,
  onConfirm,
}: BaseModalProps & {
  onConfirm: () => void;
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} className="pt-8 pb-5 px-4">
      <div className="flex flex-col gap-5 items-center w-full">
        <div className="flex flex-col gap-2 items-center text-center w-full">
          <h3 className="text-[18px] font-bold text-text-main leading-[1.3]">
            해당 방 기록을 삭제하시겠어요?
          </h3>
          <p className="text-[14px] font-normal text-text-mute text-center leading-[1.3]">
            삭제 시, 데이터를 복구할 수 없습니다.
          </p>
        </div>
        <div className="flex gap-2 items-center w-full">
          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 bg-bg-gray-soft text-text-sub text-[15px] font-semibold rounded-[6px] hover:bg-bg-gray-hover transition-colors active:scale-[0.98] cursor-pointer"
          >
            취소
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-3 px-4 bg-brand-primary text-white text-[15px] font-semibold rounded-[6px] hover:bg-brand-primary-dark transition-colors active:scale-[0.98] cursor-pointer"
          >
            삭제
          </button>
        </div>
      </div>
    </Modal>
  );
}
