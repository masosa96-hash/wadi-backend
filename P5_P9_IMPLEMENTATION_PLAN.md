# Plan de Implementación - Proyectos P5, P6, P8, P9

**Fecha**: 20 de Noviembre, 2025  
**Estado**: En Progreso  
**Objetivo**: Implementar workspaces dinámicos, gestión de archivos, onboarding y sistema de monetización

---

## 📋 Resumen Ejecutivo

Implementación de 4 proyectos clave que transformarán WADI en una plataforma completa:

- **P5**: Workspaces dinámicos con creación automática
- **P6**: Manejo de archivos y memoria de usuario
- **P8**: Onboarding fluido para nuevos usuarios
- **P9**: Sistema de planes y medición de uso

---

## 🏗️ Arquitectura Actual (Análisis)

### Base de Datos (Supabase)

```
✅ Tablas existentes:
- profiles (usuarios)
- workspaces (espacios de trabajo)
- workspace_members (miembros)
- conversations (conversaciones)
- messages (mensajes del chat)

📝 Tablas a crear:
- workspace_conversations (relación workspace-conversación)
- files (archivos adjuntos)
- user_memory (preferencias y memoria del usuario)
- usage_metrics (métricas de uso)
- subscription_plans (planes de suscripción)
- user_subscriptions (suscripciones activas)
```

### Backend API Existente

```typescript
✅ Controllers implementados:
- workspacesController.ts (CRUD completo)
- chatController.ts (envío de mensajes)
- authController (autenticación)

📝 Controllers a crear/extender:
- filesController.ts (gestión de archivos)
- memoryController.ts (memoria de usuario)
- billingController.ts (planes y uso)
```

### Frontend Store Existente

```typescript
✅ Stores implementados:
- authStore.ts
- chatStore.ts
- workspacesStore.ts

📝 Stores a crear/extender:
- filesStore.ts
- memoryStore.ts
- billingStore.ts
- onboardingStore.ts
```

---

## 📦 P5: Workspaces Dinámicos y Organización

### 5.1 Detección Automática y Creación de Workspaces

#### Base de Datos

```sql
-- Añadir campos a workspaces
ALTER TABLE workspaces
ADD COLUMN is_auto_created BOOLEAN DEFAULT false,
ADD COLUMN detected_topic TEXT,
ADD COLUMN message_count INTEGER DEFAULT 0,
ADD COLUMN last_message_at TIMESTAMPTZ;

-- Nueva tabla: workspace_conversations
CREATE TABLE workspace_conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(conversation_id)
);

-- Índices
CREATE INDEX idx_workspace_conversations_workspace ON workspace_conversations(workspace_id);
CREATE INDEX idx_workspace_conversations_conversation ON workspace_conversations(conversation_id);
```

#### Backend: Servicio de Detección de Temas

```typescript
// apps/api/src/services/topic-detection.ts
export interface TopicDetectionResult {
  shouldCreateWorkspace: boolean;
  suggestedName: string;
  suggestedTopic: string;
  confidence: number;
}

export async function detectTopicChange(
  messages: Array<{ role: string; content: string }>,
  currentWorkspace?: string,
): Promise<TopicDetectionResult>;
```

**Lógica inicial**:

1. Analizar últimos 5 mensajes con OpenAI
2. Detectar cambio de tema significativo
3. Sugerir nombre basado en contexto
4. Crear workspace automáticamente si confidence > 0.7

#### Backend: Extender chatController

```typescript
// Modificar sendMessage para detectar tema
export async function sendMessage(req, res) {
  // ... código existente ...

  // Después de guardar mensaje
  const topicResult = await detectTopicChange(recentMessages, currentWorkspace);

  if (topicResult.shouldCreateWorkspace) {
    const newWorkspace = await createAutoWorkspace(userId, topicResult);
    await moveConversationToWorkspace(conversationId, newWorkspace.id);
  }
}
```

### 5.2 Pantalla de Gestión de Espacios

#### Nueva Página: WorkspacesPage.tsx

