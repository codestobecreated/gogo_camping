@echo off
echo Initializing, tagging 1.1.0 and pushing to GitHub repository...
git init
git remote remove origin 2>nul
git remote add origin https://github.com/codestobecreated/gogo_camping.git
git add .
git commit -m "Release v1.1.0 - Custom Person Package, Dynamic Camper Counter & Profile History"
git branch -M main
git tag -a 1.1.0 -m "Version 1.1.0"
git push -u origin main --tags
echo Push complete with tag 1.1.0!
