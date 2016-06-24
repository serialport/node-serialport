#include "serialport.h"
#include <nan.h>
#include <ppltasks.h>
#include <array>

#define MAX_BUFFER_SIZE 1000
const int MAX_DEVICES = 256; 

using namespace concurrency;
using namespace Platform;
using namespace Windows::Devices::Enumeration;
using namespace Windows::Devices::SerialCommunication;
using namespace Windows::Foundation;
using namespace Windows::Storage::Streams;

struct WindowsPlatformOptions : OpenBatonPlatformOptions
{
};

OpenBatonPlatformOptions* ParsePlatformOptions(const v8::Local<v8::Object>& options) {
  // currently none
  return new WindowsPlatformOptions();
}

int bufferSize;
std::array<SerialDevice^, MAX_DEVICES> g_devices{};

std::string PlatformStringToStdStr(String^ platStr) {
  if (0 == platStr->Length()) {
      return "";
  }
  std::wstring wStr(platStr->Data());
  auto wideData = wStr.c_str();
  int bufferSize = WideCharToMultiByte(CP_UTF8, 0, wideData, -1, nullptr, 0, NULL, NULL);
  auto utf8 = std::make_unique<char[]>(bufferSize);
  if (0 == WideCharToMultiByte(CP_UTF8, 0, wideData, -1, utf8.get(), bufferSize, NULL, NULL)) {
    throw std::exception("Can't convert string to UTF8");
  }
  return std::string(utf8.get());
}

void EIO_Open(uv_work_t* req) {
  OpenBaton* data = static_cast<OpenBaton*>(req->data);
  UINT16 vid = 0;
  UINT16 pid = 0;
  std::wstring serialStr;
  SerialDevice^ device;

  bufferSize = data->bufferSize;
  if (bufferSize > MAX_BUFFER_SIZE || bufferSize == 0) {
    bufferSize = MAX_BUFFER_SIZE;
  }
  
  // data->path (name of the device passed in to the 'open' function of serialport)
  // can either be a regular port name like "COM1" or "UART2" or it can be the device
  // ID (if not port name is assigned). serialport.list method should be used to get
  // the name or ID to use.

  std::string s_str = std::string(data->path);
  std::wstring wid_str = std::wstring(s_str.begin(), s_str.end());
  const wchar_t* w_char = wid_str.c_str();
  String^ deviceId = ref new String(w_char);

  try {
    device = create_task(SerialDevice::FromIdAsync(deviceId)).get();
  } catch (Exception^ e) {
    _snprintf(data->errorString, ERROR_STRING_SIZE, "unable to open %s", data->path);
    return;
  }

  if (data->hupcl == false) {
    device->IsDataTerminalReadyEnabled = false; // disable DTR to avoid reset 
  }
  else {
    device->IsDataTerminalReadyEnabled = true;
  }

  device->BaudRate = CBR_9600;
  device->Parity = SerialParity::None;
  device->DataBits = 8;
  device->StopBits = SerialStopBitCount::One;
  device->Handshake = SerialHandshake::None;
  device->IsRequestToSendEnabled = true;

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

  int i = 0;
  bool deviceSpaceFull = true;

  for (; i < MAX_DEVICES; i++) {
    if(g_devices[i] == nullptr) { 
      g_devices[i] = device;
      deviceSpaceFull = false;
      break;
    }
  }

  if (deviceSpaceFull) {
    _snprintf(data->errorString, ERROR_STRING_SIZE, "limit reached for open serial devices");
    return;
  }

  data->result = i;
}

struct WatchPortBaton {
  int deviceIndex;
  DWORD bytesRead;
  char buffer[MAX_BUFFER_SIZE];
  char errorString[ERROR_STRING_SIZE];
  DWORD errorCode;
  bool disconnected;
  Nan::Callback* dataCallback;
  Nan::Callback* errorCallback;
  Nan::Callback* disconnectedCallback;
};

void EIO_Update(uv_work_t* req) {
}

void EIO_Set(uv_work_t* req) {
}

void EIO_WatchPort(uv_work_t* req) {
  WatchPortBaton* data = static_cast<WatchPortBaton*>(req->data);
  data->bytesRead = 0;
  data->disconnected = false;

  DataReader^ dataReader = ref new DataReader(g_devices[data->deviceIndex]->InputStream);
  dataReader->InputStreamOptions = InputStreamOptions::Partial;

  auto bytesToRead = concurrency::create_task(dataReader->LoadAsync((unsigned int)bufferSize)).get();
  try {
    memset(data->buffer, 0, MAX_BUFFER_SIZE);
    // Keep reading until we consume the complete stream.
    while (dataReader->UnconsumedBufferLength > 0) {
      unsigned char byteReceived = dataReader->ReadByte();
      data->buffer[data->bytesRead] = byteReceived;
      data->bytesRead++;
    }
  }
  catch (Exception^ e) {
    data->errorCode = e->HResult;
	_snprintf(data->errorString, ERROR_STRING_SIZE, PlatformStringToStdStr(e->Message).data());
  }
  dataReader->DetachStream();
}

void DisposeWatchPortCallbacks(WatchPortBaton* data) {
  delete data->dataCallback;
  delete data->errorCallback;
  delete data->disconnectedCallback;
}

