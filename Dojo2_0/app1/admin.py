from django.contrib import admin
from .models import ProductivityEvaluation,Schedule,TrainingAttendance,RescheduledSession,AdvanceManpowerDashboard, EvaluationCriterion, HandoverSheet, HierarchyStructure, Hq, Factory, Department, HumanBodyQuestions, Line, ManagementReview, MasterTable, OJTDay, OJTLevel2Quantity, OJTPassingCriteria, OJTScoreRange, RetrainingSession, StationManager, SubLine, Station, User, UserRegistration

class StationInline(admin.TabularInline):
    model = Station
    extra = 1

class SubLineInline(admin.TabularInline):
    model = SubLine
    extra = 1

class LineInline(admin.TabularInline):
    model = Line
    extra = 1

class DepartmentInline(admin.TabularInline):
    model = Department
    extra = 1

class FactoryInline(admin.TabularInline):
    model = Factory
    extra = 1

@admin.register(Hq)
class HqAdmin(admin.ModelAdmin):
    list_display = ['hq_id', 'hq_name']
    search_fields = ['hq_id', 'hq_name']
    inlines = [FactoryInline]

@admin.register(Factory)
class FactoryAdmin(admin.ModelAdmin):
    list_display = ['factory_id', 'factory_name', 'hq']
    search_fields = ['factory_id', 'factory_name']
    list_filter = ['hq']
    inlines = [DepartmentInline]

@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    list_display = ['department_id', 'department_name', 'factory']
    search_fields = ['department_id', 'department_name']
    list_filter = ['factory']
    inlines = [LineInline]

@admin.register(Line)
class LineAdmin(admin.ModelAdmin):
    list_display = ['line_id', 'line_name', 'department']
    search_fields = ['line_id', 'line_name']
    list_filter = ['department']
    inlines = [SubLineInline]

@admin.register(SubLine)
class SubLineAdmin(admin.ModelAdmin):
    list_display = ['subline_id', 'subline_name', 'line']
    search_fields = ['subline_id', 'subline_name']
    list_filter = ['line']
    inlines = [StationInline]

@admin.register(Station)
class StationAdmin(admin.ModelAdmin):
    list_display = ['station_id', 'station_name', 'subline']
    search_fields = ['station_id', 'station_name']
    list_filter = ['subline']




from django.contrib import admin
from .models import (
     Level, Days,
    SubTopic, SubTopicContent,
    TrainingContent, Evaluation
)

# ------------------ Inline Admins ------------------
class DaysInline(admin.TabularInline):
    model = Days
    extra = 1



class SubTopicInline(admin.TabularInline):
    model = SubTopic
    extra = 1


class SubTopicContentInline(admin.TabularInline):
    model = SubTopicContent
    extra = 1


class TrainingContentInline(admin.TabularInline):
    model = TrainingContent
    extra = 1


class EvaluationInline(admin.TabularInline):
    model = Evaluation
    extra = 1


# ------------------ Model Admins ------------------



@admin.register(Level)
class LevelAdmin(admin.ModelAdmin):
    list_display = ("level_id", "level_name", )
    search_fields = ("level_name",)
    inlines = [DaysInline, SubTopicInline]


@admin.register(Days)
class DaysAdmin(admin.ModelAdmin):
    list_display = ("days_id", "day", "level")
    list_filter = ("level",)
    search_fields = ("day",)
    inlines = [SubTopicInline]




from django.contrib import admin
from .models import SubTopic, SubTopicContent, Evaluation


@admin.register(SubTopic)
class SubTopicAdmin(admin.ModelAdmin):
    list_display = ("subtopic_id", "subtopic_name", "level", "days")
    list_filter = ("level", "days")
    search_fields = ("subtopic_name",)
    inlines = [SubTopicContentInline, EvaluationInline]

# Helper function (if not already defined)
    def _int_or_none(value):
        """Convert string to int or return None if conversion fails"""
        try:
            return int(value) if value is not None else None
        except (ValueError, TypeError):
            return None

@admin.register(SubTopicContent)
class SubTopicContentAdmin(admin.ModelAdmin):
    list_display = ("subtopiccontent_id", "subtopic", "content")
    search_fields = ("content",)
    inlines = [TrainingContentInline]


