

import React, { useState, useEffect } from 'react';
import type { OrientationFeedbackModalProps } from '../../constants/types';
import { API_ENDPOINTS } from '../../constants/api';
import { ModalHeader } from '../../molecules/ModalHeader/ModalHeader';
import { UserInfoSection } from '../../molecules/UserInfoSection/UserInfoSection';
import { OrientationForm } from '../../molecules/OrientationForm/OrientationForm';
import { ModalFooter } from '../../molecules/ModalFooter/ModalFooter';
import { toast } from 'react-hot-toast';

export const OrientationFeedbackModal: React.FC<OrientationFeedbackModalProps> = ({
  user,
  onClose,
  onSave,
}) => {
  // ------------------------------------------------------------------
  // 1. Form state – matches OrientationForm fields
  // ------------------------------------------------------------------
  const [orientationFields, setOrientationFields] = useState({
    emp_id: '',
    date_of_joining: '',
    birth_date: '',
    department: '',
    sub_department: '',
    designation: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();

  // Reset on user change
  useEffect(() => {
    setOrientationFields({
      emp_id: '',
      date_of_joining: '',
      birth_date: '',
      department: '',
      sub_department: '',
      designation: '',
    });
    setError(undefined);
  }, [user]);

  // ------------------------------------------------------------------
  // 2. SAVE TO MASTER TABLE
  // ------------------------------------------------------------------
  const handleSave = async () => {
    setLoading(true);
    setError(undefined);

    // Build payload for MasterTable (exact field names Django expects)
    const payload = {
      emp_id: orientationFields.emp_id,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      phone: user.phone_number,
      sex: user.sex,
      department: orientationFields.department ? Number(orientationFields.department) : null,
      sub_department: orientationFields.sub_department
        ? Number(orientationFields.sub_department)
        : null, // SUB-DEPARTMENT SAVED!
      date_of_joining: orientationFields.date_of_joining,
      designation: orientationFields.designation || null,
      birth_date: orientationFields.birth_date || null,
    };

    const readApiError = async (response: Response, fallback: string) => {
      const errorData = await response.json().catch(() => ({}));
      if (typeof errorData.detail === 'string') return errorData.detail;

      const fieldErrors = Object.entries(errorData)
        .map(([field, messages]) => {
          const text = Array.isArray(messages) ? messages.join(', ') : String(messages);
          return `${field}: ${text}`;
        })
        .filter(Boolean);
      return fieldErrors.join('\n') || fallback;
    };

    try {
      // 1. POST to master table
      const masterRes = await fetch(`${API_ENDPOINTS.BASE_URL}${API_ENDPOINTS.EMPLOYEES}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!masterRes.ok) {
        throw new Error(await readApiError(masterRes, 'Failed to save employee'));
      }

      // 2. Mark temp user as added (PATCH)
      const patchRes = await fetch(`${API_ENDPOINTS.BASE_URL}/user-body-checks/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          temp_id: user.temp_id,
          emp_id: orientationFields.emp_id // Save the Employee ID to the user record
        }),
      });

      if (!patchRes.ok) {
        throw new Error(await readApiError(patchRes, 'Failed to mark user as added'));
      }

      toast.success('Employee added to master table!');
      onSave?.(); // refresh parent list
      onClose?.();
    } catch (err: any) {
      const msg = err.message || 'Something went wrong';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // ------------------------------------------------------------------
  // 3. RENDER
  // ------------------------------------------------------------------
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-2xl">
          <ModalHeader user={user} onClose={onClose} />
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          <UserInfoSection user={user} />

          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
            {/* Pass user.id so OrientationForm can link the record */}
            <OrientationForm
              orientationFields={orientationFields}
              setOrientationFields={setOrientationFields}
              error={error}
              userId={user.id}
              onSaveSuccess={() => {
                // Optional: auto-close or extra logic
              }}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="border-t bg-gray-50 rounded-b-2xl px-6 py-4">
          <ModalFooter onClose={onClose} onSave={handleSave} loading={loading} />
        </div>
      </div>
    </div>
  );
};

export default OrientationFeedbackModal;