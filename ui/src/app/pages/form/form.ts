import { Component, inject, OnInit, computed, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

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
import { firstValueFrom, Observable, of } from 'rxjs';
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
  private router = inject(Router)
  // Initialize immediately to satisfy Angular formGroup binding
  userForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]]
  });

  user = signal<User | null>(null);
  generatorCounts = signal<Record<string, number>>({});
  generatorTypes = signal<GeneratorType[]>([]);
  selectedType = signal<string | null>(null);
  private route = inject(ActivatedRoute);

  totalGenerators = computed(() => Object.values(this.generatorCounts()).reduce((a, b) => a + b, 0));
  overallProduction = computed(() =>
    this.generatorTypes().reduce((sum, t) => sum + (this.generatorCounts()[t.typeKey] || 0) * t.productionRateKwh, 0)
  );
  isEditMode = computed(() => !!this.user());

  async ngOnInit() {
    const userId = this.route.snapshot.paramMap.get('id');
    await this.init(userId || undefined);
  }

  selectType(typeKey: string) {
    this.selectedType.set(typeKey);
  }
  async init(userId?: string) {
    const typesPromise = this.api.fetchGeneratorTypes();
    const userObs: Observable<UserWithGenerators> | null = userId ? this.api.fetchUserWithGenerators(userId) : null;

    const types = await typesPromise;
    this.generatorTypes.set(types);

    if (userObs) {

      const userWithGens = await firstValueFrom(userObs); // resolve observable

      if (userWithGens && userWithGens.generators?.generators) {
        const counts: Record<string, number> = {};
        userWithGens.generators.generators.forEach(g => counts[g.type] = g.count);
        this.generatorCounts.set(counts);

        this.user.set(userWithGens.user);
        this.userForm.patchValue({ name: userWithGens.user.name });
      } else {
        console.log(JSON.stringify(userWithGens, null, 4))
        console.warn('User generators missing', userWithGens);
      }


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
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    };

    user.name = this.userForm.value.name;
    user.updatedAt = now.toISOString();

    const generatorsList: GeneratorOutput[] = this.generatorTypes()
      .map(t => ({
        type: t.typeKey,
        count: this.getGeneratorCount(t.typeKey),
        totalKwhPerType: this.getTotalProduction(t.typeKey)
      }));

    const payload: UserWithGenerators = {
      user: user,
      generators: {
        generators: generatorsList,
        totalKwh: generatorsList.reduce((sum, g) => sum + g.totalKwhPerType, 0)
      }
    };

    try {
      const result = await this.api.upsertUserWithGenerators(payload);
      await this.router.navigate(["/list"])
      console.log('User saved:', result);
    } catch (err: any) {
      console.error('Failed to save user:', err);
    }


  }
}
