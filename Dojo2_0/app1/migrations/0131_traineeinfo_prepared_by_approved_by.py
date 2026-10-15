from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('app1', '0130_score_test_date_testsession_test_date'),
    ]

    operations = [
        migrations.AddField(
            model_name='traineeinfo',
            name='prepared_by',
            field=models.CharField(blank=True, max_length=100, null=True),
        ),
        migrations.AddField(
            model_name='traineeinfo',
            name='approved_by',
            field=models.CharField(blank=True, max_length=100, null=True),
        ),
    ]