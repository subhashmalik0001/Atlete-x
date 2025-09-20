import { useState, useEffect, useCallback } from 'react';

export interface EMGData {
  muscleActivity: number;
  fatigue: number;
  activated: boolean;
  timestamp: number;
}

export interface EMGDevice {
  connected: boolean;
  battery: number | null;
  device: BluetoothDevice | null;
}

export const useEMG = () => {
  const [emgData, setEmgData] = useState<EMGData>({
    muscleActivity: 0,
    fatigue: 0,
    activated: false,
    timestamp: Date.now()
  });
  
  const [device, setDevice] = useState<EMGDevice>({
    connected: false,
    battery: null,
    device: null
  });

  const [isConnecting, setIsConnecting] = useState(false);

  const connectDevice = useCallback(async () => {
    if (!navigator.bluetooth) {
      throw new Error('Bluetooth not supported');
    }

    setIsConnecting(true);
    
    try {
      const bluetoothDevice = await navigator.bluetooth.requestDevice({
        filters: [{ name: 'AthletiX-EMG' }],
        optionalServices: ['battery_service']
      });

      const server = await bluetoothDevice.gatt?.connect();
      
      setDevice({
        connected: true,
        battery: 85,
        device: bluetoothDevice
      });

      // Start listening for EMG data
      startDataStream();
      
    } catch (error) {
      console.error('Failed to connect to EMG device:', error);
      throw error;
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnectDevice = useCallback(async () => {
    if (device.device?.gatt?.connected) {
      await device.device.gatt.disconnect();
    }
    
    setDevice({
      connected: false,
      battery: null,
      device: null
    });
  }, [device.device]);

  const startDataStream = useCallback(() => {
    // Simulate real-time EMG data stream
    const interval = setInterval(() => {
      if (device.connected) {
        setEmgData({
          muscleActivity: 20 + Math.random() * 60,
          fatigue: Math.random() * 40,
          activated: Math.random() > 0.6,
          timestamp: Date.now()
        });
      } else {
        clearInterval(interval);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [device.connected]);

  const saveEMGReading = useCallback(async (testId: string) => {
    if (!device.connected) return;

    try {
      const response = await fetch('/api/emg/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          testId,
          emgData,
          timestamp: Date.now()
        })
      });

      if (!response.ok) {
        throw new Error('Failed to save EMG data');
      }

      return await response.json();
    } catch (error) {
      console.error('Error saving EMG data:', error);
      throw error;
    }
  }, [device.connected, emgData]);

  return {
    emgData,
    device,
    isConnecting,
    connectDevice,
    disconnectDevice,
    saveEMGReading
  };
};