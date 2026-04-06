// import React, { useState } from 'react';
// import { User, Mail, Phone, VenusAndMars, IdCard, Building2, Briefcase } from 'lucide-react';
// import { Input } from '../../atoms/Inputs/Inputs';
// import SelectField from '../../atoms/Select/select';
// import { saveUserInfo } from '../../hooks/ServiceApis';
// import { PhotoUpload } from '../../molecules/PhotoUpload/PhotoUpload';
// import { ProgressBar } from '../../atoms/ProgressBarPercentage/ProgressBarPercentage';
// import { FormActions } from '../../molecules/FormAction/FormAction';
// import { StatusAlert } from '../../molecules/StatusAlert/StatusAlert';
// import { useNavigate } from 'react-router-dom';

// interface UserInfo {
//   firstName: string;
//   lastName: string;
//   email: string;
//   phoneNumber: string;
//   sex: string;
//   photo: File | null;
//   aadharNumber: string;
//   employmentType: 'contractual' | 'permanent' | '';

//   hasExperience: boolean;
//   experienceYears: string;
//   companyOfExperience: string;
// }

// export const UserInfoForm: React.FC = () => {
//   const navigate = useNavigate();
//   const [userInfo, setUserInfo] = useState<UserInfo>({
//     firstName: '',
//     lastName: '',
//     email: '',
//     phoneNumber: '',
//     sex: 'M',
//     photo: null,
//     aadharNumber: '',
//     employmentType: '',

//     hasExperience: false,
//     experienceYears: '',
//     companyOfExperience: '',
//   });

//   const [errors, setErrors] = useState<Record<string, string>>({});
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [formStatus, setFormStatus] = useState<'idle' | 'success' | 'error' | 'submitting'>('idle');
//   const [submitError, setSubmitError] = useState<string | null>(null);
//   const [photoPreview, setPhotoPreview] = useState<string | null>(null);

//   const handleInputChange = (field: keyof UserInfo, value: any) => {
//     setUserInfo(prev => ({
//       ...prev,
//       [field]: value
//     }));

//     if (errors[field as string]) {
//       setErrors(prev => ({ ...prev, [field as string]: '' }));
//     }
//   };

//   const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0] || null;
//     if (!file) return;

//     if (!file.type.startsWith('image/')) {
//       setErrors(prev => ({ ...prev, photo: 'Please select an image file' }));
//       return;
//     }
//     if (file.size > 5 * 1024 * 1024) {
//       setErrors(prev => ({ ...prev, photo: 'Image must be less than 5MB' }));
//       return;
//     }

//     handleInputChange('photo', file);

//     const reader = new FileReader();
//     reader.onload = () => setPhotoPreview(reader.result as string);
//     reader.readAsDataURL(file);
//   };

//   const validateForm = (): boolean => {
//     const newErrors: Record<string, string> = {};

//     if (!userInfo.firstName.trim()) {
//       newErrors.firstName = 'First Name is required';
//     }
//     if (!userInfo.lastName.trim()) {
//       newErrors.lastName = 'Last Name is required';
//     }

//     // phoneNumber is required per your model
//     if (!userInfo.phoneNumber.trim()) {
//       newErrors.phoneNumber = 'Phone Number is required';
//     }

//     // If experience is checked, both fields are required (matches your model.clean)
//     if (userInfo.hasExperience) {
//       if (!userInfo.experienceYears || String(userInfo.experienceYears).trim() === '') {
//         newErrors.experienceYears = 'Experience years is required when experience is selected.';
//       }
//       if (!userInfo.companyOfExperience.trim()) {
//         newErrors.companyOfExperience = 'Company of experience is required when experience is selected.';
//       }
//     }

//     // Aadhar validation — if provided must be exactly 12 digits (model enforces this)
//     if (userInfo.aadharNumber && userInfo.aadharNumber.trim().length !== 12) {
//       newErrors.aadharNumber = 'Aadhar number must be exactly 12 digits.';
//     }

//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!validateForm()) return;

//     setFormStatus('submitting');
//     setIsSubmitting(true);
//     setSubmitError(null);

//     try {
//       const formData = new FormData();

