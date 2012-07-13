/* This file is the compacted single file version of the DispHelper COM helper library.
 * DispHelper allows you to call COM objects with an extremely simple printf style syntax.
 * DispHelper can be used from C++ or even plain C. It works with most Windows compilers
 * including Dev-CPP, Visual C++ and LCC-WIN32. Including DispHelper in your project
 * couldn't be simpler as it is available in a compacted single file version (this file).
 *
 * Included with DispHelper are over 20 samples that demonstrate using COM objects
 * including ADO, CDO, Outlook, Eudora, Excel, Word, Internet Explorer, MSHTML,
 * PocketSoap, Word Perfect, MS Agent, SAPI, MSXML, WIA, dexplorer and WMI.
 *
 * DispHelper is free open source software provided under the BSD license.
 *
 * Find out more, browse the readable version of the source code
 * and download DispHelper at:
 * http://sourceforge.net/projects/disphelper/
 * http://disphelper.sourceforge.net/
 */


/* To use DispHelper in your project, include this file(disphelper.c) and the
 * header (disphelper.h). For Visual C++, Borland C++ and LCC-Win32 import
 * libraries are included via pragma directives. For other compilers you may
 * need to add ole32, oleaut32 and uuid. To do this in Dev-CPP add
 * "-lole32 -loleaut32 -luuid" to the linker box under Project->Project Options->Parameters.
 */


/* If you are using Dev-CPP and get errors when compiling this file:
 * Make sure this file is set to compile as C and not C++ under
 * Project->Project Options->Files.
 */


#define DISPHELPER_INTERNAL_BUILD
#include "disphelper.h"
#include <math.h>
#include <assert.h>

/* ----- convert.h ----- */

HRESULT ConvertFileTimeToVariantTime(FILETIME * pft, DATE * pDate);
HRESULT ConvertVariantTimeToFileTime(DATE date, FILETIME * pft);

HRESULT ConvertVariantTimeToSystemTime(DATE date, SYSTEMTIME * pSystemTime);
HRESULT ConvertSystemTimeToVariantTime(SYSTEMTIME * pSystemTime, DATE * pDate);

HRESULT ConvertTimeTToVariantTime(time_t timeT, DATE * pDate);
HRESULT ConvertVariantTimeToTimeT(DATE date, time_t * pTimeT);

HRESULT ConvertAnsiStrToBStr(LPCSTR szAnsiIn, BSTR * lpBstrOut);
HRESULT ConvertBStrToAnsiStr(BSTR bstrIn, LPSTR * lpszOut);

/* ----- dh_create.c ----- */

HRESULT dhCreateObjectEx(LPCOLESTR szProgId, REFIID riid, DWORD dwClsContext,
			    COSERVERINFO * pServerInfo, void ** ppv)
{
	CLSID clsid;
	HRESULT hr;
	IClassFactory * pCf = NULL;

	DH_ENTER(L"CreateObjectEx");

	if (!szProgId || !riid || !ppv) return DH_EXIT(E_INVALIDARG, szProgId);

	if (L'{' == szProgId[0])
		hr = CLSIDFromString((LPOLESTR) szProgId, &clsid);
	else
		hr = CLSIDFromProgID(szProgId, &clsid);

	if (SUCCEEDED(hr)) hr = CoGetClassObject(&clsid, dwClsContext, pServerInfo, &IID_IClassFactory, (void **) &pCf);
	if (SUCCEEDED(hr)) hr = pCf->lpVtbl->CreateInstance(pCf, NULL, riid, ppv);

	if (pCf) pCf->lpVtbl->Release(pCf);

	return DH_EXIT(hr, szProgId);
}

HRESULT dhGetObjectEx(LPCOLESTR szPathName, LPCOLESTR szProgId, REFIID riid,
		         DWORD dwClsContext, LPVOID lpvReserved, void ** ppv)
{
	HRESULT hr;

	DH_ENTER(L"GetObjectEx");

	if ((!szProgId && !szPathName) || !riid || !ppv || lpvReserved) return DH_EXIT(E_INVALIDARG, szProgId);

	if (szPathName)
	{

		if (!szProgId)
		{
			hr = CoGetObject(szPathName, NULL, riid, ppv);
		}
		else
		{
			IPersistFile * ppf = NULL;

			hr = dhCreateObjectEx(szProgId, &IID_IPersistFile, dwClsContext, NULL, (void **) &ppf);

			if (SUCCEEDED(hr)) hr = ppf->lpVtbl->Load(ppf, szPathName, 0);
			if (SUCCEEDED(hr)) hr = ppf->lpVtbl->QueryInterface(ppf, riid, ppv);

			if (ppf) ppf->lpVtbl->Release(ppf);
		}
	}
	else
	{

		CLSID clsid;
		IUnknown * pUnk = NULL;

		if (L'{' == szProgId[0])
			hr = CLSIDFromString((LPOLESTR) szProgId, &clsid);
		else
			hr = CLSIDFromProgID(szProgId, &clsid);

		if (SUCCEEDED(hr)) hr = GetActiveObject(&clsid, NULL, &pUnk);
		if (SUCCEEDED(hr)) hr = pUnk->lpVtbl->QueryInterface(pUnk, riid, ppv);

		if (pUnk) pUnk->lpVtbl->Release(pUnk);
	}

	return DH_EXIT(hr, szProgId);
}

HRESULT dhCreateObject(LPCOLESTR szProgId, LPCWSTR szMachine, IDispatch ** ppDisp)
{
	COSERVERINFO si = { 0 };

	DH_ENTER(L"CreateObject");

	si.pwszName = (LPWSTR) szMachine;

	return DH_EXIT(dhCreateObjectEx(szProgId, &IID_IDispatch,
			  szMachine ? CLSCTX_REMOTE_SERVER : CLSCTX_LOCAL_SERVER|CLSCTX_INPROC_SERVER,
			  szMachine ? &si : NULL, (void **) ppDisp), szProgId);
}

