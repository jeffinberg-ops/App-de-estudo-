<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Focus - Aplicativo de Estudo e Produtividade

Um aplicativo completo para gerenciamento de estudos com suporte a Pomodoro, rastreamento de questões, metas semanais e sincronização na nuvem.

## ✨ Funcionalidades

- 🔐 **Autenticação Firebase**: Login com e-mail/senha e Google
- ☁️ **Sincronização em Nuvem**: Dados salvos no Firestore Database
- ⏱️ **Timer Pomodoro**: Sessões de foco com intervalos automáticos
- 📊 **Rastreamento de Progresso**: Gráficos e estatísticas detalhadas
- 📝 **Gestão de Questões**: Acompanhe acertos e erros por matéria
- 🎯 **Metas Semanais**: Defina e acompanhe objetivos de estudo
- 🏆 **Sistema de Conquistas**: Desbloqueie achievements
- 📅 **Calendário de Estudos**: Visualize seu histórico
- 🌍 **Multilíngue**: Suporte para Português, Inglês, Espanhol e Russo
- 📱 **PWA**: Funciona offline como aplicativo instalável

## 🚀 Executar Localmente

**Pré-requisitos:** Node.js 16+

1. **Clone o repositório**
   ```bash
   git clone https://github.com/jeffinberg-ops/App-de-estudo-.git
   cd App-de-estudo-
   ```

2. **Instale as dependências**
   ```bash
   npm install
   ```

3. **Configure o Firebase**
   
   Siga o guia completo em [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) para:
   - Criar projeto no Firebase
   - Ativar Authentication e Firestore
   - Configurar variáveis de ambiente

4. **Execute o aplicativo**
   ```bash
   npm run dev
   ```
   
   O aplicativo estará disponível em `http://localhost:3000`

## 🔧 Configuração do Firebase

O aplicativo requer configuração do Firebase para autenticação e sincronização de dados.

📖 **Guia completo**: Veja [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) para instruções detalhadas.

**Resumo rápido:**
- Crie um projeto no [Firebase Console](https://console.firebase.google.com/)
- Ative Firebase Authentication (Email/Senha e Google)
- Configure Firestore Database
- Copie as credenciais para `.env.local`

## 📦 Build para Produção

```bash
npm run build
npm run preview
```

## 🛠️ Tecnologias

- **Frontend**: React 19 + TypeScript
- **Build**: Vite
- **Estilização**: Tailwind CSS
- **Autenticação**: Firebase Authentication
- **Banco de Dados**: Firestore Database + IndexedDB
- **Gráficos**: Recharts
- **Ícones**: Lucide React

## 📱 Progressive Web App (PWA)

O aplicativo pode ser instalado em dispositivos móveis e desktop:
- Funciona offline
- Ícone na tela inicial
- Notificações (futuro)

## 🔒 Segurança

- Autenticação segura via Firebase
- Regras de segurança Firestore
- Dados criptografados em trânsito
- Credenciais via variáveis de ambiente
- IndexedDB para dados locais

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

View your app in AI Studio: https://ai.studio/apps/drive/1V4VPKDMp-YuCZSsamenll_Mn0BuApp4C
