import { Component, OnInit } from '@angular/core';
import { Energy } from '../../services/energy';
import { inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
@Component({
  selector: 'app-list',
  standalone: true,
  imports: [MatCardModule, MatExpansionModule, MatButtonModule, RouterLink],
  templateUrl: './list.html',
  styleUrls: ['./list.sass']
})
export class List implements OnInit {
  energy = inject(Energy)

  ngOnInit() {
    this.energy.fetchUsers();
  }

  nextPage() {
    this.energy.next();
  }

  prevPage() {
    this.energy.prev();
  }
}