```typescript
// apps/frontend/src/pages/Workspaces.tsx
interface WorkspaceWithStats extends Workspace {
  message_count: number;
  conversation_count: number;
  last_activity: string;
}

export default function WorkspacesPage() {
  // Lista de workspaces con estadísticas
  // Acciones: Ver, Renombrar, Archivar, Borrar
  // Botón destacado: "Crear Nuevo Espacio"
}
```

**Características**:

- Lista ordenada por última actividad
- Vista de tarjetas con stats (mensajes, conversaciones)
- Acción rápida: Mover conversación
- Filtros: Todos, Recientes, Archivados

### 5.3 Mover Conversaciones Entre Workspaces

#### Backend: workspacesController

```typescript
export async function moveConversation(req: Request, res: Response) {
  const { conversationId } = req.params;
  const { targetWorkspaceId } = req.body;

  // Verificar permisos
  // Actualizar workspace_conversations
  // Actualizar contadores
}
```

#### Frontend: UI de Mover

```typescript
// Modal para seleccionar workspace destino
<MoveConversationModal
  conversationId={conv.id}
  currentWorkspaceId={workspace.id}
  availableWorkspaces={workspaces}
/>
```

### 5.4 Home Adaptativa

#### Modificar Home.tsx

```typescript
// Mostrar:
// 1. Workspace principal (más activo)
// 2. 2-3 workspaces recientes
// 3. Botón "Nuevo espacio" destacado
// 4. Indicador de workspaces auto-creados recientes

const mainWorkspace = workspaces[0]; // Más activo
const recentWorkspaces = workspaces.slice(1, 4);
```

---

## 📎 P6: Archivos + Memoria del Usuario

### 6.1 Subida de Archivos en Chat

#### Base de Datos

```sql
CREATE TABLE files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(user_id) ON DELETE CASCADE,
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  message_id UUID REFERENCES messages(id) ON DELETE SET NULL,

  filename TEXT NOT NULL,
  original_filename TEXT NOT NULL,
  file_type TEXT NOT NULL, -- 'pdf', 'image', 'text', 'docx'
  file_size INTEGER NOT NULL, -- bytes
  mime_type TEXT NOT NULL,

  -- Storage
  storage_path TEXT NOT NULL,
  storage_provider TEXT DEFAULT 'supabase', -- 'supabase' | 's3'

  -- Procesamiento
  extracted_text TEXT,
  summary TEXT,
  metadata JSONB,
  processing_status TEXT DEFAULT 'pending', -- 'pending' | 'processing' | 'completed' | 'failed'
  processing_error TEXT,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_files_user ON files(user_id);
CREATE INDEX idx_files_conversation ON files(conversation_id);
CREATE INDEX idx_files_message ON files(message_id);
```

#### Backend: filesController.ts

```typescript
// apps/api/src/controllers/filesController.ts

export async function uploadFile(req: Request, res: Response) {
  // 1. Validar archivo (tipo, tamaño)
  // 2. Subir a Supabase Storage
  // 3. Guardar metadata en DB
  // 4. Encolar procesamiento
  // 5. Retornar file ID
}

export async function getFileContent(req: Request, res: Response) {
  // Retornar texto extraído o resumen
}

export async function deleteFile(req: Request, res: Response) {
  // Borrar de storage y DB
}
```

#### Servicio de Procesamiento de Archivos

```typescript
// apps/api/src/services/file-processor.ts

export async function processFile(fileId: string) {
  const file = await getFileFromDB(fileId);

  switch (file.file_type) {
    case "pdf":
      return await processPDF(file);
    case "image":
      return await processImage(file); // OCR con Tesseract o API
    case "text":
      return await processText(file);
    case "docx":
      return await processDocx(file);
  }
}

async function processPDF(file) {
  // Usar pdf-parse o similar
  const text = await extractTextFromPDF(file.storage_path);
  const summary = await generateSummaryWithAI(text);

  await updateFileInDB(file.id, {
    extracted_text: text,
    summary,
    processing_status: "completed",
  });
}
```

#### Frontend: Componente de Subida

