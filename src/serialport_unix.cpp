#ifndef WIN32
#include "serialport.h"
#include <unistd.h>
#include <fcntl.h>
#include <errno.h>
#include <termios.h>

#ifdef __APPLE__
#include <AvailabilityMacros.h>
#include <sys/param.h>
#include <IOKit/IOKitLib.h>
#include <IOKit/IOCFPlugIn.h>
#include <IOKit/usb/IOUSBLib.h>
#include <IOKit/serial/IOSerialKeys.h>

uv_mutex_t list_mutex;
Boolean lockInitialised = FALSE;

#endif
#if defined(MAC_OS_X_VERSION_10_4) && (MAC_OS_X_VERSION_MIN_REQUIRED >= MAC_OS_X_VERSION_10_4)
#include <sys/ioctl.h>
#include <IOKit/serial/ioss.h>
#include <errno.h>
#endif

int ToBaudConstant(int baudRate);
int ToDataBitsConstant(int dataBits);
int ToStopBitsConstant(SerialPortStopBits stopBits);
int ToFlowControlConstant(bool flowControl);

void AfterOpenSuccess(int fd, v8::Handle<v8::Value> dataCallback, v8::Handle<v8::Value> disconnectedCallback, v8::Handle<v8::Value> errorCallback) {

}

int ToBaudConstant(int baudRate) {
  switch (baudRate) {
    case 0: return B0;
    case 50: return B50;
    case 75: return B75;
    case 110: return B110;
    case 134: return B134;
    case 150: return B150;
    case 200: return B200;
    case 300: return B300;
    case 600: return B600;
    case 1200: return B1200;
    case 1800: return B1800;
    case 2400: return B2400;
    case 4800: return B4800;
    case 9600: return B9600;
    case 19200: return B19200;
    case 38400: return B38400;
    case 57600: return B57600;
    case 115200: return B115200;
    case 230400: return B230400;
#if !defined(__APPLE__) && !defined(__OpenBSD__)
    case 460800: return B460800;
    case 500000: return B500000;
    case 576000: return B576000;
    case 921600: return B921600;
    case 1000000: return B1000000;
    case 1152000: return B1152000;
    case 1500000: return B1500000;
    case 2000000: return B2000000;
    case 2500000: return B2500000;
    case 3000000: return B3000000;
    case 3500000: return B3500000;
    case 4000000: return B4000000;
#endif
  }
  return -1;
}

#ifdef __APPLE__
typedef struct SerialDevice {
    char port[MAXPATHLEN];
    char locationId[MAXPATHLEN];
    char vendorId[MAXPATHLEN];
    char productId[MAXPATHLEN];
    char manufacturer[MAXPATHLEN];
    char serialNumber[MAXPATHLEN];
} stSerialDevice;

typedef struct DeviceListItem {
    struct SerialDevice value;
    struct DeviceListItem *next;
    int* length;
} stDeviceListItem;
#endif

int ToDataBitsConstant(int dataBits) {
  switch (dataBits) {
    case 8: default: return CS8;
    case 7: return CS7;
    case 6: return CS6;
    case 5: return CS5;
  }
  return -1;
}

int ToFlowControlConstant(bool flowControl) {
  return flowControl ? CRTSCTS : 0;
}

