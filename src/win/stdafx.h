#pragma once

#define CENUMERATESERIAL_USE_STL //Uncomment this line if you want to test the STL support in CEnumerateSerial

#ifndef _SECURE_ATL
#define _SECURE_ATL 1 //Use the Secure C Runtime in ATL
#endif

#ifndef VC_EXTRALEAN
#define VC_EXTRALEAN
#endif

#ifndef WINVER
#define WINVER 0x0500
#endif

#ifndef _WIN32_WINNT
#define _WIN32_WINNT 0x0500
#endif

#ifndef _WIN32_WINDOWS
#define _WIN32_WINDOWS 0x0500
#endif

#ifndef _WIN32_IE
#define _WIN32_IE 0x0500
#endif

#ifndef CENUMERATESERIAL_USE_STL
  #define _ATL_CSTRING_EXPLICIT_CONSTRUCTORS	// some CString constructors will be explicit

  #define _AFX_ALL_WARNINGS // turns off MFC's hiding of some common and often safely ignored warning messages

  #include <afxext.h> 
  #include <afxtempl.h>
  #include <atlbase.h>
#else
  #include "stdstring.h"
  #define NO_ENUMSERIAL_USING_WMI
#endif

#include <vector>

#define NO_ENUMSERIAL_USING_ENUMPORTS
#define NO_ENUMSERIAL_USING_SETUPAPI1
#define NO_ENUMSERIAL_USING_SETUPAPI2
#define NO_ENUMSERIAL_USING_WMI
#define NO_ENUMSERIAL_USING_COMDB
#define NO_ENUMSERIAL_USING_CREATEFILE
#define NO_ENUMSERIAL_USING_GETDEFAULTCOMMCONFIG
#define NO_ENUMSERIAL_USING_REGISTRY