```typescript
// apps/frontend/src/components/FileUpload.tsx

export default function FileUpload({ onFileUploaded }) {
  const handleFileSelect = async (file: File) => {
    // Validar tamaño y tipo
    // Mostrar preview
    // Subir archivo
    // Mostrar progreso
    // Notificar procesamiento
  };

  return (
    <div>
      <input type="file" accept=".pdf,.jpg,.png,.txt,.docx" />
      {uploading && <ProgressBar progress={uploadProgress} />}
      {processing && <ProcessingIndicator />}
    </div>
  );
}
```

#### Integrar en Chat.tsx

```typescript
// Añadir botón de adjuntar archivo
<FileUploadButton onFileSelected={handleFileUpload} />

// Mostrar archivos en mensajes
{message.files?.map(file => (
  <FileAttachment
    file={file}
    onAsk={() => askAboutFile(file)}
  />
))}
```

### 6.2 Integración con IA

#### Modificar openai.ts

```typescript
// apps/api/src/services/openai.ts

export async function generateChatCompletionWithFiles(
  messages: Message[],
  fileContexts: string[], // Textos extraídos
  model: string,
) {
  const systemPrompt = `
    Sos WADI, un asistente de IA amigable.
    
    El usuario adjuntó los siguientes documentos:
    ${fileContexts.map((ctx, i) => `Documento ${i + 1}:\n${ctx.substring(0, 2000)}...`).join("\n\n")}
    
    Usá esta información para responder las preguntas del usuario.
  `;

  // ... generar respuesta con contexto
}
```

#### Funciones Especiales

```typescript
// Resumir archivo
export async function summarizeFile(fileText: string) {
  return await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content:
          "Resumí el siguiente documento en 3-5 puntos clave en español:",
      },
      {
        role: "user",
        content: fileText,
      },
    ],
  });
}

// Extraer puntos clave
export async function extractKeyPoints(fileText: string) {
  // Similar, pero enfocado en información accionable
}
```

### 6.3 Memoria del Usuario

#### Base de Datos

```sql
CREATE TABLE user_memory (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(user_id) ON DELETE CASCADE,

  memory_type TEXT NOT NULL, -- 'preference' | 'fact' | 'style' | 'context'
  category TEXT, -- 'tone', 'format', 'recurring_topic', etc.

  key TEXT NOT NULL,
  value TEXT NOT NULL,
  metadata JSONB,

  source TEXT, -- 'explicit' | 'inferred' | 'feedback'
  confidence FLOAT DEFAULT 1.0,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  last_used_at TIMESTAMPTZ,

  UNIQUE(user_id, key)
);

CREATE INDEX idx_user_memory_user ON user_memory(user_id);
CREATE INDEX idx_user_memory_type ON user_memory(memory_type);
```

#### Backend: memoryController.ts

```typescript
// apps/api/src/controllers/memoryController.ts

export async function getUserMemory(req, res) {
  // Obtener toda la memoria del usuario
}

export async function saveMemory(req, res) {
  const { key, value, type, category } = req.body;
  // Guardar preferencia explícita
}

export async function deleteMemory(req, res) {
  // Borrar memoria específica
}

// Servicio de inferencia automática
export async function inferMemoryFromConversation(userId, messages) {
  // Detectar preferencias implícitas
  // Ejemplo: usuario siempre pide respuestas cortas
  // Guardar como memoria con confidence < 1.0
}
```

#### Frontend: Panel de Memoria en Settings

```typescript
// apps/frontend/src/pages/Settings.tsx

<MemoryPanel>
  <h3>Tu Memoria Personal</h3>

  <MemorySection title="Preferencias de Tono">
    <MemoryItem
      key="tone"
      value="cercano y amigable"
      editable
      onEdit={handleEditMemory}
    />
  </MemorySection>

  <MemorySection title="Temas Recurrentes">
    {recurringTopics.map(topic => (
      <MemoryItem key={topic.key} value={topic.value} />
    ))}
  </MemorySection>

  <Button onClick={addNewMemory}>Agregar Memoria</Button>
</MemoryPanel>
```

#### Integrar Memoria en Chat

