// Global chat messages array
let globalMessages = []
let listeners = []

// Load messages from localStorage on initialization
if (typeof window !== 'undefined') {
  const saved = localStorage.getItem('chatMessages')
  if (saved) {
    globalMessages = JSON.parse(saved)
  }
}

export const chatStore = {
  addMessage(message) {
    globalMessages.push(message)
    if (typeof window !== 'undefined') {
      localStorage.setItem('chatMessages', JSON.stringify(globalMessages))
      // Trigger storage event for cross-tab communication
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'chatMessages',
        newValue: JSON.stringify(globalMessages)
      }))
    }
    listeners.forEach(callback => callback([...globalMessages]))
  },

  getMessages() {
    return [...globalMessages]
  },

  subscribe(callback) {
    listeners.push(callback)
    
    // Listen for storage changes (cross-tab communication)
    const handleStorage = (e) => {
      if (e.key === 'chatMessages') {
        globalMessages = JSON.parse(e.newValue || '[]')
        callback([...globalMessages])
      }
    }
    
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', handleStorage)
    }
    
    return () => {
      listeners = listeners.filter(l => l !== callback)
      if (typeof window !== 'undefined') {
        window.removeEventListener('storage', handleStorage)
      }
    }
  }
}