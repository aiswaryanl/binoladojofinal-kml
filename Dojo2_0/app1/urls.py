from django.urls import include, path, re_path
from . import views
from rest_framework_simplejwt.views import TokenRefreshView

from django.conf import settings
from django.conf.urls.static import static
from django.views.generic import TemplateView # Import TemplateView

from rest_framework.routers import DefaultRouter
from .views import *

from .views import dojo_app 

from .views import BatchCompletionStatusView,CompleteTrainingBatchView


router = DefaultRouter()
# --- Router definitions from your original code (omitted for brevity) ---
router.register(r'hq', HqViewSet, basename='hq')
router.register(r'factories', FactoryViewSet, basename='factory')
router.register(r'departments', DepartmentViewSet, basename='department')
router.register(r'lines', LineViewSet, basename='line')
router.register(r'sublines', SubLineViewSet, basename='subline')
router.register(r'stations', StationViewSet, basename='station')
router.register(r'hierarchy-structures', HierarchyStructureViewSet, basename='hierarchy-structure')


#10 cycle
router.register(r'tencycle-days', TenCycleDayConfigurationViewSet, basename='tencycle-day')
router.register(r'tencycle-topics', TenCycleTopicsViewSet, basename='tencycle-topic')
router.register(r'tencycle-subtopics', TenCycleSubTopicViewSet, basename='tencycle-subtopic')
router.register(r'tencycle-passingcriteria', TenCyclePassingCriteriaViewSet, basename='tencycle-passingcriteria')
router.register(r'operator-evaluations', OperatorPerformanceEvaluationViewSet, basename='operator-evaluation')
router.register(r'evaluation-marks', EvaluationSubTopicMarksViewSet, basename='evaluation-mark')
router.register(r'tencycle-configuration', TenCycleConfigurationViewSet, basename='tencycle-configuration')


router.register(r'levels', LevelViewSet)
router.register(r'days', DaysViewSet)
router.register(r'subtopics', SubTopicViewSet)
router.register(r'subtopic-contents', SubTopicContentViewSet)
router.register(r'training-contents', TrainingContentViewSet)
router.register(r'evaluations', EvaluationViewSet)
router.register(r'mastertable', MasterTableViewSet, basename='mastertable')
router.register(r'humanbody-questions', HumanBodyQuestionsViewSet, basename='humanbody-questions')
router.register(r'production-plans', ProductionPlanViewSet, basename='production-plan')

router.register(r'machines', MachineViewSet, basename='machines')
router.register(r'allocations', MachineAllocationViewSet, basename='allocations')

router.register(r'machine-allocation-approval', MachineAllocationApprovalViewSet, basename='machineallocationapproval')


router.register(r'questionpapers', QuestionPaperViewSet, basename='questionpaper')
router.register(r'station-level-questionpapers', StationLevelQuestionPaperViewSet, basename='stationlevelquestionpaper')
router.register(r'arvr-content', ARVRTrainingContentViewSet, basename='arvr-content')


router.register(r'template-questions', TemplateQuestionViewSet, basename='templatequestion')


# hanshou & shokuchou 

router.register(r'hanchou-questions', HanchouExamQuestionViewSet, basename='hanchou-questions')
router.register(r"hanchou/results", HanchouExamResultViewSet, basename="hanchou-results")

router.register(r"shokuchou-questions", ShokuchouExamQuestionViewSet, basename="shokuchou-questions")
router.register(r"shokuchou/results", ShokuchouExamResultViewSet, basename="shokuchou-results")


router.register(r'han-content', HanContentViewSet, basename='han-content')
router.register(r'han-subtopics', HanSubtopicViewSet, basename='han-subtopic')
router.register(r'han-materials', HanTrainingContentViewSet, basename='han-material')

router.register(r'sho-content', ShoContentViewSet, basename='sho-content')
router.register(r'sho-subtopics', ShoSubtopicViewSet, basename='sho-subtopic')
router.register(r'sho-materials', ShoTrainingContentViewSet, basename='sho-material')


router.register(r'ojt-topics', OJTTopicViewSet, basename='ojt-topic')
router.register(r'ojt-days', OJTDayViewSet, basename='ojt-day')
router.register(r'ojt-score-ranges', OJTScoreRangeViewSet, basename='ojt-scorerange')
router.register(r'ojt-scores', OJTScoreViewSet)
router.register(r'ojt-passing-criteria', OJTPassingCriteriaViewSet)
router.register(r'trainees', TraineeInfoViewSet, basename='trainees')
router.register(r"ojt-quantity", OJTLevel2QuantityViewSet)


# Refreshment Training
router.register(r'training-categories', Training_categoryViewSet)
router.register(r'curriculums', CurriculumViewSet, basename='curriculum')
router.register(r'curriculum-contents', CurriculumContentViewSet, basename='curriculumcontent')
router.register(r'trainer_name', Trainer_nameViewSet)
router.register(r'venues', VenueViewSet)
router.register(r'schedules', ScheduleViewSet)
router.register(r'attendances', EmployeeAttendanceViewSet, basename='attendance')
router.register(r'reschedule-logs', RescheduleLogViewSet, basename='reschedulelog')


router.register(r"score-ranges", QuantityOJTScoreRangeViewSet, basename="quantity-score-range")
router.register(r"passing-criteria", QuantityPassingCriteriaViewSet, basename="quantity-passing-criteria")
router.register(r"ojt-evaluations", Level2QuantityOJTEvaluationViewSet)


router.register(r'logos', CompanyLogoViewSet)
router.register(r'evaluation-passing-criteria', EvaluationPassingCriteriaViewSet, basename='evaluation-passing-criteria')


router.register(r'retraining-sessions', RetrainingSessionViewSet, basename='retraining-session')
router.register(r'retraining-configs', RetrainingConfigViewSet, basename='retraining-config')
router.register(r'notifications', NotificationViewSet, basename='notifications')

router.register(r'levelcolours', LevelColourViewSet, basename="levelcolours")
router.register(r'displaysetting', SkillMatrixDisplaySettingViewSet, basename='displaysetting')

router.register(r'department-sublines', DepartmentSubLineViewSet, basename='department-sublines')
router.register(r'department-stations', DepartmentStationViewSet, basename='department-stations')


router.register(r"users", UserViewSet, basename="user")
router.register(r'roles', RoleViewSet, basename='role')

router.register(r'handovers', HandoverSheetViewSet, basename='handover')

router.register(r'production-data', DailyProductionDataViewSet, basename='productiondata')

router.register( r"training_topics", TrainingTopicViewSet, basename="training_topic")
router.register(r"levelwise-training-contents", LevelWiseTrainingContentViewSet, basename="levelwisetrainingcontent")

router.register(r"skill-matrix", SkillMatrixViewSet, basename="skill-matrix")



router.register(r'advance-dashboard', AdvanceManpowerDashboardViewSet, basename='advance-dashboard')

router.register(r'management-reviews', ManagementReviewViewSet, basename='managementreview')


