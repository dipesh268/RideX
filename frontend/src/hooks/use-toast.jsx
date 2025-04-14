
import { createContext, useContext, useState } from "react"

const ToastContext = createContext({
  toasts: [],
  addToast: () => {},
  removeToast: () => {},
  updateToast: () => {},
})

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const addToast = (toast) => {
    setToasts((prev) => [...prev, { ...toast, id: Math.random().toString() }])
  }

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }

  const updateToast = (id, toast) => {
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...toast } : t))
    )
  }

  return (
    <ToastContext.Provider
      value={{
        toasts,
        addToast,
        removeToast,
        updateToast,
      }}
    >
      {children}
    </ToastContext.Provider>
  )
}

export function useToast() {
  const { toasts, addToast, removeToast, updateToast } = useContext(ToastContext)

  return {
    toasts,
    toast: (props) => {
      addToast(props)
    },
    remove: (id) => {
      removeToast(id)
    },
    update: (id, props) => {
      updateToast(id, props)
    },
  }
}

export const toast = {
  DEFAULT: (props) => {
    const { toast } = useToast()
    toast(props)
  },
  success: (title, props) => {
    const { toast } = useToast()
    toast({ ...props, title, variant: "success" })
  },
  error: (title, props) => {
    const { toast } = useToast()
    toast({ ...props, title, variant: "destructive" })
  },
  warning: (title, props) => {
    const { toast } = useToast()
    toast({ ...props, title, variant: "warning" })
  },
  info: (title, props) => {
    const { toast } = useToast()
    toast({ ...props, title, variant: "info" })
  },
}
