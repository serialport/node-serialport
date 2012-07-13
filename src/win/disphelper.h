/* This file is part of the source code for the DispHelper COM helper library.
 * DispHelper allows you to call COM objects with an extremely simple printf style syntax.
 * DispHelper can be used from C++ or even plain C. It works with most Windows compilers
 * including Dev-CPP, Visual C++ and LCC-WIN32. Including DispHelper in your project
 * couldn't be simpler as it is available in a compacted single file version.
 *
 * Included with DispHelper are over 20 samples that demonstrate using COM objects
 * including ADO, CDO, Outlook, Eudora, Excel, Word, Internet Explorer, MSHTML,
 * PocketSoap, Word Perfect, MS Agent, SAPI, MSXML, WIA, dexplorer and WMI.
 *
 * DispHelper is free open source software provided under the BSD license.
 *
 * Find out more and download DispHelper at:
 * http://sourceforge.net/projects/disphelper/
 * http://disphelper.sourceforge.net/
 */


#ifndef DISPHELPER_H_INCLUDED
#define DISPHELPER_H_INCLUDED

#include <objbase.h>
#include <time.h>

#ifdef __cplusplus
extern "C" {
#endif

HRESULT dhCreateObject(LPCOLESTR szProgId, LPCWSTR szMachine, IDispatch ** ppDisp);
HRESULT dhGetObject(LPCOLESTR szFile, LPCOLESTR szProgId, IDispatch ** ppDisp);

HRESULT dhCreateObjectEx(LPCOLESTR szProgId, REFIID riid, DWORD dwClsContext, COSERVERINFO * pServerInfo, void ** ppv);
HRESULT dhGetObjectEx(LPCOLESTR szFile, LPCOLESTR szProgId, REFIID riid, DWORD dwClsContext, LPVOID lpvReserved, void ** ppv);

HRESULT dhCallMethod(IDispatch * pDisp, LPCOLESTR szMember, ...);
HRESULT dhPutValue(IDispatch * pDisp, LPCOLESTR szMember, ...);
HRESULT dhPutRef(IDispatch * pDisp, LPCOLESTR szMember, ...);
HRESULT dhGetValue(LPCWSTR szIdentifier, void * pResult, IDispatch * pDisp, LPCOLESTR szMember, ...);

HRESULT dhInvoke(int invokeType, VARTYPE returnType, VARIANT * pvResult, IDispatch * pDisp, LPCOLESTR szMember, ...);
HRESULT dhInvokeArray(int invokeType, VARIANT * pvResult, UINT cArgs, IDispatch * pDisp, LPCOLESTR szMember, VARIANT * pArgs);

HRESULT dhCallMethodV(IDispatch * pDisp, LPCOLESTR szMember, va_list * marker);
HRESULT dhPutValueV(IDispatch * pDisp, LPCOLESTR szMember, va_list * marker);
HRESULT dhPutRefV(IDispatch * pDisp, LPCOLESTR szMember, va_list * marker);
HRESULT dhGetValueV(LPCWSTR szIdentifier, void * pResult, IDispatch * pDisp, LPCOLESTR szMember, va_list * marker);
HRESULT dhInvokeV(int invokeType, VARTYPE returnType, VARIANT * pvResult, IDispatch * pDisp, LPCOLESTR szMember, va_list * marker);

HRESULT dhAutoWrap(int invokeType, VARIANT * pvResult, IDispatch * pDisp, LPCOLESTR szMember, UINT cArgs, ...);
HRESULT dhParseProperties(IDispatch * pDisp, LPCWSTR szProperties, UINT * lpcPropsSet);

HRESULT dhEnumBegin(IEnumVARIANT ** ppEnum, IDispatch * pDisp, LPCOLESTR szMember, ...);
HRESULT dhEnumBeginV(IEnumVARIANT ** ppEnum, IDispatch * pDisp, LPCOLESTR szMember, va_list * marker);
HRESULT dhEnumNextObject(IEnumVARIANT * pEnum, IDispatch ** ppDisp);
HRESULT dhEnumNextVariant(IEnumVARIANT * pEnum, VARIANT * pvResult);

HRESULT dhInitializeImp(BOOL bInitializeCOM, BOOL bUnicode);
void dhUninitialize(BOOL bUninitializeCOM);

#define dhInitializeA(bInitializeCOM) dhInitializeImp(bInitializeCOM, FALSE)
#define dhInitializeW(bInitializeCOM) dhInitializeImp(bInitializeCOM, TRUE)

#ifdef UNICODE
#define dhInitialize dhInitializeW
#else
#define dhInitialize dhInitializeA
#endif

#define AutoWrap dhAutoWrap
#define DISPATCH_OBJ(objName) IDispatch * objName = NULL
#define dhFreeString(string) SysFreeString((BSTR) string)

#ifndef SAFE_RELEASE
#ifdef __cplusplus
#define SAFE_RELEASE(pObj) { if (pObj) { (pObj)->Release(); (pObj) = NULL; } }
#else
#define SAFE_RELEASE(pObj) { if (pObj) { (pObj)->lpVtbl->Release(pObj); (pObj) = NULL; } }
#endif
#endif

#define SAFE_FREE_STRING(string) { dhFreeString(string); (string) = NULL; }




/* ===================================================================== */
#ifndef DISPHELPER_NO_WITH

#define WITH0(objName, pDisp, szMember) { \
	DISPATCH_OBJ(objName);            \
	if (SUCCEEDED(dhGetValue(L"%o", &objName, pDisp, szMember))) {

#define WITH1(objName, pDisp, szMember, arg1) { \
	DISPATCH_OBJ(objName);                  \
	if (SUCCEEDED(dhGetValue(L"%o", &objName, pDisp, szMember, arg1))) {

#define WITH2(objName, pDisp, szMember, arg1, arg2) { \
	DISPATCH_OBJ(objName);                        \
	if (SUCCEEDED(dhGetValue(L"%o", &objName, pDisp, szMember, arg1, arg2))) {

#define WITH3(objName, pDisp, szMember, arg1, arg2, arg3) { \
	DISPATCH_OBJ(objName);                              \
	if (SUCCEEDED(dhGetValue(L"%o", &objName, pDisp, szMember, arg1, arg2, arg3))) {

#define WITH4(objName, pDisp, szMember, arg1, arg2, arg3, arg4) { \
	DISPATCH_OBJ(objName);                                    \
	if (SUCCEEDED(dhGetValue(L"%o", &objName, pDisp, szMember, arg1, arg2, arg3, arg4))) {

#define WITH WITH0

#define ON_WITH_ERROR(objName) } else {

#define END_WITH(objName) } SAFE_RELEASE(objName); }

#endif /* ----- DISPHELPER_NO_WITH ----- */




/* ===================================================================== */
#ifndef DISPHELPER_NO_FOR_EACH

#define FOR_EACH0(objName, pDisp, szMember) { \
	IEnumVARIANT * xx_pEnum_xx = NULL;    \
	DISPATCH_OBJ(objName);                \
	if (SUCCEEDED(dhEnumBegin(&xx_pEnum_xx, pDisp, szMember))) { \
		while (dhEnumNextObject(xx_pEnum_xx, &objName) == NOERROR) {

#define FOR_EACH1(objName, pDisp, szMember, arg1) { \
	IEnumVARIANT * xx_pEnum_xx = NULL;          \
	DISPATCH_OBJ(objName);                      \
	if (SUCCEEDED(dhEnumBegin(&xx_pEnum_xx, pDisp, szMember, arg1))) { \
		while (dhEnumNextObject(xx_pEnum_xx, &objName) == NOERROR) {

#define FOR_EACH2(objName, pDisp, szMember, arg1, arg2) { \
	IEnumVARIANT * xx_pEnum_xx = NULL;          \
	DISPATCH_OBJ(objName);                      \
	if (SUCCEEDED(dhEnumBegin(&xx_pEnum_xx, pDisp, szMember, arg1, arg2))) { \
		while (dhEnumNextObject(xx_pEnum_xx, &objName) == NOERROR) {


#define FOR_EACH3(objName, pDisp, szMember, arg1, arg2, arg3) { \
	IEnumVARIANT * xx_pEnum_xx = NULL;          \
	DISPATCH_OBJ(objName);                      \
	if (SUCCEEDED(dhEnumBegin(&xx_pEnum_xx, pDisp, szMember, arg1, arg2, arg3))) { \
		while (dhEnumNextObject(xx_pEnum_xx, &objName) == NOERROR) {


#define FOR_EACH4(objName, pDisp, szMember, arg1, arg2, arg3, arg4) { \
	IEnumVARIANT * xx_pEnum_xx = NULL;          \
	DISPATCH_OBJ(objName);                      \
	if (SUCCEEDED(dhEnumBegin(&xx_pEnum_xx, pDisp, szMember, arg1, arg2, arg3, arg4))) { \
		while (dhEnumNextObject(xx_pEnum_xx, &objName) == NOERROR) {

#define FOR_EACH FOR_EACH0

#define ON_FOR_EACH_ERROR(objName) SAFE_RELEASE(objName); }} else {{

#define NEXT(objName) SAFE_RELEASE(objName); }} SAFE_RELEASE(objName); SAFE_RELEASE(xx_pEnum_xx); }

#endif /* ----- DISPHELPER_NO_FOR_EACH ----- */




/* ===================================================================== */
#ifndef DISPHELPER_NO_EXCEPTIONS

/* Structure to store a DispHelper exception */
typedef struct tagDH_EXCEPTION
{
	LPCWSTR szInitialFunction;
	LPCWSTR szErrorFunction;

	HRESULT hr;

	WCHAR szMember[64];
	WCHAR szCompleteMember[256];

	UINT swCode;
	LPWSTR szDescription;
	LPWSTR szSource;
	LPWSTR szHelpFile;
	DWORD dwHelpContext;

	UINT iArgError;

	BOOL bDispatchError;

#ifdef DISPHELPER_INTERNAL_BUILD
	BOOL bOld;
#endif
} DH_EXCEPTION, * PDH_EXCEPTION;

typedef void (*DH_EXCEPTION_CALLBACK) (PDH_EXCEPTION);

/* Structure to store exception options. */
typedef struct tagDH_EXCEPTION_OPTIONS
{
	HWND hwnd;
	LPCWSTR szAppName;
	BOOL bShowExceptions;
	BOOL bDisableRecordExceptions;
	DH_EXCEPTION_CALLBACK pfnExceptionCallback;
} DH_EXCEPTION_OPTIONS, * PDH_EXCEPTION_OPTIONS;

/* Functions to manipulate global exception options */
HRESULT dhToggleExceptions(BOOL bShow);
HRESULT dhSetExceptionOptions(PDH_EXCEPTION_OPTIONS pExceptionOptions);
HRESULT dhGetExceptionOptions(PDH_EXCEPTION_OPTIONS pExceptionOptions);

/* Functions to show an exception, format an exception into a string
 * and get a copy of the last exception */
HRESULT dhShowException(PDH_EXCEPTION pException);
HRESULT dhGetLastException(PDH_EXCEPTION * pException);
HRESULT dhFormatExceptionW(PDH_EXCEPTION pException, LPWSTR szBuffer, UINT cchBufferSize, BOOL bFixedFont);
HRESULT dhFormatExceptionA(PDH_EXCEPTION pException, LPSTR szBuffer, UINT cchBufferSize, BOOL bFixedFont);

#ifdef UNICODE
#define dhFormatException dhFormatExceptionW
#else
#define dhFormatException dhFormatExceptionA
#endif

#ifdef DISPHELPER_INTERNAL_BUILD

void dhEnter(void);
HRESULT dhExitEx(HRESULT hr, BOOL bDispatchError, LPCWSTR szMember, LPCWSTR szCompleteMember, EXCEPINFO * pExcepInfo, UINT iArgError, LPCWSTR szFunctionName);
void dhCleanupThreadException(void);

#define DH_ENTER(szFunctionName) static LPCWSTR xx_szFunctionName_xx = szFunctionName; \
				    dhEnter()

#define DH_EXITEX(hr, bDispatchError, szMember, szCompleteMember, pExcepInfo, iArgError) \
		dhExitEx(hr, bDispatchError, szMember, szCompleteMember, pExcepInfo, iArgError, xx_szFunctionName_xx)

#define DH_EXIT(hr, szCompleteMember) DH_EXITEX(hr, FALSE, NULL, szCompleteMember, NULL, 0)

#endif /* ----- DISPHELPER_INTERNAL_BUILD ----- */

#else  /* ----- DISPHELPER_NO_EXCEPTIONS ----- */

/* These macros define out calls to selected exception functions */
#define dhToggleExceptions(bShow) (E_NOTIMPL)
#define dhSetExceptionOptions(pExcepOptions) (E_NOTIMPL)

#ifdef DISPHELPER_INTERNAL_BUILD
#define DH_ENTER(szFunctionName)
#define DH_EXITEX(hr, bDispatchError, szMember, szCompleteMember, pExcepInfo, iArgError) \
	(((hr == DISP_E_EXCEPTION && pExcepInfo) ?                      \
	(SysFreeString(((EXCEPINFO *)(pExcepInfo))->bstrSource),        \
	 SysFreeString(((EXCEPINFO *)(pExcepInfo))->bstrDescription),   \
	 SysFreeString(((EXCEPINFO *)(pExcepInfo))->bstrHelpFile), 0) : (0)), hr)
#define DH_EXIT(hr, szCompleteMember)(hr)
#endif

#endif /* ----- DISPHELPER_NO_EXCEPTIONS ----- */






/* ===================================================================== */
#ifdef DISPHELPER_INTERNAL_BUILD

#include <stdio.h>
#include <stdarg.h>
#include <wchar.h>

/* Macro to include or lose debug code. */
#ifdef DEBUG
#define DBG_CODE(code) code
#else
#define DBG_CODE(code)
#endif

/* Are we in unicode mode? */
extern BOOL dh_g_bIsUnicodeMode;

/* Number of objects in an array */
#undef ARRAYSIZE
#define ARRAYSIZE(arr) (sizeof(arr) / sizeof((arr)[0]))

/* Maximum number of arguments for a member */
#define DH_MAX_ARGS 25

/* Maximum length of a member string */
#define DH_MAX_MEMBER 512

/* This macro is missing from Dev-Cpp/Mingw */
#ifndef V_UI4
#define V_UI4(X) V_UNION(X, ulVal)
#endif

/* Macro to notify programmer of invalid identifier in debug mode. */
#define DEBUG_NOTIFY_INVALID_IDENTIFIER(chIdentifier) \
DBG_CODE( { \
		char buf[256]; \
		sprintf(buf,"DEBUG: The format string or return identifier contained the invalid identifier '%c'.\n" \
		"The valid identifiers are \"d/u/e/b/v/B/S/s/T/o/O/t/W/D/f/m\".\n" \
		"Each %% character should be followed by a valid identifier.\n" \
		"Identifiers are case sensitive.", (chIdentifier)); \
		MessageBoxA(NULL, buf, "DEBUG: Invalid Format Identifier", MB_ICONSTOP); \
	} )

#ifdef _MSC_VER
#pragma warning(disable : 4706) /* Assignment in conditional expression */
#endif

#ifndef DISPHELPER_NO_PRAGMA_LIB
#ifdef __LCC__
#pragma lib <ole32.lib>
#pragma lib <oleaut32.lib>
#pragma lib <uuid.lib>
#endif
#endif


#endif /* ----- DISPHELPER_INTERNAL_BUILD ----- */

#ifndef DISPHELPER_NO_PRAGMA_LIB
#if defined(_MSC_VER) || defined(__BORLANDC__)
#pragma comment(lib, "ole32.lib")
#pragma comment(lib, "oleaut32.lib")
#pragma comment(lib, "uuid.lib")
#endif
#endif



#ifdef __cplusplus
}
#endif




/* ===================================================================== */
#if defined(__cplusplus) && !defined(DISPHELPER_NO_CPP_EXTENSIONS)

#include <iostream>
#include <string>

#ifdef _MSC_VER
#pragma warning( disable : 4290 ) /* throw() specification ignored */
#endif

#ifndef DISPHELPER_USE_MS_SMART_PTR

template <class T>
class CDhComPtr
{
public:
	CDhComPtr() throw() : m_pInterface (NULL) {}

	CDhComPtr(T* pInterface) throw() : m_pInterface (pInterface)
	{
		if (m_pInterface) m_pInterface->AddRef();
	}

	CDhComPtr(const CDhComPtr& original) throw() : m_pInterface (original.m_pInterface)
	{
		if (m_pInterface) m_pInterface->AddRef();
	}

	~CDhComPtr() throw()
	{
		Dispose();
	}

	void Dispose() throw()
	{
		if (m_pInterface)
		{
			m_pInterface->Release();
			m_pInterface = NULL;
		}
	}

	T* Detach() throw()
	{
		T* temp = m_pInterface;
		m_pInterface = NULL;
		return temp;
	}

	inline operator T*() const throw()
	{
        	return m_pInterface;
	}

	T** operator&() throw()
	{
		Dispose();
        	return &m_pInterface;
	}

	T* operator->() const throw(HRESULT)
	{
		if (!m_pInterface) throw E_POINTER;
		return m_pInterface;
	}

	CDhComPtr& operator=(T* pInterface) throw()
	{
		if (m_pInterface != pInterface)
		{
			T* pOldInterface = m_pInterface;
			m_pInterface = pInterface;
			if (m_pInterface)  m_pInterface->AddRef();
			if (pOldInterface) pOldInterface->Release();
		}

		return *this;
	}

	CDhComPtr& operator=(const int null) throw(HRESULT)
	{
		if (null != 0) throw(E_POINTER);
		return operator=((T*) NULL);
	}

	CDhComPtr& operator=(const CDhComPtr& rhs) throw()
	{
		return operator=(rhs.m_pInterface);
	}

private:
	T* m_pInterface;
};

typedef CDhComPtr<IDispatch>    CDispPtr;
typedef CDhComPtr<IEnumVARIANT> CEnumPtr;
typedef CDhComPtr<IUnknown>     CUnknownPtr;

#else /* DISPHELPER_USE_MS_SMART_PTR */

#include <comdef.h> 
typedef IDispatchPtr    CDispPtr;
typedef IEnumVARIANTPtr CEnumPtr;
typedef IUnknownPtr     CUnknownPtr;

#endif /* DISPHELPER_USE_MS_SMART_PTR */




/* ===================================================================== */
template <class T>
class CDhStringTemplate
{
public:
	CDhStringTemplate() throw() : m_strptr (NULL) {}

	CDhStringTemplate(const CDhStringTemplate& original) throw()
	{
		Copy(original.m_strptr);
	}

	CDhStringTemplate(const int null) throw(HRESULT) : m_strptr (NULL)
	{
		if (null != 0) throw(E_POINTER);
	}

	~CDhStringTemplate() throw()
	{
		Dispose();
	}

	void Dispose() throw()
	{
		dhFreeString(m_strptr);
		m_strptr = NULL;
	}

	T* Detach() throw()
	{
		T* temp = m_strptr;
		m_strptr = NULL;
		return temp;
	}

	T** operator&() throw()
	{
		Dispose();
		return &m_strptr;
	}

	inline operator T*() const throw()
	{
		return m_strptr;
	}

	inline T& operator[](int nIndex) const throw()
	{
		return m_strptr[nIndex];
	}

	CDhStringTemplate& operator=(const CDhStringTemplate& rhs)
	{
		if (m_strptr != rhs.m_strptr)
		{
			T* temp = m_strptr;
			Copy(rhs.m_strptr);
			dhFreeString(temp);
		}

		return *this;
	}

	CDhStringTemplate& operator=(const int null) throw(HRESULT)
	{
		if (null != 0) throw(E_POINTER);
		Dispose();
		return *this;
	}

private:
	void Copy(const T* rhs)
	{
		if (rhs == NULL)
		{
			m_strptr = NULL;
		}
		else if (sizeof(T) == sizeof(CHAR))
		{
			m_strptr = (T*) SysAllocStringByteLen((LPCSTR) rhs, SysStringByteLen((BSTR) rhs));
		}
		else
		{
			m_strptr = (T*) SysAllocStringLen((OLECHAR *) rhs, SysStringLen((BSTR) rhs));
		}
	}

	T* m_strptr;
};

typedef CDhStringTemplate<CHAR>    CDhStringA;  /* Ansi string - LPSTR */
typedef CDhStringTemplate<WCHAR>   CDhStringW;  /* Unicode string - LPWSTR */
typedef CDhStringTemplate<OLECHAR> CDhStringB;  /* Unicode bstring - BSTR */
typedef CDhStringTemplate<TCHAR>   CDhStringT;  /* T string - LPTSTR */
typedef CDhStringTemplate<TCHAR>   CDhString;   /* T string - LPTSTR */

inline std::ostream& operator<<(std::ostream& os, const CDhStringA& s)
{
	return os << (s ? s : (char*) "(null)");
}

inline std::wostream& operator<<(std::wostream& os, const CDhStringW& s)
{
	return os << (s ? s : (wchar_t*) L"(null)");
}




/* ===================================================================== */
class CDhInitialize
{
public:
	CDhInitialize(const BOOL bInitCom = TRUE) throw() : m_bInitCom (bInitCom)
	{
		dhInitialize(m_bInitCom);
	}

	~CDhInitialize() throw()
	{
		dhUninitialize(m_bInitCom);
	}
private:
	BOOL m_bInitCom;
};




/* ===================================================================== */
#ifndef DISPHELPER_NO_EXCEPTIONS
class dhThrowFunctions
{
public:
	static void throw_string() throw(std::string)
	{
		CHAR szMessage[512];
		dhFormatExceptionA(NULL, szMessage, sizeof(szMessage)/sizeof(szMessage[0]), TRUE);
		throw std::string(szMessage);
	}

	static void throw_wstring() throw(std::wstring)
	{
		WCHAR szMessage[512];
		dhFormatExceptionW(NULL, szMessage, sizeof(szMessage)/sizeof(szMessage[0]), TRUE);
		throw std::wstring(szMessage);
	}
	
	static void throw_dhexception() throw(PDH_EXCEPTION)
	{
		PDH_EXCEPTION pException = NULL;
		dhGetLastException(&pException);
		throw pException;
	}
};
#endif /* DISPHELPER_NO_EXCEPTIONS */




/* ===================================================================== */
#ifndef DISPHELPER_NO_EXCEPTIONS
inline bool dhIfFailThrowString(HRESULT hr) throw(std::string)
{
	if (FAILED(hr)) dhThrowFunctions::throw_string();
	return true;
}

inline bool dhIfFailThrowWString(HRESULT hr) throw(std::wstring)
{
	if (FAILED(hr)) dhThrowFunctions::throw_wstring();
	return true;
}

inline bool dhIfFailThrowDhException(HRESULT hr) throw(PDH_EXCEPTION)
{
	if (FAILED(hr)) dhThrowFunctions::throw_dhexception();
	return true;
}

#define dhCheck dhIfFailThrowString

#endif /* DISPHELPER_NO_EXCEPTIONS */




/* ===================================================================== */
#ifndef DISPHELPER_NO_WITH

#undef WITH0
#define WITH0(objName, pDisp, szMember) { \
	CDispPtr objName;                 \
	if (SUCCEEDED(dhGetValue(L"%o", &objName, pDisp, szMember))) {

#undef WITH1
#define WITH1(objName, pDisp, szMember, arg1) { \
	CDispPtr objName;                       \
	if (SUCCEEDED(dhGetValue(L"%o", &objName, pDisp, szMember, arg1))) {

#undef WITH2
#define WITH2(objName, pDisp, szMember, arg1, arg2) { \
	CDispPtr objName;                             \
	if (SUCCEEDED(dhGetValue(L"%o", &objName, pDisp, szMember, arg1, arg2))) {

#undef WITH3
#define WITH3(objName, pDisp, szMember, arg1, arg2, arg3) { \
	CDispPtr objName;                                   \
	if (SUCCEEDED(dhGetValue(L"%o", &objName, pDisp, szMember, arg1, arg2, arg3))) {

#undef WITH4
#define WITH4(objName, pDisp, szMember, arg1, arg2, arg3, arg4) { \
	CDispPtr objName;                                         \
	if (SUCCEEDED(dhGetValue(L"%o", &objName, pDisp, szMember, arg1, arg2, arg3, arg4))) {

#undef ON_WITH_ERROR
#define ON_WITH_ERROR(objName) } else {

#undef END_WITH
#define END_WITH(objName) }}

#define END_WITH_THROW(objName) } else { dhThrowFunctions::throw_string(); }}

#endif /* DISPHELPER_NO_WITH */




/* ===================================================================== */
#ifndef DISPHELPER_NO_FOR_EACH

#undef FOR_EACH0
#define FOR_EACH0(objName, pDisp, szMember) { \
	CEnumPtr xx_pEnum_xx;     \
	if (SUCCEEDED(dhEnumBegin(&xx_pEnum_xx, pDisp, szMember))) { \
		CDispPtr objName; \
		while (dhEnumNextObject(xx_pEnum_xx, &objName) == NOERROR) {

#undef FOR_EACH1
#define FOR_EACH1(objName, pDisp, szMember, arg1) { \
	CEnumPtr xx_pEnum_xx;     \
	if (SUCCEEDED(dhEnumBegin(&xx_pEnum_xx, pDisp, szMember, arg1))) { \
		CDispPtr objName; \
		while (dhEnumNextObject(xx_pEnum_xx, &objName) == NOERROR) {

#undef FOR_EACH2
#define FOR_EACH2(objName, pDisp, szMember, arg1, arg2) { \
	CEnumPtr xx_pEnum_xx;     \
	if (SUCCEEDED(dhEnumBegin(&xx_pEnum_xx, pDisp, szMember, arg1, arg2))) { \
		CDispPtr objName; \
		while (dhEnumNextObject(xx_pEnum_xx, &objName) == NOERROR) {

#undef FOR_EACH3
#define FOR_EACH3(objName, pDisp, szMember, arg1, arg2, arg3) { \
	CEnumPtr xx_pEnum_xx;     \
	if (SUCCEEDED(dhEnumBegin(&xx_pEnum_xx, pDisp, szMember, arg1, arg2, arg3))) { \
		CDispPtr objName; \
		while (dhEnumNextObject(xx_pEnum_xx, &objName) == NOERROR) {

#undef FOR_EACH4
#define FOR_EACH4(objName, pDisp, szMember, arg1, arg2, arg3, arg4) { \
	CEnumPtr xx_pEnum_xx;     \
	if (SUCCEEDED(dhEnumBegin(&xx_pEnum_xx, pDisp, szMember, arg1, arg2, arg3, arg4))) { \
		CDispPtr objName; \
		while (dhEnumNextObject(xx_pEnum_xx, &objName) == NOERROR) {

#undef ON_FOR_EACH_ERROR
#define ON_FOR_EACH_ERROR(objName) }} else {{

#undef NEXT
#define NEXT(objName) }}}

#define NEXT_THROW(objName) }} else { dhThrowFunctions::throw_string(); }}

#endif /* DISPHELPER_NO_FOR_EACH */

#ifdef _MSC_VER
#pragma warning( default : 4290 )
#endif

#endif /* defined(__cplusplus) && !defined(DISPHELPER_NO_CPP_EXTENSIONS) */

#endif /* ----- DISPHELPER_H_INCLUDED ----- */
