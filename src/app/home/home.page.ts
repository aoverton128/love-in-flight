import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';
import { db } from '../firebase';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage implements OnInit {
  currentMood = 'Not selected';
  moodLoaded = false;

  nextPlanTitle = '';
  nextPlanDate = '';
  nextPlanLoaded = false;

  promptOfTheDay = '';
  promptOfTheDayCategory = '';
  promptLoaded = false;

  moods = [
    'Happy',
    'Excited',
    'Calm',
    'Tired',
    'Sad',
    'Stressed',
    'Angry',
    'Overwhelmed',
    'Playful',
  ];

  moodImages: { [key: string]: string } = {
    Happy: 'assets/avatars/happy.png',
    Excited: 'assets/avatars/excited.png',
    Calm: 'assets/avatars/calm.png',
    Tired: 'assets/avatars/tired.png',
    Sad: 'assets/avatars/sad.png',
    Stressed: 'assets/avatars/stressed.png',
    Angry: 'assets/avatars/angry.png',
    Overwhelmed: 'assets/avatars/overwhelmed.png',
    Playful: 'assets/avatars/playful.png',
  };

  moodIcon(mood: string): string {
    const icons: { [key: string]: string } = {
      Happy: 'sunny-outline',
      Excited: 'sparkles-outline',
      Calm: 'leaf-outline',
      Tired: 'moon-outline',
      Sad: 'water-outline',
      Stressed: 'pulse-outline',
      Angry: 'flame-outline',
      Overwhelmed: 'sync-outline',
      Playful: 'heart-outline',
    };

    return icons[mood] || 'ellipse-outline';
  }

  get currentMoodImage() {
    return this.moodImages[this.currentMood] || 'assets/avatars/calm.png';
  }

  constructor(private router: Router) {}

  ngOnInit() {
    this.loadMood();
  }

  ionViewWillEnter() {
    this.loadNextPlan();
    this.loadPromptOfTheDay();
  }

  async loadMood() {
    try {
      const moodRef = doc(db, 'moods', 'currentUser');
      const moodSnap = await getDoc(moodRef);

      if (moodSnap.exists()) {
        const data = moodSnap.data();
        this.currentMood = data['mood'] || 'Not selected';
      }

      this.moodLoaded = true;
    } catch (error) {
      console.error('Error loading mood:', error);
      this.moodLoaded = true;
    }
  }

  async loadNextPlan() {
    try {
      const querySnapshot = await getDocs(collection(db, 'plans'));
      const now = new Date();

      const upcomingPlans: any[] = [];

      querySnapshot.forEach((planDoc) => {
        const data = planDoc.data();

        if (!data['dateTime']) {
          return;
        }

        const planDateTime = data['dateTime'].toDate();

        if (planDateTime >= now) {
          upcomingPlans.push({
            title: data['title'],
            dateTime: planDateTime,
          });
        }
      });

      upcomingPlans.sort((a, b) => a.dateTime.getTime() - b.dateTime.getTime());

      if (upcomingPlans.length > 0) {
        const nextPlan = upcomingPlans[0];

        this.nextPlanTitle = nextPlan.title;

        this.nextPlanDate = nextPlan.dateTime.toLocaleString('en-US', {
          weekday: 'long',
          hour: 'numeric',
          minute: '2-digit',
        });
      } else {
        this.nextPlanTitle = '';
        this.nextPlanDate = '';
      }

      this.nextPlanLoaded = true;
    } catch (error) {
      console.error('Error loading next plan:', error);
      this.nextPlanLoaded = true;
    }
  }

  async loadPromptOfTheDay() {
    try {
      const today = new Date();
      const todayKey = `${today.getFullYear()}-${String(
        today.getMonth() + 1,
      ).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

      const dailyPromptRef = doc(db, 'dailyPrompt', 'current');
      const dailyPromptSnap = await getDoc(dailyPromptRef);

      if (dailyPromptSnap.exists()) {
        const data = dailyPromptSnap.data();

        if (data['date'] === todayKey && data['text']) {
          this.promptOfTheDay = data['text'];
          this.promptLoaded = true;
          return;
        }
      }

      const querySnapshot = await getDocs(collection(db, 'prompts'));
      const prompts: any[] = [];

      querySnapshot.forEach((promptDoc) => {
        const data = promptDoc.data();

        if (data['text']) {
          prompts.push({
            id: promptDoc.id,
            text: data['text'],
            category: data['category'],
          });
        }
      });

      if (prompts.length > 0) {
        const randomIndex = Math.floor(Math.random() * prompts.length);
        const chosenPrompt = prompts[randomIndex];

        await setDoc(dailyPromptRef, {
          date: todayKey,
          promptId: chosenPrompt.id,
          text: chosenPrompt.text,
          category: chosenPrompt.category,
        });

        this.promptOfTheDay = chosenPrompt.text;
        this.promptOfTheDayCategory = chosenPrompt.category;
      }

      this.promptLoaded = true;
    } catch (error) {
      console.error('Error loading prompt of the day:', error);
      this.promptLoaded = true;
    }
  }

  openPromptOfTheDay() {
    if (!this.promptOfTheDay) {
      return;
    }

    this.router.navigate(['/connect'], {
      queryParams: {
        prompt: this.promptOfTheDay,
        category: this.promptOfTheDayCategory,
      },
    });
  }

  async selectMood(mood: string, moodModal: any) {
    try {
      const moodRef = doc(db, 'moods', 'currentUser');

      await setDoc(moodRef, {
        mood,
        updatedAt: serverTimestamp(),
      });

      this.currentMood = mood;

      await moodModal.dismiss();
    } catch (error) {
      console.error('Error saving mood:', error);
    }
  }
}
