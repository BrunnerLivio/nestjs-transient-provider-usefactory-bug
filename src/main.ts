import { NestFactory } from '@nestjs/core';

import { Injectable, Module, Scope, Inject } from '@nestjs/common';

@Injectable()
export class AService {
  constructor(@Inject('TRANSIENT_PROVIDER') test) {
    // ✔️ Transient provider with useFactory does work inside ApplicationContext
    console.log(`TEST provider has the value ${test} - AService`);
  }
}

@Injectable({ scope: Scope.TRANSIENT})
export class TransientService {
  test() {
    return 'TRANSIENT_SERVICE_VALUE';
  }
}

@Module({
  imports: [],
  providers: [
    AService,
    TransientService,
    {
      scope: Scope.TRANSIENT,
      provide: 'TRANSIENT_PROVIDER',
      useFactory: () => {
        console.log('Called `TRANSIENT_PROVIDER`');
        return 'TRANSIENT_PROVIDER_VALUE';
      }
    },
    {
      provide: 'NORMAL_PROVIDER',
      useFactory: () => {
        console.log('Called `NORMAL_PROVIDER`');
        return 'NORMAL_PROVIDER_VALUE'
      }
    }
  ]
})
export class AppModule {}

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  // ✔️ Provider with useFactory does work️
  console.log(`NORMAL_PROVIDER provider has the value ${app.get('NORMAL_PROVIDER')} - bootstrap`);
  // ✔️ Transient injectable does work 
  console.log(`TransientService.test() has the value ${app.get(TransientService).test()} - bootstrap`);
  // ❌ Transient provider with useFactory does not work
  console.log(`TRANSIENT_PROVIDER provider has the value ${app.get('TRANSIENT_PROVIDER')} - bootstrap`);
}

bootstrap();
