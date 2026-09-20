import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
  standalone: false,
})
export class SettingsPage implements OnInit {

  planRemindersEnabled = false;

  reminderIndex = 1;

  reminderLabel = '30 minutes before';

  constructor() { }

  ngOnInit() {
  }

  updateReminderLabel() {
    const labels = [
      '15 minutes before',
      '30 minutes before',
      '1 hour before',
      '2 hours before'
    ];

    this.reminderLabel = labels[this.reminderIndex];
  }

  togglePlanReminders() {
  const localNotification =
    (window as any).cordova?.plugins?.notification?.local;

  if (!localNotification) {
    console.log('Local notification plugin is not available.');
    return;
  }

  if (!this.planRemindersEnabled) {
    localNotification.cancel(2);
    return;
  }

  const reminderTimes = [
    { amount: 15, unit: 'minute' },
    { amount: 30, unit: 'minute' },
    { amount: 1, unit: 'hour' },
    { amount: 2, unit: 'hour' }
  ];

  const selectedTime = reminderTimes[this.reminderIndex];

  localNotification.schedule({
    id: 2,
    title: 'Love in Flight',
    text: 'You have an upcoming plan ❤️',
    trigger: {
      in: selectedTime.amount,
      unit: selectedTime.unit
    }
  });
}

}
