import { Injectable, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserService } from '../users/user.service';


@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private userService: UserService,
  ) { }

  async login(email: string, password: string) {
    const users = await this.userService.getUsers();
    const user = users.find(u => u.email === email);
    if (!user) throw new NotFoundException('User not found');

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new Error('Invalid credentials');

    const payload = { sub: user.id, email: user.email, role: user.role };

    return {
      access_token: this.jwtService.sign(payload, {
        expiresIn: '15m',
      }),
      refresh_token: this.jwtService.sign(payload, {
        expiresIn: '7d',
      }),
    };
  }

  refresh(token: string) {
    try {
      const payload = this.jwtService.verify(token);

      return {
        access_token: this.jwtService.sign({
          sub: payload.sub,
          email: payload.email,
          role: payload.role,
        }),
      };
    } catch {
      throw new NotFoundException('Invalid refresh token');
    }
  }
}
