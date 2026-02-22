@echo off
:: Daily image optimization audit for all Netlify sites
:: Runs via Windows Task Scheduler
cd /d D:\devprojects\astro-image-defaults
node scripts\audit-all-sites.mjs >> reports\daily-cron.log 2>&1