```typescript
// chatController.ts - modificar sendMessage

// Cargar memoria del usuario
const userMemory = await getUserMemoryForChat(userId);

const systemPrompt = `
  Sos WADI, un asistente de IA amigable.
  
  Preferencias del usuario:
  - Tono: ${userMemory.tone || "cercano"}
  - Formato: ${userMemory.format || "conversacional"}
  - Temas recurrentes: ${userMemory.recurring_topics?.join(", ")}
  
  Usá esta información para personalizar tus respuestas.
`;
```

---

## 🎓 P8: Onboarding y Primera Experiencia

### 8.1 Flujo de Onboarding

#### Base de Datos

```sql
ALTER TABLE profiles
ADD COLUMN onboarding_completed BOOLEAN DEFAULT false,
ADD COLUMN onboarding_step INTEGER DEFAULT 0,
ADD COLUMN first_login_at TIMESTAMPTZ;
```

#### Páginas de Onboarding

```typescript
// apps/frontend/src/pages/Onboarding.tsx

const ONBOARDING_STEPS = [
  {
    title: "¡Bienvenido a WADI!",
    description: "Tu asistente de IA personal que te ayuda en todo",
    illustration: <WelcomeIllustration />,
    cta: "Siguiente"
  },
  {
    title: "Hablá con naturalidad",
    description: "Escribime como le escribirías a un amigo. WADI entiende español argentino perfectamente.",
    illustration: <ChatIllustration />,
    example: "Ejemplo: 'Che, necesito ayuda con un proyecto...'",
    cta: "Siguiente"
  },
  {
    title: "Espacios dinámicos",
    description: "WADI crea espacios de trabajo automáticamente según tus conversaciones. Todo organizado sin esfuerzo.",
    illustration: <WorkspacesIllustration />,
    cta: "Empezar"
  }
];

export default function Onboarding() {
  const [currentStep, setCurrentStep] = useState(0);

  const handleComplete = async () => {
    await markOnboardingComplete();
    navigate('/home');
  };

  return (
    <PhoneShell>
      <OnboardingStep
        step={ONBOARDING_STEPS[currentStep]}
        progress={(currentStep + 1) / ONBOARDING_STEPS.length}
        onNext={() => setCurrentStep(s => s + 1)}
        onComplete={handleComplete}
      />
    </PhoneShell>
  );
}
```

### 8.2 Estado de Primer Uso en Home

#### Modificar Home.tsx

```typescript
// apps/frontend/src/pages/Home.tsx

const { user } = useAuthStore();
const isFirstTime = !user?.onboarding_completed;

{isFirstTime && (
  <FirstTimeGuide>
    <h3>¡Empezá tu primera conversación!</h3>
    <ExamplePrompt onClick={() => sendExampleMessage()}>
      "Che WADI, necesito organizar mis ideas para un proyecto..."
    </ExamplePrompt>
    <Tips>
      <Tip>💡 Podés hablar con naturalidad</Tip>
      <Tip>📎 Pronto podrás adjuntar archivos</Tip>
      <Tip>🔊 Próximamente: entrada por voz</Tip>
    </Tips>
  </FirstTimeGuide>
)}
```

### 8.3 Permisos Claros

#### Componente de Solicitud de Permisos

```typescript
// apps/frontend/src/components/PermissionRequest.tsx

export function VoicePermissionRequest() {
  return (
    <PermissionModal>
      <Icon>🎤</Icon>
      <h3>Entrada por voz</h3>
      <p>WADI puede escucharte para que no tengas que escribir. Tus grabaciones no se guardan, solo se convierten a texto.</p>
      <Button onClick={requestMicPermission}>Permitir micrófono</Button>
      <Button variant="secondary" onClick={dismiss}>Ahora no</Button>
    </PermissionModal>
  );
}

export function FilePermissionRequest() {
  return (
    <PermissionModal>
      <Icon>📎</Icon>
      <h3>Archivos y documentos</h3>
      <p>WADI puede leer tus archivos para ayudarte con análisis y resúmenes. Solo procesamos lo que vos compartís.</p>
      <Button onClick={allowFileUpload}>Entendido</Button>
    </PermissionModal>
  );
}
```

---

## 💰 P9: Base de Monetización y Límites

### 9.1 Modelo de Planes

#### Base de Datos

