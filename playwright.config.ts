import {defineConfig} from '@playwright/test';
export default defineConfig({workers:1,testDir:'./tests/e2e',use:{baseURL:'http://127.0.0.1:4473/',headless:true},webServer:{command:'node node_modules/vite/bin/vite.js --host 127.0.0.1 --port 4473',url:'http://127.0.0.1:4473/',reuseExistingServer:!process.env.CI,timeout:30000}});
