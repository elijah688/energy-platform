// import { Injectable, signal, inject } from '@angular/core';
// import { FormBuilder, FormArray, FormGroup, Validators } from '@angular/forms';
// import { Api } from './api';
// import { User } from '../model/user';
// import { GeneratorOutput } from '../model/generator';
// import { firstValueFrom } from 'rxjs';

// @Injectable({ providedIn: 'root' })
// export class UserFormService {
//   private fb = inject(FormBuilder);
//   private api = inject(Api);

//   public user = signal<User | undefined>(undefined);
//   public userForm!: FormGroup;
//   public generatorTypes = ['Wind', 'Solar', 'Hydro'];

//   // Signals for lists
//   public activeList = signal<(GeneratorOutput & { userId: string })[]>([]);
//   public deleteList = signal<(GeneratorOutput & { userId: string })[]>([]);

//   // Pagination state per user
//   public userPagination = signal<Record<string, { limit: number; offset: number }>>({});

//   /** Initialize form; fetch user + generators if userId */
//   async initFormWithId(userId?: string) {
//     let userGenerators: GeneratorOutput[] = [];
//     if (userId) {
//       try {
//         const users = await firstValueFrom(this.api.fetchUsersByIdsApi([userId]));
//         const fetchedUser = users[0] || null;
//         this.user.set(fetchedUser);

//         if (fetchedUser) {
//           const gensMap = await this.fetchGeneratorsForUser(fetchedUser.id);
//           // userGenerators = gensMap[fetchedUser.id] || [];
//         }
//       } catch {
//         console.error('Failed to load user/generators');
//       }
//     }
//     this.initForm(this.user(), userGenerators);
//   }

//   initForm(user?: User, userGenerators: GeneratorOutput[] = []) {
//     const editing = !!user;
//     this.user.set(user || undefined);

//     this.userForm = this.fb.group({
//       name: [{ value: user?.name || '', disabled: editing }, Validators.required],
//       balance: [{ value: user?.balance || 0, disabled: editing }, [Validators.required, Validators.min(0)]],
//       energyStored: [{ value: user?.energyStored || 0, disabled: editing }, [Validators.required, Validators.min(0)]],
//       generators: this.fb.array([])
//     });

//     // Seed form array
//     userGenerators.forEach(g => this.addGenerator(g));

//     // Seed active list with fetched generators
//     this.activeList.set(userGenerators.map(g => ({ ...g, userId: user?.id || '' })));
//     this.deleteList.set([]);
//   }

//   get generatorsArray(): FormArray {
//     return this.userForm.get('generators') as FormArray;
//   }

//   addGenerator(gen?: GeneratorOutput) {
//     const newId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

//     const fg = this.fb.group({
//       id: [gen?.id || newId],
//       type: [gen?.type || '', Validators.required],
//       productionRate: [gen?.productionRate || 1, [Validators.required, Validators.min(1)]],
//       status: [gen?.status || 'Active', Validators.required]
//     });
//     this.generatorsArray.push(fg);

//     // Add to active list
//     const newGen: GeneratorOutput & { userId: string } = {
//       id: gen?.id || newId,
//       type: gen?.type || 'Wind',
//       productionRate: gen?.productionRate || 1,
//       status: gen?.status || 'Active',
//       ownerId: this.user()?.id || '',
//       userId: this.user()?.id || '',
//       createdAt: new Date().getDate().toString()
//     };

//     this.activeList.update(list => [newGen, ...list]);
//   }

//   removeGenerator(index: number) {
//     this.generatorsArray.removeAt(index);
//   }

//   markForDeletion(userId: string, genId: string) {
//     this.activeList.update(list => {
//       const idx = list.findIndex(g => g.id === genId);
//       if (idx === -1) return list;
//       const [gen] = list.splice(idx, 1);
//       this.deleteList.update(d => [gen, ...d]);
//       return [...list];
//     });

//     // Also remove from form array
//     const formIndex = this.generatorsArray.controls.findIndex(
//       control => control.get('id')?.value === genId
//     );
//     if (formIndex !== -1) {
//       this.generatorsArray.removeAt(formIndex);
//     }
//   }

//   restoreGenerator(userId: string, genId: string) {
//     this.deleteList.update(list => {
//       const idx = list.findIndex(g => g.id === genId);
//       if (idx === -1) return list;
//       const [gen] = list.splice(idx, 1);
//       this.activeList.update(a => [gen, ...a]);

//       // Add back to form array
//       const fg = this.fb.group({
//         id: [gen.id],
//         type: [gen.type, Validators.required],
//         productionRate: [gen.productionRate, [Validators.required, Validators.min(1)]],
//         status: [gen.status, Validators.required]
//       });
//       this.generatorsArray.push(fg);

//       return [...list];
//     });
//   }

//   // NEW METHOD: Update generator production rate
//   updateGeneratorProductionRate(generatorId: string, rate: number): void {
//     // Update in active list
//     this.activeList.update(list =>
//       list.map(gen =>
//         gen.id === generatorId ? { ...gen, productionRate: rate } : gen
//       )
//     );

//     // Update in form array
//     const control = this.generatorsArray.controls.find(
//       c => c.get('id')?.value === generatorId
//     );
//     if (control) {
//       control.patchValue({ productionRate: rate });
//     }
//   }

//   // NEW METHOD: Update generator status
//   updateGeneratorStatus(generatorId: string, status: "Active" | "Inactive" | "Maintenance"): void {
//     this.activeList.update(list =>
//       list.map(gen =>
//         gen.id === generatorId ? { ...gen, status } : gen
//       )
//     );


//     // Update in form array
//     const control = this.generatorsArray.controls.find(
//       c => c.get('id')?.value === generatorId
//     );
//     if (control) {
//       control.patchValue({ status: status });
//     }
//   }

//   // NEW METHOD: Remove a specific generator by ID (alternative to markForDeletion)
//   removeGeneratorById(generatorId: string): void {
//     const generator = this.activeList().find(gen => gen.id === generatorId);
//     if (generator) {
//       this.markForDeletion(generator.userId, generatorId);
//     }
//   }

//   // NEW METHOD: Get count of generators by type
//   getGeneratorCountByType(type: string): number {
//     return this.activeList().filter(gen => gen.type === type).length;
//   }

//   // NEW METHOD: Get all generators of a specific type
//   getGeneratorsByType(type: string): (GeneratorOutput & { userId: string })[] {
//     return this.activeList().filter(gen => gen.type === type);
//   }

//   async fetchGeneratorsForUser(userId: string, limit = 5, offset = 0) {
//     this.userPagination.update(p => ({ ...p, [userId]: { limit, offset } }));
//     const gensMap = await this.api.fetchUserGenerators(userId, limit, offset);
//     const userGens = gensMap[userId] || [];
//     this.activeList.update(a => [...a, ...userGens.map(g => ({ ...g, userId }))]);
//     return gensMap;
//   }

//   async nextPage(userId?: string) {
//     if (!userId) return;
//     const state = this.userPagination()[userId] || { limit: 5, offset: 0 };
//     await this.fetchGeneratorsForUser(userId, state.limit, state.offset + state.limit);
//   }

//   async prevPage(userId?: string) {
//     if (!userId) return;
//     const state = this.userPagination()[userId] || { limit: 5, offset: 0 };
//     const newOffset = Math.max(0, state.offset - state.limit);
//     await this.fetchGeneratorsForUser(userId, state.limit, newOffset);
//   }

//   getPayload() {
//     return this.userForm.getRawValue();
//   }

//   isEditing() {
//     return !!this.user();
//   }
// }
