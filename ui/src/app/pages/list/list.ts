import { Component, OnInit, inject, ViewChildren, QueryList, AfterViewInit } from '@angular/core';
import { MatAccordion, MatExpansionPanel, MatExpansionPanelDescription, MatExpansionPanelHeader, MatExpansionPanelTitle } from '@angular/material/expansion';
import { MatIcon } from '@angular/material/icon';
import { MatDivider } from '@angular/material/divider';
import { UserService } from '../../services/list/users';
import { TransactionService } from '../../services/list/transaction';
import { GeneratorService } from '../../services/list/generator';
import { MatCard } from '@angular/material/card';
import { Router, RouterLink, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormField, MatInput, MatLabel } from '@angular/material/input';
import { GeneratorOutput } from '../../model/generator';

@Component({
  selector: 'app-list',
  imports: [
    MatCard,
    MatExpansionPanel,
    MatAccordion,
    MatExpansionPanelHeader,
    MatExpansionPanelTitle,
    MatButtonModule,
    MatInput,
    MatLabel,
    MatFormField,
    MatIcon,
    RouterModule
  ],
  templateUrl: './list.html',
  styleUrls: ['./list.sass']
})
export class List implements OnInit, AfterViewInit {
  userServ = inject(UserService);
  transService = inject(TransactionService);
  genService = inject(GeneratorService);

  @ViewChildren(MatAccordion) accordions!: QueryList<MatAccordion>;

  // Generator type configuration
  private generatorTypes = {
    Wind: { label: 'Wind Turbine', icon: 'air', unitRate: 25 },
    Solar: { label: 'Solar Panel', icon: 'wb_sunny', unitRate: 20 },
    Hydro: { label: 'Hydro Electric', icon: 'water_drop', unitRate: 40 }
  };

  // Add this helper method to the component class
  getShortId(fullId: string): string {
    return fullId.substring(0, 8);
  }
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

  /** Generators - now fetches all at once */
  async fetchUserGenerators(userId: string) {
    await this.genService.fetchGeneratorsForUser(userId);
  }

  // Helper methods for template
  getGeneratorsForUser(userId: string): GeneratorOutput[] {
    const userGens = this.genService.userGenerators()[userId];
    return userGens?.generators || [];
  }

  getTotalGeneratorsForUser(userId: string): number {
    const generators = this.getGeneratorsForUser(userId);
    return generators.reduce((total, gen) => total + gen.count, 0);
  }

  getTotalKwhForUser(userId: string): number {
    const userGens = this.genService.userGenerators()[userId];
    return userGens?.totalKwh || 0;
  }

  getGeneratorLabel(type: string): string {
    return this.generatorTypes[type as keyof typeof this.generatorTypes]?.label || type;
  }

  getGeneratorIcon(type: string): string {
    return this.generatorTypes[type as keyof typeof this.generatorTypes]?.icon || 'help';
  }

  getUnitRate(type: string): number {
    return this.generatorTypes[type as keyof typeof this.generatorTypes]?.unitRate || 0;
  }
}
