import { useState, useCallback } from 'react'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import { sanitize } from '../../utils/sanitize'

export default function CommentSection({ anuncioId, onRequestAuth }) {
  const { user, getUserName } = useAuth()
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [commentText, setCommentText] = useState('')

  const loadComments = useCallback(async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('comentarios')
        .select('*')
        .eq('anuncio_id', anuncioId)
        .order('fecha_creacion', { ascending: true })
      if (error) throw error
      setComments(data || [])
    } catch (e) {
      console.error('Error comentarios:', e)
    } finally {
      setLoading(false)
    }
  }, [anuncioId])

  // Load comments when component mounts or anuncioId changes
  useState(() => {
    if (anuncioId) loadComments()
  })

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault()
    if (!commentText.trim() || !user) return
    setSubmitting(true)
    try {
      const { error } = await supabase.from('comentarios').insert([
        {
          anuncio_id: anuncioId,
          user_id: user.id,
          user_name: getUserName(),
          contenido: commentText.trim(),
        },
      ])
      if (error) throw error
      setCommentText('')
      await loadComments()
    } catch (e) {
      alert('Error al enviar comentario: ' + e.message)
    } finally {
      setSubmitting(false)
    }
  }, [commentText, user, anuncioId, getUserName, loadComments])

  return (
    <div className="detail-comments">
      <h3>
        <i className="fas fa-comments"></i> Preguntas y Comentarios
      </h3>

      <div className="comments-list">
        {loading ? (
          <div className="loading-spinner" style={{ padding: '1rem' }}>
            <i className="fas fa-spinner fa-spin"></i>
          </div>
        ) : comments.length === 0 ? (
          <p className="auth-notice">
            Aún no hay preguntas. ¡Sé el primero en consultar!
          </p>
        ) : (
          comments.map((c) => (
            <div key={c.id} className="comment-bubble">
              <div className="comment-header">
                <span className="comment-user">
                  {sanitize(c.user_name || 'Usuario')}
                </span>
                <span className="comment-date">
                  {new Date(c.fecha_creacion).toLocaleDateString('es-AR')}
                </span>
              </div>
              <p>{sanitize(c.contenido)}</p>
            </div>
          ))
        )}
      </div>

      <div className="comment-form-wrapper">
        {!user ? (
          <div className="auth-notice">
            Debes{' '}
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault()
                onRequestAuth()
              }}
            >
              iniciar sesión
            </a>{' '}
            para hacer una pregunta.
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <textarea
              className="comment-input"
              placeholder="Escribe tu pregunta o duda aquí..."
              required
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
            />
            <button
              type="submit"
              className="btn-submit"
              style={{ marginTop: '0.5rem', padding: '0.8rem' }}
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i> Enviando...
                </>
              ) : (
                <>
                  Enviar pregunta <i className="fas fa-paper-plane"></i>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
