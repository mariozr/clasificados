import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import AdDetailPage from './pages/AdDetailPage'

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/ad/:id" element={<AdDetailPage />} />
      </Routes>
    </Router>
  )
}
