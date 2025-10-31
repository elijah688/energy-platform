import { Component, inject, OnInit, computed, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

// Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatDividerModule } from '@angular/material/divider';

import { User } from '../../model/user';
import { GeneratorOutput, GeneratorType } from '../../model/generator';
import { Api } from '../../services/api';
import { firstValueFrom } from 'rxjs';
import { UserWithGenerators } from '../../model/userGeneratorManagement';

@Component({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatDividerModule
  ],
  selector: 'app-user-generator-form',
  templateUrl: './form.html',
  styleUrls: ['./form.sass']
})
export class Form implements OnInit {
  private fb = inject(FormBuilder);
  private api = inject(Api);

  // Initialize immediately to satisfy Angular formGroup binding
  userForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]]
  });

  user = signal<User | null>(null);
  generatorCounts = signal<Record<string, number>>({});
  generatorTypes = signal<GeneratorType[]>([]);
  selectedType = signal<string | null>(null);

  totalGenerators = computed(() => Object.values(this.generatorCounts()).reduce((a, b) => a + b, 0));
  overallProduction = computed(() =>
    this.generatorTypes().reduce((sum, t) => sum + (this.generatorCounts()[t.typeKey] || 0) * t.productionRateKwh, 0)
  );
  isEditMode = computed(() => !!this.user());

  async ngOnInit() {
    await this.init();
  }

  selectType(typeKey: string) {
    this.selectedType.set(typeKey);
  }

  async init(userId?: string) {
    const typesPromise = this.api.fetchGeneratorTypes();
    const userPromise = userId ? firstValueFrom(this.api.fetchUsersByIdsApi([userId])) : Promise.resolve([]);
    const [types, users] = await Promise.all([typesPromise, userPromise]);

    this.generatorTypes.set(types);
    this.user.set(users[0] || null);

    if (this.user()) {
      const userGens = await this.api.fetchUserGenerators(this.user()!.id);
      const counts: Record<string, number> = {};
      userGens.generators.forEach(g => counts[g.type] = g.count);
      this.generatorCounts.set(counts);

      // Patch form values
      this.userForm.patchValue({ name: this.user()?.name });
    }
  }

  increment(type: string) { this.updateCount(type, 1); }
  decrement(type: string) { this.updateCount(type, -1); }

  private updateCount(type: string, delta: number) {
    const counts = { ...this.generatorCounts() };
    counts[type] = Math.max((counts[type] || 0) + delta, 0);
    this.generatorCounts.set(counts);
  }

  getGeneratorCount(type: string) { return this.generatorCounts()[type] || 0; }
  getProductionRate(type: string) { return this.generatorTypes().find(t => t.typeKey === type)?.productionRateKwh || 0; }
  getTotalProduction(type: string) { return this.getGeneratorCount(type) * this.getProductionRate(type); }
  async onSubmit() {
    if (this.userForm.invalid) return;

    const now = new Date();
    const user: User = this.user() || {
      id: crypto.randomUUID(),
      name: this.userForm.value.name,
      balance: 0,
      energyStored: 0,
      createdAt: now.toISOString(),  // ISO format
      updatedAt: now.toISOString()   // ISO format
    };

    // If editing existing user, just overwrite the name & updatedAt
    if (this.user()) {
      user.name = this.userForm.value.name;
      user.updatedAt = now.toISOString();
    }

    const generatorsList: GeneratorOutput[] = this.generatorTypes()
      .map(t => ({
        type: t.typeKey,
        count: this.getGeneratorCount(t.typeKey),
        totalKwhPerType: this.getTotalProduction(t.typeKey)
      }));

    const payload: UserWithGenerators = {
      User: user,
      Generators: {
        generators: generatorsList,
        totalKwh: generatorsList.reduce((sum, g) => sum + g.totalKwhPerType, 0)
      }
    };

    try {
      console.log(JSON.stringify(payload, null, 4));
      const result = await this.api.upsertUserWithGenerators(payload);
      console.log('User saved:', result);
    } catch (err: any) {
      console.error('Failed to save user:', err);
    }
  }
}
