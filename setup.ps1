$dirs = @(
    "frontend/src/assets",
    "frontend/src/components/common",
    "frontend/src/components/chat",
    "frontend/src/components/dashboard",
    "frontend/src/components/upload",
    "frontend/src/components/personality",
    "frontend/src/components/memory",
    "frontend/src/components/settings",
    "frontend/src/pages/Landing",
    "frontend/src/pages/Dashboard",
    "frontend/src/pages/Upload",
    "frontend/src/pages/Chat",
    "frontend/src/pages/Memory",
    "frontend/src/pages/Personality",
    "frontend/src/pages/Sources",
    "frontend/src/pages/Settings",
    "frontend/src/services",
    "frontend/src/hooks",
    "frontend/src/context",
    "frontend/src/utils",
    "backend/src/config",
    "backend/src/controllers",
    "backend/src/routes",
    "backend/src/middlewares",
    "backend/src/services",
    "backend/src/models",
    "backend/src/utils",
    "backend/src/uploads",
    "backend/src/prompts",
    "backend/src/vectorDB",
    "ai/parser",
    "ai/cleaner",
    "ai/personality",
    "ai/chunking",
    "ai/embeddings",
    "ai/retriever",
    "ai/prompts",
    "ai/response",
    "ai/evaluation",
    "ai/tests",
    "shared/types",
    "shared/constants",
    "shared/interfaces",
    "docs"
)

foreach ($dir in $dirs) {
    New-Item -ItemType Directory -Force -Path $dir | Out-Null
    New-Item -ItemType File -Force -Path "$dir/.gitkeep" | Out-Null
}

New-Item -ItemType File -Force -Path "frontend/src/App.jsx" | Out-Null
New-Item -ItemType File -Force -Path "backend/src/app.js" | Out-Null
if (-not (Test-Path "README.md")) {
    New-Item -ItemType File -Force -Path "README.md" | Out-Null
}

if (-not (Test-Path .git)) {
    git init
}
git add .
git commit -m "chore: initial folder structure setup"
