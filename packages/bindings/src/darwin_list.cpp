#include "./darwin_list.h"

#include <IOKit/IOKitLib.h>
#include <IOKit/IOCFPlugIn.h>
#include <IOKit/usb/IOUSBLib.h>
#include <IOKit/serial/IOSerialKeys.h>

#if defined(MAC_OS_X_VERSION_10_4) && (MAC_OS_X_VERSION_MIN_REQUIRED >= MAC_OS_X_VERSION_10_4)
#include <sys/ioctl.h>
#include <IOKit/serial/ioss.h>
#endif

#include <string>
#include <list>

uv_mutex_t list_mutex;
Boolean lockInitialised = FALSE;

Napi::Value List(const Napi::CallbackInfo& info) 
  Napi::Env env = info.Env();
  // callback
  if (!info[0].IsFunction()) {
    Napi::TypeError::New(env, "First argument must be a function").ThrowAsJavaScriptException();
    return env.Null();
  }

  ListBaton* baton = new ListBaton();
  snprintf(baton->errorString, sizeof(baton->errorString), "");
  baton->callback.Reset(info[0].As<Napi::Function>());

  napi_value resource_name;
  napi_create_string_utf8(env, "List", NAPI_AUTO_LENGTH, &resource_name);
  napi_create_async_work(env, NULL, resource_name, EIO_List, EIO_AfterList, baton, &baton->work);
  napi_queue_async_work(env, baton->work);
  return env.Undefined();
}

void setIfNotEmpty(Napi::Object item, std::string key, const char *value) {
  Napi::String v8key = Napi::String::New(env, key);
  if (strlen(value) > 0) {
    (item).Set(v8key, Napi::String::New(env, value));
  } else {
    (item).Set(v8key, env.Undefined());
  }
}


// Function prototypes
static kern_return_t FindModems(io_iterator_t *matchingServices);
static io_service_t GetUsbDevice(io_service_t service);
static stDeviceListItem* GetSerialDevices();


static kern_return_t FindModems(io_iterator_t *matchingServices) {
    kern_return_t     kernResult;
    CFMutableDictionaryRef  classesToMatch;
    classesToMatch = IOServiceMatching(kIOSerialBSDServiceValue);
    if (classesToMatch != NULL) {
        CFDictionarySetValue(classesToMatch,
                             CFSTR(kIOSerialBSDTypeKey),
                             CFSTR(kIOSerialBSDAllTypes));
    }

    kernResult = IOServiceGetMatchingServices(kIOMasterPortDefault, classesToMatch, matchingServices);

    return kernResult;
}

static io_service_t GetUsbDevice(io_service_t service) {
  IOReturn status;
  io_iterator_t   iterator = 0;
  io_service_t    device = 0;

  if (!service) {
    return device;
  }

  status = IORegistryEntryCreateIterator(service,
                                         kIOServicePlane,
                                         (kIORegistryIterateParents | kIORegistryIterateRecursively),
                                         &iterator);

  if (status == kIOReturnSuccess) {
    io_service_t currentService;
    while ((currentService = IOIteratorNext(iterator)) && device == 0) {
      io_name_t serviceName;
      status = IORegistryEntryGetNameInPlane(currentService, kIOServicePlane, serviceName);
      if (status == kIOReturnSuccess && IOObjectConformsTo(currentService, kIOUSBDeviceClassName)) {
        device = currentService;
      } else {
        // Release the service object which is no longer needed
        (void) IOObjectRelease(currentService);
      }
    }

    // Release the iterator
    (void) IOObjectRelease(iterator);
  }

  return device;
}

static void ExtractUsbInformation(stSerialDevice *serialDevice, IOUSBDeviceInterface  **deviceInterface) {
  kern_return_t kernResult;
  UInt32 locationID;
  kernResult = (*deviceInterface)->GetLocationID(deviceInterface, &locationID);
  if (KERN_SUCCESS == kernResult) {
    snprintf(serialDevice->locationId, sizeof(serialDevice->locationId), "%08x", locationID);
  }

  UInt16 vendorID;
  kernResult = (*deviceInterface)->GetDeviceVendor(deviceInterface, &vendorID);
  if (KERN_SUCCESS == kernResult) {
    snprintf(serialDevice->vendorId, sizeof(serialDevice->vendorId), "%04x", vendorID);
  }

  UInt16 productID;
  kernResult = (*deviceInterface)->GetDeviceProduct(deviceInterface, &productID);
  if (KERN_SUCCESS == kernResult) {
    snprintf(serialDevice->productId, sizeof(serialDevice->productId), "%04x", productID);
  }
}

