#include "serialport.h"
#include <nan.h>
#include <ppltasks.h>
#include <array>
#include <unordered_map>

const int MAX_DEVICES = 256; 

using namespace concurrency;
using namespace Platform;
using namespace Windows::Devices::Enumeration;
using namespace Windows::Devices::SerialCommunication;
using namespace Windows::Foundation;
using namespace Windows::Storage::Streams;

std::unordered_map<int, SerialDevice^> g_devices;
int g_device_index = 0;
std::mutex g_mutex;

 DWORD PlatStrToStdStr(String^ platStr, std::string* str) {
  if (0 == platStr->Length()) {
    return ERROR_INVALID_PARAMETER;
  }
  int bufferSize = WideCharToMultiByte(CP_UTF8, 0, platStr->Data(), -1, nullptr, 0, NULL, NULL);
  if (bufferSize == 0) {
    return GetLastError();
  }
  auto utf8 = std::make_unique<char[]>(bufferSize);
  if (0 == WideCharToMultiByte(CP_UTF8, 0, platStr->Data(), -1, utf8.get(), bufferSize, NULL, NULL)) {
    return GetLastError();
  }
  *str = std::string(utf8.get());
  return ERROR_SUCCESS;
}

 DWORD CharStrToPlatStr(char* str, String^& platStr) {
  if (!str) {
    return ERROR_INVALID_PARAMETER;
  }
  int bufferSize = MultiByteToWideChar(CP_UTF8, 0, str, -1, nullptr, 0);
  if (bufferSize == 0) {
    return GetLastError();
  }
  auto utf8 = std::make_unique<wchar_t[]>(bufferSize);
  bufferSize = MultiByteToWideChar(CP_UTF8,0, str, -1, utf8.get(), bufferSize);
  if (bufferSize == 0) {
    return GetLastError();
  }
  platStr = ref new String(utf8.get());
  return ERROR_SUCCESS;
}

void EIO_Open(uv_work_t* req) {
  OpenBaton* data = static_cast<OpenBaton*>(req->data);
  UINT16 vid = 0;
  UINT16 pid = 0;
  std::wstring serialStr;
  SerialDevice^ device;
  DeviceInformationCollection^ dis;
  
  // data->path (name of the device passed in to the 'open' function of serialport)
  // can either be a regular port name like "COM1" or "UART2" or it can be the device
  // ID (if not port name is assigned). serialport.list method should be used to get
  // the name or ID to use.

  String^ deviceId;
  DWORD err = CharStrToPlatStr(data->path, deviceId);
  if (ERROR_SUCCESS != err) {
    _snprintf(data->errorString, ERROR_STRING_SIZE,
              "EIO_Open() failed to convert %s to Platform::String. error: %d", data->path, err);
    return;
  }

  try {
    device = create_task(SerialDevice::FromIdAsync(deviceId)).get();
  } 
  catch (Exception^ e) {
    if (HRESULT_FROM_WIN32(ERROR_INVALID_DATA) != e->HResult) {
      _snprintf(data->errorString, ERROR_STRING_SIZE, 
                "EIO_Open() unable to open %s. error: %d", data->path, e->HResult);
      return;
    }
  }

  // Check if it's a fixed serial port (e.g. UART0) before giving up
  if (nullptr == device) {
    String^ aqs = SerialDevice::GetDeviceSelector(deviceId);
    dis = create_task(DeviceInformation::FindAllAsync(aqs)).get();

    try {
      device = create_task(SerialDevice::FromIdAsync(dis->GetAt(0)->Id)).get();
    }
    catch (Exception^ e) {
      _snprintf(data->errorString, ERROR_STRING_SIZE, 
                "EIO_Open() unable to open %s. error: %d", data->path, e->HResult);
      return;
    }
  }

  if (nullptr == device) {
    _snprintf(data->errorString, ERROR_STRING_SIZE, 
              "EIO_Open() unable to open %s", data->path);
    return;
  }

  try {
    if (data->hupcl == false) {
      device->IsDataTerminalReadyEnabled = false; // disable DTR to avoid reset 
    }
    else {
      device->IsDataTerminalReadyEnabled = true;
    }
  } 
  catch (Exception^ e) {
    // IsDataTerminalReadyEnabled not supported for fixed ports
    if (HRESULT_FROM_WIN32(ERROR_NOT_SUPPORTED) != e->HResult) {
      _snprintf(data->errorString, ERROR_STRING_SIZE, 
                "EIO_Open() failed to set dts. error: %d", e->HResult);
      return;
    }
  }

  device->BaudRate = CBR_9600;
  device->Parity = SerialParity::None;
  device->DataBits = 8;
  device->StopBits = SerialStopBitCount::One;
  device->Handshake = SerialHandshake::None;

  try {
    device->IsRequestToSendEnabled = true;
  } 
  catch (Exception^ e) {
    // IsRequestToSendEnabled not supported for fixed ports
    if (HRESULT_FROM_WIN32(ERROR_NOT_SUPPORTED) != e->HResult) {
      _snprintf(data->errorString, ERROR_STRING_SIZE, 
                "EIO_Open() failed to set rts. error: %d", e->HResult);
      return;
    }
  }

  device->BaudRate = data->baudRate;
  device->DataBits = data->dataBits;
  switch (data->parity) {
    case SERIALPORT_PARITY_NONE:
      device->Parity = SerialParity::None;
      break;
    case SERIALPORT_PARITY_MARK:
      device->Parity = SerialParity::Mark;
      break;
    case SERIALPORT_PARITY_EVEN:
      device->Parity = SerialParity::Even;
      break;
    case SERIALPORT_PARITY_ODD:
      device->Parity = SerialParity::Odd;
      break;
    case SERIALPORT_PARITY_SPACE:
      device->Parity = SerialParity::Space;
      break;
  }
  switch (data->stopBits) {
    case SERIALPORT_STOPBITS_ONE:
      device->StopBits = SerialStopBitCount::One;
      break;
    case SERIALPORT_STOPBITS_ONE_FIVE:
      device->StopBits = SerialStopBitCount::OnePointFive;
      break;
    case SERIALPORT_STOPBITS_TWO:
      device->StopBits = SerialStopBitCount::Two;
      break;
  }

  // Set the com port read/write timeouts
  TimeSpan commTimeout;
  commTimeout.Duration = 10000000; // 1 second. Duration is expressed in 100 nanosecond units.
  device->ReadTimeout = commTimeout;
  device->WriteTimeout = commTimeout;

  std::lock_guard<std::mutex> lk(g_mutex);
  g_devices[g_device_index] = device;
  data->result = g_device_index++;
}

