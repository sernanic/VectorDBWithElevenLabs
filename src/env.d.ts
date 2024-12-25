/// <reference types="vite/client" />

declare namespace NodeJS {
  interface ProcessEnv {
    NEXT_PUBLIC_ELEVENLABS_AGENT_ID: string;
  }
}

interface ImportMetaEnv {
  readonly VITE_XI_API_KEY: string
  readonly VITE_ELEVENLABS_AGENT_ID: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