static stDeviceListItem* GetSerialDevices() {
  char bsdPath[MAXPATHLEN];

  io_iterator_t serialPortIterator;
  FindModems(&serialPortIterator);

  kern_return_t kernResult = KERN_FAILURE;
  Boolean modemFound = false;

  // Initialize the returned path
  *bsdPath = '\0';

  stDeviceListItem* devices = NULL;
  stDeviceListItem* lastDevice = NULL;
  int length = 0;

  io_service_t modemService;
  while ((modemService = IOIteratorNext(serialPortIterator))) {
    CFTypeRef bsdPathAsCFString;
    bsdPathAsCFString = IORegistryEntrySearchCFProperty(
      modemService,
      kIOServicePlane,
      CFSTR(kIODialinDeviceKey),
      kCFAllocatorDefault,
      kIORegistryIterateRecursively);

    if (bsdPathAsCFString) {
      Boolean result;

      // Convert the path from a CFString to a C (NUL-terminated)
      result = CFStringGetCString((CFStringRef) bsdPathAsCFString,
                    bsdPath,
                    sizeof(bsdPath),
                    kCFStringEncodingUTF8);
      CFRelease(bsdPathAsCFString);

      if (result) {
        stDeviceListItem *deviceListItem = reinterpret_cast<stDeviceListItem*>( malloc(sizeof(stDeviceListItem)));
        stSerialDevice *serialDevice = &(deviceListItem->value);
        snprintf(serialDevice->port, sizeof(serialDevice->port), "%s", bsdPath);
        memset(serialDevice->locationId, 0, sizeof(serialDevice->locationId));
        memset(serialDevice->vendorId, 0, sizeof(serialDevice->vendorId));
        memset(serialDevice->productId, 0, sizeof(serialDevice->productId));
        serialDevice->manufacturer[0] = '\0';
        serialDevice->serialNumber[0] = '\0';
        deviceListItem->next = NULL;
        deviceListItem->length = &length;

        if (devices == NULL) {
          devices = deviceListItem;
        } else {
          lastDevice->next = deviceListItem;
        }

        lastDevice = deviceListItem;
        length++;

        modemFound = true;
        kernResult = KERN_SUCCESS;

        uv_mutex_lock(&list_mutex);

        io_service_t device = GetUsbDevice(modemService);

        if (device) {
          CFStringRef manufacturerAsCFString = (CFStringRef) IORegistryEntryCreateCFProperty(device,
                      CFSTR(kUSBVendorString),
                      kCFAllocatorDefault,
                      0);

          if (manufacturerAsCFString) {
            Boolean result;
            char    manufacturer[MAXPATHLEN];

            // Convert from a CFString to a C (NUL-terminated)
            result = CFStringGetCString(manufacturerAsCFString,
                          manufacturer,
                          sizeof(manufacturer),
                          kCFStringEncodingUTF8);

            if (result) {
              snprintf(serialDevice->manufacturer, sizeof(serialDevice->manufacturer), "%s", manufacturer);
            }

            CFRelease(manufacturerAsCFString);
          }

          CFStringRef serialNumberAsCFString = (CFStringRef) IORegistryEntrySearchCFProperty(device,
                      kIOServicePlane,
                      CFSTR(kUSBSerialNumberString),
                      kCFAllocatorDefault,
                      kIORegistryIterateRecursively);

          if (serialNumberAsCFString) {
            Boolean result;
            char    serialNumber[MAXPATHLEN];

            // Convert from a CFString to a C (NUL-terminated)
            result = CFStringGetCString(serialNumberAsCFString,
                          serialNumber,
                          sizeof(serialNumber),
                          kCFStringEncodingUTF8);

            if (result) {
              snprintf(serialDevice->serialNumber, sizeof(serialDevice->serialNumber), "%s", serialNumber);
            }

            CFRelease(serialNumberAsCFString);
          }

          IOCFPlugInInterface **plugInInterface = NULL;
          SInt32        score;
          HRESULT       res;

          IOUSBDeviceInterface  **deviceInterface = NULL;

          kernResult = IOCreatePlugInInterfaceForService(device, kIOUSBDeviceUserClientTypeID, kIOCFPlugInInterfaceID,
                               &plugInInterface, &score);

          if ((kIOReturnSuccess != kernResult) || !plugInInterface) {
            continue;
          }

          // Use the plugin interface to retrieve the device interface.
          res = (*plugInInterface)->QueryInterface(plugInInterface, CFUUIDGetUUIDBytes(kIOUSBDeviceInterfaceID),
                               reinterpret_cast<LPVOID*> (&deviceInterface));

          // Now done with the plugin interface.
          (*plugInInterface)->Release(plugInInterface);

          if (res || deviceInterface == NULL) {
            continue;
          }

          // Extract the desired Information
          ExtractUsbInformation(serialDevice, deviceInterface);

          // Release the Interface
          (*deviceInterface)->Release(deviceInterface);

          // Release the device
          (void) IOObjectRelease(device);
        }

        uv_mutex_unlock(&list_mutex);
      }
    }

    // Release the io_service_t now that we are done with it.
    (void) IOObjectRelease(modemService);
  }

  IOObjectRelease(serialPortIterator);  // Release the iterator.

  return devices;
}

