void setup() {
  pinMode(LED_BUILTIN, OUTPUT);
  Serial.begin(9600);
  Serial.write("READY");
}

void loop() {
  while (Serial.available()) {
    int byte = Serial.read();
    if (byte == 130) {
      Serial.begin(57600);
      Serial.write("set to 57600");
    } else if (byte == 131) {
      Serial.begin(9600);
      Serial.write("set to 9600");
    } else {
      Serial.write(byte);
    }
  }
}