HRESULT dhGetObject(LPCOLESTR szPathName, LPCOLESTR szProgId, IDispatch ** ppDisp)
{
	DH_ENTER(L"GetObject");

	return DH_EXIT(dhGetObjectEx(szPathName, szProgId, &IID_IDispatch,
			  CLSCTX_LOCAL_SERVER|CLSCTX_INPROC_SERVER, NULL, (void **) ppDisp), szProgId);
}

HRESULT dhCallMethod(IDispatch * pDisp, LPCOLESTR szMember, ... )
{
	HRESULT hr;
	va_list marker;

	DH_ENTER(L"CallMethod");

	va_start(marker, szMember);

	hr = dhCallMethodV(pDisp, szMember, &marker);

	va_end(marker);

	return DH_EXIT(hr, szMember);
}

HRESULT dhPutValue(IDispatch * pDisp, LPCOLESTR szMember, ...)
{
	HRESULT hr;
	va_list marker;

	DH_ENTER(L"PutValue");

	va_start(marker, szMember);

	hr = dhPutValueV(pDisp, szMember, &marker);

	va_end(marker);

	return DH_EXIT(hr, szMember);
}

HRESULT dhPutRef(IDispatch * pDisp, LPCOLESTR szMember, ...)
{
	HRESULT hr;
	va_list marker;

	DH_ENTER(L"PutRef");

	va_start(marker, szMember);

	hr = dhPutRefV(pDisp, szMember, &marker);

	va_end(marker);

	return DH_EXIT(hr, szMember);
}

HRESULT dhGetValue(LPCWSTR szIdentifier, void * pResult, IDispatch * pDisp, LPCOLESTR szMember, ...)
{
	HRESULT hr;
	va_list marker;

	DH_ENTER(L"GetValue");

	va_start(marker, szMember);

	hr = dhGetValueV(szIdentifier, pResult, pDisp, szMember, &marker);

	va_end(marker);

	return DH_EXIT(hr, szMember);
}

HRESULT dhInvoke(int invokeType, VARTYPE returnType, VARIANT * pvResult, IDispatch * pDisp, LPCOLESTR szMember, ...)
{
	HRESULT hr;
	va_list marker;

	DH_ENTER(L"Invoke");

	va_start(marker, szMember);

	hr = dhInvokeV(invokeType, returnType, pvResult, pDisp, szMember, &marker);

	va_end(marker);

	return DH_EXIT(hr, szMember);
}

/* ----- dh_core.c ----- */

BOOL dh_g_bIsUnicodeMode;

HRESULT dhInvokeArray(int invokeType, VARIANT * pvResult, UINT cArgs,
                         IDispatch * pDisp, LPCOLESTR szMember, VARIANT * pArgs)
{
	DISPPARAMS dp       = { 0 };
	EXCEPINFO excep     = { 0 };
	DISPID dispidNamed  = DISPID_PROPERTYPUT;
	DISPID dispID;
	UINT uiArgErr;
	HRESULT hr;

	DH_ENTER(L"InvokeArray");

	if(!pDisp || !szMember || (cArgs != 0 && !pArgs)) return DH_EXIT(E_INVALIDARG, szMember);

	hr = pDisp->lpVtbl->GetIDsOfNames(pDisp, &IID_NULL, (LPOLESTR *) &szMember, 1, LOCALE_USER_DEFAULT, &dispID);

	if(FAILED(hr)) return DH_EXITEX(hr, TRUE, szMember, szMember, NULL, 0);

	if (pvResult != NULL) VariantInit(pvResult);

	dp.cArgs  = cArgs;
	dp.rgvarg = pArgs;

	if(invokeType & (DISPATCH_PROPERTYPUT | DISPATCH_PROPERTYPUTREF))
	{
		dp.cNamedArgs = 1;
		dp.rgdispidNamedArgs = &dispidNamed;
	}

	hr = pDisp->lpVtbl->Invoke(pDisp, dispID, &IID_NULL, LOCALE_USER_DEFAULT, (WORD) invokeType, &dp, pvResult, &excep, &uiArgErr);

	return DH_EXITEX(hr, TRUE, szMember, szMember, &excep, uiArgErr);
}

HRESULT dhCallMethodV(IDispatch * pDisp, LPCOLESTR szMember, va_list * marker)
{
	DH_ENTER(L"CallMethodV");

	return DH_EXIT(dhInvokeV(DISPATCH_METHOD, VT_EMPTY, NULL, pDisp, szMember, marker), szMember);
}

HRESULT dhPutValueV(IDispatch * pDisp, LPCOLESTR szMember, va_list * marker)
{
	DH_ENTER(L"PutValueV");

	return DH_EXIT(dhInvokeV(DISPATCH_PROPERTYPUT, VT_EMPTY, NULL, pDisp, szMember, marker), szMember);
}

HRESULT dhPutRefV(IDispatch * pDisp, LPCOLESTR szMember, va_list * marker)
{
	DH_ENTER(L"PutRefV");

	return DH_EXIT(dhInvokeV(DISPATCH_PROPERTYPUTREF, VT_EMPTY, NULL, pDisp, szMember, marker), szMember);
}

