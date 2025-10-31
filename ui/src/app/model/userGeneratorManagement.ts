
import { User } from './user';
import { UserGenerators } from './generator';

export interface UserWithGenerators {
  user: User;
  generators: UserGenerators;
}