@admin.register(TrainingContent)
class TrainingContentAdmin(admin.ModelAdmin):
    list_display = ("trainingcontent_id", "subtopiccontent", "material")
    search_fields = ("material",)


@admin.register(Evaluation)
class EvaluationAdmin(admin.ModelAdmin):
    list_display = ("evaluation_id", "subtopic", "evaluation_text")
    search_fields = ("evaluation_text",)



from django.contrib import admin
from .models import MasterTable

@admin.register(MasterTable)
class MasterTableAdmin(admin.ModelAdmin):
    list_display = (
        "row_number",      # 👈 fake serial ID
        "emp_id",
        "first_name",
        "last_name",
        "department",
        "date_of_joining",
        "birth_date",
        "sex",
        "email",
        "phone",
    )
    list_filter = ("department", "sex", "date_of_joining", "birth_date")
    search_fields = ("emp_id", "first_name", "last_name", "email", "phone")

    def row_number(self, obj):
        return list(MasterTable.objects.order_by("emp_id")).index(obj) + 1
    row_number.short_description = "DB ID"



admin.site.register(HumanBodyQuestions)

admin.site.register(ManagementReview)

from django.contrib import admin
from .models import Machine, MachineAllocation


@admin.register(Machine)
class MachineAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "department", "level", "process", "created_at")
    search_fields = ("name", "process")
    list_filter = ("department", "level")



from django.contrib import admin
from .models import TemplateQuestion


@admin.register(TemplateQuestion)
class TemplateQuestionAdmin(admin.ModelAdmin):
    list_display = ("id", "question_paper", "short_question", "correct_answer")
    list_filter = ("question_paper",)
    search_fields = ("question", "correct_answer")

    def short_question(self, obj):
        return obj.question[:50]  # Show first 50 chars
    short_question.short_description = "Question"


from django.contrib import admin
from .models import ARVRTrainingContent

@admin.register(ARVRTrainingContent)
class ARVRTrainingContentAdmin(admin.ModelAdmin):
    list_display = ("id", "short_description", "arvr_file", "url_link")
    search_fields = ("description", "url_link")

    def short_description(self, obj):
        return obj.description[:50] + ("..." if len(obj.description) > 50 else "")
    short_description.short_description = "Description"



from django.contrib import admin
from .models import QuestionPaper, StationLevelQuestionPaper

@admin.register(QuestionPaper)
class QuestionPaperAdmin(admin.ModelAdmin):
    list_display = (
        'question_paper_name',
        'department',
        'line',
        'subline',
        'station',
        'level',
        'created_at',
        'updated_at',
    )
    list_filter = ('department', 'line', 'subline', 'station', 'level')
    search_fields = ('question_paper_name',)
    date_hierarchy = 'created_at'
    ordering = ('-created_at',)

@admin.register(StationLevelQuestionPaper)
class StationLevelQuestionPaperAdmin(admin.ModelAdmin):
    list_display = (
        'department',
        'line',
        'subline',
        'station',
        'level',
        'question_paper',
        'created_at',
    )
    list_filter = ('department', 'line', 'subline', 'station', 'level')
    search_fields = ('question_paper__question_paper_name',)
    date_hierarchy = 'created_at'
    ordering = ('-created_at',)


from django.contrib import admin
from .models import TestSession, KeyEvent, ConnectEvent, VoteEvent

# Register your models here to make them accessible in the admin panel.

admin.site.register(TestSession)

admin.site.register(KeyEvent)
admin.site.register(ConnectEvent)
admin.site.register(VoteEvent)
    

from .models import (
    TenCycleDayConfiguration,
    TenCycleTopics,
    TenCycleSubTopic,
    TenCyclePassingCriteria,
    OperatorPerformanceEvaluation,
    EvaluationSubTopicMarks,
    Level,
    Department,
    Station
)

@admin.register(TenCycleDayConfiguration)
class TenCycleDayConfigurationAdmin(admin.ModelAdmin):
    list_display = ['id', 'level', 'department', 'station', 'day_name', 'sequence_order', 'is_active']
    list_filter = ['level', 'department', 'station', 'is_active']
    search_fields = ['day_name']

@admin.register(TenCycleTopics)
class TenCycleTopicsAdmin(admin.ModelAdmin):
    list_display = ['id', 'level', 'department', 'station', 'cycle_topics', 'is_active']
    list_filter = ['level', 'department', 'station', 'is_active']
    search_fields = ['cycle_topics']
    ordering = ['level', 'department', 'station', 'cycle_topics']

