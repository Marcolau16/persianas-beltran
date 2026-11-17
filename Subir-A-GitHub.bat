@echo off
setlocal
cd /d "%~dp0"
title Subir Persianas Beltran HMO a GitHub
echo ========================================================
echo Subiendo proyecto a GitHub...
echo ========================================================

where git >nul 2>nul
if errorlevel 1 goto git_missing

if not exist ".git" (
    echo No se encontro un repositorio Git. Inicializando...
    git init
    if errorlevel 1 goto upload_failed
)

git branch -M main
if errorlevel 1 goto upload_failed

git remote get-url origin >nul 2>nul
if errorlevel 1 (
    git remote add origin https://github.com/Marcolau16/persianas-beltran.git
    if errorlevel 1 goto upload_failed
)

git add -A
if errorlevel 1 goto upload_failed

git diff --cached --quiet
if errorlevel 2 goto upload_failed
if errorlevel 1 goto commit_changes
goto push_changes

:commit_changes
set /p "commitMessage=Mensaje del cambio (Enter para usar 'Actualizacion del proyecto'): "
if not defined commitMessage set "commitMessage=Actualizacion del proyecto"
git commit -m "%commitMessage%"
if errorlevel 1 goto upload_failed

:push_changes
git push -u origin main
if errorlevel 1 goto upload_failed

echo ========================================================
echo [EXITO] Tu proyecto fue subido a GitHub correctamente.
goto finish

:git_missing
echo [ERROR] Git no esta instalado o no esta disponible en PATH.
echo Instala Git for Windows y vuelve a ejecutar este archivo.
goto finish_failed

:upload_failed
echo [ERROR] No se pudo completar la subida.
echo Revisa el mensaje de Git; puede faltar iniciar sesion o crear el repositorio remoto.

:finish_failed
echo ========================================================
pause
exit /b 1

:finish
echo ========================================================
pause
exit /b 0
