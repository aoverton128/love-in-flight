import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-plans',
  templateUrl: './plans.page.html',
  styleUrls: ['./plans.page.scss'],
  standalone: false,
})
export class PlansPage implements OnInit {

  days = [
  {
    shortName: 'Sun',
    name: 'Sunday',
    date: 20,
    fullDate: 'September 20',
    plans: []
  },
  {
    shortName: 'Mon',
    name: 'Monday',
    date: 21,
    fullDate: 'September 21',
    plans: [
      { title: 'Study Call', time: '7:00 PM' }
    ]
  },
  {
    shortName: 'Tue',
    name: 'Tuesday',
    date: 22,
    fullDate: 'September 22',
    plans: []
  },
  {
    shortName: 'Wed',
    name: 'Wednesday',
    date: 23,
    fullDate: 'September 23',
    plans: []
  },
  {
    shortName: 'Thu',
    name: 'Thursday',
    date: 24,
    fullDate: 'September 24',
    plans: []
  },
  {
    shortName: 'Fri',
    name: 'Friday',
    date: 25,
    fullDate: 'September 25',
    plans: []
  },
  {
    shortName: 'Sat',
    name: 'Saturday',
    date: 26,
    fullDate: 'September 26',
    plans: [
      { title: 'Movie Night', time: '8:00 PM' }
    ]
  }
];

selectedDay = this.days[6];

constructor() { }

ngOnInit() {
}

selectDay(day: any) {
  this.selectedDay = day;
}

}