void EIO_Open(uv_work_t* req) {
  OpenBaton* data = static_cast<OpenBaton*>(req->data);

#if not ( defined(MAC_OS_X_VERSION_10_4) && (MAC_OS_X_VERSION_MIN_REQUIRED >= MAC_OS_X_VERSION_10_4) )
  int baudRate = ToBaudConstant(data->baudRate);
  if(baudRate == -1) {
    sprintf(data->errorString, "Invalid baud rate setting %d", data->baudRate);
    return;
  }
#endif
  int dataBits = ToDataBitsConstant(data->dataBits);
  if(dataBits == -1) {
    sprintf(data->errorString, "Invalid data bits setting %d", data->dataBits);
    return;
  }

  int flowControl = ToFlowControlConstant(data->flowControl);
  if(flowControl == -1) {
    sprintf(data->errorString, "Invalid flow control setting %d", data->flowControl);
    return;
  }

  int flags = (O_RDWR | O_NOCTTY | O_NONBLOCK | O_NDELAY);
  int fd = open(data->path, flags);

  if (fd == -1) {
    sprintf(data->errorString, "Cannot open %s", data->path);
    return;
  }

  struct termios options;
  struct sigaction saio;
  saio.sa_handler = SIG_IGN;
  sigemptyset(&saio.sa_mask);
  saio.sa_flags = 0;
  sigaction(SIGIO, &saio, NULL);

  //all process to receive SIGIO
  fcntl(fd, F_SETOWN, getpid());
  fcntl(fd, F_SETFL, FASYNC);

  // Set baud and other configuration.
  tcgetattr(fd, &options);

#if not ( defined(MAC_OS_X_VERSION_10_4) && (MAC_OS_X_VERSION_MIN_REQUIRED >= MAC_OS_X_VERSION_10_4) )
  // Specify the baud rate
  cfsetispeed(&options, baudRate);
  cfsetospeed(&options, baudRate);
#endif 

  // Specify data bits
  options.c_cflag &= ~CSIZE;
  options.c_cflag |= dataBits;

  // Specify flow control
  options.c_cflag &= ~flowControl;
  options.c_cflag |= flowControl;

  switch (data->parity)
  {
  case SERIALPORT_PARITY_NONE:
    options.c_cflag &= ~PARENB;
    options.c_cflag &= ~CSTOPB;
    options.c_cflag &= ~CSIZE;
    options.c_cflag |= CS8;
    break;
  case SERIALPORT_PARITY_ODD:
    options.c_cflag |= PARENB;
    options.c_cflag |= PARODD;
    options.c_cflag &= ~CSTOPB;
    options.c_cflag &= ~CSIZE;
    options.c_cflag |= CS7;
    break;
  case SERIALPORT_PARITY_EVEN:
    options.c_cflag |= PARENB;
    options.c_cflag &= ~PARODD;
    options.c_cflag &= ~CSTOPB;
    options.c_cflag &= ~CSIZE;
    options.c_cflag |= CS7;
    break;
  default:
    sprintf(data->errorString, "Invalid parity setting %d", data->parity);
    close(fd);
    return;
  }

  switch(data->stopBits) {
  case SERIALPORT_STOPBITS_ONE:
    options.c_cflag &= ~CSTOPB;
    break;
  case SERIALPORT_STOPBITS_TWO:
    options.c_cflag |= CSTOPB;
    break;
  default:
    sprintf(data->errorString, "Invalid stop bits setting %d", data->stopBits);
    close(fd);
    return;
  }

  options.c_cflag |= CLOCAL; //ignore status lines
  options.c_cflag |= CREAD;  //enable receiver
  options.c_cflag |= HUPCL;  //drop DTR (i.e. hangup) on close
  options.c_iflag = IGNPAR;
  options.c_oflag = 0;
  options.c_lflag = 0; //ICANON;
  options.c_cc[VMIN]=1;
  options.c_cc[VTIME]=0;

  sleep(1);
  tcflush(fd, TCIFLUSH);
  tcsetattr(fd, TCSANOW, &options);


#if defined(MAC_OS_X_VERSION_10_4) && (MAC_OS_X_VERSION_MIN_REQUIRED >= MAC_OS_X_VERSION_10_4)
    speed_t speed = data->baudRate;
    if ( ioctl( fd,  IOSSIOSPEED, &speed ) == -1 )
    {
      printf( "Error %d calling ioctl( ..., IOSSIOSPEED, ... )\n", errno );
    }
#endif 


  data->result = fd;
}

void EIO_Write(uv_work_t* req) {
  QueuedWrite* queuedWrite = static_cast<QueuedWrite*>(req->data);
  WriteBaton* data = static_cast<WriteBaton*>(queuedWrite->baton);

  int bytesWritten = write(data->fd, data->bufferData, data->bufferLength);

  data->result = bytesWritten;
}

void EIO_Close(uv_work_t* req) {
  CloseBaton* data = static_cast<CloseBaton*>(req->data);

  close(data->fd);
}

#ifdef __APPLE__

// Function prototypes
static kern_return_t FindModems(io_iterator_t *matchingServices);
static io_registry_entry_t GetUsbDevice(char *pathName);
static stDeviceListItem* GetSerialDevices();


