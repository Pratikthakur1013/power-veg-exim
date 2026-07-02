' Power Veg Exim - Silent Startup Launcher
' This VBScript runs the server silently (no terminal window visible)
' Place this file in the Windows Startup folder to auto-run on login

Set oShell = CreateObject("WScript.Shell")

' Run node with the server launcher - window style 0 = completely hidden
oShell.Run "node ""F:\power-veg-exim (1)\startup-launcher.cjs""", 0, False

' Done - the server runs detached in background
WScript.Quit