HRESULT dhGetValueV(LPCWSTR szIdentifier, void * pResult, IDispatch * pDisp, LPCOLESTR szMember, va_list * marker)
{
	VARIANT vtResult;
	VARTYPE returnType;
	HRESULT hr;

	DH_ENTER(L"GetValueV");

	if (!pResult || !szIdentifier) return DH_EXIT(E_INVALIDARG, szMember);

	if (*szIdentifier == L'%') szIdentifier++;

	switch(*szIdentifier)
	{
		case L'd': returnType = VT_I4;       break;
		case L'u': returnType = VT_UI4;      break;
		case L'e': returnType = VT_R8;       break;
		case L'b': returnType = VT_BOOL;     break;
		case L'v': returnType = VT_EMPTY;    break;
		case L'B': returnType = VT_BSTR;     break;
		case L'S': returnType = VT_BSTR;     break;
		case L's': returnType = VT_BSTR;     break;
		case L'T': returnType = VT_BSTR;     break;
		case L'o': returnType = VT_DISPATCH; break;
		case L'O': returnType = VT_UNKNOWN;  break;
		case L't': returnType = VT_DATE;     break;
		case L'W': returnType = VT_DATE;     break;
		case L'f': returnType = VT_DATE;     break;
		case L'D': returnType = VT_DATE;     break;
#ifndef _WIN64
		case L'p': returnType = VT_I4;       break;
#else
		case L'p': returnType = VT_I8;       break;
#endif
		default:
			DEBUG_NOTIFY_INVALID_IDENTIFIER(*szIdentifier);
			return DH_EXIT(E_INVALIDARG, szMember);
	}

	hr = dhInvokeV(DISPATCH_PROPERTYGET|DISPATCH_METHOD, returnType, &vtResult, pDisp, szMember, marker);
	if (FAILED(hr)) return DH_EXIT(hr, szMember);

	switch(*szIdentifier)
	{
		case L'd':
			*((LONG *) pResult) = V_I4(&vtResult);
			break;

		case L'u':
			*((ULONG *) pResult) = V_UI4(&vtResult);
			break;

		case L'e':
			*((DOUBLE *) pResult) = V_R8(&vtResult);
			break;

		case L'b':
			*((BOOL *) pResult) = V_BOOL(&vtResult);
			break;

		case L'v':
			*((VARIANT *) pResult) = vtResult;
			break;

		case L'B':
			*((BSTR *) pResult) = V_BSTR(&vtResult);
			break;

		case L'S':
			*((LPWSTR *) pResult) = V_BSTR(&vtResult);
			break;

		case L's':
			hr = ConvertBStrToAnsiStr(V_BSTR(&vtResult), (LPSTR *) pResult);
			SysFreeString(V_BSTR(&vtResult));
			break;

		case L'T':
			if (dh_g_bIsUnicodeMode)
			{
				*((LPWSTR *) pResult) = V_BSTR(&vtResult);
			}
			else
			{
				hr = ConvertBStrToAnsiStr(V_BSTR(&vtResult), (LPSTR *) pResult);
				SysFreeString(V_BSTR(&vtResult));
			}
			break;

		case L'o':
			*((IDispatch **) pResult) = V_DISPATCH(&vtResult);
			if (V_DISPATCH(&vtResult) == NULL) hr = E_NOINTERFACE;
			break;

		case L'O':
			*((IUnknown **) pResult) = V_UNKNOWN(&vtResult);
			if (V_UNKNOWN(&vtResult) == NULL) hr = E_NOINTERFACE;
			break;

		case L't':
			hr = ConvertVariantTimeToTimeT(V_DATE(&vtResult), (time_t *) pResult);
			break;

		case L'W':
			hr = ConvertVariantTimeToSystemTime(V_DATE(&vtResult), (SYSTEMTIME *) pResult);
			break;

		case L'f':
			hr = ConvertVariantTimeToFileTime(V_DATE(&vtResult), (FILETIME *) pResult);
			break;

		case L'D':
			*((DATE *) pResult) = V_DATE(&vtResult);
			break;

		case L'p':
#ifndef _WIN64
			*((LPVOID *) pResult) = (LPVOID) V_I4(&vtResult);
#else
			*((LPVOID *) pResult) = (LPVOID) V_I8(&vtResult);
#endif
			break;
	}

	return DH_EXIT(hr, szMember);
}

/* ----- dh_invoke.c ----- */

static HRESULT TraverseSubObjects(IDispatch ** ppDisp, LPWSTR * lpszMember, va_list * marker);
static HRESULT CreateArgumentArray(LPWSTR szTemp, VARIANT * pArgs, BOOL * pbFreeList, UINT * pcArgs, va_list * marker);
static HRESULT InternalInvokeV(int invokeType, VARTYPE returnType, VARIANT * pvResult, IDispatch * pDisp, LPOLESTR szMember, va_list * marker);
static HRESULT ExtractArgument(VARIANT * pvArg, WCHAR chIdentifier, BOOL * pbFreeArg, va_list * marker);

HRESULT dhInvokeV(int invokeType, VARTYPE returnType, VARIANT * pvResult,
                     IDispatch * pDisp, LPCOLESTR szMember, va_list * marker)
{
	WCHAR szCopy[DH_MAX_MEMBER];
	LPWSTR szTemp                  = szCopy;
	SIZE_T cchDest                 = ARRAYSIZE(szCopy);
	HRESULT hr;

	DH_ENTER(L"InvokeV");

	if (!pDisp || !szMember || !marker) return DH_EXIT(E_INVALIDARG, szMember);

	do
	{
		if (cchDest-- == 0) return DH_EXIT(E_INVALIDARG, szMember);
	}
	while( (*szTemp++ = *szMember++) );

	szTemp = szCopy;

	hr = TraverseSubObjects(&pDisp, &szTemp, marker);

	if (SUCCEEDED(hr))
	{
		hr = InternalInvokeV(invokeType, returnType, pvResult, pDisp, szTemp, marker);

		pDisp->lpVtbl->Release(pDisp);
	}

	return DH_EXIT(hr, szMember);
}

