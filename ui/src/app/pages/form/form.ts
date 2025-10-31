// // generator-form.component.ts
// import { Component, OnInit, inject } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
// import { ActivatedRoute, Router, RouterModule } from '@angular/router';

// // Angular Material imports
// import { MatCardModule } from '@angular/material/card';
// import { MatFormFieldModule } from '@angular/material/form-field';
// import { MatInputModule } from '@angular/material/input';
// import { MatSelectModule } from '@angular/material/select';
// import { MatButtonModule } from '@angular/material/button';
// import { MatIconModule } from '@angular/material/icon';
// import { MatDividerModule } from '@angular/material/divider';

// import { User } from '../../model/user';
// // import { EnergyGenerator, GENERATOR_TYPES } from '../../model/generator';

// @Component({
//   selector: 'app-generator-form',
//   standalone: true,
//   imports: [
//     CommonModule,
//     ReactiveFormsModule,
//     RouterModule,
//     // Angular Material modules
//     MatCardModule,
//     MatFormFieldModule,
//     MatInputModule,
//     MatSelectModule,
//     MatButtonModule,
//     MatIconModule,
//     MatDividerModule
//   ],
//   templateUrl: './form.html',
//   styleUrl: './form.sass'
// })
// export class Form implements OnInit {
//   private fb = inject(FormBuilder);
//   private route = inject(ActivatedRoute);
//   router = inject(Router);

//   userForm!: FormGroup;
//   isEditMode = false;
//   userId: string | null = null;
//   availableTypes = Object.entries(GENERATOR_TYPES);

//   // Track generator counts by type
//   generatorCounts: { [key: string]: number } = {
//     Wind: 0,
//     Solar: 0,
//     Hydro: 0
//   };

//   // Track selected type for status management
//   selectedType: string | null = null;

//   // Track generator status by type
//   generatorStatus: { [key: string]: string } = {
//     Wind: 'Active',
//     Solar: 'Active',
//     Hydro: 'Active'
//   };

//   ngOnInit(): void {
//     this.userId = this.route.snapshot.paramMap.get('id');
//     this.isEditMode = !!this.userId;

//     this.initForm();

//     if (this.isEditMode && this.userId) {
//       this.loadUserData(this.userId);
//     }
//   }

//   private initForm(): void {
//     this.userForm = this.fb.group({
//       name: ['', [Validators.required, Validators.minLength(2)]],
//       generatorStatus: ['Active'] // For the selected type
//     });
//   }

//   // Select a generator type to manage its status
//   selectType(type: string): void {
//     this.selectedType = type;
//     this.userForm.patchValue({
//       generatorStatus: this.generatorStatus[type]
//     });
//   }

//   getSelectedTypeLabel(): string {
//     if (!this.selectedType) return '';
//     return GENERATOR_TYPES[this.selectedType as keyof typeof GENERATOR_TYPES]?.label || this.selectedType;
//   }

//   // Increment generator count for a type
//   incrementGenerator(type: string): void {
//     this.generatorCounts[type]++;
//     // Auto-select the type when adding generators
//     if (!this.selectedType) {
//       this.selectType(type);
//     }
//   }

//   // Decrement generator count for a type
//   decrementGenerator(type: string): void {
//     if (this.generatorCounts[type] > 0) {
//       this.generatorCounts[type]--;
//     }
//     // If we removed the last generator of the selected type, clear selection
//     if (this.selectedType === type && this.generatorCounts[type] === 0) {
//       this.selectedType = null;
//     }
//   }

//   // Get count for a specific generator type
//   getGeneratorCount(type: string): number {
//     return this.generatorCounts[type] || 0;
//   }

//   // Get total generators across all types
//   getTotalGenerators(): number {
//     return Object.values(this.generatorCounts).reduce((sum, count) => sum + count, 0);
//   }

//   // Get total production for a specific generator type
//   getTotalProduction(type: string): number {
//     const count = this.generatorCounts[type] || 0;
//     const productionRate = GENERATOR_TYPES[type as keyof typeof GENERATOR_TYPES]?.productionRate || 0;
//     return count * productionRate;
//   }

//   // Get overall total production across all generator types
//   getOverallTotalProduction(): number {
//     return this.availableTypes.reduce((total, type) => {
//       return total + this.getTotalProduction(type[0]);
//     }, 0);
//   }

//   // Update status for all generators of the selected type
//   updateAllGeneratorStatus(): void {
//     if (this.selectedType) {
//       this.generatorStatus[this.selectedType] = this.userForm.get('generatorStatus')?.value;
//     }
//   }

//   private loadUserData(userId: string): void {
//     // In real app, you would fetch from service
//     const mockUser: User = {
//       id: userId,
//       name: 'John Doe',
//       balance: 1000,
//       energyStored: 500,
//       createdAt: new Date().toISOString(),
//       updatedAt: new Date().toISOString()
//     };

//     // Mock data - in real app, you'd calculate counts from existing generators
//     this.generatorCounts = {
//       Wind: 0,
//       Solar: 1,
//       Hydro: 0
//     };

//     this.userForm.patchValue({
//       name: mockUser.name
//     });
//   }

//   onSubmit(): void {
//     if (this.userForm.valid) {
//       // Build the generators array from counts
//       const generators: any[] = [];

//       this.availableTypes.forEach(type => {
//         const typeKey = type[0];
//         const count = this.generatorCounts[typeKey];
//         const productionRate = GENERATOR_TYPES[typeKey as keyof typeof GENERATOR_TYPES]?.productionRate || 0;
//         const status = this.generatorStatus[typeKey];

//         // Create individual generator entries for each count
//         for (let i = 0; i < count; i++) {
//           generators.push({
//             id: this.generateId(),
//             type: typeKey,
//             productionRate: productionRate,
//             status: status,
//             ownerId: this.userId || this.generateId(),
//             createdAt: new Date().toISOString()
//           });
//         }
//       });

//       const formValue = {
//         ...this.userForm.value,
//         generators: generators
//       };

//       console.log('Form submitted:', formValue);
//       console.log('Generator counts:', this.generatorCounts);

//       // Here you would call your service to save the data
//       alert(this.isEditMode ? 'User updated successfully!' : 'User created successfully!');
//       this.router.navigate(['/']);
//     } else {
//       this.markFormGroupTouched(this.userForm);
//     }
//   }

//   private generateId(): string {
//     return 'gen_' + Math.random().toString(36).substr(2, 9);
//   }

//   private markFormGroupTouched(formGroup: FormGroup): void {
//     Object.keys(formGroup.controls).forEach(key => {
//       const control = formGroup.get(key);
//       control?.markAsTouched();
//     });
//   }

//   hasError(controlName: string, errorType: string): boolean {
//     const control = this.userForm.get(controlName);
//     return control?.touched && control?.hasError(errorType) || false;
//   }
// }
