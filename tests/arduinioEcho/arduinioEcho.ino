
void setup()
{
  Serial.begin(9600);
  Serial.write("READY");
}

void loop()
{
  if (Serial.available() > 0) {
    char inByte = Serial.read();
    Serial.write(toupper(inByte));               
  }
}

