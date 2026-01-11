# Configuração do Firebase - Focus App

Este documento explica como configurar o Firebase Authentication e Firestore Database para o aplicativo Focus.

## Pré-requisitos

- Uma conta Google
- Node.js instalado
- Acesso ao [Console do Firebase](https://console.firebase.google.com/)

## Passos para Configuração

### 1. Criar Projeto no Firebase

1. Acesse o [Console do Firebase](https://console.firebase.google.com/)
2. Clique em "Adicionar projeto"
3. Digite o nome do projeto (ex: "App-de-estudo")
4. Siga os passos de configuração
5. Desabilite o Google Analytics (opcional)

### 2. Ativar Firebase Authentication

1. No console do Firebase, vá para **Authentication** no menu lateral
2. Clique em "Começar"
3. Na aba "Sign-in method", ative os seguintes provedores:
   - **E-mail/senha**: Clique em "E-mail/senha", ative e salve
   - **Google** (opcional): Clique em "Google", ative, configure o e-mail de suporte e salve

### 3. Configurar Firestore Database

1. No console do Firebase, vá para **Firestore Database** no menu lateral
2. Clique em "Criar banco de dados"
3. Escolha o modo de teste (para desenvolvimento) ou modo de produção
   - **Modo de teste**: Dados públicos por 30 dias (bom para desenvolvimento)
   - **Modo de produção**: Requer regras de segurança
4. Selecione a localização do servidor (escolha o mais próximo dos seus usuários)
5. Clique em "Ativar"

### 4. Configurar Regras de Segurança do Firestore

No Firestore Database, vá para a aba **Regras** e configure:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Regra para a coleção de usuários
    match /users/{userId} {
      // Apenas o próprio usuário pode ler e escrever seus dados
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

Clique em "Publicar" para aplicar as regras.

### 5. Obter Credenciais do Firebase

1. No console do Firebase, clique no ícone de engrenagem (⚙️) ao lado de "Visão geral do projeto"
2. Selecione "Configurações do projeto"
3. Role para baixo até "Seus aplicativos"
4. Clique no ícone da Web (`</>`)
5. Registre seu aplicativo com um nome (ex: "Focus Web")
6. Copie as credenciais de configuração do Firebase

### 6. Configurar Variáveis de Ambiente

1. Crie um arquivo `.env.local` na raiz do projeto (se não existir)
2. Adicione as seguintes variáveis com os valores obtidos no passo anterior:

```env
VITE_FIREBASE_API_KEY="sua-api-key"
VITE_FIREBASE_AUTH_DOMAIN="seu-projeto.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="seu-project-id"
VITE_FIREBASE_STORAGE_BUCKET="seu-projeto.firebasestorage.app"
VITE_FIREBASE_MESSAGING_SENDER_ID="seu-sender-id"
VITE_FIREBASE_APP_ID="seu-app-id"
```

3. Adicione `.env.local` ao seu `.gitignore` (já está configurado)

### 7. Instalar Dependências

```bash
npm install
```

### 8. Executar o Aplicativo

```bash
npm run dev
```

O aplicativo estará disponível em `http://localhost:3000`

## Funcionalidades Implementadas

### Autenticação
- ✅ Login com e-mail e senha
- ✅ Cadastro de novos usuários
- ✅ Login com Google
- ✅ Validação de formulários
- ✅ Mensagens de erro amigáveis
- ✅ Logout

### Sincronização de Dados
- ✅ Dados salvos no Firestore automaticamente após login
- ✅ Carregamento de dados do Firestore ao fazer login
- ✅ Fallback para IndexedDB local quando offline
- ✅ Sincronização automática ao salvar dados
- ✅ Dados persistem entre dispositivos

## Estrutura de Dados no Firestore

Os dados do usuário são salvos na coleção `users` com a seguinte estrutura:

```
users/
  └── {userId}/
      ├── subjects: string[]
      ├── subjectColors: Record<string, string>
      ├── topics: Record<string, string[]>
      ├── logs: StudyLog[]
      ├── goals: Record<string, number>
      ├── questions: Record<string, QuestionData>
      ├── questionLogs: QuestionLog[]
      ├── unlockedAchievements: string[]
      ├── viewedAchievements: string[]
      ├── settings: UserSettings
      └── lastUpdated: Timestamp
```

## Fluxo de Autenticação

1. **Primeiro Acesso**: Usuário vê a tela de login
2. **Novo Usuário**: Clica em "Criar conta", preenche e-mail/senha
3. **Login**: Usuário autenticado é redirecionado para o app
4. **Carregamento**: Dados são carregados do Firestore
5. **Uso**: Todas as mudanças são sincronizadas automaticamente
6. **Logout**: Usuário pode sair da conta nas configurações

## Funcionamento Offline

O aplicativo funciona offline através de duas camadas:

1. **IndexedDB**: Armazena dados localmente no navegador
2. **Firestore**: Sincroniza dados quando online

Quando o usuário está **offline**:
- Dados são salvos apenas no IndexedDB
- O app continua funcionando normalmente

Quando o usuário fica **online**:
- Dados são automaticamente sincronizados com o Firestore
- Mudanças de outros dispositivos são carregadas

## Segurança

- ✅ Senhas têm mínimo de 6 caracteres
- ✅ Validação de e-mail
- ✅ Regras de segurança do Firestore impedem acesso não autorizado
- ✅ Credenciais nunca são commitadas no Git
- ✅ API keys são gerenciadas via variáveis de ambiente

## Troubleshooting

### Erro: "Firebase: Error (auth/invalid-api-key)"
- Verifique se o arquivo `.env.local` existe na raiz do projeto
- Confirme que todas as variáveis estão configuradas corretamente
- Reinicie o servidor de desenvolvimento após criar/modificar o `.env.local`

### Erro: "Missing or insufficient permissions"
- Verifique as regras de segurança do Firestore
- Certifique-se de que o usuário está autenticado
- Confirme que o userId nas regras corresponde ao uid do usuário

### Dados não estão sincronizando
- Verifique a conexão com a internet
- Abra o console do navegador para ver erros
- Confirme que o Firestore está configurado corretamente

## Próximos Passos (Opcional)

- Adicionar recuperação de senha via e-mail
- Implementar autenticação com Facebook
- Adicionar foto de perfil do usuário
- Implementar sincronização em tempo real
- Adicionar notificações push

## Recursos Úteis

- [Documentação Firebase Authentication](https://firebase.google.com/docs/auth)
- [Documentação Firestore](https://firebase.google.com/docs/firestore)
- [Regras de Segurança Firestore](https://firebase.google.com/docs/firestore/security/get-started)
- [Firebase com React](https://firebase.google.com/docs/web/setup)
