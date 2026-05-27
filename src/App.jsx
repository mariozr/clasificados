import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import AdDetailPage from './pages/AdDetailPage'
import MyQuestionsPage from './pages/MyQuestionsPage'

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/ad/:id" element={<AdDetailPage />} />
        <Route path="/mis-preguntas" element={<MyQuestionsPage />} />
      </Routes>
    </Router>
  )
}
