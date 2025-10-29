import { Component, OnInit } from '@angular/core';
import { Energy } from '../../services/energy';
import { inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-list',
  standalone: true,
  imports: [MatCardModule],
  templateUrl: './list.html',
  styleUrls: ['./list.sass']
})
export class List implements OnInit {
  energy = inject(Energy)

  ngOnInit() {
    this.energy.fetchUsers(10, 0);
  }
}
