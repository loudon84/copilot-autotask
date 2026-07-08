/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_AUTOTASK_API_MODE?: "mock" | "remote";
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
