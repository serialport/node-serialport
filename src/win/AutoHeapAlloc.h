/*
Module : AutoHeapAlloc.h
Purpose: Defines the interface for a class which supports auto closing of a heap pointer allocated via HeapAlloc
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

#ifndef __AUTOHEAPALLOC_H__
#define __AUTOHEAPALLOC_H__


///////////////////////// Includes ////////////////////////////////////////////                      

#include <assert.h>


///////////////////////// Classes /////////////////////////////////////////////

class CAutoHeapAlloc
{
public:
//Constructors / Destructors
  CAutoHeapAlloc(HANDLE hHeap = GetProcessHeap(), DWORD dwHeapFreeFlags = 0) : m_pData(NULL),
                                                                               m_hHeap(hHeap),
                                                                               m_dwHeapFreeFlags(dwHeapFreeFlags)
  {
  }

  BOOL Allocate(SIZE_T dwBytes, DWORD dwFlags = 0)
  {
    //Validate our parameters
    assert(m_pData == NULL);

    m_pData = HeapAlloc(m_hHeap, dwFlags, dwBytes);
    return (m_pData != NULL);
  }

  ~CAutoHeapAlloc()
  {
    if (m_pData != NULL)
    {
      HeapFree(m_hHeap, m_dwHeapFreeFlags, m_pData);
      m_pData = NULL;
    }
  }

//Methods

//Member variables
  LPVOID m_pData;
  HANDLE m_hHeap;
  DWORD  m_dwHeapFreeFlags;
};

#endif //__AUTOHEAPALLOC_H__
