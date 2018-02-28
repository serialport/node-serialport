void setup() {
  // put your setup code here, to run once:
  pinMode(LED_BUILTIN, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  // put your main code here, to run repeatedly:
  while (Serial.available()) {
    int byte = Serial.read();
    digitalWrite(LED_BUILTIN, byte);
    Serial.write(byte);
  }
}
