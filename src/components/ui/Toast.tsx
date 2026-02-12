import { useEffect, useState } from 'react'
import { create } from 'zustand'

interface ToastState {
  message: string | null
  type: 'success' | 'info' | 'warning'
  show: (message: string, type?: 'success' | 'info' | 'warning') => void
  hide: () => void
}

export const useToast = create<ToastState>((set) => ({
  message: null,
  type: 'success',
  show: (message, type = 'success') => set({ message, type }),
  hide: () => set({ message: null }),
}))

const TYPE_STYLES = {
  success: 'bg-green-600 text-white',
  info: 'bg-blue-600 text-white',
  warning: 'bg-yellow-600 text-black',
}

export function Toast() {
  const { message, type, hide } = useToast()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (message) {
      setVisible(true)
      const timer = setTimeout(() => {
        setVisible(false)
        setTimeout(hide, 300)
      }, 2500)
      return () => clearTimeout(timer)
    }
  }, [message, hide])

  if (!message) return null

  return (
    <div
      className={`fixed bottom-20 left-1/2 z-50 -translate-x-1/2 transform rounded-lg px-4 py-2 text-sm font-medium shadow-lg transition-all duration-300 lg:bottom-6 ${
        TYPE_STYLES[type]
      } ${visible ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'}`}
    >
      {message}
    </div>
  )
}
