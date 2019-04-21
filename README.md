## Minimal Repository for the NestJS Transient bug when using useFactory

See `src/main.ts` and the corresponding log `start.log`

main.ts
```ts
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


```

start.log
```

> on-inject-example@0.0.1 start /home/brunnerlivio/workspace/on-inject-example
> ts-node -r tsconfig-paths/register src/main.ts

[32m[Nest] 8288   - [39m04/22/2019, 1:31 AM   [38;5;3m[NestFactory] [39m[32mStarting Nest application...[39m
Called `NORMAL_PROVIDER`
Called `TRANSIENT_PROVIDER`
TEST provider has the value TRANSIENT_PROVIDER_VALUE - AService
[32m[Nest] 8288   - [39m04/22/2019, 1:31 AM   [38;5;3m[InstanceLoader] [39m[32mAppModule dependencies initialized[39m[38;5;3m +10ms[39m
NORMAL_PROVIDER provider has the value NORMAL_PROVIDER_VALUE - bootstrap
TransientService.test() has the value TRANSIENT_SERVICE_VALUE - bootstrap
TRANSIENT_PROVIDER provider has the value null - bootstrap

```

## Reproduce

```bash

git clone https://github.com/BrunnerLivio/nestjs-transient-provider-usefactory-bug.git
cd nestjs-transient-provider-usefactory-bug
npm i
npm start

```