import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
    plugins: [react()],
    server: {
        proxy: {
            '/lotto': 'http://localhost:7090',
            '/draws': 'http://localhost:7090',
            '/retailers': 'http://localhost:7090',
        },
    },
});
