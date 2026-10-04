import { ActivatedRoute, Router } from '@angular/router';
import { Component } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { addDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase';
@Component({
  selector: 'app-connect',
  templateUrl: './connect.page.html',
  styleUrls: ['./connect.page.scss'],
  standalone: false,
})
export class ConnectPage {
  selectedCategory = '';

  selectedPrompts: string[] = [];

  selectedPrompt = '';

  savePromptDate = '';
  savePromptTime = '';
  openedFromHome = false;

  categoryClass(category: string): string {
    const classes: { [key: string]: string } = {
      Us: 'us',
      'Light & Fun': 'light-and-fun',
      'Plans & Dreams': 'plans-and-dreams',
      'Check-In': 'check-in',
    };

    return classes[category] || '';
  }

  categoryIcon(category: string): string {
    const icons: { [key: string]: string } = {
      Us: 'heart-outline',
      'Light & Fun': 'sparkles-outline',
      'Plans & Dreams': 'compass-outline',
      'Check-In': 'chatbubble-ellipses-outline',
    };

    return icons[category] || 'chatbubble-outline';
  }

  constructor(
    private toastController: ToastController,
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  ionViewWillEnter() {
    const prompt = this.route.snapshot.queryParamMap.get('prompt');
    const category = this.route.snapshot.queryParamMap.get('category');

    if (prompt) {
      this.openedFromHome = true;
      this.selectedPrompt = prompt;
      this.selectedCategory = category || '';
      this.savePromptDate = '';
      this.savePromptTime = '';

      if (!this.selectedCategory) {
        this.findPromptCategory(prompt);
      }

      setTimeout(async () => {
        const modal = document.querySelector(
          'ion-modal#prompt-save-modal',
        ) as any;

        await modal?.present();

        await this.router.navigate([], {
          relativeTo: this.route,
          queryParams: {},
          replaceUrl: true,
        });
      }, 0);
    }
  }

  async findPromptCategory(prompt: string) {
    try {
      const promptsQuery = query(
        collection(db, 'prompts'),
        where('text', '==', prompt),
      );

      const querySnapshot = await getDocs(promptsQuery);

      if (!querySnapshot.empty) {
        const data = querySnapshot.docs[0].data();
        this.selectedCategory = data['category'] || '';
      }
    } catch (error) {
      console.error('Error finding prompt category:', error);
    }
  }

  async closePromptSave(promptSaveModal: any) {
    await promptSaveModal.dismiss();

    if (this.openedFromHome) {
      this.openedFromHome = false;
      await this.router.navigate(['/home']);
    }
  }

  async openCategory(category: string, promptModal: any) {
    this.selectedCategory = category;
    this.selectedPrompts = [];

    try {
      const promptsQuery = query(
        collection(db, 'prompts'),
        where('category', '==', category),
      );

      const querySnapshot = await getDocs(promptsQuery);

      querySnapshot.forEach((doc) => {
        const data = doc.data();

        this.selectedPrompts.push(data['text']);
      });

      await promptModal.present();
    } catch (error) {
      console.error('Error loading prompts:', error);
    }
  }

  openPromptSave(prompt: string, promptSaveModal: any) {
    this.selectedPrompt = prompt;
    this.savePromptDate = '';
    this.savePromptTime = '';

    promptSaveModal.present();
  }

  formatDisplayDate(value: string): string {
    if (!value) {
      return 'Choose a date';
    }

    const [year, month, day] = value.split('-').map(Number);
    const date = new Date(year, month - 1, day);

    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  }

  formatDisplayTime(value: string): string {
    if (!value) {
      return 'Choose a time';
    }

    const [hours, minutes] = value.split(':').map(Number);
    const time = new Date();
    time.setHours(hours, minutes, 0, 0);

    return time.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
  }

  schedulePlanReminder(planTitle: string, planDateTime: Date) {
    const remindersEnabled =
      localStorage.getItem('planRemindersEnabled') === 'true';

    if (!remindersEnabled) return;

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
      trigger: { at: reminderTime },
    });
  }

  async savePromptToPlans(promptSaveModal: any, promptModal: any) {
    if (!this.selectedPrompt || !this.savePromptDate || !this.savePromptTime) {
      return;
    }

    const planDateTime = new Date(
      `${this.savePromptDate}T${this.savePromptTime}`,
    );

    try {
      await addDoc(collection(db, 'plans'), {
        title: this.selectedPrompt,
        date: this.savePromptDate,
        time: this.savePromptTime,
        dateTime: planDateTime,
      });

      this.schedulePlanReminder(this.selectedPrompt, planDateTime);

      await promptSaveModal.dismiss();

      if (!this.openedFromHome) {
        await promptModal.dismiss();
      }

      const toast = await this.toastController.create({
        message: 'Prompt saved to Weekly Plans',
        duration: 1800,
        position: 'bottom',
      });

      await toast.present();
      if (this.openedFromHome) {
        this.openedFromHome = false;
        await this.router.navigate(['/home']);
      }
    } catch (error) {
      console.error('Error saving prompt to plans:', error);
    }
  }
}