static HRESULT TraverseSubObjects(IDispatch ** ppDisp, LPWSTR * lpszMember, va_list * marker)
{
	LPWSTR szSeperator, szTemp;
	VARIANT vtObject;
	HRESULT hr;

	DH_ENTER(L"TraverseSubObjects");

	if (**lpszMember == L'.') (*lpszMember)++;

	(*ppDisp)->lpVtbl->AddRef(*ppDisp);

	szSeperator = wcschr(*lpszMember, L'.');

	if (szSeperator == NULL) return DH_EXIT(NOERROR, *lpszMember);

	szTemp = *lpszMember;

	do
	{
		*szSeperator = L'\0';

		hr = InternalInvokeV(DISPATCH_METHOD|DISPATCH_PROPERTYGET, VT_DISPATCH,
		                     &vtObject, *ppDisp, szTemp, marker);

		if (!vtObject.pdispVal && SUCCEEDED(hr)) hr = E_NOINTERFACE;

		(*ppDisp)->lpVtbl->Release(*ppDisp);

		if (FAILED(hr)) break;

		*ppDisp = vtObject.pdispVal;

		szTemp = szSeperator + 1;

	}
	while ( (szSeperator = wcschr(szTemp, L'.') ) != NULL);

	*lpszMember = szTemp;

	return DH_EXIT(hr, *lpszMember);
}

static HRESULT InternalInvokeV(int invokeType, VARTYPE returnType, VARIANT * pvResult,
                               IDispatch * pDisp, LPOLESTR szMember, va_list * marker)
{
	VARIANT vtArgs[DH_MAX_ARGS];
	BOOL bFreeList[DH_MAX_ARGS];
	HRESULT hr;
	UINT cArgs, iArg;

	DH_ENTER(L"InternalInvokeV");

	hr = CreateArgumentArray(szMember, vtArgs, bFreeList, &cArgs, marker);

	if (SUCCEEDED(hr))
	{
		hr = dhInvokeArray(invokeType, pvResult, cArgs, pDisp, szMember, &vtArgs[DH_MAX_ARGS - cArgs]);

		for (iArg = DH_MAX_ARGS - cArgs;iArg < DH_MAX_ARGS;iArg++)
		{
			if (bFreeList[iArg]) VariantClear(&vtArgs[iArg]);
		}

		if (SUCCEEDED(hr) && pvResult != NULL &&
	            pvResult->vt != returnType && returnType != VT_EMPTY)
		{
			hr = VariantChangeType(pvResult, pvResult, 16 , returnType);
			if (FAILED(hr)) VariantClear(pvResult);
		}
	}

	return DH_EXIT(hr, szMember);
}

static HRESULT CreateArgumentArray(LPWSTR szMember, VARIANT * pArgs, BOOL * pbFreeList,
				   UINT * pcArgs, va_list * marker)
{
	HRESULT hr        = NOERROR;
	INT iArg          = DH_MAX_ARGS;
	BOOL bInArguments = FALSE;

	DH_ENTER(L"CreateArgumentArray");

	while (*szMember)
	{
		if (!bInArguments &&
                   (*szMember == L'(' || *szMember == L' ' || *szMember == L'=') )
		{
			bInArguments = TRUE;

			*szMember = L'\0';
		}
		else if  (*szMember == L'%')
		{
			if (!bInArguments)
			{
				bInArguments = TRUE;
				*szMember = L'\0';
			}

			iArg--;

			if (iArg == -1) { hr = E_INVALIDARG; break; }

			szMember++;

			hr = ExtractArgument(&pArgs[iArg], *szMember, &pbFreeList[iArg], marker);

			if (FAILED(hr)) break;
		}

		szMember++;
	}

	*pcArgs = DH_MAX_ARGS - iArg;

	if (FAILED(hr))
	{
		for (++iArg;iArg < DH_MAX_ARGS; iArg++)
		{
			if (pbFreeList[iArg]) VariantClear(&pArgs[iArg]);
		}
	}

	return DH_EXIT(hr, szMember);
}

static HRESULT ExtractArgument(VARIANT * pvArg, WCHAR chIdentifier, BOOL * pbFreeArg, va_list * marker)
{
	HRESULT hr = NOERROR;

	*pbFreeArg = FALSE;

	if (chIdentifier == L'T') chIdentifier = (dh_g_bIsUnicodeMode ? L'S' : L's');

	switch (chIdentifier)
	{
		case L'd':
			V_VT(pvArg)  = VT_I4;
			V_I4(pvArg)  = va_arg(*marker, LONG);
			break;

		case L'u':
			V_VT(pvArg)  = VT_UI4;
			V_UI4(pvArg) = va_arg(*marker, ULONG);
			break;

		case L'e':
			V_VT(pvArg)  = VT_R8;
			V_R8(pvArg)  = va_arg(*marker, DOUBLE);
			break;

		case L'b':
			V_VT(pvArg)   = VT_BOOL;
			V_BOOL(pvArg) = ( va_arg(*marker, BOOL) ? VARIANT_TRUE : VARIANT_FALSE );
			break;

		case L'v':
			*pvArg  = *va_arg(*marker, VARIANT *);
			break;

		case L'm':
			V_VT(pvArg)    = VT_ERROR;
			V_ERROR(pvArg) = DISP_E_PARAMNOTFOUND;
			break;

		case L'B':
			V_VT(pvArg)   = VT_BSTR;
			V_BSTR(pvArg) = va_arg(*marker, BSTR);
			break;

		case L'S':
		{
			LPOLESTR szTemp = va_arg(*marker, LPOLESTR);

			V_VT(pvArg)   = VT_BSTR;
			V_BSTR(pvArg) = SysAllocString(szTemp);

			if (V_BSTR(pvArg) == NULL && szTemp != NULL) hr = E_OUTOFMEMORY;

			*pbFreeArg = TRUE;
			break;
		}

		case L's':
			V_VT(pvArg) = VT_BSTR;
			hr = ConvertAnsiStrToBStr(va_arg(*marker, LPSTR), &V_BSTR(pvArg));
			*pbFreeArg = TRUE;
			break;

		case L'o':
			V_VT(pvArg)       = VT_DISPATCH;
			V_DISPATCH(pvArg) = va_arg(*marker, IDispatch *);
			break;

		case L'O':
			V_VT(pvArg)      = VT_UNKNOWN;
			V_UNKNOWN(pvArg) = va_arg(*marker, IUnknown *);
			break;

		case L'D':
			V_VT(pvArg)   = VT_DATE;
			V_DATE(pvArg) = va_arg(*marker, DATE);
			break;

		case L't':
			V_VT(pvArg) = VT_DATE;
			hr = ConvertTimeTToVariantTime(va_arg(*marker, time_t), &V_DATE(pvArg));
			break;

		case L'W':
			V_VT(pvArg) = VT_DATE;
			hr = ConvertSystemTimeToVariantTime(va_arg(*marker, SYSTEMTIME *), &V_DATE(pvArg));
			break;

		case L'f':
			V_VT(pvArg) = VT_DATE;
			hr = ConvertFileTimeToVariantTime(va_arg(*marker, FILETIME *), &V_DATE(pvArg));
			break;

		case L'p':
#ifndef _WIN64
			V_VT(pvArg) = VT_I4;
			V_I4(pvArg) = (LONG) va_arg(*marker, LPVOID);
#else
			V_VT(pvArg) = VT_I8;
			V_I8(pvArg) = (LONGLONG) va_arg(*marker, LPVOID);
#endif
			break;

		default:
			hr = E_INVALIDARG;
			DEBUG_NOTIFY_INVALID_IDENTIFIER(chIdentifier);
			break;
	}

	return hr;
}

