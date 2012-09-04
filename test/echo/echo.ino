void setup()
{
  Serial.begin(57600);
}

void loop()
{
  while (Serial.available()) {
    Serial.write(Serial.read());               
  }
}