void EIO_Update(uv_work_t* req) {
  ConnectionOptionsBaton* data = static_cast<ConnectionOptionsBaton*>(req->data);
  try {
    std::lock_guard<std::mutex> lk(g_mutex);
    auto it = g_devices.find(data->fd);
    if(g_devices.end() == it) {
      _snprintf(data->errorString, ERROR_STRING_SIZE, 
                "EIO_Update() out of range error. fd: %d", data->fd);
      return;
    }
    else {
      it->second->BaudRate = data->baudRate;
    }
  } catch (Exception^ e) {
    _snprintf(data->errorString, ERROR_STRING_SIZE, 
              "EIO_Update() invalid baud rate: %d", data->baudRate);
    return;
  }
}

void EIO_Set(uv_work_t* req) {
  SetBaton* data = static_cast<SetBaton*>(req->data);

  // SerialDevice::ClearToSendState and SerialDevice::DataSetReadyState 
  // have no set accessors
  if (data->cts || data->dsr) {
    _snprintf(data->errorString, ERROR_STRING_SIZE, 
              "EIO_Set() setting cts or dsr is not supported");
    return;
  }

  std::lock_guard<std::mutex> lk(g_mutex);
  auto it = g_devices.find(data->fd);
  if(g_devices.end() == it) {
    _snprintf(data->errorString, ERROR_STRING_SIZE, 
              "EIO_Set() out of range error. fd: %d", data->fd);
    return;
  }

  try {
    it->second->IsRequestToSendEnabled = data->rts;
  } 
  catch (Exception^ e) {
    if (HRESULT_FROM_WIN32(ERROR_NOT_SUPPORTED) != e->HResult) {
      _snprintf(data->errorString, ERROR_STRING_SIZE, 
                "EIO_Set() failed to set rts. error: %d", e->HResult);
      return;
    }
  }
  
  try {
    it->second->IsDataTerminalReadyEnabled = data->dtr;
  } 
  catch (Exception^ e) {
    if (HRESULT_FROM_WIN32(ERROR_NOT_SUPPORTED) != e->HResult) {
      _snprintf(data->errorString, ERROR_STRING_SIZE,
                "EIO_Set() failed to set dtr. error: %d", e->HResult);
      return;
    }
  }
  
  try {
    it->second->BreakSignalState = data->brk;
  } 
  catch (Exception^ e) {
    if (HRESULT_FROM_WIN32(ERROR_NOT_SUPPORTED) != e->HResult) {
      _snprintf(data->errorString, ERROR_STRING_SIZE, 
                "EIO_Set() failed to set brk. error: %d", e->HResult);
      return;
    }
  }
}

