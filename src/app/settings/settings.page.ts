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

  constructor() {}

  ngOnInit() {
    const savedEnabled = localStorage.getItem('planRemindersEnabled');
    const savedReminderIndex = localStorage.getItem('reminderIndex');

    if (savedEnabled !== null) {
      this.planRemindersEnabled = savedEnabled === 'true';
    }

    if (savedReminderIndex !== null) {
      this.reminderIndex = Number(savedReminderIndex);
    }

    this.updateReminderLabel();
  }

  updateReminderLabel(event?: any) {
    if (event?.detail?.value !== undefined) {
      this.reminderIndex = Number(event.detail.value);
    }

    const labels = [
      '15 minutes before',
      '30 minutes before',
      '1 hour before',
      '2 hours before',
    ];

    this.reminderLabel = labels[this.reminderIndex];

    localStorage.setItem('reminderIndex', this.reminderIndex.toString());
  }

  togglePlanReminders() {
    localStorage.setItem(
      'planRemindersEnabled',
      this.planRemindersEnabled.toString(),
    );
  }
}
