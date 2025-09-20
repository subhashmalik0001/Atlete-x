#include <WiFi.h>
#include <BluetoothSerial.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
#define OLED_RESET -1

Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);
BluetoothSerial SerialBT;

const int EMG_PIN = 36;
const int SAMPLE_RATE = 50; // 50Hz
const int BUFFER_SIZE = 100;

int emgBuffer[BUFFER_SIZE];
int bufferIndex = 0;
float muscleActivity = 0;
float fatigueLevel = 0;
bool isActivated = false;

void setup() {
  Serial.begin(115200);
  SerialBT.begin("AthletiX-EMG");
  
  // Initialize OLED
  if(!display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) {
    Serial.println("SSD1306 allocation failed");
  }
  display.clearDisplay();
  display.setTextSize(1);
  display.setTextColor(WHITE);
  
  pinMode(EMG_PIN, INPUT);
  Serial.println("AthletiX EMG Sensor Ready");
}

void loop() {
  // Read EMG data
  int emgValue = analogRead(EMG_PIN);
  
  // Store in buffer
  emgBuffer[bufferIndex] = emgValue;
  bufferIndex = (bufferIndex + 1) % BUFFER_SIZE;
  
  // Calculate metrics
  muscleActivity = calculateMuscleActivity(emgValue);
  fatigueLevel = calculateFatigue();
  isActivated = emgValue > 200;
  
  // Send data via Bluetooth
  sendBluetoothData(emgValue);
  
  // Update display
  updateDisplay();
  
  delay(1000 / SAMPLE_RATE);
}

float calculateMuscleActivity(int emgValue) {
  return map(emgValue, 0, 4095, 0, 100);
}

float calculateFatigue() {
  // Simple fatigue calculation based on signal variance
  float sum = 0, variance = 0;
  for(int i = 0; i < BUFFER_SIZE; i++) {
    sum += emgBuffer[i];
  }
  float mean = sum / BUFFER_SIZE;
  
  for(int i = 0; i < BUFFER_SIZE; i++) {
    variance += pow(emgBuffer[i] - mean, 2);
  }
  variance /= BUFFER_SIZE;
  
  return map(variance, 0, 1000000, 0, 100);
}

void sendBluetoothData(int emgValue) {
  String data = "{";
  data += "\"emg\":" + String(emgValue) + ",";
  data += "\"muscleActivity\":" + String(muscleActivity) + ",";
  data += "\"fatigue\":" + String(fatigueLevel) + ",";
  data += "\"activated\":" + String(isActivated ? "true" : "false");
  data += "}";
  
  SerialBT.println(data);
}

void updateDisplay() {
  display.clearDisplay();
  
  display.setCursor(0, 0);
  display.println("AthletiX EMG");
  
  display.setCursor(0, 16);
  display.print("Activity: ");
  display.print(muscleActivity, 1);
  display.println("%");
  
  display.setCursor(0, 32);
  display.print("Fatigue: ");
  display.print(fatigueLevel, 1);
  display.println("%");
  
  display.setCursor(0, 48);
  display.print("Status: ");
  display.println(isActivated ? "ACTIVE" : "REST");
  
  display.display();
}