void EIO_Get(uv_work_t* req) {
  GetBaton* data = static_cast<GetBaton*>(req->data);

  std::lock_guard<std::mutex> lk(g_mutex);
  auto it = g_devices.find(data->fd);
  if(g_devices.end() == it) {
    _snprintf(data->errorString, ERROR_STRING_SIZE, 
              "EIO_Get() out of range error. fd: %d", data->fd);
    return;
  }

  try {
    data->cts = it->second->CarrierDetectState;
  } 
  catch (Exception^ e) {
    if (HRESULT_FROM_WIN32(ERROR_NOT_SUPPORTED) != e->HResult) {
      _snprintf(data->errorString, ERROR_STRING_SIZE, 
                "EIO_Get() failed to get cts. error: %d", e->HResult);
      return;
    }
  }
  
  try {
    data->dsr = it->second->DataSetReadyState;
  } 
  catch (Exception^ e) {
    if (HRESULT_FROM_WIN32(ERROR_NOT_SUPPORTED) != e->HResult) {
      _snprintf(data->errorString, ERROR_STRING_SIZE,
                "EIO_Get() failed to get dsr. error: %d", e->HResult);
      return;
    }
  }
  
  try {
    data->dcd = it->second->CarrierDetectState;
  } 
  catch (Exception^ e) {
    if (HRESULT_FROM_WIN32(ERROR_NOT_SUPPORTED) != e->HResult) {
      _snprintf(data->errorString, ERROR_STRING_SIZE, 
                "EIO_Get() failed to get dcd. error: %d", e->HResult);
      return;
    }
  }
}

void EIO_Read(uv_work_t* req) {
  ReadBaton* data = static_cast<ReadBaton*>(req->data);
  data->bytesRead = 0;
  DataReader^ dataReader;

  char* offsetPtr = data->bufferData;
  offsetPtr += data->offset;

  {
    std::lock_guard<std::mutex> lk(g_mutex);
    auto it = g_devices.find(data->fd);
    if (g_devices.end() == it) {
      _snprintf(data->errorString, ERROR_STRING_SIZE, 
                "EIO_WatchPort() out of range error. fd: %d", data->fd);
      return;
    }
    
    dataReader = ref new DataReader(it->second->InputStream);
    dataReader->InputStreamOptions = InputStreamOptions::Partial;
  }

  try {
    size_t bytesToRead = concurrency::create_task(dataReader->LoadAsync(
                                                  (unsigned int)data->bytesToRead)).get();

    // Keep reading until we consume the complete stream.
    while (dataReader->UnconsumedBufferLength > 0) {
      unsigned char byteReceived = dataReader->ReadByte();
      offsetPtr[data->bytesRead] = byteReceived;
      data->bytesRead++;
    }
  }
  catch (Exception^ e) {
    if (HRESULT_FROM_WIN32(ERROR_OPERATION_ABORTED) != e->HResult) {
      _snprintf(data->errorString, ERROR_STRING_SIZE, 
                "EIO_WatchPort() failed to read. error: %d", e->HResult);
    }
  }
  dataReader->DetachStream();
}

void EIO_Write(uv_work_t* req) {
  QueuedWrite* queuedWrite = static_cast<QueuedWrite*>(req->data);
  WriteBaton* data = static_cast<WriteBaton*>(queuedWrite->baton);
  data->result = 0;
  DataWriter^ dataWriter;
  {
    std::lock_guard<std::mutex> lk(g_mutex);
    auto it = g_devices.find(data->fd);
    if (g_devices.end() == it) {
      _snprintf(data->errorString, ERROR_STRING_SIZE, 
                "EIO_Write() out of range error. fd: %d", data->fd);
      return;
    }
    
    dataWriter = ref new DataWriter(it->second->OutputStream);
  }

  try {
    dataWriter->WriteBytes(ref new Array<byte>((byte*)data->bufferData, data->bufferLength));
    auto bytesStored = concurrency::create_task(dataWriter->StoreAsync()).get();
    data->result = bytesStored;
    if(data->bufferLength == bytesStored) {
      data->offset = data->bufferLength;
    }
  }
  catch (Exception^ e) {
    _snprintf(data->errorString, ERROR_STRING_SIZE, 
              "EIO_Write() failed to write. error: %d", e->HResult);
  }
  dataWriter->DetachStream();
}