static kern_return_t FindModems(io_iterator_t *matchingServices)
{
    kern_return_t     kernResult; 
    CFMutableDictionaryRef  classesToMatch;
    classesToMatch = IOServiceMatching(kIOSerialBSDServiceValue);
    if (classesToMatch != NULL)
    {
        CFDictionarySetValue(classesToMatch,
                             CFSTR(kIOSerialBSDTypeKey),
                             CFSTR(kIOSerialBSDAllTypes));
    }
    
    kernResult = IOServiceGetMatchingServices(kIOMasterPortDefault, classesToMatch, matchingServices);    
    
    return kernResult;
}

static io_registry_entry_t GetUsbDevice(char* pathName)
{
    io_registry_entry_t device = 0;
            
    CFMutableDictionaryRef classesToMatch = IOServiceMatching(kIOUSBDeviceClassName);
    if (classesToMatch != NULL)
    {
        io_iterator_t matchingServices;
        kern_return_t kernResult = IOServiceGetMatchingServices(kIOMasterPortDefault, classesToMatch, &matchingServices);
        if (KERN_SUCCESS == kernResult)
        {
            io_service_t service;
            Boolean deviceFound = false;
            
            while ((service = IOIteratorNext(matchingServices)) && !deviceFound)
            {
                CFStringRef bsdPathAsCFString = (CFStringRef) IORegistryEntrySearchCFProperty(service, kIOServicePlane, CFSTR(kIOCalloutDeviceKey), kCFAllocatorDefault, kIORegistryIterateRecursively);

                if (bsdPathAsCFString)
                {
                    Boolean result;
                    char    bsdPath[MAXPATHLEN];
                    
                    // Convert the path from a CFString to a C (NUL-terminated)
                    result = CFStringGetCString(bsdPathAsCFString,
                                                bsdPath,
                                                sizeof(bsdPath),
                                                kCFStringEncodingUTF8);
                    
                    CFRelease(bsdPathAsCFString);
                    
                    if (result && (strcmp(bsdPath, pathName) == 0))
                    {
                        deviceFound = true;
                        //memset(bsdPath, 0, sizeof(bsdPath));
                        device = service;
                    }
                    else
                    {
                       // Release the object which are no longer needed
                       (void) IOObjectRelease(service);
                    }
                }
            }
            // Release the iterator.
            IOObjectRelease(matchingServices); 
        }
    }
    
    return device;
}

static void ExtractUsbInformation(stSerialDevice *serialDevice, IOUSBDeviceInterface  **deviceInterface)
{
    kern_return_t kernResult = KERN_FAILURE;
    UInt32 locationID;
    kernResult = (*deviceInterface)->GetLocationID(deviceInterface, &locationID);
    if (KERN_SUCCESS == kernResult)
    {
        snprintf(serialDevice->locationId, 11, "0x%08x", locationID);
    }

    UInt16 vendorID;
    kernResult = (*deviceInterface)->GetDeviceVendor(deviceInterface, &vendorID);
    if (KERN_SUCCESS == kernResult)
    {
        snprintf(serialDevice->vendorId, 7, "0x%04x", vendorID);
    }

    UInt16 productID;
    kernResult = (*deviceInterface)->GetDeviceProduct(deviceInterface, &productID);
    if (KERN_SUCCESS == kernResult)
    {
        snprintf(serialDevice->productId, 7, "0x%04x", productID);
    }
}