//       // serializer expects camelCase for these mapped fields
//       formData.append('firstName', userInfo.firstName);
//       formData.append('lastName', userInfo.lastName);
//       formData.append('email', userInfo.email || '');
//       formData.append('phoneNumber', userInfo.phoneNumber);
//       formData.append('sex', userInfo.sex);

//       if (userInfo.photo instanceof File) {
//         formData.append('photo', userInfo.photo);
//       }

//       // serializer expects aadharNumber (camelCase) and also an employment_type snake_case field
//       formData.append('aadharNumber', userInfo.aadharNumber || '');
//       // IMPORTANT: serializer's `fields` includes 'employment_type' (snake_case)
//       formData.append('employment_type', userInfo.employmentType || '');

//       // serializer maps hasExperience -> source='experience'
//       formData.append('hasExperience', String(userInfo.hasExperience));
//       formData.append('experienceYears', userInfo.experienceYears || '');
//       formData.append('companyOfExperience', userInfo.companyOfExperience || '');

//       // Debugging: uncomment to inspect formData entries in console while developing
//       for (const pair of formData.entries()) {
//         console.log(pair[0], pair[1]);
//       }

//       const response = await saveUserInfo(formData);

//       if (!response.ok) {
//         let message = 'Failed to save user info';
//         try {
//           const errorData = await response.json();
//           message =
//             errorData.detail ||
//             errorData.message ||
//             (typeof errorData === 'object' ? Object.values(errorData).flat().join('\n') : String(errorData));
//         } catch (err) {
//           message = `Server returned status ${response.status}`;
//         }

//         setFormStatus('error');
//         setSubmitError(message);
//         return;
//       }

