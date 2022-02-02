void setup() {
  pinMode(LED_BUILTIN, OUTPUT);
  Serial.begin(115200);
}

void loop() {
  while (Serial.available()) {
    uint8_t oneByteData = Serial.read();
    Serial.write(oneByteData);
  }
}
