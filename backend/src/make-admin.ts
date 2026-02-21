import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { UserAdminScriptService } from './users/user-admin-script.service';

async function makeAdmin() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const adminService = app.get(UserAdminScriptService);
  const email = process.argv[2];
  if (!email) {
    console.error('Usage: npm run make-admin <email>');
    process.exit(1);
  }
  const user = await adminService.makeAdminByEmail(email);
  if (user) {
    console.log(`User ${email} is now admin.`);
  } else {
    console.error(`User with email ${email} not found.`);
  }
  await app.close();
}

makeAdmin();
