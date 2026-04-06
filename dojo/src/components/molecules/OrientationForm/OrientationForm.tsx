

import React, { useEffect, useState, useMemo } from 'react';
import { Building, User as UserIcon, Calendar, Briefcase } from 'lucide-react';
import { ErrorMessage } from '../ErrorMessage/ErrorMessage';
import { Input } from '../../atoms/Inputs/Inputs';
import { Icon } from '../../atoms/LucidIcons/LucidIcons';
import SelectField from '../../atoms/Select/select';
import axios from 'axios';
import { API_ENDPOINTS } from '../../constants/api';
import { toast } from 'react-hot-toast'; // Optional: for success/error messages

// ------------------------------------------------------------------
// TYPES
// ------------------------------------------------------------------
interface OrientationFields {
  emp_id: string;
  date_of_joining: string;
  birth_date: string;
  department: string;
  sub_department: string;
  designation: string;
}

interface Department {
  department_id: number;
  department_name: string;
}

interface Line {
  line_id: number;
  line_name: string;
}

interface ApiLine {
  id: number;
  line_name: string;
  sublines?: Array<{ id: number; subline_name: string }>;
  stations?: Array<{ id: number; station_name: string }>;
}

interface ApiDepartment {
  id: number;
  department_name: string;
  lines?: ApiLine[];
  stations?: Array<{ id: number; station_name: string }>;
}

interface ApiStructureData {
  hq_name?: string;
  factory_name?: string;
  departments?: ApiDepartment[];
}

interface ApiHierarchyResponseItem {
  structure_id?: number;
  structure_name?: string;
  hq?: number;
  hq_name?: string;
  factory?: number;
  factory_name?: string;
  structure_data?: ApiStructureData;
}

interface OrientationFormProps {
  orientationFields: OrientationFields;
  setOrientationFields: (fields: OrientationFields) => void;
  error?: string;
  userId: number; // <-- NEW: Pass from parent (after body check)
  onSaveSuccess?: () => void; // Optional: callback after save
}

// ------------------------------------------------------------------
// HELPER FUNCTION - Build lines by department from hierarchy
// ------------------------------------------------------------------
const buildLinesByDeptFromHierarchy = (
  items: ApiHierarchyResponseItem[]
): Record<number, Line[]> => {
  const map: Record<number, Line[]> = {};

  if (!Array.isArray(items)) return map;

  items.forEach((item) => {
    if (!item?.structure_data?.departments) return;

    item.structure_data.departments.forEach((dept) => {
      if (!dept?.id) return;

      if (!map[dept.id]) {
        map[dept.id] = [];
      }

      const existingLineIds = new Set(map[dept.id].map((l) => l.line_id));

      if (Array.isArray(dept.lines)) {
        dept.lines.forEach((line) => {
          if (line?.id && line?.line_name && !existingLineIds.has(line.id)) {
            map[dept.id].push({
              line_id: line.id,
              line_name: line.line_name,
            });
            existingLineIds.add(line.id);
          }
        });
      }
    });
  });

  return map;
};

