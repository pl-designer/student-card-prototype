#!/bin/bash
# deploy.sh — push all changes to GitHub Pages with one command

cd "$(dirname "$0")"

echo "📦 Committing changes..."
git add .
git commit -m "update: $(date '+%Y-%m-%d %H:%M')"

echo "🚀 Pushing to GitHub..."
git push

echo ""
echo "✅ Done! Live in ~60 seconds at:"
echo "   https://pl-designer.github.io/student-card-prototype"
