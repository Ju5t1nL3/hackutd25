interface ImportMetaEnv {
  readonly VITE_CALLING_AGENT_URL: string;
  readonly VITE_SEARCHING_AGENT_URL: string;
  // Add other VITE_ variables here if needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
