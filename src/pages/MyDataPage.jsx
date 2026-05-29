import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import AuthModal from "../components/auth/AuthModal";
import LoadingSpinner from "../components/ui/LoadingSpinner";

const PROVINCIAS_ARGENTINA = [
  "Formosa",
  "Chaco",
  "Corrientes",
  "Misiones",
  "Salta",
  "Jujuy",
  "Tucumán",
  "Santiago del Estero",
  "Catamarca",
  "La Rioja",
  "San Juan",
  "San Luis",
  "Mendoza",
  "Córdoba",
  "Santa Fe",
  "Entre Ríos",
  "Buenos Aires",
  "CABA",
  "La Pampa",
  "Neuquén",
  "Río Negro",
  "Chubut",
  "Santa Cruz",
  "Tierra del Fuego",
];

export default function MyDataPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const [authModal, setAuthModal] = useState({ open: false, mode: "login" });
  const [formData, setFormData] = useState({
    nombre_apellido: "",
    telefono: "",
    ciudad: "",
    provincia: "Formosa",
  });
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ type: "", text: "" });

  // Load initial data from user_metadata and Users table
  useEffect(() => {
    if (user) {
      const metadata = user.user_metadata || {};

      // Set initial values from metadata first
      setFormData((prev) => ({
        ...prev,
        nombre_apellido: metadata.full_name || metadata.nombre_apellido || "",
        telefono: metadata.telefono || "",
        ciudad: metadata.ciudad || "",
        provincia: metadata.provincia || "Formosa",
      }));

      // Fetch from users table to overwrite phone if present (trying lowercase first)
      const fetchDbPhone = async () => {
        try {
          let { data, error } = await supabase
            .from("users")
            .select("phone")
            .eq("id", user.id)
            .single();

          if (error) {
            // Try uppercase Users table
            const { data: data2, error: error2 } = await supabase
              .from("Users")
              .select("phone")
              .eq("id", user.id)
              .single();
            if (!error2 && data2) {
              data = data2;
            }
          }

          if (data && data.phone) {
            setFormData((prev) => ({
              ...prev,
              telefono: data.phone,
            }));
          }
        } catch (e) {
          console.warn("Error fetching phone from users table:", e);
        }
      };

      fetchDbPhone();
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setStatusMessage({ type: "", text: "" });

    try {
      // 1. Save in the users (or Users) database table using upsert to handle missing rows
      let dbError = null;
      let isTableMissing = false;

      try {
        const { error } = await supabase
          .from("users")
          .upsert({
            id: user.id,
            phone: formData.telefono,
            provincia: formData.provincia,
            ciudad: formData.ciudad,
          });
        dbError = error;
      } catch (e) {
        dbError = e;
      }

      if (dbError) {
        console.warn(
          "Failed to upsert into users table, trying Users in uppercase:",
          dbError,
        );
        try {
          const { error: dbError2 } = await supabase
            .from("Users")
            .upsert({ id: user.id, phone: formData.telefono });
          if (dbError2) {
            throw dbError2;
          }
        } catch (err) {
          console.error("Failed to upsert into Users table:", err);
          // If the table is missing from schema cache (PGRST205) or not found (404 / 42P01)
          const errCode =
            err.code ||
            (err.message && err.message.includes("PGRST205") ? "PGRST205" : "");
          if (
            errCode === "PGRST205" ||
            err.message?.includes("schema cache") ||
            err.message?.includes("relation") ||
            String(err).includes("404")
          ) {
            isTableMissing = true;
          } else {
            throw new Error(
              `Error en la base de datos (users/Users): ${err.message || dbError.message || err}`,
            );
          }
        }
      }

      // 2. Update user_metadata in Supabase auth
      const { data, error } = await supabase.auth.updateUser({
        data: {
          full_name: formData.nombre_apellido,
          nombre_apellido: formData.nombre_apellido,
          telefono: formData.telefono,
          ciudad: formData.ciudad,
          provincia: formData.provincia,
        },
      });

      if (error) throw error;

      if (isTableMissing) {
        setStatusMessage({
          type: "warning",
          text: 'Tus datos se guardaron en tu cuenta de perfil, pero la tabla "users" (o "Users") no existe en tu base de datos de Supabase. Por favor, créala para registrar el teléfono allí.',
        });
      } else {
        setStatusMessage({
          type: "success",
          text: "¡Tus datos se actualizaron con éxito!",
        });
      }
    } catch (err) {
      console.error("Error al actualizar datos:", err);
      setStatusMessage({
        type: "error",
        text: "Ocurrió un error al intentar actualizar los datos. Por favor, intentá de nuevo.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleShowAuth = useCallback((mode = "login") => {
    setAuthModal({ open: true, mode });
  }, []);

  const handleOpenAd = useCallback(
    (adId) => {
      navigate(`/ad/${adId}`);
    },
    [navigate],
  );

  return (
    <div
      className="ad-detail-page"
      style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}
    >
      <Header onShowAuth={handleShowAuth} onOpenAd={handleOpenAd} />

      <main style={{ flex: 1, padding: "3rem 0" }}>
        <div className="container" style={{ maxWidth: "800px" }}>
          {/* Back button */}
          <button className="btn-back" onClick={() => navigate(-1)}>
            <i className="fas fa-arrow-left"></i> Volver
          </button>

          {/* Page Header */}
          <div
            style={{
              marginBottom: "2.5rem",
              display: "flex",
              flexDirection: "column",
              gap: "0.5rem",
            }}
          >
            <h1
              style={{
                fontSize: "2.5rem",
                fontWeight: 800,
                background:
                  "linear-gradient(135deg, var(--text-main) 0%, var(--primary) 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                width: "fit-content",
              }}
            >
              <i
                className="fas fa-user-circle"
                style={{ marginRight: "0.75rem", color: "var(--primary)" }}
              ></i>
              Mis Datos
            </h1>
            <p style={{ color: "var(--text-muted)", fontSize: "1.05rem" }}>
              Completá tu información de contacto para que los interesados
              puedan comunicarse con vos más fácilmente.
            </p>
          </div>

          {authLoading ? (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                padding: "5rem 0",
              }}
            >
              <LoadingSpinner />
            </div>
          ) : !user ? (
            /* Not authenticated view */
            <div
              style={{
                background: "var(--surface)",
                borderRadius: "var(--radius-lg)",
                padding: "4rem 2rem",
                textAlign: "center",
                boxShadow: "var(--shadow-md)",
                border: "1px solid var(--border-light)",
                maxWidth: "600px",
                margin: "2rem auto",
              }}
            >
              <i
                className="fas fa-user-lock"
                style={{
                  fontSize: "3.5rem",
                  color: "var(--primary)",
                  marginBottom: "1.5rem",
                  opacity: 0.8,
                }}
              ></i>
              <h2 style={{ marginBottom: "1rem", fontWeight: 700 }}>
                Iniciá sesión para editar tus datos
              </h2>
              <p
                style={{
                  color: "var(--text-muted)",
                  marginBottom: "2rem",
                  lineHeight: 1.6,
                }}
              >
                Necesitamos que te identifiques para poder asociar y resguardar
                tu información de perfil.
              </p>
              <button
                className="btn-submit"
                style={{ maxWidth: "250px", margin: "0 auto" }}
                onClick={() => handleShowAuth("login")}
              >
                Iniciar Sesión <i className="fas fa-sign-in-alt"></i>
              </button>
            </div>
          ) : (
            /* Profile Form */
            <div
              style={{
                background: "var(--surface)",
                borderRadius: "var(--radius-lg)",
                padding: "2.5rem",
                boxShadow: "var(--shadow-md)",
                border: "1px solid var(--border-light)",
              }}
            >
              {statusMessage.text && (
                <div
                  style={{
                    padding: "1rem 1.25rem",
                    borderRadius: "var(--radius-md)",
                    marginBottom: "1.5rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                    fontSize: "0.95rem",
                    fontWeight: 500,
                    backgroundColor:
                      statusMessage.type === "success"
                        ? "rgba(16, 185, 129, 0.1)"
                        : statusMessage.type === "warning"
                          ? "rgba(245, 158, 11, 0.1)"
                          : "rgba(239, 68, 68, 0.1)",
                    color:
                      statusMessage.type === "success"
                        ? "var(--success)"
                        : statusMessage.type === "warning"
                          ? "#d97706"
                          : "#ef4444",
                    border: `1px solid ${statusMessage.type === "success" ? "rgba(16, 185, 129, 0.2)" : statusMessage.type === "warning" ? "rgba(245, 158, 11, 0.2)" : "rgba(239, 68, 68, 0.2)"}`,
                  }}
                >
                  <i
                    className={`fas ${statusMessage.type === "success" ? "fa-circle-check" : statusMessage.type === "warning" ? "fa-triangle-exclamation" : "fa-circle-xmark"}`}
                    style={{ fontSize: "1.2rem" }}
                  ></i>
                  <span>{statusMessage.text}</span>
                </div>
              )}

              <form
                onSubmit={handleSubmit}
                className="publish-form"
                style={{ padding: 0 }}
              >
                <div className="form-group">
                  <label htmlFor="nombre_apellido">Nombre y Apellido</label>
                  <input
                    type="text"
                    id="nombre_apellido"
                    name="nombre_apellido"
                    value={formData.nombre_apellido}
                    onChange={handleInputChange}
                    placeholder="Ej. Juan Pérez"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="telefono">Teléfono / WhatsApp</label>
                  <input
                    type="tel"
                    id="telefono"
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleInputChange}
                    placeholder="Ej. +54 370 4123456"
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="provincia">Provincia</label>
                    <select
                      id="provincia"
                      name="provincia"
                      value={formData.provincia}
                      onChange={handleInputChange}
                      required
                    >
                      {PROVINCIAS_ARGENTINA.map((prov) => (
                        <option key={prov} value={prov}>
                          {prov}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="ciudad">Ciudad</label>
                    <input
                      type="text"
                      id="ciudad"
                      name="ciudad"
                      value={formData.ciudad}
                      onChange={handleInputChange}
                      placeholder="Ej. Formosa"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn-submit"
                  disabled={loading}
                  style={{ marginTop: "2rem" }}
                >
                  {loading ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i> Guardando...
                    </>
                  ) : (
                    <>
                      Guardar Cambios <i className="fas fa-save"></i>
                    </>
                  )}
                </button>
              </form>
            </div>
          )}
        </div>
      </main>

      <Footer />

      <AuthModal
        isOpen={authModal.open}
        onClose={() => setAuthModal({ open: false, mode: "login" })}
        initialMode={authModal.mode}
      />
    </div>
  );
}