@admin.register(TenCycleSubTopic)
class TenCycleSubTopicAdmin(admin.ModelAdmin):
    list_display = ['id', 'topic', 'sub_topic', 'score_required', 'is_active']
    list_filter = ['is_active']
    search_fields = ['sub_topic']

@admin.register(TenCyclePassingCriteria)
class TenCyclePassingCriteriaAdmin(admin.ModelAdmin):
    list_display = ['id', 'level', 'department', 'station', 'passing_percentage', 'is_active']
    list_filter = ['level', 'department', 'station', 'is_active']

@admin.register(OperatorPerformanceEvaluation)
class OperatorPerformanceEvaluationAdmin(admin.ModelAdmin):
    list_display = ['id', 'employee', 'date', 'department', 'station', 'level', 'final_percentage', 'final_status']
    list_filter = ['department', 'station', 'level', 'final_status']
    search_fields = ['employee__emp_id', 'employee__first_name', 'employee__last_name']

@admin.register(EvaluationSubTopicMarks)
class EvaluationSubTopicMarksAdmin(admin.ModelAdmin):
    list_display = ['id', 'employee', 'subtopic', 'day', 'total_score', 'max_possible_score']
    list_filter = ['day']
    search_fields = ['employee__emp_id', 'employee__first_name']

# app_name/admin.py
from django.contrib import admin
from .models import Score

admin.site.register(Score)

from .models import SkillMatrix,TraineeInfo, OJTScore, MasterTable, Station
@admin.register(SkillMatrix)
class SkillMatrixAdmin(admin.ModelAdmin):
    list_display = ("employee_name", "emp_id", "level", "doj", "updated_at")
    
    search_fields = ("employee_name", "emp_id")
admin.site.register(TraineeInfo)
admin.site.register(OJTScore)
admin.site.register(HandoverSheet)





from django.contrib import admin
from .models import Notification

@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = (
        'title',
        'recipient',
        'recipient_email',
        'notification_type',
        'priority',
        'is_read',
        'created_at',
        'sent_at',
    )
    list_filter = (
        'notification_type',
        'priority',
        'is_read',
        'created_at',
    )
    search_fields = (
        'title',
        'message',
        'recipient__username',
        'recipient_email',
    )
    readonly_fields = (
        'created_at',
        'sent_at',
        'read_at',
    )
    ordering = ('-created_at',)
    actions = ['mark_selected_as_read', 'mark_selected_as_unread']

    def mark_selected_as_read(self, request, queryset):
        updated_count = queryset.update(is_read=True, read_at=timezone.now())
        self.message_user(request, f"{updated_count} notification(s) marked as read.")
    mark_selected_as_read.short_description = "Mark selected notifications as read"

    def mark_selected_as_unread(self, request, queryset):
        updated_count = queryset.update(is_read=False, read_at=None)
        self.message_user(request, f"{updated_count} notification(s) marked as unread.")
    mark_selected_as_unread.short_description = "Mark selected notifications as unread"



admin.site.register(HierarchyStructure)
admin.site.register(OJTLevel2Quantity)
admin.site.register(UserRegistration)

admin.site.register(OJTDay)
admin.site.register(OJTScoreRange)


admin.site.register(OJTPassingCriteria)
admin.site.register(EvaluationCriterion)
admin.site.register(User)


from django.contrib import admin
from .models import EvaluationLevel2

@admin.register(EvaluationLevel2)
class EvaluationLevel2Admin(admin.ModelAdmin):
    # Columns to display in the list view
    list_display = (
        'employee', 
        'station_name', 
        'department', 
        'level', 
        'total_marks', 
        'status', 
        'evaluation_date',
        'created_at'
    )

    # Fields that can be searched
    search_fields = (
        'employee__first_name', 
        'employee__last_name', 
        'employee__emp_id',
        'station_name',
        'department__department_name'
    )

    # Filters on the right sidebar
    list_filter = ('status', 'level', 'department', 'evaluation_date')

    # Fields to make read-only in admin form
    readonly_fields = (
        'snapshot_full_name', 
        'snapshot_department', 
        'snapshot_designation', 
        'snapshot_date_of_joining',
        'created_at',
        'updated_at'
    )

    # Optional: ordering in list view
    ordering = ('-evaluation_date', 'employee__emp_id')

    # Optional: grouping fields in form
    fieldsets = (
        ('Employee Info', {
            'fields': ('employee', 'snapshot_full_name', 'snapshot_designation', 'snapshot_department', 'snapshot_date_of_joining')
        }),
        ('Evaluation Details', {
            'fields': ('station_name', 'level', 'department', 'evaluation_date', 'dojo_incharge_name', 'area_incharge_name', 'total_marks', 'status')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at')
        }),
    )



