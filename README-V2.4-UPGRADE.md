# StudyStride V2.4 Upgrade

## Upload to GitHub Pages
Replace the root files:
- index.html
- service-worker.js
- manifest.json (optional, unchanged)
- studystride-logo.jpeg (keep your current logo if already present)

## IMPORTANT: Real AI image understanding
The frontend now sends image data to your Worker. To enable true visual understanding, replace your Cloudflare Worker code with `cloudflare-worker-v24-vision.js`.

Your Worker must keep the Workers AI binding named `AI`.

The V2.4 Worker uses:
- Text: @cf/meta/llama-3.1-8b-instruct
- Vision: @cf/meta/llama-3.2-11b-vision-instruct

Cloudflare may require a one-time acceptance of Meta's license for the Vision model. After updating the Worker, deploy it and keep the same Worker URL in StudyStride Settings.

## New features
- Dedicated working Biometric Hub
- Daily readiness snapshot
- Biometric history and trends
- AI-ready biometric analysis
- Study Resources / custom website launcher
- Ctrl+K universal search
- Vision-capable AI request pipeline
- Dynamic current-date mission behavior