//       setFormStatus('success');
//       setTimeout(() => navigate('/TempEmployeeSearch'), 1500);
//     } catch (error: unknown) {
//       setFormStatus('error');
//       setSubmitError(error instanceof Error ? error.message : 'An unknown error occurred.');
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   const handleReset = () => {
//     setUserInfo({
//       firstName: '',
//       lastName: '',
//       email: '',
//       phoneNumber: '',
//       sex: 'M',
//       photo: null,
//       aadharNumber: '',
//       employmentType: '',

//       hasExperience: false,
//       experienceYears: '',
//       companyOfExperience: '',
//     });
//     setErrors({});
//     setPhotoPreview(null);
//   };

//   const genderOptions = [
//     { value: 'M', label: 'Male' },
//     { value: 'F', label: 'Female' },
//     { value: 'O', label: 'Other' }
//   ];

//   return (
//     <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
//       <div className="max-w-4xl mx-auto relative z-10">
//         <div className="bg-white/80 backdrop-blur-sm shadow-2xl rounded-3xl border border-white/50 overflow-hidden">
//           <ProgressBar progress={33} />

//           <form onSubmit={handleSubmit} className="p-10">
//             <div className="space-y-10">
//               {/* First / Last Name */}
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
//                 <Input
//                   label="First Name"
//                   type="text"
//                   id="firstName"
//                   value={userInfo.firstName}
//                   onChange={(e) => handleInputChange('firstName', e.target.value)}
//                   required
//                   error={errors.firstName}
//                   icon={<User className="h-5 w-5 text-gray-400" />}
//                 />
//                 <Input
//                   label="Last Name"
//                   type="text"
//                   id="lastName"
//                   value={userInfo.lastName}
//                   onChange={(e) => handleInputChange('lastName', e.target.value)}
//                   icon={<User className="h-5 w-5 text-gray-400" />}
//                 />
//               </div>

//               {/* Email / Phone */}
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
//                 <Input
//                   label="Email Address"
//                   type="email"
//                   id="email"
//                   value={userInfo.email}
//                   onChange={(e) => handleInputChange('email', e.target.value)}
//                   icon={<Mail className="h-5 w-5 text-gray-400" />}
//                 />
//                 <Input
//                   label="Phone Number"
//                   type="tel"
//                   id="phoneNumber"
//                   value={userInfo.phoneNumber}
//                   onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
//                   required
//                   error={errors.phoneNumber}
//                   icon={<Phone className="h-5 w-5 text-gray-400" />}
//                 />
//               </div>

//               {/* Gender / Photo */}
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
//                 <SelectField
//                   label="Gender"
//                   id="sex"
//                   value={userInfo.sex}
//                   onChange={(e) => handleInputChange('sex', e.target.value)}
//                   options={genderOptions}
//                   required
//                   icon={<VenusAndMars className="h-5 w-5 text-gray-400" />}
//                 />
//                 <PhotoUpload
//                   photoPreview={photoPreview}
//                   error={errors.photo}
//                   onChange={handlePhotoChange}
//                   currentFileName={userInfo.photo instanceof File ? userInfo.photo.name : undefined}
//                 />
//               </div>

//               {/* Aadhar */}
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
//                 <Input
//                   label="Aadhar Number"
//                   type="text"
//                   id="aadharNumber"
//                   value={userInfo.aadharNumber}
//                   onChange={(e) => handleInputChange('aadharNumber', e.target.value)}
//                   optional
//                   error={errors.aadharNumber}
//                   icon={<IdCard className="h-5 w-5 text-gray-400" />}
//                 />
//               </div>

//               {/* Employment Type */}
//               <div className="flex items-center gap-6">
//                 <label className="font-medium">Employment Type:</label>
//                 <label className="flex items-center gap-2">
//                   <input
//                     type="radio"
//                     name="employmentType"
//                     value="contractual"
//                     checked={userInfo.employmentType === 'contractual'}
//                     onChange={(e) => handleInputChange('employmentType', e.target.value)}
//                   />
//                   Contractual
//                 </label>
//                 <label className="flex items-center gap-2">
//                   <input
//                     type="radio"
//                     name="employmentType"
//                     value="permanent"
//                     checked={userInfo.employmentType === 'permanent'}
//                     onChange={(e) => handleInputChange('employmentType', e.target.value)}
//                   />
//                   Permanent
//                 </label>
//               </div>

//               {/* Experience Section */}
//               <div>
//                 <label className="flex items-center gap-2">
//                   <input
//                     type="checkbox"
//                     checked={userInfo.hasExperience}
//                     onChange={(e) => handleInputChange('hasExperience', e.target.checked)}
//                   />
//                   Have Experience?
//                 </label>

//                 {userInfo.hasExperience && (
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
//                     <Input
//                       label="Years of Experience"
//                       type="number"
//                       id="experienceYears"
//                       value={userInfo.experienceYears}
//                       onChange={(e) => handleInputChange('experienceYears', e.target.value)}
//                       required
//                       error={errors.experienceYears}
//                       icon={<Briefcase className="h-5 w-5 text-gray-400" />}
//                     />
//                     <Input
//                       label="Company of Experience"
//                       type="text"
//                       id="companyOfExperience"
//                       value={userInfo.companyOfExperience}
//                       onChange={(e) => handleInputChange('companyOfExperience', e.target.value)}
//                       error={errors.companyOfExperience}
//                       icon={<Building2 className="h-5 w-5 text-gray-400" />}
//                     />
//                   </div>
//                 )}
//               </div>
//             </div>

//             <FormActions
//               onReset={handleReset}
//               onSubmit={handleSubmit}
//               isSubmitting={isSubmitting}
//             />
//           </form>

//           {formStatus === 'success' && (
//             <StatusAlert
//               type="success"
//               title="Profile Created Successfully!"
//               message="Your profile has been created and saved. You can now proceed to the next step."
//             />
//           )}

//           {formStatus === 'error' && (
//             <StatusAlert
//               type="error"
//               title="Something went wrong"
//               message={submitError || 'Failed to submit form. Please check your information and try again.'}
//             />
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };



import React, { useState } from 'react';
import { User, Mail, Phone, VenusAndMars, IdCard, Building2, Briefcase } from 'lucide-react';
import { Input } from '../../atoms/Inputs/Inputs';
import SelectField from '../../atoms/Select/select';
import { saveUserInfo } from '../../hooks/ServiceApis';
import { PhotoUpload } from '../../molecules/PhotoUpload/PhotoUpload';
import { ProgressBar } from '../../atoms/ProgressBarPercentage/ProgressBarPercentage';
import { FormActions } from '../../molecules/FormAction/FormAction';
import { StatusAlert } from '../../molecules/StatusAlert/StatusAlert';
import { useNavigate } from 'react-router-dom';

