
import { useState } from 'react'

type ToastType = 'success' | 'error'

interface ToastNotification {
  id: number
  type: ToastType
  message: string
  visible: boolean
}

export default function Toast() {
  const [notifications, setNotifications] = useState<ToastNotification[]>([])
  
  const handleShowNotification = (type: ToastType) => {
    const newNotification: ToastNotification = {
      id: Date.now(),
      type,
      message: type === 'success' ? 'Operation completed successfully!' : 'An error occurred!',
      visible: true
    }
    
    setNotifications(prev => [...prev, newNotification])
    
    setTimeout(() => {
      setNotifications(prev => 
        prev.map(item => 
          item.id === newNotification.id ? { ...item, visible: false } : item
        )
      )
      
      setTimeout(() => {
        setNotifications(prev => prev.filter(item => item.id !== newNotification.id))
      }, 300)
    }, 3000)
  }

  return (    
    <>
      <div className="flex flex-col items-center justify-center h-screen">
        <button 
          onClick={() => handleShowNotification('success')} 
          className="bg-green-500 text-white px-4 py-2 rounded-md cursor-pointer mb-8 hover:bg-green-600 transition-colors"
        >
          Success
        </button>
        <button 
          onClick={() => handleShowNotification('error')} 
          className="bg-red-500 text-white px-4 py-2 rounded-md cursor-pointer hover:bg-red-600 transition-colors"
        >
          Error
        </button>
      </div>
      
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-3" style={{width: '300px'}}>
        {notifications.map(notification => (
          <div 
            key={notification.id} 
            className={`
              px-5 py-3 rounded shadow-lg max-w-xs transition-all duration-300 ease-out
              ${notification.visible ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'}
              ${notification.type === 'success' ? 'bg-green-500 text-white' : ''}
              ${notification.type === 'error' ? 'bg-red-500 text-white' : ''}
            `}
          >
            {notification.message}
          </div>
        ))}
      </div>
    </>
  ) 
}
