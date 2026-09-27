import { Component, OnInit } from '@angular/core';
import { AlertController, ToastController } from '@ionic/angular';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  updateDoc,
} from 'firebase/firestore';
import { db } from '../firebase';

@Component({
  selector: 'app-plans',
  templateUrl: './plans.page.html',
  styleUrls: ['./plans.page.scss'],
  standalone: false,
})
export class PlansPage implements OnInit {
  currentWeekStart = this.getStartOfWeek(new Date());

  days: any[] = [];

  selectedDay: any;

  newPlanTitle = '';
  newPlanDate = '';
  newPlanTime = '';

  editingPlan: any = null;

  editPlanTitle = '';
  editPlanDate = '';
  editPlanTime = '';

  constructor(
    private toastController: ToastController,
    private alertController: AlertController,
  ) {}

  ngOnInit() {
    this.generateWeek();
    this.loadPlans();
  }

  selectDay(day: any) {
    this.selectedDay = day;
  }

  openEditPlan(plan: any, editPlanModal: any) {
    this.editingPlan = plan;
    this.editPlanTitle = plan.title;

    const planDate = new Date(plan.dateTime);

    this.editPlanDate = planDate.toISOString().split('T')[0];

    this.editPlanTime = `${planDate
      .getHours()
      .toString()
      .padStart(2, '0')}:${planDate.getMinutes().toString().padStart(2, '0')}`;

    editPlanModal.present();
  }

  async updatePlan(editPlanModal: any) {
    if (
      !this.editingPlan ||
      !this.editPlanTitle ||
      !this.editPlanDate ||
      !this.editPlanTime
    ) {
      console.log('Please complete all plan fields.');
      return;
    }

    const updatedDateTime = new Date(
      `${this.editPlanDate}T${this.editPlanTime}`,
    );

    try {
      const planRef = doc(db, 'plans', this.editingPlan.id);

      await updateDoc(planRef, {
        title: this.editPlanTitle,
        date: this.editPlanDate,
        time: this.editPlanTime,
        dateTime: updatedDateTime,
      });

      this.editingPlan.title = this.editPlanTitle;
      this.editingPlan.time = updatedDateTime.toLocaleTimeString([], {
        hour: 'numeric',
        minute: '2-digit',
      });
      this.editingPlan.dateTime = updatedDateTime;

      await editPlanModal.dismiss();
      await this.showSaveToast();

      this.generateWeek();
      await this.loadPlans();
    } catch (error) {
      console.error('Error updating plan:', error);
    }
  }