```sql
CREATE TABLE subscription_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL, -- 'free', 'pro', 'business'
  display_name TEXT NOT NULL,
  description TEXT,

  -- Límites
  max_messages_per_month INTEGER,
  max_file_uploads_per_month INTEGER,
  max_file_size_mb INTEGER,
  max_workspaces INTEGER,
  voice_input_enabled BOOLEAN DEFAULT false,

  -- Precios (para futuro)
  price_monthly DECIMAL(10,2),
  price_yearly DECIMAL(10,2),
  currency TEXT DEFAULT 'USD',

  features JSONB, -- Lista de features incluidas

  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Planes iniciales
INSERT INTO subscription_plans (name, display_name, max_messages_per_month, max_file_uploads_per_month, max_file_size_mb, max_workspaces, price_monthly) VALUES
('free', 'Free', 50, 5, 5, 3, 0),
('pro', 'Pro', 500, 50, 25, 20, 9.99),
('business', 'Business', -1, -1, 100, -1, 29.99); -- -1 = unlimited

CREATE TABLE user_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(user_id) ON DELETE CASCADE,
  plan_id UUID REFERENCES subscription_plans(id),

  status TEXT DEFAULT 'active', -- 'active' | 'cancelled' | 'expired' | 'trial'

  started_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,

  -- Billing (futuro)
  stripe_subscription_id TEXT,
  stripe_customer_id TEXT,

  metadata JSONB,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_user_subscriptions_user ON user_subscriptions(user_id);
```

### 9.2 Medición de Uso

#### Base de Datos

```sql
CREATE TABLE usage_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(user_id) ON DELETE CASCADE,

  period_start DATE NOT NULL,
  period_end DATE NOT NULL,

  -- Contadores
  messages_sent INTEGER DEFAULT 0,
  tokens_used INTEGER DEFAULT 0, -- Estimado de tokens OpenAI
  files_uploaded INTEGER DEFAULT 0,
  total_file_size_mb DECIMAL(10,2) DEFAULT 0,

  -- Metadata
  model_usage JSONB, -- { "gpt-3.5-turbo": 100, "gpt-4": 10 }

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  UNIQUE(user_id, period_start)
);

CREATE INDEX idx_usage_metrics_user_period ON usage_metrics(user_id, period_start);

-- Función para obtener/crear métricas del mes actual
CREATE OR REPLACE FUNCTION get_or_create_current_usage(p_user_id UUID)
RETURNS usage_metrics AS $$
DECLARE
  v_period_start DATE := DATE_TRUNC('month', CURRENT_DATE);
  v_period_end DATE := (DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month' - INTERVAL '1 day')::DATE;
  v_metrics usage_metrics;
BEGIN
  SELECT * INTO v_metrics FROM usage_metrics
  WHERE user_id = p_user_id AND period_start = v_period_start;

  IF NOT FOUND THEN
    INSERT INTO usage_metrics (user_id, period_start, period_end)
    VALUES (p_user_id, v_period_start, v_period_end)
    RETURNING * INTO v_metrics;
  END IF;

  RETURN v_metrics;
END;
$$ LANGUAGE plpgsql;
```

#### Backend: Middleware de Medición

```typescript
// apps/api/src/middleware/usage-tracking.ts

export async function trackMessageUsage(
  userId: string,
  tokensUsed: number,
  model: string,
) {
  const metrics = await supabase.rpc("get_or_create_current_usage", {
    p_user_id: userId,
  });

  await supabase
    .from("usage_metrics")
    .update({
      messages_sent: metrics.messages_sent + 1,
      tokens_used: metrics.tokens_used + tokensUsed,
      model_usage: {
        ...metrics.model_usage,
        [model]: (metrics.model_usage?.[model] || 0) + 1,
      },
    })
    .eq("id", metrics.id);
}

export async function trackFileUsage(userId: string, fileSizeMB: number) {
  const metrics = await supabase.rpc("get_or_create_current_usage", {
    p_user_id: userId,
  });

  await supabase
    .from("usage_metrics")
    .update({
      files_uploaded: metrics.files_uploaded + 1,
      total_file_size_mb: metrics.total_file_size_mb + fileSizeMB,
    })
    .eq("id", metrics.id);
}
```

