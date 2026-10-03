@echo off
echo Initializing and pushing to GitHub repository...
git init
git remote remove origin 2>nul
git remote add origin https://github.com/codestobecreated/gogo_camping.git
git add .
git commit -m "first commit"
git branch -M main
git push -u origin main
echo Push complete!

