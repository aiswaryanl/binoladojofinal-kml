from import_export import resources, fields
from import_export.widgets import ForeignKeyWidget, DateWidget
from .models import MasterTable, Department
from datetime import datetime


class MasterTableResource(resources.ModelResource):
    emp_id = fields.Field(attribute='emp_id', column_name='Employee ID')
    full_name = fields.Field(column_name='Full Name')  # Combined first_name and last_name
    sex = fields.Field(attribute='sex', column_name='Sex')
    birth_date = fields.Field(
        attribute='birth_date',
        column_name='Birth Date',
        widget=DateWidget(format='%d-%m-%Y')
    )
    department = fields.Field(
        attribute='department',
        column_name='Department',
        widget=ForeignKeyWidget(Department, 'department_name')
    )
    date_of_joining = fields.Field(
        attribute='date_of_joining',
        column_name='Joining Date',
        widget=DateWidget(format='%d-%m-%Y')
    )
    email = fields.Field(attribute='email', column_name='Email')
    phone = fields.Field(attribute='phone', column_name='Phone')

    class Meta:
        model = MasterTable
        import_id_fields = ['emp_id']  # Unique identifier for import
        fields = (
            'emp_id',
            'full_name',
            'sex',
            'birth_date',
            'department',
            'date_of_joining',
            'email',
            'phone',
        )
        skip_unchanged = True
        report_skipped = True

    def dehydrate_full_name(self, obj):
        """Combine first_name and last_name for export"""
        return f"{obj.first_name} {obj.last_name}".strip()

    def before_import_row(self, row, **kwargs):
        """Handle data preprocessing before import"""
        # Split full_name into first_name and last_name
        if 'Full Name' in row and row['Full Name']:
            full_name = row['Full Name'].split()
            row['first_name'] = full_name[0]
            row['last_name'] = ' '.join(full_name[1:]) if len(full_name) > 1 else ''
        else:
            row['first_name'] = ''
            row['last_name'] = ''

        # Handle date fields safely (already handled by DateWidget, but kept for compatibility)
        date_fields = ['Birth Date', 'Joining Date']
        for field in date_fields:
            if row.get(field):
                try:
                    # DateWidget handles parsing, but ensure the format is correct
                    row[field] = datetime.strptime(row[field], "%d-%m-%Y").date()
                except Exception as e:
                    print(f"Date parsing error in {field}: {e}")





#================== BiometricAttendance ==================#


from import_export import resources, fields
from .models import BiometricAttendance
from datetime import datetime

class BiometricAttendanceResource(resources.ModelResource):
    sr_no = fields.Field(column_name='Sr.No.', attribute='sr_no')
    pay_code = fields.Field(column_name='PayCode', attribute='pay_code')
    card_no = fields.Field(column_name='Card No', attribute='card_no')
    employee_name = fields.Field(column_name='Employee Name', attribute='employee_name')
    department = fields.Field(column_name='Department', attribute='department')
    designation = fields.Field(column_name='Designation', attribute='designation')
    shift = fields.Field(column_name='Shift', attribute='shift')
    start = fields.Field(column_name='Start', attribute='start')
    in_time = fields.Field(column_name='In', attribute='in_time')
    out_time = fields.Field(column_name='Out', attribute='out_time')
    hrs_works = fields.Field(column_name='Hrs Works', attribute='hrs_works')
    status = fields.Field(column_name='Status', attribute='status')
    early_arrival = fields.Field(column_name='Early Arriv.', attribute='early_arrival')
    late_arrival = fields.Field(column_name='Late Arriv.', attribute='late_arrival')
    shift_early = fields.Field(column_name='Shift Early', attribute='shift_early')
    excess_lunch = fields.Field(column_name='Excess Lunch', attribute='excess_lunch')
    ot = fields.Field(column_name='Ot', attribute='ot')
    ot_amount = fields.Field(column_name='Ot Amount', attribute='ot_amount')
    
    # --- NEW FIELD MAPPING ---
    os = fields.Field(column_name='Os', attribute='os')
    
    manual = fields.Field(column_name='Manual', attribute='manual')

    class Meta:
        model = BiometricAttendance
        import_id_fields = ['card_no'] 
        # If you want to allow duplicate card_nos for different dates, 
        # remove import_id_fields or ensure logic handles updates vs inserts.

    def before_import_row(self, row, **kwargs):
        # Strip leading/trailing spaces from column names
        keys = list(row.keys())
        for key in keys:
            trimmed_key = key.strip()
            if trimmed_key != key:
                row[trimmed_key] = row.pop(key)
        
        # Convert specific time fields
        # REMOVED 'Hrs Works' from this list because in your image it is a decimal (11.37)
        time_fields = ['Start', 'In', 'Out'] 
        
        for field in time_fields:
            value = row.get(field)
            # Handle Excel time objects or strings
            if value:
                if isinstance(value, str):
                    try:
                        row[field] = datetime.strptime(value.strip(), "%H:%M:%S").time()
                    except ValueError:
                        try:
                            row[field] = datetime.strptime(value.strip(), "%I:%M %p").time()
                        except ValueError:
                            # Last resort for HH:MM
                            try:
                                row[field] = datetime.strptime(value.strip(), "%H:%M").time()
                            except:
                                row[field] = None


                                
#================== BiometricAttendance End ==================#


