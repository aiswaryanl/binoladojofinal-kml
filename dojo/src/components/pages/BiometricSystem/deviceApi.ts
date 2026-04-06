// src/api/deviceApi.ts
import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000/biometric-devices/';

export interface BiometricDevice {
  id: number;
  name: string;
  ip_address: string;
  serial_number: string;
  port: number;
  username?: string; // Optional in UI, backend has default
  password?: string; // Optional in UI, backend has default

  machine_name?: string;           // READ: The name of the connected machine
  linked_machine_id?: number | null; // WRITE: The ID to update
}

// GET List
export const getBiometricDevices = async (): Promise<BiometricDevice[]> => {
  const res = await axios.get<BiometricDevice[]>(API_URL);
  return res.data;
};



// POST Create
export const createBiometricDevice = async (data: Omit<BiometricDevice, 'id'>): Promise<BiometricDevice> => {
  const res = await axios.post<BiometricDevice>(API_URL, data);
  return res.data;
};

// PUT Update
export const updateBiometricDevice = async (id: number, data: Partial<BiometricDevice>): Promise<BiometricDevice> => {
  const res = await axios.put<BiometricDevice>(`${API_URL}${id}/`, data);
  return res.data;
};

// DELETE
export const deleteBiometricDevice = async (id: number): Promise<void> => {
  await axios.delete(`${API_URL}${id}/`);
};