router.register(r'employees-excel', EmployeeExcelViewSet, basename='employee-excel')


router.register(r"multiskilling", MultiSkillingViewSet, basename="multiskilling")

router.register(r'skillevaluations', EvaluationLevel2ViewSet, basename='evaluation-level2')
router.register(r'criteria', EvaluationCriterionViewSet, basename='criterion')


# level 1 productivity and quality sheet 
router.register(r"productivityevaluations", ProductivityEvaluationViewSet)
router.register(r"sequences", ProductivitySequenceViewSet)
router.register(r"qualityevaluations", QualityEvaluationViewSet)
router.register(r"qualitysequences", QualitySequenceViewSet)

router.register(r'questions', QuestionViewSet)
# operator observance sheet
router.register(r'topics', TopicViewSet, basename='topic')
router.register(r'observancesheets', OperatorObservanceSheetViewSet, basename='observancesheet')




router.register(r'biouser', BioUserViewSet, basename='biouser')
router.register(r'biometric-devices', BiometricDeviceViewSet)
router.register(r'biometric-logs', BiometricEnrollmentViewSet)


#Biometric Attendance
router.register(r'biometric-attendance', BiometricAttendanceViewSet, basename='biometric-attendance')

router.register(r'ojt-dashboard', views.OJTStatusDashboardViewSet, basename='ojt-dashboard')

router.register(r'station-managers', StationManagerViewSet, basename='station-manager')

router.register(r'defect-categories', DefectCategoryViewSet, basename='defect-category')
router.register(r'defect-types', DefectTypeViewSet, basename='defect-type')
router.register(r'operators', OperatorViewSet, basename='operator')
# Add to your existing urls.py router

router.register(r'recurring-schedules', RecurringTestScheduleViewSet, basename='recurring-schedule')
router.register(r'reinspection-plans', ReInspectionPlanViewSet, basename='reinspection-plan')
router.register(r'poison-cake-tests', PoisonCakeTestViewSet, basename='poison-cake-test')
router.register(r'attrition', AttritionRecordViewSet, basename='attrition')


