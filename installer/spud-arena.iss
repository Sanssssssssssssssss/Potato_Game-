#define MyAppName "Spud Arena"
#ifndef MyAppVersion
  #define MyAppVersion "1.0.0"
#endif
#ifndef MyAppSource
  #define MyAppSource "release\\Spud Arena-win32-x64"
#endif
#ifndef MyOutputDir
  #define MyOutputDir "release\\installer"
#endif

[Setup]
AppId={{47F54653-23B0-4E3C-A1A1-4F2B82DB4E6A}
AppName={#MyAppName}
AppVersion={#MyAppVersion}
AppPublisher=Sanssssssssssssssss
DefaultDirName={autopf}\{#MyAppName}
DefaultGroupName={#MyAppName}
DisableProgramGroupPage=yes
LicenseFile={#SourcePath}\..\LICENSE
OutputDir={#MyOutputDir}
OutputBaseFilename=Spud-Arena-Setup-{#MyAppVersion}
SetupIconFile={#SourcePath}\..\assets\desktop\app-icon.ico
UninstallDisplayIcon={app}\Spud Arena.exe
Compression=lzma
SolidCompression=yes
WizardStyle=modern
ArchitecturesAllowed=x64compatible
ArchitecturesInstallIn64BitMode=x64compatible

[Languages]
Name: "chinesesimp"; MessagesFile: "compiler:Default.isl"

[Tasks]
Name: "desktopicon"; Description: "创建桌面快捷方式"; GroupDescription: "附加任务："; Flags: unchecked

[Files]
Source: "{#MyAppSource}\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs

[Icons]
Name: "{autoprograms}\{#MyAppName}"; Filename: "{app}\Spud Arena.exe"; IconFilename: "{app}\Spud Arena.exe"
Name: "{autodesktop}\{#MyAppName}"; Filename: "{app}\Spud Arena.exe"; Tasks: desktopicon; IconFilename: "{app}\Spud Arena.exe"

[Run]
Filename: "{app}\Spud Arena.exe"; Description: "启动 {#MyAppName}"; Flags: nowait postinstall skipifsilent
