#define READY 0
#define SET_BAUD_57600 130
#define SET_BAUD_9600 131

void setup() {
  pinMode(LED_BUILTIN, OUTPUT);
  Serial.begin(9600);
  Serial.write(READY);
}

void loop() {
  while (Serial.available()) {
    int byte = Serial.read();
    switch (byte) {
      case SET_BAUD_57600:
        Serial.end();
        Serial.begin(57600);
        delay(500);
        Serial.write(SET_BAUD_57600);
        break;
      case SET_BAUD_9600:
        Serial.end();
        Serial.begin(9600);
        delay(500);
        Serial.write(SET_BAUD_57600);
        break;
      default:
        Serial.write(byte);
        break;
    }
  }
}

