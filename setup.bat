@echo off
REM Suivi Sportif - Script d'installation pour Windows

echo.
echo ================================================
echo  Suivi Sportif - Configuration du Projet
echo ================================================
echo.

REM Vérifier si Node.js est installé
node --version > nul 2>&1
if errorlevel 1 (
    echo ✗ Erreur: Node.js n'est pas installé
    echo Téléchargez-le depuis: https://nodejs.org/
    exit /b 1
)

echo ✓ Node.js détecté
node --version

echo.
echo 1️⃣  Création de la structure des répertoires...
node setup-dirs.js

if errorlevel 1 (
    echo ✗ Erreur lors de la création de la structure
    exit /b 1
)

echo.
echo 2️⃣  Installation des dépendances...
call npm install

if errorlevel 1 (
    echo ✗ Erreur lors de l'installation des dépendances
    exit /b 1
)

echo.
echo 3️⃣  Configuration de la base de données...
call npm run migrate -w server

if errorlevel 1 (
    echo ✗ Erreur lors de la migration BD
    exit /b 1
)

echo.
echo ================================================
echo ✓ Configuration terminée avec succès !
echo ================================================
echo.
echo Démarrage du serveur de développement...
echo.
echo 🔗 Accédez à:
echo    Client  : http://localhost:5173
echo    API     : http://localhost:3001
echo.
echo Appuyez sur Ctrl+C pour arrêter
echo.

call npm run dev

pause
