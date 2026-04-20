


import os
import re
import datetime
import shutil
import time
from celery import shared_task
from tablib import Dataset
from .models import BiometricAttendance, SystemSettings


@shared_task
def import_attendance_from_excel():
    """
    Celery task to automatically import attendance from Excel files.
    Reads the source path from SystemSettings database.
    """
    
    # 1. GET PATH FROM DATABASE
    settings = SystemSettings.objects.first()
    
    if not settings or not settings.excel_source_path:
        return {
            'status': 'failed', 
            'reason': 'Source path not configured. Please set it in Settings.'
        }
    
    BASE_DIR = settings.excel_source_path
    PROCESSED_DIR = os.path.join(BASE_DIR, "Processed")

    # 2. CHECK BASE DIRECTORY
    if not os.path.exists(BASE_DIR):
        return {
            'status': 'failed', 
            'reason': f'Source directory not found: {BASE_DIR}'
        }
    
    # 3. CREATE PROCESSED DIRECTORY IF NOT EXISTS
    if not os.path.exists(PROCESSED_DIR):
        try:
            os.makedirs(PROCESSED_DIR)
        except Exception as e:
            return {
                'status': 'failed', 
                'reason': f"Could not create Processed folder: {e}"
            }

    # 4. GET EXCEL FILES
    try:
        all_files = os.listdir(BASE_DIR)
    except Exception as e:
        return {
            'status': 'failed',
            'reason': f'Could not read directory: {e}'
        }
    
    excel_files = [f for f in all_files if f.endswith('.xlsx') or f.endswith('.xls')]
    
    if not excel_files:
        return {
            'status': 'skipped', 
            'message': 'No Excel files found to process.',
            'source_path': BASE_DIR
        }

    results_log = []

    # 5. PROCESS EACH FILE
    for filename in excel_files:
        file_path = os.path.join(BASE_DIR, filename)
        
        # A. EXTRACT DATE FROM FILENAME
        # Supports formats: 04.12.25, 4.12.2025, 04-12-25, etc.
        match = re.search(r'(\d{1,2})[.\-_](\d{1,2})[.\-_](\d{2,4})', filename)
        
        if not match:
            msg = f"Skipped {filename}: No date pattern found in filename"
            results_log.append(msg)
            continue 

        day, month, year = match.groups()
        if len(year) == 2: 
            year = "20" + year
        date_str = f"{year}-{month.zfill(2)}-{day.zfill(2)}"

        # B. READ EXCEL FILE
        dataset = Dataset()
        file_format = 'xls' if filename.endswith('.xls') else 'xlsx'
        
        try:
            with open(file_path, 'rb') as f:
                imported_data = dataset.load(f.read(), format=file_format)
        except Exception as e:
            results_log.append(f"Error reading {filename}: {e}")
            continue

        # Clean headers
        if imported_data.headers:
            imported_data.headers = [str(h).strip() for h in imported_data.headers]

        # C. HELPER FUNCTIONS
        def parse_time(val):
            if not val or str(val).lower() == 'nan': 
                return None
            if isinstance(val, datetime.time): 
                return val
            if isinstance(val, datetime.datetime): 
                return val.time()
            try: 
                return datetime.datetime.strptime(str(val).strip(), '%H:%M:%S').time()
            except: 
                try:
                    return datetime.datetime.strptime(str(val).strip(), '%H:%M').time()
                except:
                    return None

        def clean_val(val):
            return str(val).strip() if val and str(val).lower() != 'nan' else None

        # D. SAVE TO DATABASE
        saved_count = 0
        for row in imported_data.dict:
            try:
                card_no = row.get('Card No')
                if not card_no: 
                    continue
                    
                BiometricAttendance.objects.update_or_create(
                    card_no=str(card_no).strip(),
                    attendance_date=date_str,
                    defaults={
                        'sr_no': row.get('Sr.No.'),
                        'pay_code': row.get('PayCode'),
                        'employee_name': row.get('Employee Name'),
                        'department': row.get('Department'),
                        'designation': row.get('Designation'),
                        'shift': row.get('Shift'),
                        'start': parse_time(row.get('Start')),
                        'in_time': parse_time(row.get('In')),
                        'out_time': parse_time(row.get('Out')),
                        'hrs_works': clean_val(row.get('Hrs Works')),
                        'status': row.get('Status'),
                        'late_arrival': clean_val(row.get('Late Arriv.')),
                        'early_arrival': clean_val(row.get('Early Arriv.')),
                        'shift_early': clean_val(row.get('Shift Early')),
                        'excess_lunch': clean_val(row.get('Excess Lunch')),
                        'ot': clean_val(row.get('Ot')),
                        'ot_amount': clean_val(row.get('Ot Amount')),
                        'os': clean_val(row.get('Os')),
                        'manual': row.get('Manual'),
                    }
                )
                saved_count += 1
            except Exception as e:
                pass

        # E. MOVE FILE TO PROCESSED
        try:
            destination = os.path.join(PROCESSED_DIR, filename)
            
            # Handle duplicate filenames
            if os.path.exists(destination):
                timestamp = datetime.datetime.now().strftime("%H%M%S")
                name, ext = os.path.splitext(filename)
                destination = os.path.join(PROCESSED_DIR, f"{name}_{timestamp}{ext}")

            time.sleep(0.5)  # Brief pause to ensure file handle is released
            shutil.move(file_path, destination)
            
            msg = f"SUCCESS: {filename} → {saved_count} records imported, moved to Processed"
            results_log.append(msg)
            
        except PermissionError:
            msg = f"IMPORTED but MOVE FAILED ({filename}): File may be open in Excel"
            results_log.append(msg)
        except Exception as e:
            msg = f"IMPORTED but MOVE FAILED ({filename}): {str(e)}"
            results_log.append(msg)

    return {
        'status': 'completed',
        'files_processed': len(results_log),
        'source_path': BASE_DIR,
        'log': results_log
    }




