# StudyStride V2.1 Sidebar
Updated fixes:
- Working Flashcards panel
- Working AI chat panel with configurable API endpoint
- Working BS + AD Calendar panel
- Knowledge Vault device upload picker
- Settings panel: API location, model, local key, appearance, density, display name, about
- Cache version bumped to reduce stale PWA issues

## AI endpoint
Use a server-side endpoint/proxy that accepts POST JSON with `message`, `model`, and `messages`, and returns JSON containing one of:
- answer
- message
- response
- choices[0].message.content

Do not expose sensitive production API keys in a public GitHub Pages app. A backend/edge function is recommended.
