import { Component, OnInit } from '@angular/core';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase';
@Component({
  selector: 'app-connect',
  templateUrl: './connect.page.html',
  styleUrls: ['./connect.page.scss'],
  standalone: false,
})
export class ConnectPage implements OnInit {
  selectedCategory = '';

  selectedPrompts: string[] = [];

  constructor() {}

  ngOnInit() {}

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
}
