/*
Module : AutoHandle.h
Purpose: Defines the interface for a class which supports auto closing of a handle via CloseHandle
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

#ifndef __AUTOHANDLE_H__
#define __AUTOHANDLE_H__


///////////////////////// Classes /////////////////////////////////////////////

class CAutoHandle
{
public:
//Constructors / Destructors
  CAutoHandle() : m_hHandle(INVALID_HANDLE_VALUE)
  {
  }

  explicit CAutoHandle(HANDLE hHandle) : m_hHandle(hHandle)
  {
  }

  ~CAutoHandle()
  {
    if (m_hHandle != INVALID_HANDLE_VALUE)
    {
      CloseHandle(m_hHandle);
      m_hHandle = INVALID_HANDLE_VALUE;
    }
  }

//Methods
  operator HANDLE() 
  {
    return m_hHandle;
  }

//Member variables
  HANDLE m_hHandle;
};

#endif //__AUTOHANDLE_H__
