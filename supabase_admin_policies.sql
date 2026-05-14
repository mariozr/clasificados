-- POLÍTICAS DE SUPERUSUARIO PARA CLASIFICADOS FORMOSA
-- Ejecuta esto en el "SQL Editor" de tu panel de Supabase.

DO $$
DECLARE
    admin_id UUID;
BEGIN
    -- Obtenemos tu ID exacto de la tabla de usuarios
    SELECT id INTO admin_id FROM auth.users WHERE email = 'marioadolfozarza@gmail.com' LIMIT 1;
    
    IF admin_id IS NOT NULL THEN
        -- Eliminamos políticas anteriores
        DROP POLICY IF EXISTS "Superuser can update any ad" ON public.anuncios;
        DROP POLICY IF EXISTS "Superuser can delete any ad" ON public.anuncios;
        DROP POLICY IF EXISTS "Superuser can delete any image" ON storage.objects;
        DROP POLICY IF EXISTS "Superuser can update any image" ON storage.objects;

        -- 1. Políticas para anuncios (ALL = Select, Insert, Update, Delete)
        EXECUTE format('CREATE POLICY "Superuser ALL on anuncios" ON public.anuncios FOR ALL TO authenticated USING ( auth.uid() = %L ) WITH CHECK ( auth.uid() = %L );', admin_id, admin_id);
        
        -- 2. Políticas para imágenes (ALL = Select, Insert, Update, Delete)
        EXECUTE format('CREATE POLICY "Superuser ALL on images" ON storage.objects FOR ALL TO authenticated USING ( bucket_id = ''anuncios_images'' AND auth.uid() = %L ) WITH CHECK ( bucket_id = ''anuncios_images'' AND auth.uid() = %L );', admin_id, admin_id);
        
        RAISE NOTICE 'Políticas de administrador creadas exitosamente para el ID: %', admin_id;
    ELSE
        RAISE EXCEPTION 'No se encontró un usuario con ese correo electrónico.';
    END IF;
END $$;