void EIO_Close(uv_work_t* req) {
  VoidBaton* data = static_cast<VoidBaton*>(req->data);

  auto it = g_devices.find(data->fd);
  if (g_devices.end() == it) {
    _snprintf(data->errorString, ERROR_STRING_SIZE, 
              "EIO_Close() out of range error in g_devices. fd: %d", data->fd);
    return;
  }

  delete it->second;
  g_devices.erase(it);
}

void EIO_List(uv_work_t* req) {
  ListBaton* data = static_cast<ListBaton*>(req->data);

  String ^aqs = SerialDevice::GetDeviceSelector();
  
  auto deviceInfoCollection = concurrency::create_task(DeviceInformation::FindAllAsync(aqs)).get();
  if (deviceInfoCollection->Size < 1) {
    _snprintf(data->errorString, ERROR_STRING_SIZE, 
              "EIO_List() no serial devices found to list");
    return;
  }

  for (size_t i = 0; i < deviceInfoCollection->Size; i++) {
    ListResultItem* resultItem = new ListResultItem();

    auto serialDevice = concurrency::create_task(SerialDevice::FromIdAsync(
                                                 deviceInfoCollection->GetAt(i)->Id)).get();
    if (!serialDevice) {
      continue;
    }

    // Get the port name or ID
    String^ comName = serialDevice->PortName;
    if (comName == nullptr) {
      // Show the device ID if a port name has not been assigned
      comName = deviceInfoCollection->GetAt(i)->Id;
    }

    DWORD err = PlatStrToStdStr(comName, &resultItem->comName);
    if (ERROR_SUCCESS != err) {
      _snprintf(data->errorString, ERROR_STRING_SIZE,
                "EIO_List() failed to convert comName to std::string. error: %d", err);
      break;
    }

    // Get the vendor ID
    resultItem->vendorId = std::to_string(serialDevice->UsbVendorId);

    // Get the product ID
    resultItem->productId = std::to_string(serialDevice->UsbProductId);

    // Use DeviceInformation class to get pnpId and manufacturer if available.
    auto deviceInfo = concurrency::create_task(DeviceInformation::CreateFromIdAsync(
                                               deviceInfoCollection->GetAt(i)->Id)).get();
    if (deviceInfo) {
      if (DeviceInformationKind::DeviceInterface == deviceInfo->Kind) {
        err = PlatStrToStdStr((String^)deviceInfo->Properties->Lookup(
                              "System.Devices.DeviceInstanceId"), &resultItem->pnpId);
        if (ERROR_SUCCESS != err) {
          _snprintf(data->errorString, ERROR_STRING_SIZE, 
                    "EIO_List() failed to convert DeviceInstanceId to std::string. error: %d", err);
          break;
        }

        err = PlatStrToStdStr((String^)deviceInfo->Properties->Lookup(
                              "System.ItemNameDisplay"), &resultItem->displayName);
        if (ERROR_SUCCESS != err) {
          _snprintf(data->errorString, ERROR_STRING_SIZE,
                    "EIO_List() failed to convert ItemNameDisplay to std::string. error: %d", err);
          break;
        }
      }
      if (DeviceInformationKind::Device == deviceInfo->Kind) {
        err = PlatStrToStdStr((String^)deviceInfo->Properties->Lookup(
                              "System.Devices.DeviceManufacturer"), &resultItem->manufacturer);
        if (ERROR_SUCCESS != err) {
          _snprintf(data->errorString, ERROR_STRING_SIZE, 
                    "EIO_List() failed to convert DeviceManufacturer to std::string. error: %d", err);
          break;
        }
      }
    }

    data->results.push_back(resultItem);
  }
}

void EIO_Flush(uv_work_t* req) {
  VoidBaton* data = static_cast<VoidBaton*>(req->data);
  _snprintf(data->errorString, ERROR_STRING_SIZE, "EIO_Flush() not implemented");
}

void EIO_Drain(uv_work_t* req) {
  VoidBaton* data = static_cast<VoidBaton*>(req->data);
  _snprintf(data->errorString, ERROR_STRING_SIZE, "EIO_Drain() not implemented");
}