static stDeviceListItem* GetSerialDevices()
{
    kern_return_t kernResult = KERN_FAILURE;
    io_iterator_t serialPortIterator;
    char bsdPath[MAXPATHLEN];
    
    kernResult = FindModems(&serialPortIterator);
    
    io_service_t modemService;
    kernResult = KERN_FAILURE;
    Boolean modemFound = false;
    
    // Initialize the returned path
    *bsdPath = '\0';
    
    stDeviceListItem* devices = NULL;
    stDeviceListItem* lastDevice = NULL;
    int length = 0;
    
    while ((modemService = IOIteratorNext(serialPortIterator)))
    {
        CFTypeRef bsdPathAsCFString;
  
        bsdPathAsCFString = IORegistryEntrySearchCFProperty(modemService, kIOServicePlane, CFSTR(kIOCalloutDeviceKey), kCFAllocatorDefault, kIORegistryIterateRecursively);
        
        if (bsdPathAsCFString)
        {
            Boolean result;
            
            // Convert the path from a CFString to a C (NUL-terminated)
      
            result = CFStringGetCString((CFStringRef) bsdPathAsCFString,
                                        bsdPath,
                                        sizeof(bsdPath), 
                                        kCFStringEncodingUTF8);
            CFRelease(bsdPathAsCFString);
            
            if (result)
            {
                stDeviceListItem *deviceListItem = (stDeviceListItem*) malloc(sizeof(stDeviceListItem));
                stSerialDevice *serialDevice = &(deviceListItem->value);
                strcpy(serialDevice->port, bsdPath);
                memset(serialDevice->locationId, 0, sizeof(serialDevice->locationId));
                memset(serialDevice->vendorId, 0, sizeof(serialDevice->vendorId));
                memset(serialDevice->productId, 0, sizeof(serialDevice->productId));
                serialDevice->manufacturer[0] = '\0';
                serialDevice->serialNumber[0] = '\0';
                deviceListItem->next = NULL;
                deviceListItem->length = &length;
                                
                if (devices == NULL) {
                    devices = deviceListItem;
                }
                else {
                    lastDevice->next = deviceListItem;
                }
                
                lastDevice = deviceListItem;
                length++;
                
                modemFound = true;
                kernResult = KERN_SUCCESS;
                
                uv_mutex_lock(&list_mutex);

                io_registry_entry_t device = GetUsbDevice(bsdPath);
        
                if (device) {
                    CFStringRef manufacturerAsCFString = (CFStringRef) IORegistryEntrySearchCFProperty(device,
                                          kIOServicePlane,
                                          CFSTR(kUSBVendorString),
                                          kCFAllocatorDefault,
                                          kIORegistryIterateRecursively);

                    if (manufacturerAsCFString)
                    {
                        Boolean result;
                        char    manufacturer[MAXPATHLEN];
                        
                        // Convert from a CFString to a C (NUL-terminated)
                        result = CFStringGetCString(manufacturerAsCFString,
                                                    manufacturer,
                                                    sizeof(manufacturer),
                                                    kCFStringEncodingUTF8);

                        if (result) {
                          strcpy(serialDevice->manufacturer, manufacturer);
                        }
                        
                        CFRelease(manufacturerAsCFString);
                    }

                    CFStringRef serialNumberAsCFString = (CFStringRef) IORegistryEntrySearchCFProperty(device,
                                          kIOServicePlane,
                                          CFSTR(kUSBSerialNumberString),
                                          kCFAllocatorDefault,
                                          kIORegistryIterateRecursively);

                    if (serialNumberAsCFString)
                    {
                        Boolean result;
                        char    serialNumber[MAXPATHLEN];
                        
                        // Convert from a CFString to a C (NUL-terminated)
                        result = CFStringGetCString(serialNumberAsCFString,
                                                    serialNumber,
                                                    sizeof(serialNumber),
                                                    kCFStringEncodingUTF8);

                        if (result) {
                          strcpy(serialDevice->serialNumber, serialNumber);
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
                                                             (LPVOID*) &deviceInterface);
                    
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

#endif

void EIO_List(uv_work_t* req) {
  // This code exists in javascript for unix platforms

#ifdef __APPLE__
  if(!lockInitialised)
  {
    uv_mutex_init(&list_mutex);
    lockInitialised = TRUE;
  }

  ListBaton* data = static_cast<ListBaton*>(req->data);

  stDeviceListItem* devices = GetSerialDevices();

  if (*(devices->length) > 0)
  {    
    stDeviceListItem* next = devices;
    
    for (int i = 0, len = *(devices->length); i < len; i++) {
        stSerialDevice device = (* next).value;

        ListResultItem* resultItem = new ListResultItem();
        resultItem->comName = device.port;

        if (device.locationId != NULL) {
          resultItem->locationId = device.locationId;
        }
        if (device.vendorId != NULL) {
          resultItem->vendorId = device.vendorId;
        }
        if (device.productId != NULL) {
          resultItem->productId = device.productId;
        }
        if (device.manufacturer != NULL) {
          resultItem->manufacturer = device.manufacturer;
        }
        if (device.serialNumber != NULL) {
          resultItem->serialNumber = device.serialNumber;
        }
        data->results.push_back(resultItem);

        stDeviceListItem* current = next;

        if (next->next != NULL)
        {
          next = next->next;
        }

        free(current);
    }

  }

#endif
}

void EIO_Flush(uv_work_t* req) {
  FlushBaton* data = static_cast<FlushBaton*>(req->data);

  data->result = tcflush(data->fd, TCIFLUSH);
}

#endif