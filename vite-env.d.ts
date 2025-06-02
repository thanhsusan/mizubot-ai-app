
interface ImportMetaEnv {
  readonly VITE_API_KEY: string;
  // You can add other environment variables here if needed
  // readonly VITE_OTHER_VAR: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
