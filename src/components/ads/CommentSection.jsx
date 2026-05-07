import { useState, useCallback, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import { sanitize } from '../../utils/sanitize'

export default function CommentSection({ anuncioId, adOwnerId, adTitle, onRequestAuth }) {
  const { user, getUserName } = useAuth()
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [commentText, setCommentText] = useState('')

  // States for replying
  const [replyingTo, setReplyingTo] = useState(null)
  const [replyText, setReplyText] = useState('')
  const [replySubmitting, setReplySubmitting] = useState(false)

  const isOwner = user?.id === adOwnerId

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
  useEffect(() => {
    if (anuncioId) loadComments()
  }, [anuncioId, loadComments])

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault()
    if (!commentText.trim() || !user) return
    setSubmitting(true)
    try {
      const { error: insertError } = await supabase.from('comentarios').insert([
        {
          anuncio_id: anuncioId,
          user_id: user.id,
          user_name: getUserName(),
          contenido: commentText.trim(),
        },
      ])
      if (insertError) throw insertError

      // Notify the owner of the ad
      if (adOwnerId && adOwnerId !== user.id) {
        await supabase.from('notificaciones').insert([
          {
            user_id: adOwnerId,
            mensaje: `Tienes una nueva consulta en "${adTitle}"`,
            anuncio_id: anuncioId,
            leida: false
          }
        ])
      }

      setCommentText('')
      await loadComments()
    } catch (e) {
      alert('Error al enviar comentario: ' + e.message)
    } finally {
      setSubmitting(false)
    }
  }, [commentText, user, anuncioId, getUserName, loadComments, adOwnerId, adTitle])

  const handleReply = useCallback(async (commentId, originalCommenterId) => {
    if (!replyText.trim()) return
    setReplySubmitting(true)
    try {
      // 1. Update the comment with the reply
      const { error: replyError } = await supabase
        .from('comentarios')
        .update({
          respuesta: replyText.trim(),
          fecha_respuesta: new Date().toISOString()
        })
        .eq('id', commentId)
      if (replyError) {
        console.error("Error detallado:", replyError);
        throw new Error(`No se pudo guardar la respuesta. Verifica si la columna 'respuesta' existe en Supabase. Detalles: ${replyError.message}`);
      }

      // 2. Send notification to the original commenter
      if (originalCommenterId && originalCommenterId !== user?.id) {
        await supabase.from('notificaciones').insert([
          {
            user_id: originalCommenterId,
            mensaje: `El vendedor respondió a tu consulta en "${adTitle}"`,
            anuncio_id: anuncioId,
            leida: false
          }
        ])
      }

      setReplyText('')
      setReplyingTo(null)
      await loadComments()
    } catch (e) {
      alert('Error al enviar respuesta: ' + e.message)
    } finally {
      setReplySubmitting(false)
    }
  }, [replyText, loadComments, user?.id, adTitle, anuncioId])

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
            <div key={c.id} className="comment-group">
              <div className="comment-bubble">
                <div className="comment-header">
                  <span className="comment-user">
                    {sanitize(c.user_name || 'Usuario')}
                  </span>
                  <span className="comment-date">
                    {new Date(c.fecha_creacion).toLocaleDateString('es-AR')}
                  </span>
                </div>
                <p>{sanitize(c.contenido)}</p>

                {/* Reply button for owner */}
                {isOwner && !c.respuesta && (
                  <button
                    className="btn-reply-trigger"
                    onClick={() => setReplyingTo(replyingTo === c.id ? null : c.id)}
                  >
                    <i className="fas fa-reply"></i> Responder
                  </button>
                )}
              </div>

              {/* Display existing reply */}
              {c.respuesta && (
                <div className="owner-reply-bubble">
                  <div className="reply-header">
                    <span className="reply-label">
                      <i className="fas fa-user-check"></i> Vendedor respondió:
                    </span>
                    {c.fecha_respuesta && (
                      <span className="comment-date">
                        {new Date(c.fecha_respuesta).toLocaleDateString('es-AR')}
                      </span>
                    )}
                  </div>
                  <p>{sanitize(c.respuesta)}</p>
                </div>
              )}

              {/* Reply form */}
              {replyingTo === c.id && (
                <div className="reply-form">
                  <textarea
                    placeholder="Escribe tu respuesta..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    autoFocus
                  />
                  <div className="reply-actions">
                    <button
                      className="btn-cancel"
                      onClick={() => {
                        setReplyingTo(null)
                        setReplyText('')
                      }}
                    >
                      Cancelar
                    </button>
                    <button
                      className="btn-reply-submit"
                      disabled={replySubmitting || !replyText.trim()}
                      onClick={() => handleReply(c.id, c.user_id)}
                    >
                      {replySubmitting ? <i className="fas fa-spinner fa-spin"></i> : 'Enviar respuesta'}
                    </button>
                  </div>
                </div>
              )}
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
        ) : isOwner ? (
          <div className="auth-notice">
            Eres el dueño de esta publicación. Puedes responder a las preguntas de los interesados.
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
