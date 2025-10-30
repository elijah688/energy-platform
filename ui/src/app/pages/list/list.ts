import { Component, OnInit, inject } from '@angular/core';
import { UserService } from '../../services/users';
import { TransactionService } from '../../services/transaction';
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
  userServ = inject(UserService);
  transService = inject(TransactionService);

  async ngOnInit() {
    await this.userServ.fetchUsers();
  }

  async nextPage() {
    await this.userServ.next();
  }

  async prevPage() {
    await this.userServ.prev();
  }

  async fetchUserTransactions(userId: string) {
    await this.transService.fetchTransactionsForUser(userId);
  }

  async nextUserTxPage(userId: string) {
    await this.transService.nextPage(userId);
  }

  async prevUserTxPage(userId: string) {
    await this.transService.prevPage(userId);
  }
}