urlpatterns = [

    path('', dojo_app, name='dojo-app'), # Normal path
    # Frontend Root and Home Paths
    path('', TemplateView.as_view(template_name='index.html'), name='root-frontend'),
    path('home/', TemplateView.as_view(template_name='index.html'), name='home-frontend'),

    # Auth URLs with Frontend counterparts
    path('register/', views.RegisterView.as_view(), name="register"),
    path('register/frontend/', TemplateView.as_view(template_name='index.html'), name="register-frontend"),
    path('login/', views.LoginAPIView.as_view(), name='login'),
    path('login/frontend/', TemplateView.as_view(template_name='index.html'), name='login-frontend'),
    path('logout/', views.LogoutAPIView.as_view(), name="logout"),
    path('logout/frontend/', TemplateView.as_view(template_name='index.html'), name="logout-frontend"),
    
    # JWT Refresh with Frontend counterpart
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/token/refresh/frontend/', TemplateView.as_view(template_name='index.html'), name='token-refresh-frontend'),

    # Temp User URLs with Frontend counterparts
    path('temp-user-info/', UserRegistrationViewSet.as_view({'get': 'list', 'post': 'create'}), name='temp-user-info'),
    path('temp-user-info/frontend/', TemplateView.as_view(template_name='index.html'), name='temp-user-info-frontend'),
    path('users/<str:temp_id>/', UserRegistrationViewSet.as_view({'get': 'retrieve', 'patch': 'partial_update', 'put': 'update', 'delete': 'destroy'}), name='user-update'),
    path('users/<str:temp_id>/frontend/', TemplateView.as_view(template_name='index.html'), name='user-update-frontend'),

    # Body check endpoints with Frontend counterparts
    path('human-body-checks/', BodyCheckSubmissionView.as_view(), name='human-body-checks'),
    path('human-body-checks/frontend/', TemplateView.as_view(template_name='index.html'), name='human-body-checks-frontend'),
    path('user-body-checks/', UserBodyCheckListView.as_view(), name='user-body-checks'),
    path('user-body-checks/frontend/', TemplateView.as_view(template_name='index.html'), name='user-body-checks-frontend'),

    # Material Serving URLs with Frontend counterparts
    path('han-materials/<int:pk>/serve/', serve_han_material_file, name='serve-han-material-file'),
    path('han-materials/<int:pk>/serve/frontend/', TemplateView.as_view(template_name='index.html'), name='serve-han-material-file-frontend'),
    path('sho-materials/<int:pk>/serve/', serve_sho_material_file, name='serve-sho-material-file'),
    path('sho-materials/<int:pk>/serve/frontend/', TemplateView.as_view(template_name='index.html'), name='serve-sho-material-file-frontend'),

    # Certificate URLs with Frontend counterparts
    path('hanchou-results/<int:pk>/download-certificate/', HanchouResultCertificatePDF.as_view(), name='download-hanchou-certificate'),
    path('hanchou-results/<int:pk>/download-certificate/frontend/', TemplateView.as_view(template_name='index.html'), name='download-hanchou-certificate-frontend'),
    path('shokuchou-results/<int:pk>/download-certificate/', ShokuchouResultCertificatePDF.as_view(), name='download-shokuchou-certificate'),
    path('shokuchou-results/<int:pk>/download-certificate/frontend/', TemplateView.as_view(template_name='index.html'), name='download-shokuchou-certificate-frontend'),

    # OJT List Views with Frontend counterparts
    path('ojt-days-list/', OJTDayListView.as_view(), name="ojt-days-list"),
    path('ojt-days-list/frontend/', TemplateView.as_view(template_name='index.html'), name="ojt-days-list-frontend"),
    path('ojt-topics-list/', OJTTopicListView.as_view(), name="ojt-topics-list"),
    path('ojt-topics-list/frontend/', TemplateView.as_view(template_name='index.html'), name="ojt-topics-list-frontend"),
    path("trainee-info-list/", TraineeInfoListView.as_view(), name="trainee-info-list"),
    path("trainee-info-list/frontend/", TemplateView.as_view(template_name='index.html'), name="trainee-info-list-frontend"),

    # Station Settings with Frontend counterpart
    path('station-settings/', StationSettingCreateView.as_view(), name='station-setting-create'),
    path('station-settings/frontend/', TemplateView.as_view(template_name='index.html'), name='station-setting-create-frontend'),


    path('api/next-test-sequence/', views.NextTestSequenceView.as_view(), name='next_test_sequence'),
    path('start-test/', views.StartTestSessionView.as_view(), name='start_test_session'),
    path('api/end-test/', views.EndTestSessionView.as_view(), name='end_test_session'),
    path('api/scores/', views.ScoreListView.as_view(), name='score_list'),
    path('api/test-session/map/', views.KeyIdToEmployeeNameMap.as_view(), name='keyid-name-map'),
    path('api/past-sessions/', views.PastTestSessionsView.as_view()),
    path('api/scores-by-session/<str:name>/', views.ScoresByTestView.as_view()),
    path('api/score-summary/', views.ResultSummaryAPIView.as_view(), name='score-summary'),
    path('api/skills/', views.SkillListView.as_view(), name='skill-list'),
    path('api/scores-by-session/<path:name>/', views.ScoresByTestView.as_view()),
    path('submit-web-test/', SubmitWebTestAPIView.as_view(), name='submit-web-test'),
    path('api/key-events/create/', KeyEventCreateView.as_view()),
    path('api/key-events/latest/', LatestKeyEventView.as_view()),
    path('api/connect-events/create/', views.connect_event_create, name='connect_event_create'),
    path('api/receiver-status/', views.ReceiverStatusView.as_view(), name='receiver_status'),

    path('api/vote-events/create/', views.vote_event_create, name='vote_event_create'),
    path('api/assessment-mode/', views.get_assessment_mode, name='get_assessment_mode'),
    path('api/assessment-mode/toggle/', views.toggle_assessment_mode, name='toggle_assessment_mode'),
    path('department/<int:department_id>/lines/', views.get_lines_by_department, name='lines-by-department'),
    path('line/<int:line_id>/sublines/', views.get_sublines_by_line, name='sublines-by-line'),
    path('subline/<int:subline_id>/stations/', views.get_stations_by_subline, name='stations-by-subline'),
    path('department/<int:department_id>/stations/', views.get_stations_by_department, name='stations-by-department'),
    path('line/<int:line_id>/stations/', views.get_stations_by_line, name='stations-by-line'),
    path('fetch-departments/', views.get_all_departments, name='fetch-departments'),


    path('api/results/levels/', ResultsLevelsAPIView.as_view(), name='results-levels'),
    path('api/results/departments/', ResultsDepartmentsAPIView.as_view(), name='results-departments'),
    path('api/results/stations/', ResultsStationsAPIView.as_view(), name='results-stations'),
    path('api/results/batches/', ResultsBatchesAPIView.as_view(), name='results-batches'),
    path('api/results/individual-scores/', ResultsIndividualScoresAPIView.as_view(), name='results-individual-scores'),

    # Hierarchy & Production API with Frontend counterparts
    path('department/<int:department_id>/lines/', views.get_lines_by_department, name='lines-by-department'),
    path('department/<int:department_id>/lines/frontend/', TemplateView.as_view(template_name='index.html'), name='lines-by-department-frontend'),
    path('line/<int:line_id>/sublines/', views.get_sublines_by_line, name='sublines-by-line'),
    path('line/<int:line_id>/sublines/frontend/', TemplateView.as_view(template_name='index.html'), name='sublines-by-line-frontend'),
    path('subline/<int:subline_id>/stations/', views.get_stations_by_subline, name='stations-by-subline'),
    path('subline/<int:subline_id>/stations/frontend/', TemplateView.as_view(template_name='index.html'), name='stations-by-subline-frontend'),
    path('department/<int:department_id>/stations/', views.get_stations_by_department, name='stations-by-department'),
    path('department/<int:department_id>/stations/frontend/', TemplateView.as_view(template_name='index.html'), name='stations-by-department-frontend'),
    path('line/<int:line_id>/stations/', views.get_stations_by_line, name='stations-by-line'),
    path('line/<int:line_id>/stations/frontend/', TemplateView.as_view(template_name='index.html'), name='stations-by-line-frontend'),
    path('fetch-departments/', views.get_all_departments, name='fetch-departments'),
    path('fetch-departments/frontend/', TemplateView.as_view(template_name='index.html'), name='fetch-departments-frontend'),
    
    # Handover and Hierarchy Views with Frontend counterparts
    path("handovers/employee/<str:emp_id>/", EmployeeHandoverView.as_view()),
    path("handovers/employee/<str:emp_id>/frontend/", TemplateView.as_view(template_name='index.html'), name='employee-handover-frontend'),
    path("hierarchy/by-department/", HierarchyByDepartmentView.as_view(), name="hierarchy-by-department"),
    path("hierarchy/by-department/frontend/", TemplateView.as_view(template_name='index.html'), name='hierarchy-by-department-frontend'),
    path('hierarchy-simple/', views.get_hierarchy_structures, name='get_hierarchy_structures'),
    path('hierarchy-simple/frontend/', TemplateView.as_view(template_name='index.html'), name='get-hierarchy-structures-frontend'),
    path("hierarchy/all-departments/", HierarchyAllDepartmentsView.as_view(), name="hierarchy-all-departments"),
    path("hierarchy/all-departments/frontend/", TemplateView.as_view(template_name='index.html'), name='hierarchy-all-departments-frontend'),

    # Production/Planning Data with Frontend counterparts
    path('production-plans/planning-data/', views.get_planning_data, name='planning-data'),
    path('production-plans/planning-data/frontend/', TemplateView.as_view(template_name='index.html'), name='planning-data-frontend'),
    path('trends/operators-required/', views.get_operators_required_trend, name='operators-required-trend'),
    path('trends/operators-required/frontend/', TemplateView.as_view(template_name='index.html'), name='operators-required-trend-frontend'),
    path('production-data/gap-analysis/', views.monthly_availability_analysis, name='monthly_availability_analysis'),
    path('production-data/gap-analysis/frontend/', TemplateView.as_view(template_name='index.html'), name='monthly-availability-analysis-frontend'),
    path('production-data/date-range-summary/', views.weekly_availability_summary, name='weekly_availability_summary'),
    path('production-data/date-range-summary/frontend/', TemplateView.as_view(template_name='index.html'), name='weekly-availability-summary-frontend'),

    # Notifications API with Frontend counterparts
    path('api/notifications/count/', notification_count, name='notification-count'),
    path('api/notifications/count/frontend/', TemplateView.as_view(template_name='index.html'), name='notification-count-frontend'),
    path('api/notifications/system/', create_system_notification, name='create-system-notification'),
    path('api/notifications/system/frontend/', TemplateView.as_view(template_name='index.html'), name='create-system-notification-frontend'),
    path('api/notifications/test/', create_test_notification, name='create-test-notification'),
    path('api/notifications/test/frontend/', TemplateView.as_view(template_name='index.html'), name='create-test-notification-frontend'),
    path('api/notifications/debug/', test_notifications, name='test-notifications'),
    path('api/notifications/debug/frontend/', TemplateView.as_view(template_name='index.html'), name='test-notifications-frontend'),
    path('api/notifications/trigger-employee/', trigger_employee_notification, name='trigger-employee-notification'),
    path('api/notifications/trigger-employee/frontend/', TemplateView.as_view(template_name='index.html'), name='trigger-employee-notification-frontend'),
    path('api/notifications/trigger-all-types/', trigger_all_notification_types, name='trigger-all-notification-types'),
    path('api/notifications/trigger-all-types/frontend/', TemplateView.as_view(template_name='index.html'), name='trigger-all-notification-types-frontend'),
    path('api/notifications/delete-all/', delete_all_notifications, name='delete-all-notifications'),
    path('api/notifications/delete-all/frontend/', TemplateView.as_view(template_name='index.html'), name='delete-all-notifications-frontend'),

    # User Manual Docs with Frontend counterparts
    path('api/usermanualdocs/', views.UserManualdocsListCreateView.as_view(), name='usermanualdocs-list-create'),
    path('api/usermanualdocs/frontend/', TemplateView.as_view(template_name='index.html'), name='usermanualdocs-list-create-frontend'),
    path('api/usermanualdocs/<int:pk>/', views.UserManualdocsDetailView.as_view(), name='usermanualdocs-detail'),
    path('api/usermanualdocs/<int:pk>/frontend/', TemplateView.as_view(template_name='index.html'), name='usermanualdocs-detail-frontend'),
    path('api/usermanualdocs/<int:doc_id>/view/', views.view_file, name='view-file'),
    path('api/usermanualdocs/<int:doc_id>/view/frontend/', TemplateView.as_view(template_name='index.html'), name='view-file-frontend'),
    path('api/usermanualdocs/<int:doc_id>/download/', views.download_file, name='download-file'),
    path('api/usermanualdocs/<int:doc_id>/download/frontend/', TemplateView.as_view(template_name='index.html'), name='download-file-frontend'),

    # Training Attendance Management with Frontend counterparts
    path('training-batches/active/', ActiveTrainingBatchListView.as_view(), name='active-training-batches'),
    path('training-batches/active/frontend/', TemplateView.as_view(template_name='index.html'), name='active-training-batches-frontend'),
    path('training-batches/past/', PastTrainingBatchListView.as_view(), name='past-training-batches'),
    path('training-batches/past/frontend/', TemplateView.as_view(template_name='index.html'), name='past-training-batches-frontend'),
    path('attendance-detail/<str:batch_id>/', BatchAttendanceDetailView.as_view(), name='batch-attendance-detail'),
    path('attendance-detail/<str:batch_id>/frontend/', TemplateView.as_view(template_name='index.html'), name='batch-attendance-detail-frontend'),
    path('attendances/', BulkAttendanceUpdateView.as_view(), name='bulk-attendance-update'),
     path('batch/<str:batch_id>/completion-status/', BatchCompletionStatusView.as_view(), name='batch-completion-status'),
    path('batch/<str:batch_id>/toggle-completion/', ToggleBatchCompletionView.as_view(), name='toggle-batch-completion'),
    path('batch/<str:batch_id>/reopen/', ReopenBatchView.as_view(), name='reopen-batch'),
    path('batch/<str:batch_id>/all-attendance/', BatchAllAttendanceView.as_view(), name='batch-all-attendance'),

    path('attendances/frontend/', TemplateView.as_view(template_name='index.html'), name='bulk-attendance-update-frontend'),
    path('batches/<str:batch_id>/complete/', CompleteTrainingBatchView.as_view(), name='complete-training-batch'),
    path('batches/<str:batch_id>/complete/frontend/', TemplateView.as_view(template_name='index.html'), name='complete-training-batch-frontend'),
    path('batch/<str:batch_id>/absentees/', AbsentUsersListView.as_view(), name='absent-users-list'),
    path('batch/<str:batch_id>/absentees/frontend/',  TemplateView.as_view(template_name='index.html'), name='absent-users-list-frontend'),
         # Subtopics
    path('subtopics/by-day/<int:day_id>/', SubTopicsByDayView.as_view(), name='subtopics-by-day'),
    path('subtopics/by-day/<int:day_id>/frontend/', TemplateView.as_view(template_name='index.html'), name='subtopics-by-day-frontend'),
    
    # Rescheduled Sessions
    path('rescheduled-sessions/', RescheduledSessionListView.as_view(), name='rescheduled-sessions-list'),
    path('rescheduled-sessions/frontend/', TemplateView.as_view(template_name='index.html'), name='rescheduled-sessions-list-frontend'),

    path('rescheduled-sessions/create/', RescheduledSessionCreateView.as_view(), name='rescheduled-session-create'),
    path('rescheduled-sessions/create/frontend/', TemplateView.as_view(template_name='index.html'), name='rescheduled-session-create-frontend'),

    path('rescheduled-sessions/<int:pk>/', RescheduledSessionDetailView.as_view(), name='rescheduled-session-detail'),
    path('rescheduled-sessions/<int:pk>/frontend/', TemplateView.as_view(template_name='index.html'), name='rescheduled-session-detail-frontend'),

    path('rescheduled-sessions/mark-attendance/', MarkRescheduledAttendanceView.as_view(), name='mark-rescheduled-attendance'),
    path('rescheduled-sessions/mark-attendance/frontend/', TemplateView.as_view(template_name='index.html'), name='mark-rescheduled-attendance-frontend'),

    path('batch/<str:batch_id>/rescheduled-sessions/', BatchRescheduledSessionsView.as_view(), name='batch-rescheduled-sessions'),
    path('batch/<str:batch_id>/rescheduled-sessions/frontend/', TemplateView.as_view(template_name='index.html'), name='batch-rescheduled-sessions-frontend'),

    path('reschedule-from-absent/', RescheduleFromAbsentView.as_view(), name='reschedule-from-absent'),
    path('reschedule-from-absent/frontend/', TemplateView.as_view(template_name='index.html'), name='reschedule-from-absent-frontend'),

    #================================management review================================
    path('current-month/training-data/', CurrentMonthTrainingDataView.as_view(), name='current-month-training-data'),
    path('current-month/defects-data/', CurrentMonthDefectsDataView.as_view(), name='current-month-defects-data'),
    path('chart/internal-rejection/', InternalRejectionChartView.as_view(), name='internal-rejection-chart'),
    path('chart/operators/', OperatorsChartView.as_view(), name='operators-chart'),
    path('chart/training-plans/', TrainingPlansChartView.as_view(), name='training-plans-chart'),
    path('chart/defects-msil/', DefectsChartView.as_view(), name='defects-msil-chart'),
    path('chart/tier1-defects/', Tier1DefectsChartView.as_view(), name='tier1-defects-chart'),
    path('management/download-template/', ManagementDownloadTemplateView.as_view(), name='management-download-template'),
    path('management/upload-excel/', ManagementUploadExcelView.as_view(), name='management-upload-excel'),


    #=========================================== Advance Manpower ==================================

    path('chart/advanced-manpower-trend/', AdvancedManpowerTrendChartView.as_view(), name='advanced-manpower-trend'),
    path('chart/attrition-trend/', AttritionChartView.as_view(), name='attrition-trend'),
    path('chart/buffer-manpower-trend/', BufferManpowerChartView.as_view(), name='buffer-manpower-trend'),
    path('chart/absenteeism-trend/', AbsenteeismChartView.as_view(), name='absenteeism-trend'),
    path('chart/bifurcation-stats/', BifurcationStatsView.as_view(), name='bifurcation-stats'),
    path('chart/advance-card-stats/', AdvanceCardStatsView.as_view(), name='advance-card-stats'),
    

    # Employee Data with Frontend counterparts
    path('employee-report/', EmployeeReportPDFView.as_view(), name='employee-report'),
    path('employee-card-details/', EmployeeCardDetailsView.as_view(), name='employee-card-details'),
    path('employee-card-details/frontend/', TemplateView.as_view(template_name='index.html'), name='employee-card-details-frontend'),
    path("employee-skill-search/", EmployeeSkillSearch.as_view(), name="employee-skill-search"),
    path("employee-skill-search/frontend/", TemplateView.as_view(template_name='index.html'), name='employee-skill-search-frontend'),
    path('levels/<int:level_pk>/criteria/', EvaluationCriterionViewSet.as_view({'get': 'list'}), name='level-criteria'),
    path('levels/<int:level_pk>/criteria/frontend/', TemplateView.as_view(template_name='index.html'), name='level-criteria-frontend'),


    path('scores/passed/level-1/', LevelOnePassedUsersView.as_view(), name='passed-level-one-scores'),
    path('scores/passed/level-1/frontend/', TemplateView.as_view(template_name='index.html'), name='passed-level-one-scores-frontend'),
    path('observancesheets/operator/<str:operator_name>/level/<str:level>/station/<path:station_name>/',
    get_sheet_by_operator_level_station, name='get-sheet-by-operator-level-station'),
#     path('observancesheets/operator/<str:operator_name>/level/<str:level>/station/<str:station_name>/',
#      get_sheet_by_operator_level_station, name='get-sheet-by-operator-level-station'),
    path('observancesheets/operator/<str:operator_name>/level/<str:level>/station/<str:station_name>/frontend/',
     TemplateView.as_view(template_name='index.html'), name='get-sheet-by-operator-level-station-frontend'),
    path('skill-matrix-excel-handler/', SkillMatrixExcelHandlerView.as_view(), name='skill-matrix-excel-handler'),
    path('skill-matrix-excel-handler/frontend/', TemplateView.as_view(template_name='index.html'), name='skill-matrix-excel-handler-frontend'),



    # path('upload-review/', ManagementReviewUploadAPIView.as_view(), name='upload_management_review_api'),
    # path('upload-review/frontend/', TemplateView.as_view(template_name='index.html'), name='upload_management_review_api_frontend'),
    # path('download-sample/', download_sample_excel, name='download_sample_excel'),
    # path('download-sample/frontend/', TemplateView.as_view(template_name='index.html'), name='download_sample_excel_frontend'),






    path('skill-matrix/report/download/', SkillMatrixExcelView.as_view(), name='skill_matrix_report_download'),
    path('station-requirements/', views.get_station_requirements, name='station-requirements'),



    path('api/answersheet/<int:score_id>/', views.AnswerSheetView.as_view(), name='answer-sheet-detail'),
    path('api/results/matrix/<int:level_id>/<int:station_id>/', views.LevelStationMatrixView.as_view(), name='results-matrix'),
    
     #Biometric realtime
    path('api/attendance-logs/', AttendanceLogView.as_view(), name='attendance-logs'),
    path('api/attendance-db/', AttendanceDatabaseView.as_view(), name='attendance-db'),
    
    #Biometric Attendance
    path('bioattendance/upload-excel/', ExcelUploadView.as_view(), name='excel-upload'), 
    path('set-task-time/attendance/', SetAttendanceTaskTimeView.as_view()),##################################
    path('biometric-attendance/summary/', MonthlySummaryView.as_view(), name='monthly-summary'),
    path('biometric-attendance/employee-detail/', EmployeeMonthlyDetailView.as_view()),
    path('system-settings/', SystemSettingsView.as_view(), name='system-settings'),
    path('validate-path/', ValidatePathView.as_view(), name='validate-path'),


    path('chart/bifurcation-statslive/', bifurcation_stats_view, name='bifurcation_stats'),
    path('chart/total-stats/', total_manpower_stats_view, name='total_manpower_stats'),
    path('chart/absenteeism-trendlive/', AbsenteeismTrendView.as_view(), name='absenteeism-trend'),
    path('chart/current-stats/', views.current_manpower_card_view, name='current-manpower-stats'),
    path('chart/advance-unified/', AdvanceDashboardUnifiedView.as_view(), name='advance-unified'),
    path('chart/skill-matrix-unified/', SkillMatrixDashboardUnifiedView.as_view(), name='skill-matrix-unified'),
    


    # =================== ACTION PLAN ==============================
    path('api/actions/', ActionItemListCreateView.as_view(), name='action-list'),
    path('api/actions/<int:pk>/', ActionItemDetailView.as_view(), name='action-detail'),


    path('api/actionsrejection/', ActionItemRejectionListCreateView.as_view(), name='action-list'),
    path('api/actionsrejection/<int:pk>/', ActionItemRejectionDetailView.as_view(), name='action-detail'),

    path('Buffer_manpower_live/', Buffer_manpower_live, name='Buffer_manpower_live'),
# 



    # Attendance endpoints
    path('attendances/all_reschedules/', 
         EmployeeAttendanceViewSet.as_view({'get': 'all_reschedules'}), 
         name='all-reschedules'),
    
    # Get only pending reschedules (DEPRECATED - use all_reschedules)
    path('attendances/pending_reschedule/', 
         EmployeeAttendanceViewSet.as_view({'get': 'pending_reschedule'}), 
         name='pending-reschedule'),
    
    # Get attendance by schedule
    path('attendances/by_schedule/', 
         EmployeeAttendanceViewSet.as_view({'get': 'by_schedule'}), 
         name='by-schedule'),
    
    # Update reschedule details
    path('attendances/<int:pk>/update_reschedule/', 
         EmployeeAttendanceViewSet.as_view({'patch': 'update_reschedule'}), 
         name='update-reschedule'),
         
    path('attendances/<int:pk>/mark_as_present/', 
         EmployeeAttendanceViewSet.as_view({'post': 'mark_as_present'}), 
         name='mark-as-present'),
    
    # Reschedule history endpoint
    path('attendances/reschedule_history/', 
         EmployeeAttendanceViewSet.as_view({'get': 'reschedule_history'}), 
         name='reschedule-history'),
    # Add this to your urlpatterns
    path('schedules/<int:pk>/update_next_training_date/', 
     ScheduleViewSet.as_view({'patch': 'update_next_training_date'}), 
     name='update-next-training-date'),
     # urls.py
        # ====end============ 

    # Question Bank & Questions
    # 1. Question Bank & Questions (Prefix: refresher/)
    path('refresher/categories/<int:category_id>/question-bank/', views.RefresherQuestionBankDetail.as_view()),    
    path('refresher/questions/', views.RefresherQuestionListCreate.as_view()),
    path('refresher/questions/<int:pk>/', views.RefresherQuestionDetail.as_view()),
    path('refresher/questions/bulk-upload/', views.RefresherQuestionBulkUpload.as_view()),
    path('refresher/questions/template/', views.RefresherQuestionTemplateDownload.as_view()),

    # 2. Test Execution (Prefix: refresher/)
    path('refresher/test/start/', views.RefresherTestStart.as_view()),
    path('refresher/test/submit/', views.RefresherTestSubmit.as_view()),
    path('refresher/test/remote-event/', views.RefresherRemoteEvent.as_view()),
    path('dashboard/summary/', dashboard_summary, name='dashboard-summary'), 
    # Reports
    path('refresher/reports/effectiveness/', views.TrainingEffectivenessReport.as_view()),
    path('refresher/questions/bulk-action/', views.RefresherQuestionBulkAction.as_view()),
    path('schedules/<int:pk>/contents/', views.ScheduleContentList.as_view()),
    path(
        'poison-cake-tests/<int:pk>/schedule-reeval/',
        views.PoisonCakeTestViewSet.as_view({'patch': 'schedule_reeval'}),
        name='poison-cake-test-schedule-reeval'
    ),
    path('download-employee-template/', views.download_employee_template, name='download-employee-template'),

    



    path('', include(router.urls)),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)