void EIO_List(napi_env env, void* req) {
  ListBaton* data = (ListBaton*)req;

  if (!lockInitialised) {
    uv_mutex_init(&list_mutex);
    lockInitialised = TRUE;
  }

  stDeviceListItem* devices = GetSerialDevices();
  if (devices != NULL && *(devices->length) > 0) {
    stDeviceListItem* next = devices;

    for (int i = 0, len = *(devices->length); i < len; i++) {
      stSerialDevice device = (* next).value;

      ListResultItem* resultItem = new ListResultItem();
      resultItem->path = device.port;

      if (*device.locationId) {
        resultItem->locationId = device.locationId;
      }
      if (*device.vendorId) {
        resultItem->vendorId = device.vendorId;
      }
      if (*device.productId) {
        resultItem->productId = device.productId;
      }
      if (*device.manufacturer) {
        resultItem->manufacturer = device.manufacturer;
      }
      if (*device.serialNumber) {
        resultItem->serialNumber = device.serialNumber;
      }
      data->results.push_back(resultItem);

      stDeviceListItem* current = next;

      if (next->next != NULL) {
        next = next->next;
      }

      free(current);
    }
  }
}

void EIO_AfterList(napi_env env, napi_status status, void* req) {
  Napi::HandleScope scope(env);

  ListBaton* data = (ListBaton*)req;

  std::vector<napi_value> args;
  args.reserve(2);
  if (data->errorString[0]) {
    args.push_back(Napi::String::New(env, data->errorString));
    napi_value undefined;
    status = napi_get_undefined(env, &undefined);
    args.push_back(undefined);
  } else {
    Napi::Array results = Napi::Array::New(env);
    int i = 0;
    for (std::list<ListResultItem*>::iterator it = data->results.begin(); it != data->results.end(); ++it, i++) {
      Napi::Object item = Napi::Object::New(env);

      setIfNotEmpty(item, "path", (*it)->path.c_str());
      setIfNotEmpty(item, "manufacturer", (*it)->manufacturer.c_str());
      setIfNotEmpty(item, "serialNumber", (*it)->serialNumber.c_str());
      setIfNotEmpty(item, "pnpId", (*it)->pnpId.c_str());
      setIfNotEmpty(item, "locationId", (*it)->locationId.c_str());
      setIfNotEmpty(item, "vendorId", (*it)->vendorId.c_str());
      setIfNotEmpty(item, "productId", (*it)->productId.c_str());

      (results).Set(i, item);
    }
    napi_value null;
    status = napi_get_null(env, &null);
    args.push_back(null);
    args.push_back(results);
  }
  data->callback.Call(args);

  for (std::list<ListResultItem*>::iterator it = data->results.begin(); it != data->results.end(); ++it) {
    delete *it;
  }
  napi_delete_async_work(env, data->work);
  free(data);
}
