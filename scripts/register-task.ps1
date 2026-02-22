$action = New-ScheduledTaskAction -Execute 'D:\devprojects\astro-image-defaults\scripts\daily-audit.bat'
$trigger = New-ScheduledTaskTrigger -Daily -At '6:00AM'
Register-ScheduledTask -TaskName 'ImageOptimizationAudit' -Action $action -Trigger $trigger -Description 'Daily image optimization audit for all Netlify sites' -Force
