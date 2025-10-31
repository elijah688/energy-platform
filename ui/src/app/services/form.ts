import { Injectable, signal, inject } from '@angular/core';
import { FormBuilder, FormArray, FormGroup, Validators } from '@angular/forms';
import { Api } from './api';
import { GeneratorType, UserGenerators, GeneratorOutput } from '../model/generator';
import { User, } from '../model/user';
import { firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UserFormService {
  private fb = inject(FormBuilder);
  private api = inject(Api);

  /** Signals to track user and generators */
  public user = signal<User | null>(null);
  public userGenerators = signal<UserGenerators>({ totalKwh: 0, generators: [] });
  public generatorTypes = signal<GeneratorType[]>([]);

  /** Form */
  public userForm!: FormGroup;

  /** UI state */
  public generatorCounts = signal<Record<string, number>>({});
  public selectedType = signal<string | null>(null);

  /** Initialize form with optional userId */
  async init(userId?: string) {

    this.generatorTypes.set(await this.api.fetchGeneratorTypes())

    if (userId) {
      try {
        const { user, generators } = await firstValueFrom(this.api.fetchUserWithGenerators(userId));
        this.user.set(user);
        this.userGenerators.set(generators);
      } catch (err) {
        console.error('Failed to fetch user or generators:', err);
      }
    }

    this.initForm();
  }

  /** Seed form */
  initForm() {
    this.userForm = this.fb.group({
      name: [this.user()?.name || '', [Validators.required, Validators.minLength(2)]],
      generators: this.fb.array([])
    });

    // Initialize counts
    const counts: Record<string, number> = {};
    this.userGenerators().generators.forEach(g => counts[g.type] = g.count);
    this.generatorCounts.set(counts);

    // Seed form array
    this.userGenerators().generators.forEach(g => this.addGenerator(g));
  }

  get generatorsArray(): FormArray {
    return this.userForm.get('generators') as FormArray;
  }

  addGenerator(gen?: GeneratorOutput) {
    const fg = this.fb.group({
      type: [gen?.type || '', Validators.required],
      count: [gen?.count || 0, [Validators.required, Validators.min(0)]],
      totalKwhPerType: [gen?.totalKwhPerType || 0]
    });
    this.generatorsArray.push(fg);

    const counts = { ...this.generatorCounts() };
    const type = gen?.type || '';
    counts[type] = (counts[type] || 0) + (gen?.count || 0);
    this.generatorCounts.set(counts);
  }

  incrementGenerator(type: string) {
    const counts = { ...this.generatorCounts() };
    counts[type] = (counts[type] || 0) + 1;
    this.generatorCounts.set(counts);

    const fg = this.generatorsArray.controls.find(c => c.get('type')?.value === type);
    if (fg) {
      const newCount = fg.get('count')!.value + 1;
      fg.patchValue({ count: newCount, totalKwhPerType: newCount * this.getProductionRate(type) });
    } else {
      this.addGenerator({ type, count: 1, totalKwhPerType: this.getProductionRate(type) });
    }
  }

  decrementGenerator(type: string) {
    const counts = { ...this.generatorCounts() };
    if ((counts[type] || 0) === 0) return;
    counts[type] -= 1;
    this.generatorCounts.set(counts);

    const fg = this.generatorsArray.controls.find(c => c.get('type')?.value === type);
    if (fg) {
      const newCount = fg.get('count')!.value - 1;
      fg.patchValue({ count: newCount, totalKwhPerType: newCount * this.getProductionRate(type) });
    }
  }

  selectType(type: string) {
    this.selectedType.set(type);
  }

  getGeneratorCount(type: string) {
    return this.generatorCounts()[type] || 0;
  }

  getProductionRate(type: string) {
    const t = this.generatorTypes().find(t => t.typeKey === type);
    return t ? t.productionRateKwh : 0;
  }

  getTotalProduction(type: string) {
    return this.getGeneratorCount(type) * this.getProductionRate(type);
  }

  getTotalGenerators() {
    return Object.values(this.generatorCounts()).reduce((a, b) => a + b, 0);
  }

  getOverallTotalProduction() {
    return this.generatorTypes().reduce(
      (sum, t) => sum + this.getTotalProduction(t.typeKey),
      0
    );
  }
}