# from django.urls import include, path,include
# from . import views
# from rest_framework_simplejwt.views import TokenRefreshView

# from django.conf import settings
# from django.conf.urls.static import static

# from rest_framework.routers import DefaultRouter
# from .views import ARVRTrainingContentViewSet, ActiveTrainingBatchListView, BatchAttendanceDetailView, AdvanceManpowerDashboardViewSet, BodyCheckSubmissionView, BulkAttendanceUpdateView, CompanyLogoViewSet, CompleteTrainingBatchView, CurrentMonthDefectsDataView, CurrentMonthTrainingDataView,  CurriculumContentViewSet, CurriculumViewSet, DailyProductionDataViewSet, DaysViewSet, DefectsChartView, DepartmentStationViewSet, DepartmentSubLineViewSet, EmployeeAttendanceViewSet, EmployeeCardDetailsView, EmployeeExcelViewSet, EmployeeHandoverView, EmployeeSkillSearch, EvaluationCriterionViewSet, EvaluationLevel2ViewSet, EvaluationViewSet, HanContentViewSet, HanSubtopicViewSet, HanTrainingContentViewSet, HanchouExamQuestionViewSet, HanchouExamResultViewSet, HanchouResultCertificatePDF, HandoverSheetViewSet, HierarchyAllDepartmentsView, HierarchyByDepartmentView, HierarchyStructureViewSet,  HqViewSet, FactoryViewSet, DepartmentViewSet, HumanBodyQuestionsViewSet, KeyEventCreateView, LatestKeyEventView, Level2QuantityOJTEvaluationViewSet, LevelColourViewSet, LevelOnePassedUsersView, LevelViewSet, LevelWiseTrainingContentViewSet, LineViewSet, MachineAllocationApprovalViewSet, MachineAllocationViewSet, MachineViewSet, ManagementReviewUploadAPIView, ManagementReviewViewSet, MasterTableViewSet, MultiSkillingViewSet, NotificationViewSet, OJTDayListView, OJTDayViewSet, OJTLevel2QuantityViewSet, OJTPassingCriteriaViewSet, OJTScoreRangeViewSet, OJTScoreViewSet, OJTTopicListView, OJTTopicViewSet, PastTrainingBatchListView, OperatorsChartView,  ProductionPlanViewSet, ProductivityEvaluationViewSet, ProductivitySequenceViewSet, QualityEvaluationViewSet, QualitySequenceViewSet, QuantityOJTScoreRangeViewSet, QuantityPassingCriteriaViewSet, QuestionPaperViewSet, QuestionViewSet, RescheduleLogViewSet, RetrainingConfigViewSet, RetrainingSessionViewSet, RoleViewSet, ScheduleViewSet, ShoContentViewSet, ShoSubtopicViewSet, ShoTrainingContentViewSet, ShokuchouExamQuestionViewSet, ShokuchouExamResultViewSet, ShokuchouResultCertificatePDF, SkillMatrixDisplaySettingViewSet, SkillMatrixViewSet, StationLevelQuestionPaperViewSet, StationSettingCreateView, SubLineViewSet, StationViewSet, SubTopicContentViewSet, SubTopicViewSet, SubmitWebTestAPIView, TemplateQuestionViewSet,  TraineeInfoListView, TraineeInfoViewSet, Trainer_nameViewSet, Training_categoryViewSet, TrainingContentViewSet, TrainingPlansChartView, TrainingTopicViewSet, UserBodyCheckListView, UserRegistrationViewSet, UserViewSet, VenueViewSet, create_system_notification, create_test_notification, delete_all_notifications, download_sample_excel, notification_count, serve_han_material_file, serve_sho_material_file,EvaluationPassingCriteriaViewSet, test_notifications, trigger_all_notification_types, trigger_employee_notification
# from django.urls import path, include
# from rest_framework.routers import DefaultRouter
# from .views import (
#     TenCycleDayConfigurationViewSet,
#     TenCycleTopicsViewSet,
#     TenCycleSubTopicViewSet,
#     TenCyclePassingCriteriaViewSet,
#     OperatorPerformanceEvaluationViewSet,
#     EvaluationSubTopicMarksViewSet,TenCycleConfigurationViewSet,TopicViewSet,OperatorObservanceSheetViewSet
# )
# from .views import get_sheet_by_operator_level_station


