@echo off
echo Initializing, tagging 1.1.1 and force pushing to GitHub repository...
git init
git remote remove origin 2>nul
git remote add origin https://github.com/codestobecreated/gogo_camping.git
git add .
git commit -m "Release v1.1.1 - Custom Person Package, UI updates & Tag 1.1.1"
git branch -M main
git tag -f -a 1.1.1 -m "Version 1.1.1"
git tag -f -a v1.1.1 -m "Version 1.1.1"
git push -u origin main --force --tags
echo Push complete with tag 1.1.1!
