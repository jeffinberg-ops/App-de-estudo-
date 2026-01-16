# Configuração do Firebase Authentication

Este guia explica como configurar o Firebase Authentication e sincronização de dados no aplicativo Focus.

## Pré-requisitos

1. Conta no [Firebase Console](https://console.firebase.google.com/)
2. Node.js instalado

## Passo 1: Criar Projeto Firebase

1. Acesse o [Firebase Console](https://console.firebase.google.com/)
2. Clique em "Adicionar projeto" ou "Add project"
3. Dê um nome ao seu projeto (ex: "app-de-estudo")
4. Configure o Google Analytics (opcional)
5. Clique em "Criar projeto"

## Passo 2: Configurar Authentication

1. No menu lateral, vá em **Authentication**
2. Clique em "Começar" ou "Get started"
3. Na aba "Sign-in method", clique em "Email/Password"
4. Ative a opção "Email/Password"
5. Clique em "Salvar"

## Passo 3: Configurar Firestore Database

1. No menu lateral, vá em **Firestore Database**
2. Clique em "Criar banco de dados" ou "Create database"
3. Escolha um modo:
   - **Modo de produção**: Requer regras de segurança
   - **Modo de teste**: Permite leitura/escrita por 30 dias (recomendado para desenvolvimento)
4. Escolha uma localização para o banco de dados
5. Clique em "Ativar"

### Regras de Segurança Recomendadas (Firestore)

Após criar o banco de dados, configure as regras de segurança:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Permitir que usuários autenticados leiam/escrevam apenas seus próprios dados
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

**IMPORTANTE sobre as regras de segurança:**

Estas regras implementam um modelo de segurança baseado em acesso a documento individual:
- ✅ **Permitido**: Cada usuário pode acessar APENAS seu próprio documento em `/users/{userId}` onde `userId` corresponde ao seu UID de autenticação
- ❌ **Bloqueado**: Consultas à coleção completa, listagem de documentos de outros usuários, ou qualquer operação que não seja no documento específico do usuário autenticado

O código da aplicação foi desenvolvido para seguir este modelo de segurança, usando apenas referências diretas a documentos (`doc()`). NÃO modifique o código para usar operações de coleção (`collection()`, `getDocs()`, `query()`) pois elas serão bloqueadas por estas regras.

## Passo 4: Obter Credenciais do Firebase

1. No menu lateral, clique no ícone de engrenagem ⚙️ e selecione "Configurações do projeto"
2. Role até a seção "Seus aplicativos"
3. Clique no ícone "</>" (Web)
4. Registre seu app com um apelido (ex: "Focus Web App")
5. Copie as credenciais fornecidas

## Passo 5: Configurar Variáveis de Ambiente

1. No diretório raiz do projeto, já existe um arquivo `.env.local`
2. As credenciais já estão configuradas no arquivo:

```env
VITE_FIREBASE_API_KEY="sua-api-key"
VITE_FIREBASE_AUTH_DOMAIN="seu-projeto.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="seu-projeto-id"
VITE_FIREBASE_STORAGE_BUCKET="seu-projeto.appspot.com"
VITE_FIREBASE_MESSAGING_SENDER_ID="seu-sender-id"
VITE_FIREBASE_APP_ID="seu-app-id"
```

3. Se necessário, atualize com suas credenciais do Firebase Console

## Passo 6: Executar o Aplicativo

```bash
npm install
npm run dev
```

## Como Funciona

### Autenticação

- Quando o Firebase está configurado, o aplicativo exige login
- Usuários podem criar conta com email e senha
- Usuários existentes podem fazer login
- A sessão é mantida automaticamente

### Sincronização de Dados

1. **No Login**: 
   - Dados locais (IndexedDB) são mesclados com dados remotos (Firestore)
   - Prioriza informações mais completas de ambas as fontes
   
2. **Durante o Uso**:
   - Todas as alterações são salvas localmente (IndexedDB)
   - Alterações são automaticamente sincronizadas com o Firestore
   
3. **No Logout**:
   - Dados locais são mantidos
   - Sincronização com Firestore é pausada

### Estratégia de Merge

Quando há conflito entre dados locais e remotos:

- **Matérias e Tópicos**: Combina todas as entradas únicas
- **Logs de Estudo**: Combina sem duplicatas (por ID)
- **Questões**: Usa o maior valor entre local e remoto
- **Conquistas**: Combina todas desbloqueadas
- **Configurações**: Prioriza configurações locais (mais recentes)

## Modo Offline (Sem Firebase)

Se as credenciais do Firebase não estiverem configuradas:

- O aplicativo funciona normalmente em modo offline
- Dados são salvos apenas localmente (IndexedDB)
- Não há tela de login
- Funciona como antes da implementação do Firebase

## Troubleshooting

### Erro: "Firebase não está configurado"

- Verifique se o arquivo `.env.local` existe
- Confirme que todas as variáveis estão preenchidas
- Reinicie o servidor de desenvolvimento (`npm run dev`)

### Erro: "Erro de rede. Verifique sua conexão"

- Verifique sua conexão com a internet
- Confirme que as credenciais no `.env.local` estão corretas
- Verifique se o Authentication está habilitado no Firebase Console

### Dados não sincronizam

- Verifique as regras de segurança no Firestore
- Confirme que o usuário está autenticado
- Verifique o console do navegador para erros
- **Erro de permissão específico (permission-denied)**:
  - Certifique-se de que as regras de segurança estão configuradas corretamente (veja seção "Regras de Segurança Recomendadas")
  - Verifique se o usuário está autenticado (check no console: `auth.currentUser`)
  - Confirme que o código está usando apenas `doc()` para acesso direto ao documento do usuário, não operações de coleção
  - O userId usado nas funções deve corresponder exatamente ao UID do usuário autenticado

## Segurança

⚠️ **IMPORTANTE**: 

- Nunca commite o arquivo `.env.local` no Git
- As credenciais do Firebase são públicas (client-side), mas protegidas por regras de segurança
- Configure sempre regras adequadas no Firestore para proteger os dados dos usuários
- Use autenticação para garantir que usuários só acessem seus próprios dados

## Estrutura de Dados no Firestore

```
users (collection)
  └── {userId} (document)
      ├── subjects: string[]
      ├── subjectColors: object
      ├── topics: object
      ├── logs: StudyLog[]
      ├── goals: object
      ├── questions: object
      ├── questionLogs: QuestionLog[]
      ├── unlockedAchievements: string[]
      ├── viewedAchievements: string[]
      ├── settings: UserSettings
      ├── examDate?: string
      ├── examName?: string
      └── lastSync: string (timestamp ISO)
```