# router = DefaultRouter()
# router.register(r'hq', HqViewSet, basename='hq')
# router.register(r'factories', FactoryViewSet, basename='factory')
# router.register(r'departments', DepartmentViewSet, basename='department')
# router.register(r'lines', LineViewSet, basename='line')
# router.register(r'sublines', SubLineViewSet, basename='subline')
# router.register(r'stations', StationViewSet, basename='station')
# router.register(r'hierarchy-structures', HierarchyStructureViewSet, basename='hierarchy-structure')


# #10 cycle

# router.register(r'tencycle-days', TenCycleDayConfigurationViewSet, basename='tencycle-day')
# router.register(r'tencycle-topics', TenCycleTopicsViewSet, basename='tencycle-topic')
# router.register(r'tencycle-subtopics', TenCycleSubTopicViewSet, basename='tencycle-subtopic')
# router.register(r'tencycle-passingcriteria', TenCyclePassingCriteriaViewSet, basename='tencycle-passingcriteria')
# router.register(r'operator-evaluations', OperatorPerformanceEvaluationViewSet, basename='operator-evaluation')
# router.register(r'evaluation-marks', EvaluationSubTopicMarksViewSet, basename='evaluation-mark')
# router.register(r'tencycle-configuration', TenCycleConfigurationViewSet, basename='tencycle-configuration')


