import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
	plugins: [react()],
	build: {
		rollupOptions: {
			output: {
				manualChunks(id) {
					const moduleId = id.replace(/\\/g, '/');
					if (moduleId.includes('/node_modules/@supabase/')) return 'supabase';
					if (
						moduleId.includes('/node_modules/react/')
						|| moduleId.includes('/node_modules/react-dom/')
						|| moduleId.includes('/node_modules/scheduler/')
					) return 'react-vendor';
					if (
						moduleId.includes('/node_modules/framer-motion/')
						|| moduleId.includes('/node_modules/motion-dom/')
						|| moduleId.includes('/node_modules/motion-utils/')
					) return 'motion';
					if (
						moduleId.includes('/node_modules/react-hook-form/')
						|| moduleId.includes('/node_modules/@hookform/resolvers/')
					) return 'forms';
					if (moduleId.includes('/node_modules/zod/')) return 'validation';
				},
			},
		},
	},
});
