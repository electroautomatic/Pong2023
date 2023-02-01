import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { renderFile } from 'ejs'
// !
import { PrismaService } from "./prisma.service";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // var cors = require('cors')
  app.enableCors({
    origin: "http://localhost:3000",
    credentials: true
  });
  // !
  const prismaService = app.get(PrismaService);
  await prismaService.enableShutdownHooks(app);


  // обратите внимание на порт
  // app.use(function(req, res, next) {
  //   // res.header("Access-Control-Allow-Origin", "*");
  //   res.header("Access-Control-Allow-Methods", "GET, PUT, POST");
  //   res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  //   next();
  // });
  await app.listen(3001);
}
bootstrap();