# router.register(r'levels', LevelViewSet)
# router.register(r'days', DaysViewSet)
# router.register(r'subtopics', SubTopicViewSet)
# router.register(r'subtopic-contents', SubTopicContentViewSet)
# router.register(r'training-contents', TrainingContentViewSet)
# router.register(r'evaluations', EvaluationViewSet)
# router.register(r'mastertable', MasterTableViewSet, basename='mastertable')
# router.register(r'humanbody-questions', HumanBodyQuestionsViewSet, basename='humanbody-questions')
# router.register(r'production-plans', ProductionPlanViewSet, basename='production-plan')

# router.register(r'machines', MachineViewSet, basename='machines')
# router.register(r'allocations', MachineAllocationViewSet, basename='allocations')

# router.register(r'machine-allocation-approval', MachineAllocationApprovalViewSet, basename='machineallocationapproval')


# router.register(r'questionpapers', QuestionPaperViewSet, basename='questionpaper')
# router.register(r'station-level-questionpapers', StationLevelQuestionPaperViewSet, basename='stationlevelquestionpaper')
# router.register(r'arvr-content', ARVRTrainingContentViewSet, basename='arvr-content')




# router.register(r'template-questions', TemplateQuestionViewSet, basename='templatequestion')


# # hanshou & shokuchou 

