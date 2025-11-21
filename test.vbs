Set objShell = WScript.CreateObject(\"WScript.Shell\"):objShell.Run \"cmd /c cd apps\frontend && pnpm exec vite build > nul 2> err.txt\", 0, True
