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
        className="fixed inset-0 bg-black/40 backdrop-blur-[2px]" 
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className={cn(
        "relative bg-white rounded-[20px] shadow-xl w-[90%] max-w-[340px] p-6 flex flex-col items-center animate-in fade-in zoom-in duration-200",
        className
      )}>
        {children}
      </div>
    </div>
  );
}

interface ConfirmModalProps extends ModalProps {
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
      <h3 className="text-[18px] font-bold text-text-main text-center mt-2 mb-3">
        {title}
      </h3>
      
      {description && (
        <p className="text-[13px] text-text-caption text-center whitespace-pre-wrap mb-6 leading-relaxed">
          {description}
        </p>
      )}
      
      <div className="flex w-full gap-2 mt-2">
        <button
          onClick={onLeftClick}
          className="flex-1 py-3.5 bg-bg-gray text-text-main text-[14px] font-medium rounded-lg hover:bg-gray-200 transition-colors active:scale-[0.98]"
        >
          {leftButtonText}
        </button>
        <button
          onClick={onRightClick}
          className="flex-1 py-3.5 bg-brand-primary text-white text-[14px] font-medium rounded-lg hover:brightness-110 transition-all active:scale-[0.98]"
        >
          {rightButtonText}
        </button>
      </div>
    </Modal>
  );
}
