import { Injectable } from '@nestjs/common';
import path from 'path';

@Injectable()
export class AppService {
  getUsers(): string {
    return "Liste des utilisateurs";
  }
  getNome(): string {
      let nom = "John Doe";
    return "Liste des utilisateurs"+nom;
  }
}