#### Middleware de Validación de Límites

```typescript
// apps/api/src/middleware/limit-check.ts

export async function checkMessageLimit(req, res, next) {
  const userId = req.user_id;

  const subscription = await getUserActiveSubscription(userId);
  const plan = await getPlanById(subscription.plan_id);
  const usage = await getCurrentUsage(userId);

  if (
    plan.max_messages_per_month !== -1 &&
    usage.messages_sent >= plan.max_messages_per_month
  ) {
    return res.status(429).json({
      ok: false,
      error: "LIMIT_REACHED",
      message: "Alcanzaste el límite de mensajes de tu plan",
      limit: plan.max_messages_per_month,
      current: usage.messages_sent,
      upgrade_url: "/billing/upgrade",
    });
  }

  next();
}

export async function checkFileLimit(req, res, next) {
  // Similar para archivos
}
```

#### Integrar en Rutas

```typescript
// apps/api/src/routes/chat.ts
import { checkMessageLimit } from "../middleware/limit-check";

router.post("/api/chat", authenticate, checkMessageLimit, sendMessage);

// apps/api/src/routes/files.ts
router.post("/api/files", authenticate, checkFileLimit, uploadFile);
```

### 9.3 UI de Billing

#### Nueva Página: Billing.tsx (actualizar existente)

```typescript
// apps/frontend/src/pages/Billing.tsx

export default function BillingPage() {
  const { user } = useAuthStore();
  const { subscription, usage, loadSubscription, loadUsage } = useBillingStore();

  useEffect(() => {
    loadSubscription();
    loadUsage();
  }, []);

  return (
    <PhoneShell>
      <Header>
        <BackButton />
        <h1>Plan y Uso</h1>
      </Header>

      <Main>
        {/* Plan Actual */}
        <CurrentPlanCard>
          <PlanBadge>{subscription.plan.display_name}</PlanBadge>
          <h2>{subscription.plan.name === 'free' ? 'Plan Gratuito' : subscription.plan.display_name}</h2>
          <p>{subscription.plan.description}</p>

          {subscription.plan.name !== 'business' && (
            <UpgradeButton onClick={() => navigate('/billing/upgrade')}>
              Mejorar Plan
            </UpgradeButton>
          )}
        </CurrentPlanCard>

        {/* Uso Actual */}
        <UsageCard>
          <h3>Uso este mes</h3>

          <UsageItem>
            <Label>Mensajes</Label>
            <Progress
              value={usage.messages_sent}
              max={subscription.plan.max_messages_per_month}
            />
            <Stats>
              {usage.messages_sent} / {subscription.plan.max_messages_per_month === -1 ? '∞' : subscription.plan.max_messages_per_month}
            </Stats>
          </UsageItem>

          <UsageItem>
            <Label>Archivos</Label>
            <Progress
              value={usage.files_uploaded}
              max={subscription.plan.max_file_uploads_per_month}
            />
            <Stats>
              {usage.files_uploaded} / {subscription.plan.max_file_uploads_per_month === -1 ? '∞' : subscription.plan.max_file_uploads_per_month}
            </Stats>
          </UsageItem>

          <UsageItem>
            <Label>Almacenamiento</Label>
            <Stats>{usage.total_file_size_mb.toFixed(1)} MB usado</Stats>
          </UsageItem>
        </UsageCard>

        {/* Comparación de Planes */}
        <PlansComparison>
          <h3>Comparar Planes</h3>
          {plans.map(plan => (
            <PlanCard key={plan.id} isCurrent={plan.id === subscription.plan_id}>
              <PlanHeader>
                <h4>{plan.display_name}</h4>
                <Price>${plan.price_monthly}/mes</Price>
              </PlanHeader>

              <FeatureList>
                <Feature>
                  {plan.max_messages_per_month === -1 ? 'Mensajes ilimitados' : `${plan.max_messages_per_month} mensajes/mes`}
                </Feature>
                <Feature>
                  {plan.max_file_uploads_per_month === -1 ? 'Archivos ilimitados' : `${plan.max_file_uploads_per_month} archivos/mes`}
                </Feature>
                <Feature>
                  Archivos hasta {plan.max_file_size_mb} MB
                </Feature>
                <Feature>
                  {plan.max_workspaces === -1 ? 'Workspaces ilimitados' : `${plan.max_workspaces} workspaces`}
                </Feature>
                {plan.voice_input_enabled && <Feature>✓ Entrada por voz</Feature>}
              </FeatureList>

              {plan.id !== subscription.plan_id && (
                <SelectPlanButton disabled>
                  Próximamente
                </SelectPlanButton>
              )}
            </PlanCard>
          ))}
        </PlansComparison>
      </Main>

      <BottomNav />
    </PhoneShell>
  );
}
```

