const int ledPin = 11;

void setup() {
  pinMode(ledPin, OUTPUT);
  Serial.begin(9600);
  Serial.write("READY");
}

void loop() {

  while (Serial.available()) {
    digitalWrite(ledPin, HIGH);
    Serial.write(Serial.read());
  }

  delay(100);
  digitalWrite(ledPin, LOW);
}
