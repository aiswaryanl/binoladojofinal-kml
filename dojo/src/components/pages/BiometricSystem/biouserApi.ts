// src/api/biouserApi.ts
import axios from 'axios';

const API_URL = 'http://192.168.2.51:8000/biouser/';

export interface BioUser {
  id: number;
  employeeid: string;
  first_name: string;
  last_name: string;
  enrollments?: any[]; // To see where they are enrolled
}

export const getBioUsers = async (): Promise<BioUser[]> => {
  const res = await axios.get<BioUser[]>(API_URL);
  return res.data;
};

export const addBioUser = async (user: Omit<BioUser, 'id'>): Promise<BioUser> => {
  const res = await axios.post<BioUser>(API_URL, user);
  return res.data;
};

export const deleteBioUser = async (id: number): Promise<void> => {
  await axios.delete(`${API_URL}${id}/`);
};

// --- UPDATED ENROLLMENT FUNCTIONS ---

// Enroll face now requires Device ID
export const enrollFace = async (id: number, deviceId: number, is_overwrite = false): Promise<any> => {
  const res = await axios.post(`${API_URL}${id}/enroll_face/`, {
    device_id: deviceId,
    is_overwrite
  });
  return res.data;
};

// Enroll fingerprint now requires Device ID
export const enrollFingerprint = async (
  id: number,
  deviceId: number,
  finger_index = 1,
  is_overwrite = false
): Promise<any> => {
  const res = await axios.post(`${API_URL}${id}/enroll_fingerprint/`, {
    device_id: deviceId,
    finger_index,
    is_overwrite,
  });
  return res.data;
};

// NEW: Manual Sync Function
export const syncUserToDevice = async (id: number, deviceId: number): Promise<any> => {
  const res = await axios.post(`${API_URL}${id}/sync_to_device/`, {
    device_id: deviceId
  });
  return res.data;
};

// // src/api/biouserApi.ts
// import axios from 'axios';

// // const API_URL = 'http://192.168.2.51:8000/biouser/'; // Change if needed
// const API_URL = 'http://192.168.2.51:8000/biouser/'; // Change if needed

// export interface BioUser {
//   id: number;
//   employeeid: string;
//   first_name: string;
//   last_name: string;
// }

// export const getBioUsers = async (): Promise<BioUser[]> => {
//   const res = await axios.get<BioUser[]>(API_URL);
//   return res.data;
// };

// export const addBioUser = async (user: Omit<BioUser, 'id'>): Promise<BioUser> => {
//   const res = await axios.post<BioUser>(API_URL, user);
//   return res.data;
// };

// export const deleteBioUser = async (id: number): Promise<void> => {
//   await axios.delete(`${API_URL}${id}/`);
// };


// // Enroll face
// export const enrollFace = async (id: number, is_overwrite = false): Promise<any> => {
//   const res = await axios.post(`${API_URL}${id}/enroll_face/`, { is_overwrite });
//   return res.data;
// };


// // Enroll fingerprint
// export const enrollFingerprint = async (
//   id: number,
//   finger_index = 1,
//   is_overwrite = false
// ): Promise<any> => {
//   const res = await axios.post(`${API_URL}${id}/enroll_fingerprint/`, {
//     finger_index,
//     is_overwrite,
//   });
//   return res.data;
// };