from django.contrib import admin
from .models import OperatorObservanceSheet, Topic
import json

@admin.register(OperatorObservanceSheet)
class OperatorObservanceSheetAdmin(admin.ModelAdmin):
    # Fields to display in list view
    list_display = (
        'operator_name',
        'level',
        'process_name',
        'supervisor_name',
        'score',
        'marks_obtained',
        'result',
        'evaluation_period'
    )

    # Searchable fields
    search_fields = ('operator_name', 'process_name', 'supervisor_name', 'level')

    # Filters
    list_filter = ('level', 'result', 'process_name')

    # ManyToMany fields display
    filter_horizontal = ('topics',)

    # Readonly JSON display for marks and signatures
    readonly_fields = ('pretty_marks', 'pretty_signatures')

    # Organize fields in form
    fieldsets = (
        ('Operator Info', {
            'fields': ('operator_name', 'operator_category', 'process_name', 'supervisor_name', 'level')
        }),
        ('Evaluation Period', {
            'fields': ('evaluation_start_date', 'evaluation_end_date')
        }),
        ('Marks & Topics', {
            'fields': ('topics', 'pretty_marks')
        }),
        ('Scores & Result', {
            'fields': ('score', 'marks_obtained', 'value', 'result', 'pretty_signatures', 'remarks')
        }),
    )

    # Custom display for JSONField marks
    def pretty_marks(self, obj):
        return f"<pre>{json.dumps(obj.marks, indent=2)}</pre>"
    pretty_marks.allow_tags = True
    pretty_marks.short_description = 'Marks'

    def pretty_signatures(self, obj):
        return f"<pre>{json.dumps(obj.signatures, indent=2)}</pre>"
    pretty_signatures.allow_tags = True
    pretty_signatures.short_description = 'Signatures'

    # Optional: display evaluation period in list view
    def evaluation_period(self, obj):
        return f"{obj.evaluation_start_date} → {obj.evaluation_end_date}"
    evaluation_period.short_description = "Evaluation Period"


admin.site.register(StationManager)
admin.site.register(RetrainingSession)

from .models import BiometricAttendance

# Role is registered below with RoleAdmin

# -----------------------ESSL Biometric Man-Machine interlinkage ----------------------------

admin.site.register(BiometricAttendance)

admin.site.register(AdvanceManpowerDashboard)


from django.contrib import admin
from .models import BiometricDevice, BioUser, BiometricEnrollment
from .models import Machine, AttendanceLog, BiometricPunch

# ---------------------------------------------------------
# INLINE: Shows enrollments directly inside BioUser page
# ---------------------------------------------------------
class BiometricEnrollmentInline(admin.TabularInline):
    model = BiometricEnrollment
    extra = 0  # Removes empty extra rows
    readonly_fields = ('synced_at',)
    can_delete = True  # Allows you to manually remove a log if needed
    autocomplete_fields = ['device']

# ---------------------------------------------------------
# 1. BIOMETRIC DEVICE ADMIN
# ---------------------------------------------------------
@admin.register(BiometricDevice)
class BiometricDeviceAdmin(admin.ModelAdmin):
    list_display = ('name', 'ip_address', 'port', 'serial_number', 'test_url')
    search_fields = ('name', 'ip_address', 'serial_number')
    list_filter = ('port',)
    
    # Helper to quickly check the WSDL URL from Admin
    def test_url(self, obj):
        return f"http://{obj.ip_address}:{obj.port}/WebAPIService.asmx?WSDL"
    test_url.short_description = "WSDL URL"

# ---------------------------------------------------------
# INLINE: Shows individual punch logs inside BioUser page
# ---------------------------------------------------------
class BiometricPunchInline(admin.TabularInline):
    model = BiometricPunch
    extra = 0
    readonly_fields = ('punch_time', 'device', 'created_at')
    can_delete = False
    ordering = ('-punch_time',)

    def has_add_permission(self, request, obj=None):
        return False # Punches should come from the machine

