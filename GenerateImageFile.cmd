@echo off
IF "%1" equ "execute" (GOTO EXECUTE)

GenerateImageFile.cmd execute > script\DataImagesLib.js

GOTO EXIT

:EXECUTE
echo var imagesList = new Array();
for /r %%i in (images\interface\*.*) do echo imagesList.push({ id: "%%~ni", fileName: "interface/%%~nxi" });

for /r %%i in (images\planets\*.*) do echo imagesList.push({ id: "%%~ni", fileName: "planets/%%~nxi" });
for /r %%i in (images\resources\*.*) do echo imagesList.push({ id: "%%~ni", fileName: "resources/%%~nxi" });
for /r %%i in (images\buildings\*.*) do echo imagesList.push({ id: "%%~ni", fileName: "buildings/%%~nxi" });
for /r %%i in (images\illustrations\*.*) do echo imagesList.push({ id: "%%~ni", fileName: "illustrations/%%~nxi" });
:EXIT
