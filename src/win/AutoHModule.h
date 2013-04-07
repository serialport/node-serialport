/*
Module : AutoHModule.h
Purpose: Defines the interface for a class which supports auto closing of a HMODULE via FreeLibrary and 
         setting of the last Win32 error via SetLastError
Created: PJN / 10-01-2013

Copyright (c) 2013 by PJ Naughter (Web: www.naughter.com, Email: pjna@naughter.com)

All rights reserved.

Copyright / Usage Details:

You are allowed to include the source code in any product (commercial, shareware, freeware or otherwise) 
when your product is released in binary form. You are allowed to modify the source code in any way you want 
except you cannot modify the copyright details at the top of each module. If you want to distribute source 
code with your application, then you are only allowed to distribute versions released by the author. This is 
to maintain a single distribution point for the source code. 

*/


///////////////////////// Macros / Structs etc ////////////////////////////////

#pragma once

#ifndef __AUTOHMODULE_H__
#define __AUTOHMODULE_H__


///////////////////////// Classes /////////////////////////////////////////////

class CAutoHModule
{
public:
//Constructors / Destructors
  CAutoHModule() : m_hModule(NULL), 
                    m_dwError(ERROR_SUCCESS)
  {
  }

  explicit CAutoHModule(HMODULE hModule) : m_hModule(hModule), 
                                            m_dwError(GetLastError())
  {
  }

  explicit CAutoHModule(HMODULE hModule, DWORD dwError) : m_hModule(hModule), 
                                                          m_dwError(dwError)
  {
  }

  ~CAutoHModule()
  {
    if (m_hModule != NULL)
    {
      FreeLibrary(m_hModule);
      m_hModule = NULL;
    }
    SetLastError(m_dwError);
  }

  operator HMODULE() 
  {
    return m_hModule;
  }

//Member variables
  HMODULE m_hModule;
  DWORD m_dwError;
};


#endif //__AUTOHMODULE_H__
