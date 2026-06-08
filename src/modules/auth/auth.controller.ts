import { Body, Controller, Get, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }
    @Get('test')
    test() {
        return 'Auth working';
    }
    @Post('login')
    login(@Body() body: any) {
        return this.authService.login(body.email, body.password);
    }
    @Post('refresh')
    refresh(@Body() body: any) {
        return this.authService.refresh(body.refresh_token);
    }
}
