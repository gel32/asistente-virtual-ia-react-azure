# 🤖 Asistente Virtual IA "Emma" — React + Azure OpenAI

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Microsoft Azure](https://img.shields.io/badge/Microsoft_Azure-0078D4?style=for-the-badge&logo=microsoftazure&logoColor=white)

Componente de asistente virtual corporativo desarrollado para brindar soporte de primer nivel, resolver dudas frecuentes sobre gestión de garantías y derivar requerimientos comerciales complejos a ejecutivos mediante WhatsApp.

> **Nota de seguridad:** Este repositorio contiene una versión extraída y sanitizada del módulo original desplegado en ambiente corporativo. Las credenciales, firmas SAS de Azure, IDs de suscripción y números telefónicos reales han sido reemplazados por variables de entorno y datos de demostración.

---

## 🏗️ Arquitectura y Flujo de Datos

El proyecto desacopla la interfaz de usuario de la lógica de IA utilizando una arquitectura *serverless* en Microsoft Azure:

```mermaid
sequenceDiagram
    participant U as Usuario (Web)
    participant R as Chatbot.tsx (React)
    participant L as Azure Logic Apps (Webhook)
    participant AI as Azure OpenAI (Chat Completions)

    U->>R: Envía mensaje
    R->>L: POST JSON { id, sender, text, timestamp }
    L->>AI: Envía System Prompt + Mensaje del usuario
    AI-->>L: Genera respuesta contextualizada
    L-->>R: HTTP 200 { reply }
    R-->>U: Renderiza respuesta con timestamp