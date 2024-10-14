#include <LiquidCrystal.h>

#define SOIL_MOISTURE_PIN A0
#define RELAY_PIN 2
#define ledred 3
#define ledgreen 4

// Initialize the LCD with the pins you specified
LiquidCrystal lcd(7, 8, 9, 10, 11, 12);

void setup() {
  pinMode(SOIL_MOISTURE_PIN, INPUT);
  pinMode(RELAY_PIN, OUTPUT);
  pinMode(ledred, OUTPUT);
  pinMode(ledgreen, OUTPUT);
  digitalWrite(RELAY_PIN, HIGH);  // Turn off the pump initially
  Serial.begin(9600);

  // Initialize the LCD with 16 columns and 2 rows
  lcd.begin(16, 2);
  lcd.print("Smart Irrigation");
}

void loop() {
  int soilMoistureValue = analogRead(SOIL_MOISTURE_PIN);
  Serial.print("Soil Moisture: ");
  Serial.println(soilMoistureValue);

  lcd.setCursor(0, 1);  // Move cursor to the second line
  lcd.print("Soil: ");
  lcd.print(soilMoistureValue);
  lcd.print(" ");

  
  if (soilMoistureValue < 300) {
     
    digitalWrite(RELAY_PIN, LOW); 
    digitalWrite(ledred, LOW);
    digitalWrite(ledgreen, HIGH); 
    lcd.setCursor(12, 1);
    lcd.print("stop");
  } else {
    digitalWrite(RELAY_PIN, HIGH);
    digitalWrite(ledred, HIGH);
    digitalWrite(ledgreen, LOW);  
    lcd.setCursor(12, 1);
    lcd.print("Start");
  }
  
  delay(2000);  // Wait for 2 seconds before next loop
}