/* ----- dh_enum.c ----- */

HRESULT dhEnumBeginV(IEnumVARIANT ** ppEnum, IDispatch * pDisp, LPCOLESTR szMember, va_list * marker)
{
	DISPPARAMS dp    = { 0 };
	EXCEPINFO excep  = { 0 };
	VARIANT vtResult;
	IDispatch * pDispObj;
	HRESULT hr;

	DH_ENTER(L"EnumBeginV");

	if (!ppEnum || !pDisp) return DH_EXIT(E_INVALIDARG, szMember);

	if (szMember != NULL)
	{
		hr = dhGetValueV(L"%o", &pDispObj, pDisp, szMember, marker);
		if (FAILED(hr)) return DH_EXIT(hr, szMember);
	}
	else
	{
		pDispObj = pDisp;
	}

	hr = pDispObj->lpVtbl->Invoke(pDispObj, DISPID_NEWENUM, &IID_NULL, LOCALE_USER_DEFAULT,
				 DISPATCH_METHOD | DISPATCH_PROPERTYGET, &dp, &vtResult, &excep, NULL);

	if (szMember != NULL) pDispObj->lpVtbl->Release(pDispObj);

	if (FAILED(hr)) return DH_EXITEX(hr, TRUE, L"_NewEnum", szMember, &excep, 0);

	if (vtResult.vt == VT_DISPATCH)
		hr = vtResult.pdispVal->lpVtbl->QueryInterface(vtResult.pdispVal, &IID_IEnumVARIANT, (void **) ppEnum);
	else if (vtResult.vt == VT_UNKNOWN)
		hr = vtResult.punkVal->lpVtbl->QueryInterface(vtResult.punkVal, &IID_IEnumVARIANT, (void **) ppEnum);
	else
		hr = E_NOINTERFACE;

	VariantClear(&vtResult);

	return DH_EXIT(hr, szMember);
}

HRESULT dhEnumNextVariant(IEnumVARIANT * pEnum, VARIANT * pvResult)
{
	DH_ENTER(L"EnumNextVariant");

	if (!pEnum || !pvResult) return DH_EXIT(E_INVALIDARG, L"Enumerator");

	return DH_EXIT(pEnum->lpVtbl->Next(pEnum, 1, pvResult, NULL), L"Enumerator");
}

HRESULT dhEnumNextObject(IEnumVARIANT * pEnum, IDispatch ** ppDisp)
{
	VARIANT vtResult;
	HRESULT hr;

	DH_ENTER(L"EnumNextObject");

	if (!pEnum || !ppDisp) return DH_EXIT(E_INVALIDARG, L"Enumerator");

	hr = pEnum->lpVtbl->Next(pEnum, 1, &vtResult, NULL);

	if (hr == S_OK)
	{
		if (vtResult.vt == VT_DISPATCH)
		{
			*ppDisp = vtResult.pdispVal;
		}
		else
		{
			hr = VariantChangeType(&vtResult, &vtResult, 0, VT_DISPATCH);
			if (SUCCEEDED(hr)) *ppDisp = vtResult.pdispVal;
			else VariantClear(&vtResult);
		}
	}

	return DH_EXIT(hr, L"Enumerator");
}

HRESULT dhEnumBegin(IEnumVARIANT ** ppEnum, IDispatch * pDisp, LPCOLESTR szMember, ...)
{
	HRESULT hr;
	va_list marker;

	DH_ENTER(L"EnumBegin");

	va_start(marker, szMember);

	hr = dhEnumBeginV(ppEnum, pDisp, szMember, &marker);

	va_end(marker);

	return DH_EXIT(hr, szMember);
}

/* ----- convert.c ----- */

static const LONGLONG FILE_TIME_ONE_DAY           = 864000000000;

static const LONGLONG FILE_TIME_VARIANT_DAY0      = 94353120000000000;

static const ULONGLONG FILE_TIME_VARIANT_OVERFLOW  = 2650467744000000000;

static const DATE      VARIANT_FILE_TIME_DAY0      = -109205;

static const DATE      VARIANT_TIMET_DAY0          = 25569;

static const LONG      TIMET_ONE_DAY               = 86400;

#ifndef _WIN64
static const DATE      VARIANT_TIMET_MAX           = 50424.13480;
#else
static const time_t    TIMET_VARIANT_OVERFLOW      = 253402300800;
#endif

HRESULT ConvertFileTimeToVariantTime(FILETIME * pft, DATE * pDate)
{
	ULONGLONG ftScalar;

	if (!pft || !pDate) return E_INVALIDARG;

	ftScalar = *((ULONGLONG *) pft) + 500;

	if (ftScalar >= FILE_TIME_VARIANT_OVERFLOW) return E_INVALIDARG;
	*pDate = (LONGLONG) (ftScalar - FILE_TIME_VARIANT_DAY0) / (double) FILE_TIME_ONE_DAY;
	if (*pDate < 0) *pDate = floor(*pDate) + (floor(*pDate) - *pDate);

	return NOERROR;
}

