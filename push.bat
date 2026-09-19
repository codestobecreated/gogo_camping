@echo off
echo Initializing and pushing to GitHub repository...
git init
git remote remove origin 2>nul
git remote add origin https://github.com/ec4you-digital-marketing-creator/gogo_booking_page-.git
git add .
git commit -m "Update GOGOCamping CMS Admin Dashboard & Add-on Steppers"
git branch -M main
git push -u origin main
echo Push complete!