# ---------------------------------------------------------
# 2. BIO USER ADMIN
# ---------------------------------------------------------
@admin.register(BioUser)
class BioUserAdmin(admin.ModelAdmin):
    list_display = ('employeeid', 'first_name', 'last_name', 'total_enrollments')
    search_fields = ('employeeid', 'first_name', 'last_name')
    
    # This adds both synced devices and raw punch history at the bottom
    inlines = [BiometricEnrollmentInline, BiometricPunchInline]

    def total_enrollments(self, obj):
        return obj.enrollments.count()
    total_enrollments.short_description = "Devices Synced"

# ---------------------------------------------------------
# 3. BIOMETRIC ENROLLMENT LOG ADMIN
# ---------------------------------------------------------
@admin.register(BiometricEnrollment)
class BiometricEnrollmentAdmin(admin.ModelAdmin):
    list_display = ('bio_user', 'device', 'synced_at')
    list_filter = ('device', 'synced_at')
    search_fields = ('bio_user__employeeid', 'bio_user__first_name', 'device__name')
    date_hierarchy = 'synced_at' # Adds a date navigation bar at top
    
    # Optimization: If you have thousands of users, this makes loading faster
    autocomplete_fields = ['bio_user', 'device']


from django.contrib import admin

# ... (Keep your existing BioUser/Machine/Device admins here) ...

@admin.register(AttendanceLog)
class AttendanceLogAdmin(admin.ModelAdmin):
    # Columns to show in the list
    list_display = (
        'get_employee_id', 
        'get_employee_name', 
        'date', 
        'first_punch', 
        'last_punch', 
        'get_device_name', 
        'get_machine_name'
    )
    
    # Sidebar Filters
    list_filter = ('date', 'device', 'bio_user')
    
    # Search Bar (Search by ID, Name, or Device)
    search_fields = ('bio_user__employeeid', 'bio_user__first_name', 'device__name')
    
    # Default sorting (Newest dates first)
    ordering = ('-date', 'bio_user')

    # --- Custom Columns ---

    @admin.display(description='Emp ID')
    def get_employee_id(self, obj):
        return obj.bio_user.employeeid

    @admin.display(description='Name')
    def get_employee_name(self, obj):
        return f"{obj.bio_user.first_name} {obj.bio_user.last_name}"

    @admin.display(description='Biometric Device')
    def get_device_name(self, obj):
        return obj.device.name if obj.device else "-"

    @admin.display(description='Linked Machine')
    def get_machine_name(self, obj):
        """
        Finds which Factory Machine is linked to this Device.
        """
        if obj.device:
            # Look for the machine that has this biometric_device assigned
            linked_machine = Machine.objects.filter(biometric_device=obj.device).first()
            return linked_machine.name if linked_machine else "(Gate/General)"
        return "-"

@admin.register(BiometricPunch)
class BiometricPunchAdmin(admin.ModelAdmin):
    list_display = ('get_employee_id', 'get_employee_name', 'punch_time', 'device', 'created_at')
    list_filter = ('punch_time', 'device')
    search_fields = ('bio_user__employeeid', 'bio_user__first_name', 'device__name')
    ordering = ('-punch_time',)

    @admin.display(description='Emp ID')
    def get_employee_id(self, obj):
        return obj.bio_user.employeeid

    @admin.display(description='Name')
    def get_employee_name(self, obj):
        return f"{obj.bio_user.first_name} {obj.bio_user.last_name}"



admin.site.register(RescheduledSession)
admin.site.register(TrainingAttendance)
admin.site.register(Schedule)
admin.site.register(ProductivityEvaluation)

# -----------------------ESSL Biometric Man-Machine interlinkage End----------------------------



from django.contrib import admin
from django.db.models import Sum
from .models import (
    DefectCategory,
    DefectType,
    PoisonCakeTest,
    PlantedDefect
)

# ============================================================
# DEFECT CATEGORY ADMIN
# ============================================================

@admin.register(DefectCategory)
class DefectCategoryAdmin(admin.ModelAdmin):
    list_display = (
        'category_name',
        'is_active',
        'created_at',
        'updated_at',
    )
    list_filter = ('is_active',)
    search_fields = ('category_name', 'description')
    ordering = ('category_name',)


