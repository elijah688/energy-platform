import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

// Angular Material modules
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatDividerModule } from '@angular/material/divider';

interface GeneratorType {
  key: string;
  label: string;
  icon: string;
  productionRate: number;
}

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
  styleUrl: './form.sass'
})
export class Form {
  userForm: FormGroup;
  isEditMode = false;

  // Hardcoded generator types
  generatorTypes: GeneratorType[] = [
    { key: 'solar', label: 'Solar Panel', icon: 'wb_sunny', productionRate: 5 },
    { key: 'wind', label: 'Wind Turbine', icon: 'air', productionRate: 10 },
    { key: 'hydro', label: 'Hydro Generator', icon: 'opacity', productionRate: 20 }
  ];

  // Track counts of each generator type
  generatorCounts: Record<string, number> = {};
  selectedType: string | null = null;
  generatorStatus: string = 'Active';

  constructor(private fb: FormBuilder, private router: Router) {
    this.userForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      generatorStatus: [this.generatorStatus]
    });

    // Initialize counts to 0
    this.generatorTypes.forEach(type => this.generatorCounts[type.key] = 0);
  }

  // Form validation helper
  hasError(control: string, error: string) {
    const c = this.userForm.get(control);
    return c?.touched && c.hasError(error);
  }

  // Generator selection
  selectType(key: string) {
    this.selectedType = key;
  }

  // Counter methods
  getGeneratorCount(key: string) {
    return this.generatorCounts[key] || 0;
  }

  incrementGenerator(key: string) {
    this.generatorCounts[key] = this.getGeneratorCount(key) + 1;
  }

  decrementGenerator(key: string) {
    const count = this.getGeneratorCount(key);
    if (count > 0) this.generatorCounts[key] = count - 1;
  }

  getTotalProduction(key: string) {
    const type = this.generatorTypes.find(t => t.key === key);
    return type ? this.getGeneratorCount(key) * type.productionRate : 0;
  }

  getTotalGenerators() {
    return Object.values(this.generatorCounts).reduce((a, b) => a + b, 0);
  }

  getOverallTotalProduction() {
    return this.generatorTypes.reduce(
      (total, t) => total + this.getTotalProduction(t.key),
      0
    );
  }

  updateAllGeneratorStatus() {
    if (this.selectedType) {
      this.generatorStatus = this.userForm.get('generatorStatus')?.value;
    }
  }

  onSubmit() {
    if (this.userForm.invalid) return;

    const payload = {
      name: this.userForm.value.name,
      generators: this.generatorCounts,
      status: this.generatorStatus
    };

    console.log('Form submitted:', payload);
    // TODO: Send payload to backend
  }
}
