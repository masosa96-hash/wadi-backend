# WADI – Beta 1 (scope congelado)

Objetivo: permitir que un usuario se registre, cree proyectos y haga runs de IA por proyecto, con historial.

Incluye SOLO:

1. Auth (Supabase)
   - Registro / login email + password
   - Tabla `profiles` (user_id, display_name, created_at)

2. Proyectos
   - Tabla `projects`:
     - id, user_id, name, description, created_at
   - API:
     - GET /api/projects
     - POST /api/projects

3. Runs (ejecuciones IA)
   - Tabla `runs`:
     - id, project_id, user_id, input, output, model, created_at
   - API:
     - GET /api/projects/:id/runs
     - POST /api/projects/:id/runs
       - Llama a OpenAI y guarda input/output en DB

4. Frontend (React)
   - Pantalla Login / Register
   - Pantalla “Mis proyectos”
     - Lista + crear proyecto
   - Pantalla “Proyecto”
     - Muestra historial de runs
     - Textarea + botón “Enviar” (crea nuevo run con IA)

5. Infra
   - .env definido para:
     - Supabase
     - OpenAI
     - URLs API/Frontend
   - Scripts:
     - `pnpm --filter api dev`
     - `pnpm --filter frontend dev`

Todo lo que no esté en esta lista se considera “futuro” (Beta 2+).
