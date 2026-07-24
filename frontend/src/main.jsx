import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext.jsx'
import { ToastProvider } from './context/ToastContext.jsx'
import { TaskProvider } from './context/TaskContext.jsx'
import { ProjectProvider } from './context/ProjectContext.jsx'
import { MarketProvider } from './context/MarketContext.jsx'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <MarketProvider>
        <TaskProvider>
          <ProjectProvider>
            <ToastProvider>
              <AuthProvider>
                <App />
              </AuthProvider>
            </ToastProvider>
          </ProjectProvider>
        </TaskProvider>
      </MarketProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