interface UserInfo {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  sex: string;
  photo: File | null;
  aadharNumber: string;
  employmentType: 'contractual' | 'permanent' | '';

  hasExperience: boolean;
  experienceYears: string;
  companyOfExperience: string;
}

export const UserInfoForm: React.FC = () => {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState<UserInfo>({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    sex: 'M',
    photo: null,
    aadharNumber: '',
    employmentType: '',

    hasExperience: false,
    experienceYears: '',
    companyOfExperience: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formStatus, setFormStatus] = useState<'idle' | 'success' | 'error' | 'submitting'>('idle');
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const handleInputChange = (field: keyof UserInfo, value: any) => {
    setUserInfo(prev => ({
      ...prev,
      [field]: value
    }));

    if (errors[field as string]) {
      setErrors(prev => ({ ...prev, [field as string]: '' }));
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrors(prev => ({ ...prev, photo: 'Please select an image file' }));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, photo: 'Image must be less than 5MB' }));
      return;
    }

    handleInputChange('photo', file);

    const reader = new FileReader();
    reader.onload = () => setPhotoPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // First Name is still required
    if (!userInfo.firstName.trim()) {
      newErrors.firstName = 'First Name is required';
    }

    // Phone Number is required
    if (!userInfo.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone Number is required';
    }

    // Experience fields – required only when checkbox is checked
    if (userInfo.hasExperience) {
      if (!userInfo.experienceYears || String(userInfo.experienceYears).trim() === '') {
        newErrors.experienceYears = 'Experience years is required when experience is selected.';
      }
      if (!userInfo.companyOfExperience.trim()) {
        newErrors.companyOfExperience = 'Company of experience is required when experience is selected.';
      }
    }

    // Aadhar – optional, but if provided must be 12 digits
    if (userInfo.aadharNumber && userInfo.aadharNumber.trim().length !== 12) {
      newErrors.aadharNumber = 'Aadhar number must be exactly 12 digits.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setFormStatus('submitting');
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const formData = new FormData();

      formData.append('firstName', userInfo.firstName);
      formData.append('lastName', userInfo.lastName);           // optional
      formData.append('email', userInfo.email || '');          // optional
      formData.append('phoneNumber', userInfo.phoneNumber);
      formData.append('sex', userInfo.sex);

      if (userInfo.photo instanceof File) {
        formData.append('photo', userInfo.photo);
      }

      formData.append('aadharNumber', userInfo.aadharNumber || '');
      formData.append('employment_type', userInfo.employmentType || '');

      formData.append('hasExperience', String(userInfo.hasExperience));
      formData.append('experienceYears', userInfo.experienceYears || '');
      formData.append('companyOfExperience', userInfo.companyOfExperience || '');

      const response = await saveUserInfo(formData);

      if (!response.ok) {
        let message = 'Failed to save user info';
        try {
          const errorData = await response.json();
          message =
            errorData.detail ||
            errorData.message ||
            (typeof errorData === 'object' ? Object.values(errorData).flat().join('\n') : String(errorData));
        } catch {
          message = `Server returned status ${response.status}`;
        }

        setFormStatus('error');
        setSubmitError(message);
        return;
      }

      setFormStatus('success');
      setTimeout(() => navigate('/TempEmployeeSearch'), 1500);
    } catch (error: unknown) {
      setFormStatus('error');
      setSubmitError(error instanceof Error ? error.message : 'An unknown error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setUserInfo({
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      sex: 'M',
      photo: null,
      aadharNumber: '',
      employmentType: '',
      hasExperience: false,
      experienceYears: '',
      companyOfExperience: '',
    });
    setErrors({});
    setPhotoPreview(null);
  };

  const genderOptions = [
    { value: 'M', label: 'Male' },
    { value: 'F', label: 'Female' },
    { value: 'O', label: 'Other' }
  ];

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto relative z-10">
        <div className="bg-white/80 backdrop-blur-sm shadow-2xl rounded-3xl border border-white/50 overflow-hidden">
          <ProgressBar progress={33} />

          <form onSubmit={handleSubmit} className="p-10">
            <div className="space-y-10">
              {/* First / Last Name */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Input
                  label="First Name"
                  type="text"
                  id="firstName"
                  value={userInfo.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  required
                  error={errors.firstName}
                  icon={<User className="h-5 w-5 text-gray-400" />}
                />
                {/* Last Name – now optional */}
                <Input
                  label="Last Name"
                  type="text"
                  id="lastName"
                  value={userInfo.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  optional               // visual cue (if your Input supports it)
                  icon={<User className="h-5 w-5 text-gray-400" />}
                />
              </div>

              {/* Email / Phone */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Email – now optional */}
                <Input
                  label="Email Address"
                  type="email"
                  id="email"
                  value={userInfo.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  optional
                  icon={<Mail className="h-5 w-5 text-gray-400" />}
                />
                <Input
                  label="Phone Number"
                  type="tel"
                  id="phoneNumber"
                  value={userInfo.phoneNumber}
                  onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                  required
                  error={errors.phoneNumber}
                  icon={<Phone className="h-5 w-5 text-gray-400" />}
                />
              </div>

              {/* Gender / Photo */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <SelectField
                  label="Gender"
                  id="sex"
                  value={userInfo.sex}
                  onChange={(e) => handleInputChange('sex', e.target.value)}
                  options={genderOptions}
                  required
                  icon={<VenusAndMars className="h-5 w-5 text-gray-400" />}
                />
                <PhotoUpload
                  photoPreview={photoPreview}
                  error={errors.photo}
                  onChange={handlePhotoChange}
                  currentFileName={userInfo.photo instanceof File ? userInfo.photo.name : undefined}
                />
              </div>

              {/* Aadhar */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Input
                  label="Aadhar Number"
                  type="text"
                  id="aadharNumber"
                  value={userInfo.aadharNumber}
                  onChange={(e) => handleInputChange('aadharNumber', e.target.value)}
                  optional
                  error={errors.aadharNumber}
                  icon={<IdCard className="h-5 w-5 text-gray-400" />}
                />
              </div>

              {/* Employment Type */}
              <div className="flex items-center gap-6">
                <label className="font-medium">Employment Type:</label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="employmentType"
                    value="contractual"
                    checked={userInfo.employmentType === 'contractual'}
                    onChange={(e) => handleInputChange('employmentType', e.target.value)}
                  />
                  Contractual
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="employmentType"
                    value="permanent"
                    checked={userInfo.employmentType === 'permanent'}
                    onChange={(e) => handleInputChange('employmentType', e.target.value)}
                  />
                  Permanent
                </label>
              </div>

              {/* Experience Section */}
              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={userInfo.hasExperience}
                    onChange={(e) => handleInputChange('hasExperience', e.target.checked)}
                  />
                  Have Experience?
                </label>

                {userInfo.hasExperience && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
                    <Input
                      label="Years of Experience"
                      type="number"
                      id="experienceYears"
                      value={userInfo.experienceYears}
                      onChange={(e) => handleInputChange('experienceYears', e.target.value)}
                      required
                      error={errors.experienceYears}
                      icon={<Briefcase className="h-5 w-5 text-gray-400" />}
                    />
                    <Input
                      label="Company of Experience"
                      type="text"
                      id="companyOfExperience"
                      value={userInfo.companyOfExperience}
                      onChange={(e) => handleInputChange('companyOfExperience', e.target.value)}
                      error={errors.companyOfExperience}
                      icon={<Building2 className="h-5 w-5 text-gray-400" />}
                    />
                  </div>
                )}
              </div>
            </div>

            <FormActions
              onReset={handleReset}
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
            />
          </form>

          {formStatus === 'success' && (
            <StatusAlert
              type="success"
              title="Profile Created Successfully!"
              message="Your profile has been created and saved. You can now proceed to the next step."
            />
          )}

          {formStatus === 'error' && (
            <StatusAlert
              type="error"
              title="Something went wrong"
              message={submitError || 'Failed to submit form. Please check your information and try again.'}
            />
          )}
        </div>
      </div>
    </div>
  );
};