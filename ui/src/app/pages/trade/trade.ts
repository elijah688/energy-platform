import { Component, OnInit, inject } from '@angular/core';
import { UserService } from '../../services/users';
import { TransactionService } from '../../services/transaction';
import { MatCardModule } from '@angular/material/card';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

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
  readonly userService = inject(UserService);
  private readonly transService = inject(TransactionService);
  private readonly snackBar = inject(MatSnackBar);
  private router = inject(Router);

  sellerIsLeft = true;
  amount: number = 0.0;
  pricePerKwh: number = 0.0;

  ngOnInit() {
    console.log('Selected transaction users:', this.userService.selecterUsers());
  }

  swapSeller() {
    this.sellerIsLeft = !this.sellerIsLeft;
  }

  get seller() {
    const [userA, userB] = this.userService.selecterUsers();
    return this.sellerIsLeft ? userA : userB;
  }

  get buyer() {
    const [userA, userB] = this.userService.selecterUsers();
    return this.sellerIsLeft ? userB : userA;
  }

  // Compute projected balances and energy for display
  projectedBalance(user: any) {
    if (!this.amount || !this.pricePerKwh) return user.balance;
    if (user === this.seller) return user.balance + this.amount * this.pricePerKwh;
    if (user === this.buyer) return user.balance - this.amount * this.pricePerKwh;
    return user.balance;
  }

  projectedEnergy(user: any) {
    if (!this.amount) return user.energyStored;
    if (user === this.seller) return user.energyStored - this.amount;
    if (user === this.buyer) return user.energyStored + this.amount;
    return user.energyStored;
  }

  executeTransaction() {
    if (!this.seller || !this.buyer || this.amount <= 0 || this.pricePerKwh <= 0) {
      this.snackBar.open('Invalid transaction: amount and price must be greater than 0', 'Close', { duration: 3000 });
      return;
    }

    const sellerBalanceAfter = this.seller.balance + this.amount * this.pricePerKwh;
    const sellerEnergyAfter = this.seller.energyStored - this.amount;

    if (sellerBalanceAfter < 0 || sellerEnergyAfter < 0) {
      this.snackBar.open('Transaction would result in negative balance or energy. Adjust values.', 'Close', { duration: 4000 });
      return;
    }

    this.transService.executeOfTransaction({
      sellerId: this.seller.id,
      buyerId: this.buyer.id,
      energyAmount: this.amount,
      pricePerKwh: this.pricePerKwh
    }).subscribe({
      next: res => {
        console.log('Transaction completed:', res.message);
        this.userService.selecterUsers.set([]);
        this.userService.fetchUsers(this.userService.limit, this.userService.offset);
        this.snackBar.open('Transaction executed successfully', 'Close', { duration: 2000 });
        this.router.navigate(['/list']);
      },
      error: err => {
        console.error('Failed to execute transaction', err);
        this.snackBar.open('Transaction failed', 'Close', { duration: 3000 });
      }
    });
  }

}