# router.register(r'hanchou-questions', HanchouExamQuestionViewSet, basename='hanchou-questions')
# router.register(r"hanchou/results", HanchouExamResultViewSet, basename="hanchou-results")

# router.register(r"shokuchou-questions", ShokuchouExamQuestionViewSet, basename="shokuchou-questions")
# router.register(r"shokuchou/results", ShokuchouExamResultViewSet, basename="shokuchou-results")


# router.register(r'han-content', HanContentViewSet, basename='han-content')
# router.register(r'han-subtopics', HanSubtopicViewSet,  basename='han-subtopic') 
# router.register(r'han-materials', HanTrainingContentViewSet, basename='han-material')

# router.register(r'sho-content', ShoContentViewSet, basename='sho-content')
# router.register(r'sho-subtopics', ShoSubtopicViewSet, basename='sho-subtopic')
# router.register(r'sho-materials', ShoTrainingContentViewSet, basename='sho-material')




# router.register(r'ojt-topics', OJTTopicViewSet, basename='ojt-topic')
# router.register(r'ojt-days', OJTDayViewSet, basename='ojt-day')
# router.register(r'ojt-score-ranges', OJTScoreRangeViewSet, basename='ojt-scorerange')
# router.register(r'ojt-scores', OJTScoreViewSet)
# router.register(r'ojt-passing-criteria', OJTPassingCriteriaViewSet)
# router.register(r'trainees', TraineeInfoViewSet, basename='trainees')
# router.register(r"ojt-quantity", OJTLevel2QuantityViewSet)


# # Refreshment Training
# router.register(r'training-categories', Training_categoryViewSet)
# router.register(r'curriculums', CurriculumViewSet, basename='curriculum')
# router.register(r'curriculum-contents', CurriculumContentViewSet, basename='curriculumcontent')
# router.register(r'trainer_name', Trainer_nameViewSet)
# router.register(r'venues', VenueViewSet)
# router.register(r'schedules', ScheduleViewSet)
# router.register(r'empattendances', EmployeeAttendanceViewSet, basename='attendance')
# router.register(r'reschedule-logs', RescheduleLogViewSet, basename='reschedulelog')


# router.register(r"score-ranges", QuantityOJTScoreRangeViewSet, basename="quantity-score-range")
# router.register(r"passing-criteria", QuantityPassingCriteriaViewSet, basename="quantity-passing-criteria")
# router.register(r"ojt-evaluations", Level2QuantityOJTEvaluationViewSet)


# router.register(r'logos', CompanyLogoViewSet)
# router.register(r'evaluation-passing-criteria', EvaluationPassingCriteriaViewSet, basename='evaluation-passing-criteria')



# router.register(r'retraining-sessions', RetrainingSessionViewSet, basename='retraining-session')
# router.register(r'retraining-configs', RetrainingConfigViewSet, basename='retraining-config')
# router.register(r'notifications', NotificationViewSet, basename='notifications')

# router.register(r'levelcolours', LevelColourViewSet, basename="levelcolours")
# router.register(r'displaysetting', SkillMatrixDisplaySettingViewSet, basename='displaysetting')

# router.register(r'department-sublines', DepartmentSubLineViewSet, basename='department-sublines')
# router.register(r'department-stations', DepartmentStationViewSet, basename='department-stations')


# router.register(r"users", UserViewSet, basename="user")
# router.register(r'roles', RoleViewSet, basename='role')

# router.register(r'handovers', HandoverSheetViewSet, basename='handover')

# router.register(r'production-data', DailyProductionDataViewSet, basename='productiondata')

# router.register( r"training_topics", TrainingTopicViewSet, basename="training_topic")
# router.register(r"levelwise-training-contents", LevelWiseTrainingContentViewSet, basename="levelwisetrainingcontent")

# router.register(r"skill-matrix", SkillMatrixViewSet, basename="skill-matrix")



# router.register(r'advance-dashboard', AdvanceManpowerDashboardViewSet, basename='advance-dashboard')
# router.register(r'management-reviews', ManagementReviewViewSet, basename='managementreview')


# router.register(r'employees-excel', EmployeeExcelViewSet, basename='employee-excel')


# router.register(r"multiskilling", MultiSkillingViewSet, basename="multiskilling")

# router.register(r'skillevaluations', EvaluationLevel2ViewSet, basename='evaluation-level2')
# router.register(r'criteria', EvaluationCriterionViewSet, basename='criterion')


# # level 1 productivity and quality sheet 
# router.register(r"productivityevaluations", ProductivityEvaluationViewSet)
# router.register(r"sequences", ProductivitySequenceViewSet)
# router.register(r"qualityevaluations", QualityEvaluationViewSet)
# router.register(r"qualitysequences", QualitySequenceViewSet)

# router.register(r'questions', QuestionViewSet)
# # operator observance sheet
# router.register(r'topics', TopicViewSet, basename='topic')
# router.register(r'observancesheets', OperatorObservanceSheetViewSet, basename='observancesheet')

# urlpatterns = [

#     path('register/', views.RegisterView.as_view(), name="register"),
#     path('login/', views.LoginAPIView.as_view(), name='login'),
#     path('logout/', views.LogoutAPIView.as_view(), name="logout"),

    
#     path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
#     # path('api/', include(router.urls)),
#     path('temp-user-info/', UserRegistrationViewSet.as_view({'get': 'list', 'post': 'create'}), name='temp-user-info'),
#     path('users/<str:temp_id>/', UserRegistrationViewSet.as_view({'get': 'retrieve', 'patch': 'partial_update', 'put': 'update'}), name='user-update'),
#     # Body check endpoints
#     path('human-body-checks/', BodyCheckSubmissionView.as_view(), name='human-body-checks'),
#     path('user-body-checks/', UserBodyCheckListView.as_view(), name='user-body-checks'),


#     path('han-materials/<int:pk>/serve/', serve_han_material_file, name='serve-han-material-file'),

#     # URL for Shokuchou files
#     path('sho-materials/<int:pk>/serve/', serve_sho_material_file, name='serve-sho-material-file'),

