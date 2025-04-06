"use client"

import { useEffect, type ReactNode } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

type CustomDialogProps = {
  isOpen: boolean
  onClose: () => void
  title: string
  children: ReactNode
  actions?: ReactNode
}

export default function CustomDialog({ isOpen, onClose, title, children, actions }: CustomDialogProps) {
  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }

    if (isOpen) {
      window.addEventListener("keydown", handleEscape)
    }

    return () => {
      window.removeEventListener("keydown", handleEscape)
    }
  }, [isOpen, onClose])

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-md w-full"
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-medium">{title}</h3>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={onClose}>
                <X size={18} />
              </Button>
            </div>

            <div className="p-4">{children}</div>

            {actions && <div className="flex justify-end gap-2 p-4 pt-2 border-t">{actions}</div>}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Confirmation dialog component
type ConfirmDialogProps = {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
}: ConfirmDialogProps) {
  return (
    <CustomDialog
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      actions={
        <>
          <Button variant="outline" onClick={onClose}>
            {cancelText}
          </Button>
          <Button
            onClick={() => {
              onConfirm()
              onClose()
            }}
          >
            {confirmText}
          </Button>
        </>
      }
    >
      <p>{message}</p>
    </CustomDialog>
  )
}

// Alert dialog component
type AlertDialogProps = {
  isOpen: boolean
  onClose: () => void
  title: string
  message: string
  buttonText?: string
}

export function AlertDialog({ isOpen, onClose, title, message, buttonText = "OK" }: AlertDialogProps) {
  return (
    <CustomDialog
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      actions={<Button onClick={onClose}>{buttonText}</Button>}
    >
      <p>{message}</p>
    </CustomDialog>
  )
}