// FinalizerCallback will prevent WatchPortBaton::buffer from getting
// collected by gc while finalizing v8::ArrayBuffer. The buffer will
// get cleaned up through this callback.
static void FinalizerCallback(char* data, void* hint) {
  uv_work_t* req = reinterpret_cast<uv_work_t*>(hint);
  WatchPortBaton* wpb = static_cast<WatchPortBaton*>(req->data);
  delete wpb;
  delete req;
}

void EIO_AfterWatchPort(uv_work_t* req) {
  Nan::HandleScope scope;

  WatchPortBaton* data = static_cast<WatchPortBaton*>(req->data);
  if(data->disconnected) {
    data->disconnectedCallback->Call(0, NULL);
    DisposeWatchPortCallbacks(data);
    goto cleanup;
  }

  bool skipCleanup = false;
  if(data->bytesRead > 0) {
    v8::Local<v8::Value> argv[1];
    argv[0] = Nan::NewBuffer(data->buffer, data->bytesRead, FinalizerCallback, req).ToLocalChecked();
    skipCleanup = true;
    data->dataCallback->Call(1, argv);
  } else if(data->errorCode > 0) {
    v8::Local<v8::Value> argv[1];
    argv[0] = Nan::Error(data->errorString);
    data->errorCallback->Call(1, argv);
    Sleep(100); // prevent the errors from occurring too fast
  }
  AfterOpenSuccess(data->deviceIndex, data->dataCallback, data->disconnectedCallback, data->errorCallback);

cleanup:
  if (!skipCleanup) {
    delete data;
    delete req;
  }
}

void AfterOpenSuccess(int deviceIndex, Nan::Callback* dataCallback, Nan::Callback* disconnectedCallback, Nan::Callback* errorCallback) {
  WatchPortBaton* baton = new WatchPortBaton();
  memset(baton, 0, sizeof(WatchPortBaton));
  baton->deviceIndex = deviceIndex;
  baton->dataCallback = dataCallback;
  baton->errorCallback = errorCallback;
  baton->disconnectedCallback = disconnectedCallback;

  uv_work_t* req = new uv_work_t();
  req->data = baton;

  uv_queue_work(uv_default_loop(), req, EIO_WatchPort, (uv_after_work_cb)EIO_AfterWatchPort);
}

void EIO_Write(uv_work_t* req) {
  QueuedWrite* queuedWrite = static_cast<QueuedWrite*>(req->data);
  WriteBaton* data = static_cast<WriteBaton*>(queuedWrite->baton);
  data->result = 0;

  try {
    if (!g_devices[data->fd]) {
      _snprintf(data->errorString, ERROR_STRING_SIZE, "%d: write failed, invalid device", data->fd);
      return;
    }
  }
  catch (const std::out_of_range& e) {
    _snprintf(data->errorString, ERROR_STRING_SIZE, "%d: write failed, out of range", data->fd);
    return;
  }

  DataWriter^ dataWriter = ref new DataWriter(g_devices[data->fd]->OutputStream);
  dataWriter->WriteBytes(ref new Array<byte>((byte*)data->bufferData, data->bufferLength));
  auto bytesStored = concurrency::create_task(dataWriter->StoreAsync()).get();
  data->result = bytesStored;
  if(data->bufferLength == bytesStored) {
    data->offset = data->bufferLength;
  }
  dataWriter->DetachStream();
}

void EIO_Close(uv_work_t* req) {
  CloseBaton* data = static_cast<CloseBaton*>(req->data);

  if (g_devices[data->fd]) {
    delete g_devices[data->fd];
    g_devices[data->fd] = nullptr;
  }
}

void EIO_List(uv_work_t* req) {
  ListBaton* data = static_cast<ListBaton*>(req->data);

  String ^aqs = SerialDevice::GetDeviceSelector();
  
  auto deviceInfoCollection = concurrency::create_task(DeviceInformation::FindAllAsync(aqs)).get();
  if (deviceInfoCollection->Size < 1) {
    _snprintf(data->errorString, ERROR_STRING_SIZE, "no serial devices found to list");
    return;
  }

  for (size_t i = 0; i < deviceInfoCollection->Size; i++) {
    ListResultItem* resultItem = new ListResultItem();

    auto serialDevice = concurrency::create_task(SerialDevice::FromIdAsync(deviceInfoCollection->GetAt(i)->Id)).get();
    if (!serialDevice) {
      continue;
    }

    // Get the port name or ID
    String^ comName = serialDevice->PortName;
    if (comName == nullptr) {
      // Show the device ID if a port name has not been assigned
      comName = deviceInfoCollection->GetAt(i)->Id;
    }

    resultItem->comName = PlatformStringToStdStr(comName);
    std::string nameToPrint;

    // Double the backslashes so printed port name includes escape characters
    for (int i = 0; i < resultItem->comName.length(); i++) {
      if ('\\' == resultItem->comName.at(i)) {
        nameToPrint += '\\';
      }
      nameToPrint += resultItem->comName.at(i);
    }
    resultItem->comName = nameToPrint;

    // Get the vendor ID
    resultItem->vendorId = std::to_string(serialDevice->UsbVendorId);

    // Get the product ID
    resultItem->productId = std::to_string(serialDevice->UsbProductId);

    resultItem->manufacturer = ""; // Property not available in SerialDevice class
    resultItem->pnpId = ""; // Property not available in SerialDevice class

    data->results.push_back(resultItem);
  }
}

void EIO_Flush(uv_work_t* req) {
}

void EIO_Drain(uv_work_t* req) {
}