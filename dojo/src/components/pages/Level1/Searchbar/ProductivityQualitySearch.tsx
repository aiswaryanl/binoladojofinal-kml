import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Search, X, User, BarChart3, Award } from "lucide-react";
import { API_ENDPOINTS } from "../../../constants/api";

// ✅ Types
interface Employee {
    emp_id: string;
    first_name: string;
    last_name: string;
    department_name: string;
    sub_department_name:string;
    station_name:string;
    department_id?: number;
    date_of_joining: string;
    designation:string;
    email: string;
    phone: string;
    sex: string;
  }

interface LocationState {
  stationId?: number;
  stationName?: string;
  sublineId?: number;
  sublineName?: string;
  lineId?: number;
  lineName?: string;
  departmentId?: number;
  departmentName?: string;
  levelId?: number;
  levelName?: string;
  sheetType?: 'productivity' | 'quality';
}

const ProductivityQualitySearch: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    stationId,
    stationName,
    sublineId,
    sublineName,
    lineId,
    lineName,
    departmentId,
    departmentName,
    levelId,
    levelName,
    sheetType = 'productivity'
  } = (location.state as LocationState) || {};
   console.log(location)

  const [query, setQuery] = useState("");
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // ✅ Get page configuration based on sheet type
  const getPageConfig = () => {
    if (sheetType === 'quality') {
      return {
        title: 'Quality Sheet - Select Employee',
        subtitle: 'Search for an employee to access their quality metrics',
        icon: <Award className="w-8 h-8 text-white" />,
        gradientFrom: 'from-green-500',
        gradientTo: 'to-emerald-600',
        bgGradient: 'from-green-50 via-emerald-50 to-teal-50'
      };
    } else {
      return {
        title: 'Productivity Sheet - Select Employee',
        subtitle: 'Search for an employee to access their productivity metrics',
        icon: <BarChart3 className="w-8 h-8 text-white" />,
        gradientFrom: 'from-blue-500',
        gradientTo: 'to-purple-600',
        bgGradient: 'from-slate-50 via-blue-50 to-indigo-50'
      };
    }
  };

  const pageConfig = getPageConfig();

  // ✅ Fetch Employees
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(
          `${API_ENDPOINTS.BASE_URL}${API_ENDPOINTS.EMPLOYEES}`
        );
        if (!response.ok)
          throw new Error(`Error fetching employees: ${response.statusText}`);
        const data: Employee[] = await response.json();
        setEmployees(data);
        setFilteredEmployees(data);
      } catch (error: any) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchEmployees();
  }, []);

  // ✅ Debounce Search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim() && employees.length > 0) {
        const filtered = employees.filter(
          (emp) =>
            `${emp.first_name} ${emp.last_name}`
              .toLowerCase()
              .includes(query.toLowerCase()) ||
            emp.emp_id.toLowerCase().includes(query.toLowerCase())
        );
        setFilteredEmployees(filtered.slice(0, 10));
        setShowSuggestions(true);
      } else {
        setFilteredEmployees([]);
        setShowSuggestions(false);
      }
    }, 200);
    return () => clearTimeout(timer);
  }, [query, employees]);

  // ✅ Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ✅ Navigate to appropriate sheet
//   const handleNavigation = (employee: Employee) => {
//     const targetRoute = sheetType === 'quality' ? '/QualitySheet' : '/ProductivitySheet';
    
//     navigate(targetRoute, {
//       state: {
//         ...location.state,
//         employeeId: employee.emp_id,
//         employeeName: `${employee.first_name} ${employee.last_name}`,
//         employeeData: {
//             name: `${employee.first_name} ${employee.last_name}`,
//             code: employee.emp_id,
//             designation: employee.designation,
//             department: employee.department_name,
//             dateOfJoining: employee.date_of_joining,
//             email: employee.email,
//             phone: employee.phone,
//           },
//         sheetType,
//       },
      