#     path('hanchou-results/<int:pk>/download-certificate/', HanchouResultCertificatePDF.as_view(), name='download-hanchou-certificate'),
#     path('shokuchou-results/<int:pk>/download-certificate/', ShokuchouResultCertificatePDF.as_view(), name='download-shokuchou-certificate'),

#     path('ojt-days-list/', OJTDayListView.as_view(), name="ojt-days-list"),
#     path('ojt-topics-list/', OJTTopicListView.as_view(), name="ojt-topics-list"),
#     path("trainee-info-list/", TraineeInfoListView.as_view(), name="trainee-info-list"),

#     path('station-settings/', StationSettingCreateView.as_view(), name='station-setting-create'),



#     path('start-test/', views.StartTestSessionView.as_view(), name='start_test_session'),
#     path('api/end-test/', views.EndTestSessionView.as_view(), name='end_test_session'),
#     path('api/scores/', views.ScoreListView.as_view(), name='score_list'),
#     path('api/test-session/map/', views.KeyIdToEmployeeNameMap.as_view(), name='keyid-name-map'),
#     path('api/past-sessions/', views.PastTestSessionsView.as_view()),
#     path('api/score-summary/', views.ResultSummaryAPIView.as_view(), name='score-summary'),
#     path('api/skills/', views.SkillListView.as_view(), name='skill-list'),
#     path('api/scores-by-session/<path:name>/', views.ScoresByTestView.as_view()),
#     path('submit-web-test/', SubmitWebTestAPIView.as_view(), name='submit-web-test'),
#     path('api/key-events/create/', KeyEventCreateView.as_view()),
#     path('api/key-events/latest/', LatestKeyEventView.as_view()),
#     path('api/connect-events/create/', views.connect_event_create, name='connect_event_create'),
#     path('api/vote-events/create/', views.vote_event_create, name='vote_event_create'),
#     path('api/assessment-mode/', views.get_assessment_mode, name='get_assessment_mode'),
#     path('api/assessment-mode/toggle/', views.toggle_assessment_mode, name='toggle_assessment_mode'),
#     path('department/<int:department_id>/lines/', views.get_lines_by_department, name='lines-by-department'),
#     path('line/<int:line_id>/sublines/', views.get_sublines_by_line, name='sublines-by-line'),
#     path('subline/<int:subline_id>/stations/', views.get_stations_by_subline, name='stations-by-subline'),
#     path('department/<int:department_id>/stations/', views.get_stations_by_department, name='stations-by-department'),
#     path('line/<int:line_id>/stations/', views.get_stations_by_line, name='stations-by-line'),
#     path('fetch-departments/', views.get_all_departments, name='fetch-departments'),


#     path('api/notifications/count/', notification_count, name='notification-count'),
#     path('api/notifications/system/', create_system_notification, name='create-system-notification'),
#     path('api/notifications/test/', create_test_notification, name='create-test-notification'),
#     path('api/notifications/debug/', test_notifications, name='test-notifications'),
#     path('api/notifications/trigger-employee/', trigger_employee_notification, name='trigger-employee-notification'),
#     path('api/notifications/trigger-all-types/', trigger_all_notification_types, name='trigger-all-notification-types'),
#     path('api/notifications/delete-all/', delete_all_notifications, name='delete-all-notifications'),





#     path('scores/passed/level-1/', LevelOnePassedUsersView.as_view(), name='passed-level-one-scores'),
#     path("handovers/employee/<str:emp_id>/", EmployeeHandoverView.as_view()),
#     path('fetch-departments/', views.get_all_departments, name='fetch-departments'),
#     path("hierarchy/by-department/", HierarchyByDepartmentView.as_view(), name="hierarchy-by-department"),
#     path('hierarchy-simple/', views.get_hierarchy_structures, name='get_hierarchy_structures'),



#     path('production-plans/planning-data/', views.get_planning_data, name='planning-data'),
#     path('trends/operators-required/', views.get_operators_required_trend, name='operators-required-trend'),
#     path('production-data/gap-analysis/', views.monthly_availability_analysis, name='monthly_availability_analysis'),
#     path('production-data/date-range-summary/', views.weekly_availability_summary, name='weekly_availability_summary'),


#     path("hierarchy/all-departments/", HierarchyAllDepartmentsView.as_view(), name="hierarchy-all-departments"),


#     path('api/usermanualdocs/', views.UserManualdocsListCreateView.as_view(), name='usermanualdocs-list-create'),
#     path('api/usermanualdocs/<int:pk>/', views.UserManualdocsDetailView.as_view(), name='usermanualdocs-detail'),
#     path('api/usermanualdocs/<int:doc_id>/view/', views.view_file, name='view-file'),
#     path('api/usermanualdocs/<int:doc_id>/download/', views.download_file, name='download-file'),


#     ## =================== TrainingAttendance ============================= #
#     path('training-batches/active/', ActiveTrainingBatchListView.as_view(), name='active-training-batches'),
#     path('training-batches/past/', PastTrainingBatchListView.as_view(), name='past-training-batches'),
#     path('attendance-detail/<str:batch_id>/', BatchAttendanceDetailView.as_view(), name='batch-attendance-detail'),
#     path('attendances/', BulkAttendanceUpdateView.as_view(), name='bulk-attendance-update'),
#     path('batches/<str:batch_id>/complete/', CompleteTrainingBatchView.as_view(), name='complete-training-batch'), 
#     # =================== TrainingAttendance End ============================= #




#     path('current-month/training-data/', CurrentMonthTrainingDataView.as_view(), name='current-month-training-data'),
#     path('current-month/defects-data/', CurrentMonthDefectsDataView.as_view(), name='current-month-defects-data'),
#     path('chart/operators/', OperatorsChartView.as_view(), name='operators-chart'),
#     path('chart/training-plans/', TrainingPlansChartView.as_view(), name='training-plans-chart'),
#     path('chart/defects-msil/', DefectsChartView.as_view(), name='defects-msil-chart'),

#     path('employee-card-details/', EmployeeCardDetailsView.as_view(), name='employee-card-details'),

#     path("employee-skill-search/", EmployeeSkillSearch.as_view(), name="employee-skill-search"), 

#     path('levels/<int:level_pk>/criteria/', EvaluationCriterionViewSet.as_view({'get': 'list'}), name='level-criteria'),
#     # path('observancesheets/operator/<str:operator_name>/', get_sheet_by_operator, name='get-sheet-by-operator'),
#     path('observancesheets/operator/<str:operator_name>/level/<str:level>/station/<str:station_name>/',
#      get_sheet_by_operator_level_station, name='get-sheet-by-operator-level-station'),



#     path('upload-review/', ManagementReviewUploadAPIView.as_view(), name='upload_management_review_api'),
#     path('download-sample/', download_sample_excel, name='download_sample_excel'),

    

  
#     path('', include(router.urls)),
# ] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)



#     # path('', IndexView.as_view(), name='home'),
# # from .views import IndexView
