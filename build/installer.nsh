# 1. Include all necessary libraries at the top
!include "MUI2.nsh"
!include "nsDialogs.nsh"
!include "LogicLib.nsh"

# 2. Define global variables and pages at the TOP LEVEL
Var /GLOBAL DOWNLOAD_PATH
Page custom nsCreateDownloadPage nsLeaveDownloadPage "Downloads Location"

# 3. Use macros only for actions at specific installer moments
!macro customInit
  # Set the default value when the installer UI is initialized
  StrCpy $DOWNLOAD_PATH "$PROFILE\Downloads"
!macroend

!macro customInstall
  # Write the config file when the files are being installed
  WriteINIStr "$INSTDIR\config.ini" "Settings" "downloadPath" "$DOWNLOAD_PATH"
!macroend

# --- Page Creation and Event Handler Functions (Unchanged) ---

!pragma warning disable 6010

Function nsCreateDownloadPage
  nsDialogs::Create 1018
  Pop $0
  ${NSD_CreateLabel} 0 0 100% 12u "Please select the default folder for saved files."
  ${NSD_CreateLabel} 0 25u 100% 12u "This is where decrypted files will be saved."
  ${NSD_CreateLabel} 0 55u 8% 12u "Folder:"
  ${NSD_CreateText} 10% 53u 70% 12u $DOWNLOAD_PATH
  Pop $R0
  ${NSD_CreateBrowseButton} 82% 53u 15% 12u "Browse..."
  Pop $R1
  ${NSD_OnClick} $R1 onBrowse
  nsDialogs::Show
FunctionEnd

Function nsLeaveDownloadPage
  ${NSD_GetText} $R0 $DOWNLOAD_PATH
FunctionEnd

Function onBrowse
  nsDialogs::SelectFolderDialog "Select Download Folder" ""
  Pop $0
  ${If} $0 != ""
    StrCpy $DOWNLOAD_PATH $0
  ${EndIf}
  ${NSD_SetText} $R0 $DOWNLOAD_PATH
FunctionEnd

!pragma warning default 6010
