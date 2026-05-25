'use client';

import React, { useEffect } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
}

export function Modal({ isOpen, onClose, children, className }: ModalProps) {
  // Prevent scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className={cn(
        "relative bg-white rounded-[6px] shadow-xl w-[90%] max-w-[308px] p-6 flex flex-col items-start animate-in fade-in zoom-in duration-200",
        className
      )}>
        {children}
      </div>
    </div>
  );
}

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
  title: string;
  description?: string;
  leftButtonText: string;
  rightButtonText: string;
  onLeftClick: () => void;
  onRightClick: () => void;
}

export function ConfirmModal({
  isOpen,
  onClose,
  title,
  description,
  leftButtonText,
  rightButtonText,
  onLeftClick,
  onRightClick,
  className
}: ConfirmModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} className={className}>
      <div className="flex flex-col gap-[24px] items-center w-full">
        <div className="flex flex-col gap-[24px] items-center text-center w-full">
          <h3 className="text-[18px] font-semibold text-black leading-[1.3]">
            {title}
          </h3>

          {description && (
            <p className="text-[14px] font-medium text-text-main text-center whitespace-pre-wrap leading-[1.3]">
              {description}
            </p>
          )}
        </div>

        <div className="flex gap-[12px] items-stretch w-full">
          <button
            onClick={onLeftClick}
            className="flex flex-1 items-center justify-center py-[12px] px-[8px] bg-bg-gray text-text-main text-[14px] font-medium rounded-[4px] hover:bg-gray-200 transition-colors active:scale-[0.98] cursor-pointer text-center leading-[1.3]"
          >
            {leftButtonText}
          </button>
          <button
            onClick={onRightClick}
            className="flex flex-1 items-center justify-center py-[12px] px-[8px] bg-brand-primary text-white text-[14px] font-medium rounded-[4px] hover:bg-brand-primary-dark transition-colors active:scale-[0.98] cursor-pointer text-center leading-[1.3]"
          >
            {rightButtonText}
          </button>
        </div>
      </div>
    </Modal>
  );
}