HRESULT ConvertVariantTimeToFileTime(DATE date, FILETIME * pft)
{
	ULONGLONG ftScalar;

	if (!pft) return E_INVALIDARG;

	if (date < 0) date = ceil(date) + (ceil(date) - date);

	if (date < VARIANT_FILE_TIME_DAY0) return E_INVALIDARG;
	ftScalar = (ULONGLONG) ((date * FILE_TIME_ONE_DAY) + FILE_TIME_VARIANT_DAY0);

	*pft = *((FILETIME *) &ftScalar);

	return NOERROR;
}

HRESULT ConvertVariantTimeToSystemTime(DATE date, SYSTEMTIME * pSystemTime)
{
	HRESULT hr;
	FILETIME fileTime;

	if (!pSystemTime) return E_INVALIDARG;
	if (FAILED(hr = ConvertVariantTimeToFileTime(date, &fileTime))) return hr;
	return (FileTimeToSystemTime(&fileTime, pSystemTime) ? NOERROR : HRESULT_FROM_WIN32( GetLastError() ));
}

HRESULT ConvertSystemTimeToVariantTime(SYSTEMTIME * pSystemTime, DATE * pDate)
{
	FILETIME fileTime;

	if (!pSystemTime || !pDate) return E_INVALIDARG;
	if (!SystemTimeToFileTime(pSystemTime, &fileTime)) return HRESULT_FROM_WIN32( GetLastError() );
	return ConvertFileTimeToVariantTime(&fileTime, pDate);
}

HRESULT ConvertVariantTimeToTimeT(DATE date, time_t * pTimeT)
{
	struct tm * ptm;

	if (!pTimeT) return E_INVALIDARG;

#ifndef _WIN64
	if (date < VARIANT_TIMET_DAY0 || date > VARIANT_TIMET_MAX) return E_INVALIDARG;
#else
	if (date < VARIANT_TIMET_DAY0) return E_INVALIDARG;
#endif

	*pTimeT = (time_t) (((date - VARIANT_TIMET_DAY0) * TIMET_ONE_DAY) + 0.5);

	if ( (ptm = gmtime(pTimeT)) == NULL || !(ptm->tm_isdst = -1) ||
	     (*pTimeT = mktime(ptm)) == (time_t) -1 ) return E_FAIL;

	return NOERROR;
}

HRESULT ConvertTimeTToVariantTime(time_t timeT, DATE * pDate)
{
	struct tm localtm, utctm, * ptm;
	time_t timeTLocal, timeTUtc;

	if (!pDate) return E_INVALIDARG;

	if ( (ptm = localtime(&timeT)) == NULL) return E_FAIL;
	localtm = *ptm;

	if ( (ptm = gmtime(&timeT)) == NULL) return E_FAIL;
	utctm = *ptm;

	localtm.tm_isdst = 0;
	utctm.tm_isdst   = 0;

	if ( (timeTLocal = mktime(&localtm)) == (time_t) -1 ||
	     (timeTUtc   = mktime(&utctm))   == (time_t) -1) return E_FAIL;

	timeT += timeTLocal - timeTUtc;

#ifdef _WIN64
	if (timeT >= TIMET_VARIANT_OVERFLOW) return E_INVALIDARG;
#endif
	*pDate = (DATE)  (timeT / (double) TIMET_ONE_DAY) + VARIANT_TIMET_DAY0;

	return NOERROR;
}

HRESULT ConvertAnsiStrToBStr(LPCSTR szAnsiIn, BSTR * lpBstrOut)
{
	DWORD dwSize;

	if (lpBstrOut == NULL) return E_INVALIDARG;
	if (szAnsiIn == NULL) { *lpBstrOut = NULL; return NOERROR; }

	dwSize = MultiByteToWideChar(CP_ACP, 0, szAnsiIn, -1, NULL, 0);
	if (dwSize == 0) return HRESULT_FROM_WIN32( GetLastError() );

	*lpBstrOut = SysAllocStringLen(NULL, dwSize - 1);
	if (*lpBstrOut == NULL) return E_OUTOFMEMORY;

	if ( !MultiByteToWideChar(CP_ACP, 0, szAnsiIn, -1, *lpBstrOut, dwSize) )
	{
		SysFreeString(*lpBstrOut);
		return HRESULT_FROM_WIN32( GetLastError() );
	}

	return NOERROR;
}

HRESULT ConvertBStrToAnsiStr(BSTR bstrIn, LPSTR * lpszOut)
{
	DWORD dwSize;

	if (lpszOut == NULL) return E_INVALIDARG;
	if (bstrIn == NULL) { *lpszOut = NULL; return NOERROR; }

	dwSize = WideCharToMultiByte(CP_ACP, 0, bstrIn, -1, NULL, 0, NULL, NULL);
	if (dwSize == 0) return HRESULT_FROM_WIN32( GetLastError() );

	*lpszOut = (LPSTR) SysAllocStringByteLen(NULL, dwSize - 1);
	if (*lpszOut == NULL) return E_OUTOFMEMORY;

	if ( !WideCharToMultiByte(CP_ACP, 0, bstrIn, -1, *lpszOut, dwSize, NULL, NULL) )
	{
		SysFreeString((BSTR) *lpszOut);
		return HRESULT_FROM_WIN32( GetLastError() );
	}

	return NOERROR;
}

/* ----- dh_exceptions.c ----- */

#ifndef DISPHELPER_NO_EXCEPTIONS

static DH_EXCEPTION_OPTIONS g_ExceptionOptions;

static LONG  f_lngTlsInitBegin = -1, f_lngTlsInitEnd = -1;
static DWORD f_TlsIdxStackCount, f_TlsIdxException;