//     });
//   };
// ✅ Navigate to appropriate sheet with detailed logging
const handleNavigation = (employee: Employee) => {
    const targetRoute = sheetType === 'quality' ? '/QualitySheet' : '/ProductivitySheet';
    
    const navigationPayload = {
      ...location.state,
      employeeId: employee.emp_id,
      employeeName: `${employee.first_name} ${employee.last_name}`,
      employeeData: {
        name: `${employee.first_name} ${employee.last_name}`,
        code: employee.emp_id,
        designation: employee.designation,
        department: employee.department_name || '',   // optional fallback
        line: employee.sub_department_name || '',
        station: employee.station_name || '',
        dateOfJoining: employee.date_of_joining,
        email: employee.email,
        phone: employee.phone,
      },
      sheetType,
    };
    
    console.log('=== NAVIGATION DETAILS ===');
    console.log('Target Route:', targetRoute);
    console.log('Complete Navigation Payload:');
    console.log(JSON.stringify(navigationPayload, null, 2));
    console.log('Employee Data being sent:');
    console.log('  - Name:', navigationPayload.employeeData.name);
    console.log('  - Code:', navigationPayload.employeeData.code);
    console.log('  - Designation:', navigationPayload.employeeData.designation);
    console.log('  - Department:', navigationPayload.employeeData.department);
    console.log('  - Date of Joining:', navigationPayload.employeeData.dateOfJoining);
    console.log('========================');
    
    navigate(targetRoute, {
      state: navigationPayload,
    });
  };




  // ✅ Select Employee
  const handleEmployeeSelect = (employee: Employee) => {
    setSelectedEmployee(employee);
    setQuery(`${employee.first_name} ${employee.last_name}`);
    setShowSuggestions(false);
    handleNavigation(employee);
  };

  const clearSearch = () => {
    setQuery("");
    setSelectedEmployee(null);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br ${pageConfig.bgGradient} relative overflow-hidden`}>
      {/* ✅ Floating Shapes Background */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className={`absolute w-72 h-72 ${sheetType === 'quality' ? 'bg-green-100' : 'bg-blue-100'} rounded-full top-10 left-10 opacity-30 animate-pulse`}></div>
        <div className={`absolute w-56 h-56 ${sheetType === 'quality' ? 'bg-emerald-100' : 'bg-purple-100'} rounded-full bottom-20 right-20 opacity-30 animate-pulse`}></div>
      </div>

      <div className="relative z-10 py-8 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        {/* ✅ Header */}
        <div className="text-center mb-10">
          <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r ${pageConfig.gradientFrom} ${pageConfig.gradientTo} rounded-full mb-6 shadow-lg`}>
            {pageConfig.icon}
          </div>
          <h1 className="text-4xl font-bold gradient-text mb-2">
            {pageConfig.title}
          </h1>
          <p className="text-lg text-gray-600">
            {pageConfig.subtitle}
          </p>
        </div>

        {/* ✅ Location Info */}
        {(departmentName ||
          lineName ||
          sublineName ||
          stationName ||
          levelName) && (
          <div className="glass-card rounded-xl p-6 mb-8 shadow-lg">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">
              {sheetType === 'quality' ? 'Quality Assessment Location' : 'Productivity Assessment Location'}
            </h2>
            <div className="flex flex-wrap gap-2">
              {departmentName && (
                <span className={`px-3 py-1 ${sheetType === 'quality' ? 'bg-green-100' : 'bg-blue-100'} rounded-full`}>
                  {departmentName}
                </span>
              )}
              {lineName && (
                <span className={`px-3 py-1 ${sheetType === 'quality' ? 'bg-emerald-100' : 'bg-purple-100'} rounded-full`}>
                  {lineName}
                </span>
              )}
              {sublineName && (
                <span className={`px-3 py-1 ${sheetType === 'quality' ? 'bg-teal-100' : 'bg-indigo-100'} rounded-full`}>
                  {sublineName}
                </span>
              )}
              {stationName && (
                <span className="px-3 py-1 bg-amber-100 rounded-full">
                  {stationName}
                </span>
              )}
              {levelName && (
                <span className="px-3 py-1 bg-yellow-100 rounded-full">
                  {levelName}
                </span>
              )}
            </div>
          </div>
        )}

        {/* ✅ Sheet Type Indicator */}
        <div className="glass-card rounded-xl p-4 mb-6 shadow-lg">
          <div className="flex items-center justify-center space-x-3">
            <div className={`w-3 h-3 ${sheetType === 'quality' ? 'bg-green-500' : 'bg-blue-500'} rounded-full animate-pulse`}></div>
            <span className="text-sm font-medium text-gray-700">
              {sheetType === 'quality' ? 'Quality Assessment Mode' : 'Productivity Assessment Mode'}
            </span>
            <div className={`w-3 h-3 ${sheetType === 'quality' ? 'bg-green-500' : 'bg-blue-500'} rounded-full animate-pulse`}></div>
          </div>
        </div>

        {/* ✅ Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* ✅ Search Box */}
        <div className="glass-card rounded-xl p-6 shadow-lg relative">
          <div className="relative mb-4">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name or employee ID..."
              className="w-full px-12 py-4 glass-input rounded-xl text-lg text-gray-800 placeholder-gray-500"
              onFocus={() => query && setShowSuggestions(true)}
            />
            <Search className="absolute left-4 top-4 text-gray-400" size={22} />
            {query && (
              <button
                onClick={clearSearch}
                className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            )}
          </div>

          {/* ✅ Suggestions Dropdown */}
          {showSuggestions && (
            <div
              ref={suggestionsRef}
              className="absolute w-full mt-2 bg-white rounded-xl shadow-lg max-h-80 overflow-y-auto z-50"
            >
              {loading ? (
                <div className="p-4 text-center text-gray-500">
                  Loading employees...
                </div>
              ) : filteredEmployees.length > 0 ? (
                filteredEmployees.map((employee) => (
                  <div
                    key={employee.emp_id}
                    className={`p-4 flex justify-between items-center ${sheetType === 'quality' ? 'hover:bg-green-50' : 'hover:bg-indigo-50'} cursor-pointer transition`}
                    onClick={() => handleEmployeeSelect(employee)}
                  >
                    <div>
                      <div className="font-semibold text-gray-800">
                        {employee.first_name} {employee.last_name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {employee.emp_id}
                      </div>
                    </div>
                    <span className="text-sm text-gray-400">
                      {employee.department_name}
                    </span>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-gray-500">
                  No employees found
                </div>
              )}
            </div>
          )}
        </div>

        {/* ✅ Additional Info Card */}
        <div className="mt-8">
          <div className="glass-card rounded-xl p-6 shadow-lg">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                {sheetType === 'quality' ? 'Quality Assessment' : 'Productivity Tracking'}
              </h3>
              <p className="text-gray-600">
                {sheetType === 'quality' 
                  ? 'Evaluate employee performance quality metrics and standards compliance'
                  : 'Monitor and track employee productivity metrics and performance indicators'
                }
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductivityQualitySearch;