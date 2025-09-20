# AthletiX EMG Sensor Assembly Guide

## Components Required
- Muscle BioAmp Patchy v0.2
- ESP32-WROOM-32 Development Board
- 0.96" OLED Display (I2C)
- 3.7V Li-Po Battery (1000mAh)
- TP4056 Charging Module
- Jumper Wires (Female-Female)
- Project Box
- Elastic Strap

## Wiring Connections

### Muscle BioAmp Patchy → ESP32
```
VCC → 3.3V
GND → GND
OUT → GPIO 36 (ADC1_CH0)
```

### OLED Display → ESP32
```
VCC → 3.3V
GND → GND
SDA → GPIO 21
SCL → GPIO 22
```

### Power System
```
Battery → TP4056 → ESP32 VIN
TP4056 GND → ESP32 GND
```

## Assembly Steps

1. **Prepare the ESP32**
   - Flash the firmware (emg_firmware.ino)
   - Test basic functionality

2. **Connect Sensors**
   - Wire Muscle BioAmp Patchy to ESP32
   - Connect OLED display
   - Test sensor readings

3. **Power Integration**
   - Connect TP4056 charging module
   - Wire battery to power system
   - Test charging functionality

4. **Enclosure Assembly**
   - Mount components in project box
   - Ensure EMG sensor electrodes are accessible
   - Secure all connections

5. **Strap Attachment**
   - Attach elastic strap for wearable mounting
   - Position for optimal muscle contact

## Usage Instructions

1. **Power On**
   - Press power button
   - Wait for "AthletiX EMG Sensor Ready" message

2. **Electrode Placement**
   - Clean skin with alcohol
   - Place electrodes on target muscle
   - Ensure good contact

3. **Bluetooth Pairing**
   - Open AthletiX web app
   - Go to Tests page
   - Click "Pair EMG Sensor"
   - Select "AthletiX-EMG" device

4. **Data Collection**
   - Start athletic test
   - Monitor real-time EMG data
   - View muscle activity, fatigue, and activation status

## Troubleshooting

- **No Bluetooth Connection**: Check device name and pairing
- **No EMG Signal**: Verify electrode placement and skin contact
- **Display Issues**: Check I2C connections (SDA/SCL)
- **Power Problems**: Verify battery charge and connections

## Maintenance

- Charge battery when indicator shows low
- Clean electrodes after each use
- Store in dry environment
- Update firmware as needed