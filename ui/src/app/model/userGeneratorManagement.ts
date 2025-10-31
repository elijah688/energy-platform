
import { User } from './user';
import { UserGenerators } from './generator';

export interface UserWithGenerators {
  User: User;
  Generators: UserGenerators;
}