// ------------------------------------------------------------------
// COMPONENT
// ------------------------------------------------------------------
export const OrientationForm: React.FC<OrientationFormProps> = ({
  orientationFields,
  setOrientationFields,
  error,
  userId,
  onSaveSuccess,
}) => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [linesByDept, setLinesByDept] = useState<Record<number, Line[]>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // ------------------------------------------------------------------
  // 1. DESIGNATION CHOICES
  // ------------------------------------------------------------------
  const DESIGNATION_CHOICES = [
    { value: '', label: '--- Select Designation ---' },
    { value: 'CO- DRIVER', label: 'CO- DRIVER' },
    { value: 'DRIVER', label: 'DRIVER' },
    { value: 'HELPER', label: 'HELPER' },
    { value: 'MALI', label: 'MALI' },
    { value: 'OPERATOR', label: 'OPERATOR' },
    { value: 'PANTRY BOY', label: 'PANTRY BOY' },
    { value: 'SUPERVISOR', label: 'SUPERVISOR' },
    { value: 'SWEEPER', label: 'SWEEPER' },
    { value: 'OET', label: 'OET' },
    { value: 'OE', label: 'OE' },
    { value: 'Sr.OE', label: 'Sr.OE' },
  ];

  // ------------------------------------------------------------------
  // 2. Get current lines based on selected department
  // ------------------------------------------------------------------
  const currentLines = useMemo(() => {
    if (!orientationFields.department || orientationFields.department === '') return [];
    const deptId = parseInt(orientationFields.department, 10);
    if (isNaN(deptId)) return [];
    return linesByDept[deptId] || [];
  }, [orientationFields.department, linesByDept]);

  const lineOptions = useMemo(() => {
    if (!orientationFields.department || orientationFields.department === '') {
      return [{ value: '', label: '— Select Department First —' }];
    }
    if (currentLines.length === 0) {
      return [{ value: '', label: '— No lines available for this department —' }];
    }
    return [
      { value: '', label: '--- Select Sub-Department ---' },
      ...currentLines.map((line) => ({
        value: line.line_id.toString(),
        label: line.line_name,
      })),
    ];
  }, [orientationFields.department, currentLines]);

  // ------------------------------------------------------------------
  // 3. Fetch departments and hierarchy data
  // ------------------------------------------------------------------
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const deptUrl = `${API_ENDPOINTS.BASE_URL}${API_ENDPOINTS.DEPARTMENT || '/departments/'}`;
        const deptResponse = await axios.get(deptUrl).catch(() => ({ data: [] }));

        const hierarchyUrl = `${API_ENDPOINTS.BASE_URL}/hierarchy-simple/`;
        const hierarchyResponse = await axios.get(hierarchyUrl).catch(() => ({ data: [] }));

        // Process departments
        if (Array.isArray(deptResponse.data)) {
          const uniqueDepts = new Map<number, Department>();
          deptResponse.data.forEach((dept: any) => {
            if (dept?.department_id && dept?.department_name) {
              uniqueDepts.set(dept.department_id, {
                department_id: dept.department_id,
                department_name: dept.department_name,
              });
            }
          });
          const sortedDepartments = Array.from(uniqueDepts.values()).sort((a, b) =>
            a.department_name.localeCompare(b.department_name)
          );
          setDepartments(sortedDepartments);
        }

        // Process hierarchy to get lines by department
        if (Array.isArray(hierarchyResponse.data)) {
          const linesMap = buildLinesByDeptFromHierarchy(hierarchyResponse.data);
          setLinesByDept(linesMap);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setDepartments([]);
        setLinesByDept({});
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // ------------------------------------------------------------------
  // 4. Reset sub_department when department changes
  // ------------------------------------------------------------------
  useEffect(() => {
    if (orientationFields.sub_department !== '') {
      setOrientationFields({
        ...orientationFields,
        sub_department: '',
      });
    }
  }, [orientationFields.department]);

  // ------------------------------------------------------------------
  // 5. Input handler
  // ------------------------------------------------------------------
  const handleInputChange = (field: keyof OrientationFields, value: string) => {
    if (field === 'department') {
      setOrientationFields({
        ...orientationFields,
        department: value,
        sub_department: '',
      });
    } else {
      setOrientationFields({
        ...orientationFields,
        [field]: value,
      });
    }
  };

  // ------------------------------------------------------------------
  // 6. Build select options
  // ------------------------------------------------------------------
  const departmentOptions = [
    {
      value: '',
      label: loading ? 'Loading departments...' : 'Select Department (Optional)',
    },
    ...departments.map((dept) => ({
      value: dept.department_id.toString(),
      label: dept.department_name,
    })),
  ];

  const designationOptions = DESIGNATION_CHOICES;
  const isSubDeptDisabled = !orientationFields.department || currentLines.length === 0;

  // ------------------------------------------------------------------
  // 7. SAVE TO MASTER TABLE
  // ------------------------------------------------------------------
  // const saveToMaster = async () => {
  //   setSaving(true);
  //   setSaveError(null);

  //   const payload = {
  //     emp_id: orientationFields.emp_id,
  //     first_name: null,
  //     last_name: null,
  //     department: orientationFields.department ? Number(orientationFields.department) : null,
  //     sub_department: orientationFields.sub_department ? Number(orientationFields.sub_department) : null, // SAVED!
  //     date_of_joining: orientationFields.date_of_joining,
  //     designation: orientationFields.designation || null,
  //     birth_date: orientationFields.birth_date || null,
  //     sex: null,
  //     email: '',
  //     phone: '',
  //     user: userId, // Link to the user who passed checks
  //   };

  //   try {
  //     const url = `${API_ENDPOINTS.BASE_URL}${API_ENDPOINTS.EMPLOYEES}`;
  //     await axios.post(url, payload);
  //     toast.success('Employee saved to master table!');
  //     onSaveSuccess?.();
  //   } catch (err: any) {
  //     const msg = err.response?.data?.detail || 'Failed to save employee';
  //     setSaveError(msg);
  //     toast.error(msg);
  //   } finally {
  //     setSaving(false);
  //   }
  // };

  // ------------------------------------------------------------------
  // 8. Render
  // ------------------------------------------------------------------
  return (
    <div>
      <h4 className="text-lg font-medium text-gray-900 mb-4">
        Additional Employee Details
      </h4>

      {error && <ErrorMessage message={error} />}
      {saveError && <ErrorMessage message={saveError} />}

      <div className="space-y-6">
        {/* Employee ID & Date of Joining */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Employee ID"
            type="text"
            id="empId"
            value={orientationFields.emp_id}
            onChange={(e) => handleInputChange('emp_id', e.target.value)}
            placeholder="Enter employee ID (e.g., EMP001)"
            required
            icon={<Icon icon={UserIcon} className="text-gray-400" />}
          />

          <Input
            label="Date of Joining"
            type="date"
            id="dateOfJoining"
            value={orientationFields.date_of_joining || ''}
            onChange={(e) => handleInputChange('date_of_joining', e.target.value)}
            required
            icon={<Icon icon={Calendar} className="text-gray-400" />}
          />
        </div>

        {/* Department & Sub-Department */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SelectField
            label="Department"
            id="department"
            options={departmentOptions}
            value={orientationFields.department || ''}
            onChange={(e) => handleInputChange('department', e.target.value)}
            icon={<Icon icon={Building} className="text-gray-400" />}
          />

          <SelectField
            label="Sub-Department (Line)"
            id="sub_department"
            options={lineOptions}
            value={orientationFields.sub_department || ''}
            onChange={(e) => handleInputChange('sub_department', e.target.value)}
            icon={<Icon icon={Building} className="text-gray-400" />}
            disabled={isSubDeptDisabled}
          />
        </div>

        {/* Date of Birth & Designation */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Date of Birth"
            type="date"
            id="birth_date"
            value={orientationFields.birth_date || ''}
            onChange={(e) => handleInputChange('birth_date', e.target.value)}
            icon={<Icon icon={Calendar} className="text-gray-400" />}
          />

          <SelectField
            label="Designation"
            id="designation"
            options={designationOptions}
            value={orientationFields.designation || ''}
            onChange={(e) => handleInputChange('designation', e.target.value)}
            icon={<Icon icon={Briefcase} className="text-gray-400" />}
          />
        </div>
      </div>

      {/* SAVE BUTTON */}
      {/* <div className="mt-8 flex justify-end">
        <button
          onClick={saveToMaster}
          disabled={saving || !orientationFields.emp_id || !orientationFields.date_of_joining}
          className={`px-6 py-2 rounded font-medium text-white transition-colors ${
            saving || !orientationFields.emp_id || !orientationFields.date_of_joining
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-green-600 hover:bg-green-700'
          }`}
        >
          {saving ? 'Saving...' : 'Save to Master Table'}
        </button>
      </div> */}
    </div>
  );
};