#define SetStackCount(nStackCount)   TlsSetValue(f_TlsIdxStackCount, (LPVOID) (nStackCount))
#define SetExceptionPtr(pException)  TlsSetValue(f_TlsIdxException, pException);
#define GetStackCount()       (UINT) TlsGetValue(f_TlsIdxStackCount)
#define GetExceptionPtr()            TlsGetValue(f_TlsIdxException)
#define CheckTlsInitialized()        if (f_lngTlsInitEnd != 0) InitializeTlsIndexes();

static void hlprStringCchCopyW(LPWSTR pszDest, SIZE_T cchDest, LPCWSTR pszSrc)
{
	assert(cchDest > 0);

	do
	{
		if (--cchDest == 0) break;
	}
	while ((*pszDest++ = *pszSrc++));

	*pszDest = L'\0';
}

static void InitializeTlsIndexes(void)
{
	if (0 == InterlockedIncrement(&f_lngTlsInitBegin))
	{
		f_TlsIdxStackCount = TlsAlloc();
		f_TlsIdxException  = TlsAlloc();
		f_lngTlsInitEnd    = 0;
	}
	else
	{
		while (f_lngTlsInitEnd != 0) Sleep(5);
	}
}

void dhEnter(void)
{
	CheckTlsInitialized();
	SetStackCount(GetStackCount() + 1);
}

HRESULT dhExitEx(HRESULT hr, BOOL bDispatchError, LPCWSTR szMember, LPCWSTR szCompleteMember,
                 EXCEPINFO * pExcepInfo, UINT iArgError, LPCWSTR szFunctionName)
{
	UINT nStackCount = GetStackCount();

	SetStackCount(nStackCount - 1);

	if (FAILED(hr) && !g_ExceptionOptions.bDisableRecordExceptions)
	{
		PDH_EXCEPTION pException = GetExceptionPtr();

		if (!pException)
		{
			pException = HeapAlloc(GetProcessHeap(), HEAP_ZERO_MEMORY, sizeof(DH_EXCEPTION));
			if (!pException) return hr;
			SetExceptionPtr(pException);
		}
		else if (pException->bOld)
		{
			SysFreeString(pException->szDescription);
			SysFreeString(pException->szSource);
			SysFreeString(pException->szHelpFile);
			ZeroMemory(pException, sizeof(DH_EXCEPTION));
		}

		if (pException->hr == 0)
		{
			pException->hr              = hr;
			pException->iArgError       = iArgError;
			pException->szErrorFunction = szFunctionName;
			pException->bDispatchError  = bDispatchError;

			if (szMember) hlprStringCchCopyW(pException->szMember, ARRAYSIZE(pException->szMember), szMember);

			if (pExcepInfo && hr == DISP_E_EXCEPTION)
			{
				if (pExcepInfo->pfnDeferredFillIn &&
				    !IsBadCodePtr((FARPROC) pExcepInfo->pfnDeferredFillIn)) pExcepInfo->pfnDeferredFillIn(pExcepInfo);

				pException->szDescription = pExcepInfo->bstrDescription;
				pException->szSource      = pExcepInfo->bstrSource;
				pException->szHelpFile    = pExcepInfo->bstrHelpFile;
				pException->dwHelpContext = pExcepInfo->dwHelpContext;
				pException->swCode        = (pExcepInfo->wCode ? pExcepInfo->wCode : pExcepInfo->scode);
			}
		}

		if (nStackCount == 1)
		{
			pException->bOld              = TRUE;
			pException->szInitialFunction = szFunctionName;

			if (szCompleteMember) hlprStringCchCopyW(pException->szCompleteMember, ARRAYSIZE(pException->szCompleteMember), szCompleteMember);

			if (g_ExceptionOptions.bShowExceptions)
				dhShowException(pException);

			if (g_ExceptionOptions.pfnExceptionCallback)
				g_ExceptionOptions.pfnExceptionCallback(pException);
		}
	}
	else if (hr == DISP_E_EXCEPTION && pExcepInfo)
	{
		SysFreeString(pExcepInfo->bstrDescription);
		SysFreeString(pExcepInfo->bstrSource);
		SysFreeString(pExcepInfo->bstrHelpFile);
	}

	return hr;
}

HRESULT dhShowException(PDH_EXCEPTION pException)
{
	WCHAR szMessage[512];

	dhFormatExceptionW(pException, szMessage, ARRAYSIZE(szMessage), FALSE);

	MessageBoxW(g_ExceptionOptions.hwnd, szMessage, g_ExceptionOptions.szAppName,
	            MB_ICONSTOP | MB_SETFOREGROUND);

	return NOERROR;
}