### 9.4 Mensajes de Límite Alcanzado

#### Componente de Límite

```typescript
// apps/frontend/src/components/LimitReachedModal.tsx

export function MessageLimitModal({ limit, current, onUpgrade, onDismiss }) {
  return (
    <Modal>
      <Icon>⚠️</Icon>
      <h3>Límite de mensajes alcanzado</h3>
      <p>
        Usaste {current} de {limit} mensajes este mes.
        Actualizá tu plan para seguir conversando con WADI.
      </p>

      <UsageBar value={current} max={limit} />

      <ButtonGroup>
        <Button variant="primary" onClick={onUpgrade}>
          Ver Planes
        </Button>
        <Button variant="secondary" onClick={onDismiss}>
          Cerrar
        </Button>
      </ButtonGroup>

      <ResetInfo>
        Tu límite se renueva el {getNextResetDate()}
      </ResetInfo>
    </Modal>
  );
}
```

#### Integrar en Chat

```typescript
// apps/frontend/src/pages/Chat.tsx

const handleSendMessage = async (message: string) => {
  try {
    await sendMessage(message);
  } catch (error: any) {
    if (error.code === 'LIMIT_REACHED') {
      setShowLimitModal(true);
      setLimitInfo(error.details);
    }
  }
};

{showLimitModal && (
  <MessageLimitModal
    limit={limitInfo.limit}
    current={limitInfo.current}
    onUpgrade={() => navigate('/billing')}
    onDismiss={() => setShowLimitModal(false)}
  />
)}
```

---

## 🗂️ Estructura de Archivos Final

```
apps/
├── api/
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── filesController.ts ✨ NUEVO
│   │   │   ├── memoryController.ts ✨ NUEVO
│   │   │   ├── billingController.ts ✨ NUEVO (actualizar)
│   │   │   ├── chatController.ts 📝 MODIFICAR
│   │   │   └── workspacesController.ts 📝 MODIFICAR
│   │   ├── services/
│   │   │   ├── topic-detection.ts ✨ NUEVO
│   │   │   ├── file-processor.ts ✨ NUEVO
│   │   │   ├── memory-service.ts ✨ NUEVO
│   │   │   └── openai.ts 📝 MODIFICAR
│   │   ├── middleware/
│   │   │   ├── limit-check.ts ✨ NUEVO
│   │   │   └── usage-tracking.ts ✨ NUEVO
│   │   └── routes/
│   │       ├── files.ts ✨ NUEVO
│   │       ├── memory.ts ✨ NUEVO
│   │       └── billing.ts 📝 MODIFICAR
│
└── frontend/
    ├── src/
    │   ├── pages/
    │   │   ├── Workspaces.tsx ✨ NUEVO
    │   │   ├── Onboarding.tsx ✨ NUEVO
    │   │   ├── Home.tsx 📝 MODIFICAR
    │   │   ├── Chat.tsx 📝 MODIFICAR
    │   │   ├── Settings.tsx 📝 MODIFICAR
    │   │   └── Billing.tsx 📝 MODIFICAR
    │   ├── components/
    │   │   ├── FileUpload.tsx ✨ NUEVO
    │   │   ├── FileAttachment.tsx ✨ NUEVO
    │   │   ├── MemoryPanel.tsx ✨ NUEVO
    │   │   ├── OnboardingStep.tsx ✨ NUEVO
    │   │   ├── PermissionRequest.tsx ✨ NUEVO
    │   │   ├── LimitReachedModal.tsx ✨ NUEVO
    │   │   └── MoveConversationModal.tsx ✨ NUEVO
    │   └── store/
    │       ├── filesStore.ts ✨ NUEVO
    │       ├── memoryStore.ts ✨ NUEVO
    │       ├── billingStore.ts ✨ NUEVO
    │       ├── onboardingStore.ts ✨ NUEVO
    │       ├── chatStore.ts 📝 MODIFICAR
    │       └── workspacesStore.ts 📝 MODIFICAR
```

