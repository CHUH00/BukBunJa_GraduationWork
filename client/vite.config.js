import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
    plugins: [react()],
    server: {
        proxy: {
            '/lotto': 'http://localhost:8000',
            '/draws': 'http://localhost:8000',
            '/retailers': 'http://localhost:8000',
        },
    },
});