# ============================================================
# DEFECT TYPE ADMIN
# ============================================================

@admin.register(DefectType)
class DefectTypeAdmin(admin.ModelAdmin):
    list_display = (
        'defect_name',
        'category',
        'is_active',
        'created_at',
    )
    list_filter = ('is_active', 'category')
    search_fields = ('defect_name', 'category__category_name')
    ordering = ('category', 'defect_name')


# ============================================================
# PLANTED DEFECT INLINE (inside PoisonCakeTest)
# ============================================================

class PlantedDefectInline(admin.TabularInline):
    model = PlantedDefect
    extra = 1
    autocomplete_fields = ('defect_category', 'defect_type')
    fields = ('defect_category', 'defect_type', 'quantity')
    min_num = 0


# ============================================================
# POISON CAKE TEST ADMIN
# ============================================================

@admin.register(PoisonCakeTest)
class PoisonCakeTestAdmin(admin.ModelAdmin):
    list_display = (
        'test_id',
        'test_date',
        'model_name',
        'operator',
        'department',
        'station',
        'level',
        'test_judgment',
    )

    list_filter = (
        'test_date',
        'test_judgment',
        'department',
        'station',
        'level',
    )

    search_fields = (
        'model_name',
        'operator__name',
        'department__name',
    )

    readonly_fields = (
        'reject_parts_before',
        'test_judgment',
        'created_at',
        'updated_at',
        'total_planted_defects',
    )

    inlines = [PlantedDefectInline]

    fieldsets = (
        ("Test Information", {
            'fields': (
                'test_date',
                'model_name',
                'operator',
                'department',
                'station',
                'level',
            )
        }),

        ("Before Test", {
            'fields': (
                'total_parts_before',
                'ok_parts_before',
                'reject_parts_before',
            )
        }),

        ("After Test", {
            'fields': (
                'ok_parts_after',
                'reject_parts_after',
            )
        }),

        ("Result", {
            'fields': (
                'test_judgment',
                're_inspection_qty',
                'remarks',
                'total_planted_defects',
            )
        }),

        ("Metadata", {
            'fields': (
                'created_at',
                'updated_at',
            )
        }),
    )

    def total_planted_defects(self, obj):
        total = obj.planted_defects.aggregate(
            total=Sum('quantity')
        )['total']
        return total or 0

    total_planted_defects.short_description = "Total Planted Defects"


# ============================================================
# OPTIONAL: REGISTER PLANTED DEFECT SEPARATELY
# ============================================================

@admin.register(PlantedDefect)
class PlantedDefectAdmin(admin.ModelAdmin):
    list_display = (
        'test',
        'defect_category',
        'defect_type',
        'quantity',
        'created_at',
    )
    list_filter = ('defect_category', 'defect_type')
    search_fields = ('test__model_name', 'defect_type__defect_name')

from .models import AttritionRecord
admin.site.register(AttritionRecord)




from django.contrib import admin
from .models import Role, AppModule, RolePermission

# 1. Customizing the Module Table (The Tiles and Links)
@admin.register(AppModule)
class AppModuleAdmin(admin.ModelAdmin):
    list_display = ('name', 'key', 'parent')
    list_filter = ('parent',)
    search_fields = ('name', 'key')
    ordering = ('parent__name', 'name')



# 2. Creating an Inline for Permissions
# This allows you to manage permissions directly inside the Role page
class RolePermissionInline(admin.TabularInline):
    model = RolePermission
    extra = 1 # Number of empty rows to show
    autocomplete_fields = ['module'] # Helpful if you have many modules

# 3. Customizing the Role Table
@admin.register(Role)
class RoleAdmin(admin.ModelAdmin):
    list_display = ('name', 'is_active', 'created_at')
    search_fields = ('name',)
    inlines = [RolePermissionInline]

# 4. Optional: Register RolePermission separately if you want to see all logs
@admin.register(RolePermission)
class RolePermissionAdmin(admin.ModelAdmin):
    list_display = ('role', 'module', 'is_allowed')
    list_filter = ('role', 'is_allowed', 'module')
    list_editable = ('is_allowed',) # Allows quick toggle from the list view


# @admin.register(RolePermission)
# class RolePermission(ModelAdmin): pass
