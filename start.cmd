@echo off
call "%~dp0..\backend\start.cmd" %*
exit /b %errorlevel%