---

## 🎯 Plan de Ejecución

### Fase 1: Fundamentos (Semana 1)

1. ✅ **Día 1-2**: Schema de BD (workspaces, files, memory, billing)
2. ✅ **Día 3-4**: Backend controllers básicos (files, memory, billing)
3. ✅ **Día 5-7**: Frontend stores y componentes base

### Fase 2: P5 Workspaces (Semana 2)

1. Servicio de detección de temas
2. Extender chatController con auto-creación
3. Pantalla de gestión de workspaces
4. Funcionalidad de mover conversaciones
5. Home adaptativa

### Fase 3: P6 Archivos (Semana 3)

1. Sistema de subida de archivos
2. Procesamiento de PDFs, imágenes, docs
3. Integración con OpenAI para análisis
4. UI de archivos en chat
5. Sistema de memoria de usuario
6. Panel de memoria en Settings

### Fase 4: P8 Onboarding (Semana 4)

1. Páginas de onboarding
2. Estado de primer uso
3. Componentes de permisos
4. Guías contextuales

### Fase 5: P9 Monetización (Semana 5)

1. Sistema de planes en BD
2. Middleware de límites
3. Tracking de uso
4. UI de billing
5. Modales de límite alcanzado

### Fase 6: Integración y Testing (Semana 6)

1. Testing E2E de todos los flujos
2. Optimización de performance
3. Documentación
4. Deploy

---

## 🔧 Consideraciones Técnicas

### Storage de Archivos

- **Desarrollo**: Supabase Storage (5GB gratis)
- **Producción**: Migrar a S3 si es necesario
- **Límites**: 5MB (Free), 25MB (Pro), 100MB (Business)

### Procesamiento de Archivos

- **PDFs**: `pdf-parse` (Node.js)
- **Imágenes OCR**: Tesseract.js o Google Vision API
- **DOCX**: `mammoth` o `docx`
- **Queue**: Procesar async con background jobs

### Detección de Temas

- **Inicial**: Análisis con OpenAI (prompts específicos)
- **Futuro**: Embeddings + clustering
- **Threshold**: Confianza > 0.7 para crear workspace

### Seguridad

- Validar tipos de archivo (MIME type)
- Escanear malware (ClamAV o similar)
- Limitar tamaño según plan
- Rate limiting por usuario

---

## 📊 Métricas de Éxito

### P5 Workspaces

- ✅ 70%+ de usuarios usan múltiples workspaces
- ✅ 50%+ de workspaces son auto-creados
- ✅ Tiempo de organización reducido en 80%

### P6 Archivos

- ✅ 60%+ de usuarios suben al menos 1 archivo
- ✅ 90%+ de archivos procesados exitosamente
- ✅ Tiempo de análisis < 30s por archivo

### P8 Onboarding

- ✅ 85%+ completan onboarding
- ✅ Primer mensaje enviado en < 2 min
- ✅ Retención día 1: > 70%

### P9 Monetización

- ✅ Sistema mide uso correctamente
- ✅ Límites se aplican sin errores
- ✅ UI de planes clara y atractiva

---

## 🚀 Próximos Pasos Inmediatos

1. **Crear migraciones de BD** para todas las nuevas tablas
2. **Implementar filesController** con upload básico
3. **Crear FileUpload component** en frontend
4. **Probar flujo de subida end-to-end**
5. **Implementar detección de temas** en chatController

---

## 📝 Notas

- **Todos los textos en español** (ES-AR) según memoria del usuario
- **Diseño Web3/Fintech** consistente con el existente
- **Mobile-first** dentro de PhoneShell
- **Performance**: lazy loading, optimistic updates
- **Accesibilidad**: ARIA labels, keyboard navigation
