import React, { useState, useEffect } from 'react';
import SkillMatrixTable from '../components/SkillMatrixTable';
// import { fetchSkillMatrices, fetchOperations, fetchSections, fetchMonthlySkill, fetchOperatorLevels, fetchDepartments, fetchStationRequirements } from '../api/api';
import { fetchUnifiedSkillMatrixData, fetchOperatorLevels } from '../api/api'; // Keep fetchOperatorLevels for specific updates if needed
import { type SkillMatrix, type Operation, type Section, type MonthlySkill, type OperatorLevel, months, type StationRequirement } from '../api/types';

const SkillMatrixPage: React.FC = () => {
  const [skillMatrices, setSkillMatrices] = useState<SkillMatrix[]>([]);
  const [selectedMatrix, setSelectedMatrix] = useState<SkillMatrix | null>(null);
  const [employees, setEmployees] = useState<any[]>([]);
  const [operations, setOperations] = useState<Operation[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [monthlySkills, setMonthlySkills] = useState<MonthlySkill[]>([]);
  const [operatorLevels, setOperatorLevels] = useState<OperatorLevel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stationRequirements, setStationRequirements] = useState<StationRequirement[]>([]);

  // New state to hold the detailed skill matrix data to pass down to table
  // This avoids the table fetching it again
  const [initialSkillMatrixData, setInitialSkillMatrixData] = useState<any[]>([]);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Unified Fetch
        const unifiedData = await fetchUnifiedSkillMatrixData();
        console.log('🚀 Unified Data Received:', unifiedData);

        // 1. Hierarchy & Departments
        // Reconstruct valid "SkillMatrix" objects for the dropdown selector
        const matricesData: SkillMatrix[] = (unifiedData.sections || []).map((sec: any) => ({
          id: sec.id,
          department: sec.name,
          updated_at: new Date().toISOString()
        }));

        // 2. Employees
        const employeesData = (unifiedData.employees || []).map((emp: any) => ({
          employee_code: emp.employee_code,
          full_name: emp.full_name,
          designation: emp.designation,
          date_of_join: emp.date_of_join,
          department: emp.department,
          section: emp.section
        }));

        // 3. Station Requirements
        const requirementsData = unifiedData.station_requirements || [];

        // 4. Operations & Sections
        const operationsData = unifiedData.operations || [];
        const sectionsData = unifiedData.sections || [];

        // 5. Detailed Skill Matrix Data
        const detailedSkillMatrixData = unifiedData.skill_matrices || [];

        setSkillMatrices(matricesData);
        setEmployees(employeesData);
        setOperations(operationsData);
        setSections(sectionsData);
        setStationRequirements(requirementsData);
        setInitialSkillMatrixData(detailedSkillMatrixData);

        if (matricesData.length > 0) {
          const firstMatrix = matricesData[0];
          setSelectedMatrix(firstMatrix);

          try {
            const levels = await fetchOperatorLevels(firstMatrix.department);
            setOperatorLevels(levels);
          } catch (e) {
            console.warn('Legacy fetchOperatorLevels failed or empty', e);
          }
        }

      } catch (err) {
        console.error('Error loading initial data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, []);

  const handleMatrixChange = async (matrix: SkillMatrix) => {
    setSelectedMatrix(matrix);

    try {
      setIsLoading(true);
      const operatorLevelsData = await fetchOperatorLevels(matrix.department);
      setOperatorLevels(operatorLevelsData);
    } catch (error) {
      console.error('Error fetching operator levels for department:', matrix.department, error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const unifiedData = await fetchUnifiedSkillMatrixData();

      const matricesData: SkillMatrix[] = (unifiedData.sections || []).map((sec: any) => ({
        id: sec.id,
        department: sec.name,
        updated_at: new Date().toISOString()
      }));

      const employeesData = (unifiedData.employees || []).map((emp: any) => ({
        employee_code: emp.employee_code,
        full_name: emp.full_name,
        designation: emp.designation,
        date_of_join: emp.date_of_join,
        department: emp.department,
        section: emp.section
      }));

      setSkillMatrices(matricesData);
      setEmployees(employeesData);
      setOperations(unifiedData.operations || []);
      setSections(unifiedData.sections || []);
      setStationRequirements(unifiedData.station_requirements || []);
      setInitialSkillMatrixData(unifiedData.skill_matrices || []);

      if (selectedMatrix) {
        try {
          const levels = await fetchOperatorLevels(selectedMatrix.department);
          setOperatorLevels(levels);
        } catch (e) { console.warn(e); }
      }

    } catch (err) {
      console.error('Error refreshing data:', err);
      setError(err instanceof Error ? err.message : 'Failed to refresh data');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <SkillMatrixTable
        skillMatrices={skillMatrices}
        selectedMatrix={selectedMatrix}
        employees={employees}
        operations={operations}
        sections={sections}
        monthlySkills={monthlySkills}
        operatorLevels={operatorLevels}
        stationRequirements={stationRequirements}
        // @ts-ignore - Prop to be added
        initialSkillMatrixData={initialSkillMatrixData}
        months={months}
        isLoading={isLoading}
        error={error}
        onMatrixChange={handleMatrixChange}
        onRefresh={refreshData}
      />
    </>
  );
};

export default SkillMatrixPage;