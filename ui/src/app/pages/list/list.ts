import { Component, OnInit, inject, ViewChildren, QueryList, AfterViewInit } from '@angular/core';
import { MatAccordion, MatExpansionPanel, MatExpansionPanelHeader, MatExpansionPanelTitle } from '@angular/material/expansion';
import { UserService } from '../../services/users';
import { TransactionService } from '../../services/transaction';
import { GeneratorService } from '../../services/generator';
import { MatCard } from '@angular/material/card';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormField, MatInput, MatLabel } from '@angular/material/input';
import { MatListHarness } from '@angular/material/list/testing';

@Component({
  selector: 'app-list',
  imports: [
    MatCard,
    MatExpansionPanel,
    MatAccordion,
    MatExpansionPanelHeader,
    MatExpansionPanelTitle,
    RouterLink,
    MatButtonModule,
    MatInput,
    MatLabel,
    MatFormField,
  ],
  templateUrl: './list.html',
  styleUrls: ['./list.sass']
})
export class List implements OnInit, AfterViewInit {
  userServ = inject(UserService);
  transService = inject(TransactionService);
  genService = inject(GeneratorService);

  @ViewChildren(MatAccordion) accordions!: QueryList<MatAccordion>;

  async ngOnInit() {
    await this.userServ.fetchUsers();
  }

  ngAfterViewInit() {
    // All accordions are available here
  }
  async onSearch(event: Event) {
    const input = (event.target as HTMLInputElement).value.trim();
    this.userServ.searchTerm.set(input)
    await this.userServ.fetchUsers(this.userServ.limit, 0);
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

  /** Transactions */
  async fetchUserTransactions(userId: string) {
    await this.transService.fetchTransactionsForUser(userId);
  }

  async nextUserTxPage(userId: string) {
    await this.transService.nextPage(userId);
  }

  async prevUserTxPage(userId: string) {
    await this.transService.prevPage(userId);
  }

  /** Generators */
  async fetchUserGenerators(userId: string) {
    await this.genService.fetchGeneratorsForUser(userId);
  }

  async nextUserGenPage(userId: string) {
    await this.genService.nextPage(userId);
  }

  async prevUserGenPage(userId: string) {
    await this.genService.prevPage(userId);
  }
}
