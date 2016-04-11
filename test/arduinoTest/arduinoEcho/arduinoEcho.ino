void setup() {
  pinMode(LED_BUILTIN, OUTPUT);
  Serial.begin(9600);
  Serial.write("READY");
}

void loop() {
  while (Serial.available()) {
    digitalWrite(LED_BUILTIN, HIGH);
    Serial.write(Serial.read());
  }
  digitalWrite(LED_BUILTIN, LOW);
}
