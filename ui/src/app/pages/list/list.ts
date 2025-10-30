import { Component, OnInit, inject, ViewChildren, QueryList, AfterViewInit } from '@angular/core';
import { MatAccordion, MatExpansionPanel, MatExpansionPanelHeader, MatExpansionPanelTitle } from '@angular/material/expansion';
import { UserService } from '../../services/users';
import { TransactionService } from '../../services/transaction';
import { MatCard } from '@angular/material/card';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
@Component({
  selector: 'app-list',
  imports: [MatCard, MatExpansionPanel, MatAccordion, MatExpansionPanelHeader, MatExpansionPanelTitle, RouterLink, MatButtonModule],
  templateUrl: './list.html',
  styleUrls: ['./list.sass']
})
export class List implements OnInit, AfterViewInit {
  userServ = inject(UserService);
  transService = inject(TransactionService);

  @ViewChildren(MatAccordion) accordions!: QueryList<MatAccordion>;

  async ngOnInit() {
    await this.userServ.fetchUsers();
  }

  ngAfterViewInit() {
    // All accordions are available here
  }

  async nextPage() {
    await this.userServ.next();
    this.closeAllAccordions();
  }

  async prevPage() {
    await this.userServ.prev();
    this.closeAllAccordions();
  }

  closeAllAccordions() {
    this.accordions.forEach(acc => acc.closeAll());
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