#Biometric Essl Connection Start

# (Removed redundant and shadowing import: from datetime import datetime)
from .models import BiometricDevice
from .utils import get_transactions_log_from_device, save_log_entry

# ====================================================
# 2. NEW AUTO-SYNC TASK (Add this at the bottom)
# ====================================================
@shared_task
def auto_sync_machine_logs(days_back=2):
    """
    Runs automatically (e.g., every 10 mins) to fetch logs
    from devices and save them to the DB.
    """
    print(f"[Celery] Starting Sync at {datetime.datetime.now()} (Range: last {days_back} days)...")
    
    # 1. Setup Date Range
    end_date = datetime.datetime.now()
    start_date = end_date - datetime.timedelta(days=days_back)
    from_dt = start_date.strftime("%Y-%m-%d 00:00:00")
    to_dt = end_date.strftime("%Y-%m-%d 23:59:59")

    devices = BiometricDevice.objects.all()
    
    for device in devices:
        try:
            # 2. Fetch Logs
            result = get_transactions_log_from_device(device, from_dt, to_dt)
            str_data = result.strDataList if hasattr(result, 'strDataList') else ""
            
            if str_data:
                log_lines = str_data.strip().split('\n')
                print(f"[Celery] Found {len(log_lines)} logs for {device.name}")
                for line in log_lines:
                    if line.strip():
                        parts = line.split('\t')
                        if len(parts) >= 2:
                            emp_code = parts[0]
                            time_str = parts[1]
                            
                            # 3. SAVE TO DB (Uses the same logic as Live View)
                            save_log_entry(device, emp_code, time_str)
            else:
                print(f"[Celery] No logs returned for {device.name}")

        except Exception as e:
            print(f"[Celery] Error syncing {device.name}: {e}")

    return f"Sync Complete for {len(devices)} devices."

@shared_task
def manual_sync_all_devices(start_date_str, end_date_str):
    """
    Manual trigger for historical logs across all machines.
    """
    from_dt = f"{start_date_str} 00:00:00"
    to_dt = f"{end_date_str} 23:59:59"
    
    print(f"[Celery] Manual Sync Triggered: {from_dt} to {to_dt}")
    
    devices = BiometricDevice.objects.all()
    for device in devices:
        try:
            result = get_transactions_log_from_device(device, from_dt, to_dt)
            str_data = result.strDataList if hasattr(result, 'strDataList') else ""
            if str_data:
                log_lines = str_data.strip().split('\n')
                print(f"[Celery] Manual Sync: Found {len(log_lines)} logs for {device.name}")
                for line in log_lines:
                    if line.strip():
                        parts = line.split('\t')
                        if len(parts) >= 2:
                            save_log_entry(device, parts[0], parts[1])
            else:
                print(f"[Celery] Manual Sync: No logs found on {device.name} for this range.")
        except Exception as e:
            print(f"[Celery] Error in Manual Sync for {device.name}: {e}")
            
    return "Manual Sync All Complete"

#Biometric Essl Connection End


