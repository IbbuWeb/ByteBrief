PROJECT NAME: MAILE

ROLE:
Act as a senior software architect, full-stack developer,
security engineer, and UI/UX designer.

OBJECTIVE:
Build a complete, production-quality, private email
management application called MailE.

Do not ask me questions.
Do not wait for my approval.
Make sensible technical decisions and implement the
entire application.

CORE REQUIREMENTS:

1. UNIFIED EMAIL MANAGEMENT
- Connect multiple Gmail accounts.
- Connect multiple Microsoft Outlook accounts.
- Support other IMAP/SMTP email providers.
- Display all accounts in one unified inbox.
- Switch between individual accounts.
- Send and receive emails.
- Reply, forward, delete and archive emails.
- Search across all connected accounts.
- Support attachments.
- Support drafts, spam and trash.
- Synchronize emails automatically.

2. PASSWORD MANAGEMENT
- Create a secure, built-in credential vault.
- Store email account credentials securely.
- Support encrypted credential storage.
- Use OAuth2 wherever supported.
- Never store passwords in plaintext.
- Implement a master password.
- Automatically lock the vault.
- Allow users to manage saved credentials.
- Never expose credentials through logs or APIs.

3. SECURITY
- Implement AES-256-GCM encryption.
- Use Argon2id for master-password key derivation.
- Store encryption keys securely.
- Use HTTPS for network communication.
- Implement secure session management.
- Protect against common web vulnerabilities.
- Never collect credentials through fake login pages.
- Never transmit private credentials to third parties.
- Implement secure backups and recovery.

4. USER INTERFACE
Create a modern, professional interface.

Include:
- Unified inbox.
- Sidebar with connected accounts.
- Email reading panel.
- Email composition window.
- Account management.
- Password vault.
- Settings.
- Search functionality.
- Dark and light themes.

The interface should feel polished, fast and intuitive.

5. PLATFORM SUPPORT

Build the architecture to support:

- Web Application (righnow it will run on the web).

in future support for
- Android application (APK).
- iOS application.
- Web application.

Use a shared backend and reusable components
where practical.

6. PRIVATE SERVER

Allow optional self-hosting.

I want to eventually deploy MailE on my own VPS.

Include:
- Docker support.
- Docker Compose.
- PostgreSQL database.
- Backend API.
- Database migrations.
- Environment configuration.
- Automated backups.
- Deployment documentation.

The application must remain usable locally
without requiring my own server.

7. TECHNICAL REQUIREMENTS

Choose a modern, maintainable technology stack.

Prioritize:
- Security.
- Performance.
- Low resource consumption.
- Scalability.
- Maintainability.

Use modular architecture.
Keep frontend, backend and database separate.
Implement proper error handling.
Write clean, documented code.

8. DEVELOPMENT INSTRUCTIONS

Do not just generate a prototype or UI mockup.

Actually implement the working application.

Follow this development sequence:

Phase 1: Architecture and project setup.
Phase 2: Authentication and encrypted vault.
Phase 3: Gmail integration.
Phase 4: Outlook integration.
Phase 5: Unified inbox and email operations.
Phase 6: Account management.
Phase 7: UI/UX implementation.
Phase 8: Security testing.
Phase 9: Docker and self-hosting.
Phase 10: Documentation and deployment.

Do not pretend unfinished features work.
Test each feature before marking it complete.

If an external API requires credentials,
implement the integration and provide clear
configuration instructions. Never invent API keys.

FINAL OBJECTIVE:

I want MailE to become my own private email
ecosystem.

I should be able to manage all my Gmail and
Outlook accounts from one application without
depending on third-party email management apps.

Build it as a real, functional product,
not a demonstration.

Start development immediately.
Do not ask me questions.
Make reasonable decisions and continue.