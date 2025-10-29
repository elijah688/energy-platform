

import { Generator } from './generator';
import { User } from './user';

export interface UserWithGenerators {
  user: User;
  generators: Generator[];
}
