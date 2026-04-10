import { Injectable, UnauthorizedException, BadRequestException, NotFoundException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { SignInDto } from './dto/sign-in.dto';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { MailerService } from '@nestjs-modules/mailer';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private mailerService: MailerService,
  ) {}

  async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
  }

  async validatePassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async register(createUserDto: CreateUserDto) {
    const existingUser = await this.usersService.findByEmail(createUserDto.email);
    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }

    const otpCode = this.generateOtp();
    const otpExpiry = new Date();
    otpExpiry.setMinutes(otpExpiry.getMinutes() + 15); // OTP valid for 15 mins

    console.log(`\n\n🎯 ---- CODE OTP GÉNÉRÉ POUR ${createUserDto.email} : ${otpCode} ---- 🎯\n\n`);

    const user = await this.usersService.create(createUserDto);
    await this.usersService.update(user.id, {
      otpCode,
      otpExpiry,
      isActive: false, // Explicitly set if not default
    } as any);

    // Send OTP email
    try {
      await this.mailerService.sendMail({
        to: user.email,
        subject: 'Account Activation OTP',
        text: `Your OTP code is ${otpCode}. It is valid for 15 minutes.`,
      });
    } catch (e) {
      console.log('⚠️ E-mail non envoyé (Resend non configuré), mais le compte est créé avec son OTP.');
    }

    return { message: 'User registered. Please check email for OTP to activate.' };
  }

  async verifyAccount(verifyOtpDto: VerifyOtpDto) {
    const user = await this.usersService.findByEmail(verifyOtpDto.email);
    if (!user) throw new NotFoundException('User not found');
    if (user.isActive) throw new BadRequestException('User is already activated');

    if (user.otpCode !== verifyOtpDto.otpCode || user.otpExpiry < new Date()) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    await this.usersService.update(user.id, {
      isActive: true,
      otpCode: null,
      otpExpiry: null,
    } as any);

    return { message: 'Account activated successfully' };
  }

  async signIn(signInDto: SignInDto): Promise<{ access_token: string }> {
    const user = await this.usersService.findByEmail(signInDto.username);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    
    if (!user.isActive) {
      throw new UnauthorizedException('Account not activated');
    }

    const isPasswordValid = await this.validatePassword(signInDto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }
    
    const payload = { sub: user.id, username: user.name, email: user.email };
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const user = await this.usersService.findByEmail(forgotPasswordDto.email);
    if (!user) {
      // Do not reveal if user exists or not
      return { message: 'If the email exists, an OTP has been sent.' };
    }

    const otpCode = this.generateOtp();
    const otpExpiry = new Date();
    otpExpiry.setMinutes(otpExpiry.getMinutes() + 15);

    console.log(`\n\n🔑 ---- CODE OTP DE RÉINITIALISATION POUR ${user.email} : ${otpCode} ---- 🔑\n\n`);

    await this.usersService.update(user.id, {
      otpCode,
      otpExpiry,
    } as any);

    try {
      await this.mailerService.sendMail({
        to: user.email,
        subject: 'Password Reset OTP',
        text: `Your password reset OTP code is ${otpCode}. It is valid for 15 minutes.`,
      });
    } catch (e) {
      console.log('⚠️ E-mail non envoyé (Resend non configuré), mais l\'OTP de secours a été généré en base.');
    }

    return { message: 'If the email exists, an OTP has been sent.' };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const user = await this.usersService.findByEmail(resetPasswordDto.email);
    if (!user) throw new NotFoundException('User not found');

    if (user.otpCode !== resetPasswordDto.otpCode || user.otpExpiry < new Date()) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    await this.usersService.update(user.id, {
      password: resetPasswordDto.newPassword,
      otpCode: null,
      otpExpiry: null,
    } as any);

    return { message: 'Password reset successfully' };
  }
}