HRESULT dhFormatExceptionW(PDH_EXCEPTION pException, LPWSTR szBuffer, UINT cchBufferSize, BOOL bFixedFont)
{
	HRESULT hr;
	UINT cch = 0;
#	define DESCRIPTION_LENGTH 255

	if (!szBuffer && cchBufferSize) return E_INVALIDARG;

	if (!pException)
	{
		dhGetLastException(&pException);
		if (!pException)
		{
			if (cchBufferSize != 0)
			{
				_snwprintf(szBuffer, cchBufferSize, L"No error information available.");
				szBuffer[cchBufferSize - 1] = L'\0';
			}

			return NOERROR;
		}
	}

	hr = (pException->hr == DISP_E_EXCEPTION && pException->swCode ?
			pException->swCode : pException->hr);

	if (!pException->szSource)
	{
		if (pException->bDispatchError)
			pException->szSource = SysAllocString(L"IDispatch Interface");
		else
			pException->szSource = SysAllocString(L"Application");
	}

	if (!pException->szDescription)
	{
		pException->szDescription = SysAllocStringLen(NULL, DESCRIPTION_LENGTH);

		if (pException->szDescription)
		{
			switch (hr)
			{
				case E_NOINTERFACE:
					_snwprintf(pException->szDescription, DESCRIPTION_LENGTH, L"Object required");
					break;

				case DISP_E_UNKNOWNNAME:
				case DISP_E_MEMBERNOTFOUND:
					_snwprintf(pException->szDescription, DESCRIPTION_LENGTH, L"Object doesn't support this property or method: '%s'", pException->szMember);
					break;

				case DISP_E_TYPEMISMATCH:
					if (pException->szMember[0])
					{
						_snwprintf(pException->szDescription, DESCRIPTION_LENGTH, L"Type mismatch: '%s'. Argument Index: %d", pException->szMember, pException->iArgError);
						break;
					}

				default:
				{
#ifndef UNICODE
					CHAR szDescription[DESCRIPTION_LENGTH];
#else
					LPWSTR szDescription = pException->szDescription;
#endif
					cch = FormatMessage(FORMAT_MESSAGE_FROM_SYSTEM | FORMAT_MESSAGE_IGNORE_INSERTS,
					             NULL, hr, MAKELANGID(LANG_NEUTRAL, SUBLANG_DEFAULT),
					             szDescription, DESCRIPTION_LENGTH, NULL);

					if (!cch) wcscpy(pException->szDescription, L"Unknown runtime error");
#ifndef UNICODE
					else MultiByteToWideChar(CP_ACP, 0, szDescription, -1, pException->szDescription, DESCRIPTION_LENGTH);
#endif
				}
			}
		}
	}

	if (pException->szDescription)
	{

		if (!cch) cch = wcslen(pException->szDescription);

		if (cch >= 2 && pException->szDescription[cch - 2] == L'\r')
			pException->szDescription[cch - 2] = L'\0';
		else if (cch >= 1 && pException->szDescription[cch - 1] == L'\n')
			pException->szDescription[cch - 1] = L'\0';
	}

	if (cchBufferSize)
	{
		if (!bFixedFont)
		{
			_snwprintf(szBuffer, cchBufferSize, L"Member:\t  %s\r\nFunction:\t  %s\t\t\r\nError In:\t  %s\r\nError:\t  %s\r\nCode:\t  %x\r\nSource:\t  %s",
				pException->szCompleteMember,
				pException->szInitialFunction, pException->szErrorFunction,
				pException->szDescription, hr,
				pException->szSource);
		}
		else
		{
			_snwprintf(szBuffer, cchBufferSize, L"Member:   %s\r\nFunction: %s\r\nError In: %s\r\nError:    %s\r\nCode:     %x\r\nSource:   %s",
				pException->szCompleteMember,
				pException->szInitialFunction, pException->szErrorFunction,
				pException->szDescription, hr,
				pException->szSource);
		}

		szBuffer[cchBufferSize - 1] = L'\0';
	}

	return NOERROR;
}

HRESULT dhFormatExceptionA(PDH_EXCEPTION pException, LPSTR szBuffer, UINT cchBufferSize, BOOL bFixedFont)
{
	WCHAR szBufferW[1024];

	dhFormatExceptionW(pException, szBufferW, ARRAYSIZE(szBufferW), bFixedFont);

	if (0 == WideCharToMultiByte(CP_ACP, 0, szBufferW, -1, szBuffer, cchBufferSize, NULL, NULL))
		return HRESULT_FROM_WIN32( GetLastError() );

	return NOERROR;
}

HRESULT dhGetLastException(PDH_EXCEPTION * ppException)
{
	if (!ppException) return E_INVALIDARG;

	CheckTlsInitialized();
	*ppException = GetExceptionPtr();

	return NOERROR;
}

HRESULT dhToggleExceptions(BOOL bShow)
{
	g_ExceptionOptions.bShowExceptions = bShow;
	if (bShow) g_ExceptionOptions.bDisableRecordExceptions = FALSE;

	return NOERROR;
}

HRESULT dhSetExceptionOptions(PDH_EXCEPTION_OPTIONS pExceptionOptions)
{
	if (!pExceptionOptions) return E_INVALIDARG;

	g_ExceptionOptions.hwnd                     = pExceptionOptions->hwnd;
	g_ExceptionOptions.szAppName                = pExceptionOptions->szAppName;
	g_ExceptionOptions.bShowExceptions          = pExceptionOptions->bShowExceptions;
	g_ExceptionOptions.bDisableRecordExceptions = pExceptionOptions->bDisableRecordExceptions;
	g_ExceptionOptions.pfnExceptionCallback     = pExceptionOptions->pfnExceptionCallback;

	return NOERROR;
}

HRESULT dhGetExceptionOptions(PDH_EXCEPTION_OPTIONS pExceptionOptions)
{
	if (!pExceptionOptions) return E_INVALIDARG;

	pExceptionOptions->hwnd                     = g_ExceptionOptions.hwnd;
	pExceptionOptions->szAppName                = g_ExceptionOptions.szAppName;
	pExceptionOptions->bShowExceptions          = g_ExceptionOptions.bShowExceptions;
	pExceptionOptions->bDisableRecordExceptions = g_ExceptionOptions.bDisableRecordExceptions;
	pExceptionOptions->pfnExceptionCallback     = g_ExceptionOptions.pfnExceptionCallback;

	return NOERROR;
}

void dhCleanupThreadException(void)
{
	PDH_EXCEPTION pException;

	CheckTlsInitialized();
	pException = GetExceptionPtr();

	if (pException)
	{
		SysFreeString(pException->szDescription);
		SysFreeString(pException->szSource);
		SysFreeString(pException->szHelpFile);

		HeapFree(GetProcessHeap(), 0, pException);

		SetExceptionPtr(NULL);
	}
}

#endif

/* ----- dh_init.c ----- */

HRESULT dhInitializeImp(BOOL bInitializeCOM, BOOL bUnicode)
{
	dh_g_bIsUnicodeMode = bUnicode;

	if (bInitializeCOM) return CoInitialize(NULL);

	return NOERROR;
}

void dhUninitialize(BOOL bUninitializeCOM)
{
#ifndef DISPHELPER_NO_EXCEPTIONS
	dhCleanupThreadException();
#endif
	if (bUninitializeCOM) CoUninitialize();
}

