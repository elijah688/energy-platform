import { ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { Component, Input, OnInit, inject } from '@angular/core';
import { FormBuilder, FormArray, FormGroup, Validators } from '@angular/forms';
import { User } from '../../model/user';
import { EnergyGenerator } from '../../model/generator';

@Component({
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatSnackBarModule
  ],
  selector: 'app-user-form',
  templateUrl: './form.html',
  styleUrls: ['./form.sass']
})
export class Form implements OnInit {
  @Input() user?: User;
  @Input() userGenerators: EnergyGenerator[] = [];

  userForm!: FormGroup;
  generatorTypes = ['Wind', 'Solar'];
  editing = false;

  private snackBar = inject(MatSnackBar);
  private fb = inject(FormBuilder);

  ngOnInit(): void {
    this.editing = !!this.user;

    this.userForm = this.fb.group({
      name: [{ value: this.user?.name || '', disabled: this.editing }, Validators.required],
      balance: [{ value: this.user?.balance || 0, disabled: this.editing }, [Validators.required, Validators.min(0)]],
      energyStored: [{ value: this.user?.energyStored || 0, disabled: this.editing }, [Validators.required, Validators.min(0)]],
      generators: this.fb.array([])
    });

    if (this.editing) {
      this.userGenerators.forEach(gen => this.addGenerator(gen));
    } else {
      this.addGenerator(); // start with one empty generator
    }
  }

  get generators(): FormArray {
    return this.userForm.get('generators') as FormArray;
  }

  addGenerator(gen?: EnergyGenerator) {
    this.generators.push(
      this.fb.group({
        id: [gen?.id || ''],
        type: [gen?.type || '', Validators.required],
        productionRate: [
          gen?.productionRate || 1,
          [Validators.required, Validators.min(1)] // changed min to 1
        ],
        status: [gen?.status || 'Active', Validators.required]
      })
    );
  }


  removeGenerator(index: number) {
    this.generators.removeAt(index);
  }

  submit() {
    if (this.userForm.valid) {
      const payload = this.userForm.getRawValue();
      console.log('Submit payload', payload);
      // call API to create/update user + generators
    } else {
      this.snackBar.open('Form is invalid. Please fill in all required fields correctly.', 'Close', {
        duration: 3000
      });
    }
  }
}
