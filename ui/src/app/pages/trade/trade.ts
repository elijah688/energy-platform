import { Component, OnInit, inject } from '@angular/core';
import { Energy } from '../../services/energy';
import { MatCardModule } from '@angular/material/card';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-trade',
  standalone: true,
  imports: [
    MatCardModule,
    MatSlideToggleModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    FormsModule,
    CommonModule
  ],
  templateUrl: './trade.html',
  styleUrls: ['./trade.sass']
})
export class Trade implements OnInit {
  energy = inject(Energy);
  snackBar = inject(MatSnackBar);

  sellerIsLeft = true; // toggle
  amount: number = 0;
  pricePerKwh: number = 0;

  ngOnInit() {
    console.log('Selected transaction users:', this.energy.transactionUsers());
  }

  swapSeller() {
    this.sellerIsLeft = !this.sellerIsLeft;
  }

  get seller() {
    const [userA, userB] = this.energy.transactionUsers();
    return this.sellerIsLeft ? userA : userB;
  }

  get buyer() {
    const [userA, userB] = this.energy.transactionUsers();
    return this.sellerIsLeft ? userB : userA;
  }

  // Compute projected balances and energy for display
  projectedBalance(user: any) {
    if (!this.amount || !this.pricePerKwh) return user.user.balance;
    if (user === this.seller) return user.user.balance - this.amount * this.pricePerKwh;
    if (user === this.buyer) return user.user.balance + this.amount * this.pricePerKwh;
    return user.user.balance;
  }

  projectedEnergy(user: any) {
    if (!this.amount) return user.user.energyStored;
    if (user === this.seller) return user.user.energyStored - this.amount;
    if (user === this.buyer) return user.user.energyStored + this.amount;
    return user.user.energyStored;
  }
  executeTransaction() {
    if (!this.seller || !this.buyer || this.amount <= 0 || this.pricePerKwh <= 0) {
      this.snackBar.open('Invalid transaction: amount and price must be greater than 0', 'Close', { duration: 3000 });
      return;
    }

    const sellerBalanceAfter = this.seller.user.balance - this.amount * this.pricePerKwh;
    const sellerEnergyAfter = this.seller.user.energyStored - this.amount;

    if (sellerBalanceAfter < 0 || sellerEnergyAfter < 0) {
      this.snackBar.open('Transaction would result in negative balance or energy. Adjust values.', 'Close', { duration: 4000 });
      return;
    }

    // Update actual balances/energy
    this.seller.user.balance = sellerBalanceAfter;
    this.seller.user.energyStored = sellerEnergyAfter;

    this.buyer.user.balance += this.amount * this.pricePerKwh;
    this.buyer.user.energyStored += this.amount;

    // Reset inputs
    this.amount = 0;
    this.pricePerKwh = 0;

    this.snackBar.open('Transaction executed successfully', 'Close', { duration: 2000 });
  }

}