  async confirmDeletePlan(editPlanModal: any) {
    const alert = await this.alertController.create({
      header: 'Delete Plan?',
      message: 'This plan will be permanently removed. Are you sure?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
        },
        {
          text: 'Delete',
          role: 'destructive',
          handler: () => {
            this.deletePlan(editPlanModal);
          },
        },
      ],
    });

    await alert.present();
  }

  async deletePlan(editPlanModal: any) {
    if (!this.editingPlan?.id) {
      return;
    }

    try {
      const planRef = doc(db, 'plans', this.editingPlan.id);

      await deleteDoc(planRef);

      await editPlanModal.dismiss();

      this.generateWeek();
      await this.loadPlans();

      const toast = await this.toastController.create({
        message: 'Plan deleted',
        duration: 1800,
        position: 'bottom',
      });

      await toast.present();
    } catch (error) {
      console.error('Error deleting plan:', error);
    }
  }

  getStartOfWeek(date: Date) {
    const start = new Date(date);
    start.setDate(date.getDate() - date.getDay());
    start.setHours(0, 0, 0, 0);

    return start;
  }

  generateWeek() {
    this.days = [];

    for (let i = 0; i < 7; i++) {
      const date = new Date(this.currentWeekStart);
      date.setDate(this.currentWeekStart.getDate() + i);

      this.days.push({
        shortName: date.toLocaleDateString('en-US', {
          weekday: 'short',
        }),
        name: date.toLocaleDateString('en-US', {
          weekday: 'long',
        }),
        date: date.getDate(),
        fullDate: date.toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
        }),
        fullDateValue: new Date(date),
        plans: [],
      });
    }

    this.selectedDay = this.days[0];
  }

  previousWeek() {
    this.currentWeekStart.setDate(this.currentWeekStart.getDate() - 7);

    this.currentWeekStart = new Date(this.currentWeekStart);

    this.generateWeek();
    this.loadPlans();
  }

  nextWeek() {
    this.currentWeekStart.setDate(this.currentWeekStart.getDate() + 7);

    this.currentWeekStart = new Date(this.currentWeekStart);

    this.generateWeek();
    this.loadPlans();
  }

  async loadPlans() {
    try {
      const querySnapshot = await getDocs(collection(db, 'plans'));

      querySnapshot.forEach((doc) => {
        const data = doc.data();

        const planDate = new Date(data['dateTime'].toDate());

        const matchingDay = this.days.find((day) => {
          const dayDate = day.fullDateValue;

          return (
            dayDate.getFullYear() === planDate.getFullYear() &&
            dayDate.getMonth() === planDate.getMonth() &&
            dayDate.getDate() === planDate.getDate()
          );
        });

        if (matchingDay) {
          matchingDay.plans.push({
            id: doc.id,
            title: data['title'],
            time: new Date(
              `${data['date']}T${data['time']}`,
            ).toLocaleTimeString([], {
              hour: 'numeric',
              minute: '2-digit',
            }),
            dateTime: planDate,
          });
        }
      });
    } catch (error) {
      console.error('Error loading plans:', error);
    }
  }

  async showSaveToast() {
    const toast = await this.toastController.create({
      message: 'Plan saved',
      duration: 1800,
      position: 'bottom',
    });

    await toast.present();
  }

  schedulePlanReminder(planTitle: string, planDateTime: Date) {
    const remindersEnabled =
      localStorage.getItem('planRemindersEnabled') === 'true';

    if (!remindersEnabled) {
      return;
    }

    const reminderIndex = Number(localStorage.getItem('reminderIndex') ?? '1');

    const reminderMinutes = [15, 30, 60, 120];

    const minutesBefore = reminderMinutes[reminderIndex] ?? 30;

    const reminderTime = new Date(
      planDateTime.getTime() - minutesBefore * 60 * 1000,
    );

    if (reminderTime <= new Date()) {
      console.log('Reminder time has already passed.');
      return;
    }

    const localNotification = (window as any).cordova?.plugins?.notification
      ?.local;

    if (!localNotification) {
      console.log('Local notification plugin is not available.');
      return;
    }

    const notificationId = Math.floor(Date.now() % 2147483647);

    const formattedTime = planDateTime.toLocaleTimeString([], {
      hour: 'numeric',
      minute: '2-digit',
    });

    localNotification.schedule({
      id: notificationId,
      title: 'Love in Flight',
      text: `${planTitle} starts at ${formattedTime} ❤️`,
      trigger: {
        at: reminderTime,
      },
    });

    console.log(`Reminder scheduled for ${reminderTime.toLocaleString()}`);
  }

  async savePlan(addPlanModal: any) {
    if (!this.newPlanTitle || !this.newPlanDate || !this.newPlanTime) {
      console.log('Please complete all plan fields.');
      return;
    }

    const planDateTime = new Date(`${this.newPlanDate}T${this.newPlanTime}`);

    try {
      const docRef = await addDoc(collection(db, 'plans'), {
        title: this.newPlanTitle,
        date: this.newPlanDate,
        time: this.newPlanTime,
        dateTime: planDateTime,
      });

      const matchingDay = this.days.find((day) => {
        const dayDate = day.fullDateValue;

        return (
          dayDate.getFullYear() === planDateTime.getFullYear() &&
          dayDate.getMonth() === planDateTime.getMonth() &&
          dayDate.getDate() === planDateTime.getDate()
        );
      });

      if (matchingDay) {
        matchingDay.plans.push({
          id: docRef.id,
          title: this.newPlanTitle,
          time: planDateTime.toLocaleTimeString([], {
            hour: 'numeric',
            minute: '2-digit',
          }),
          dateTime: planDateTime,
        });
      }

      console.log('Plan saved to Firebase.');

      this.schedulePlanReminder(this.newPlanTitle, planDateTime);

      this.newPlanTitle = '';
      this.newPlanDate = '';
      this.newPlanTime = '';

      await addPlanModal.dismiss();
      await this.showSaveToast();
    } catch (error) {
      console.error('Error saving plan:', error);
    }
  }
}
