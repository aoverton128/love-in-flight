import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConnectPage } from './connect.page';

describe('ConnectPage', () => {
  let component: ConnectPage;
  let fixture: ComponentFixture<ConnectPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ConnectPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
