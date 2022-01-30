
void setup() {
  pinMode(LED_BUILTIN, OUTPUT);
  Serial.begin(115200);
  Serial.write("READY");
}

void loop() {
  while (Serial.available()) {
    uint8_t oneByteData = Serial.read();
    Serial.write(oneByteData);
  }
}
