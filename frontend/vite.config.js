import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";
export default ({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "VITE_");
  return defineConfig({
    plugins: [react(), tailwindcss()],
    server: {
      port: Number(env.VITE_PORT),
    },
  });
};
