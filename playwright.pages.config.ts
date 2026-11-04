import {defineConfig} from '@playwright/test';
const base=process.env.PAGES_BASE??'/Autorijsimulator-1.1/';
export default defineConfig({testDir:'./tests/pages',use:{baseURL:'http://127.0.0.1:4176'+base,headless:true},webServer:{reuseExistingServer:!process.env.CI,command:'node node_modules/vite/bin/vite.js preview --host 127.0.0.1 --port 4176',env:{BASE_PATH:base},url:'http://127.0.0.1:4176'+base,timeout:30000}});

