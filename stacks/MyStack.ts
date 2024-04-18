import { StackContext, Api, StaticSite, Bucket } from "sst/constructs";

export function API({ stack }: StackContext) {

  const audience = `api-NotesApp-${stack.stage}`

  const assetsBucket = new Bucket(stack, "assets");

  const api = new Api(stack, "api", {
    authorizers: {
      myAuthorizer: {
        type: "jwt",
        jwt: {
          issuer: "https://royce.kinde.com",
          audience: [audience],
        },
      },
    },
    defaults: {
      authorizer: "myAuthorizer",
      function: {
        environment: {
          DRIZZLE_DATABASE_URL: process.env.DRIZZLE_DATABASE_URL!,
        },
      },
    },
    routes: {
      "GET /": {
        authorizer: "none",
        function: {
          handler: "packages/functions/src/lambda.handler",
        }
      },
      "GET /uploads/total-description": "packages/functions/src/uploads.handler",
      "GET /uploads": "packages/functions/src/uploads.handler",
      "POST /uploads": "packages/functions/src/uploads.handler",
      "DELETE /uploads": "packages/functions/src/uploads.handler",
      "GET /favorites": "packages/functions/src/favorites.handler",
      "POST /favorites": "packages/functions/src/favorites.handler",
      "POST /ai": {
        function: {
          environment: {
            OPENAI_API_KEY: process.env.OPENAI_API_KEY!,
          },
          handler: "packages/functions/src/ai.handler",
          timeout: 600,
        }
      
      },
      "POST /signed-url": {
        function: {
          environment: {
            ASSETS_BUCKET_NAME: assetsBucket.bucketName,
          },
          handler: "packages/functions/src/s3.handler",
        }
      },
      "GET /cs": {
        function: {
          handler: "packages/csharp/MyFirstCSharpFunction",
          runtime: "container",
        },
      },
    },
  });

  api.attachPermissionsToRoute("POST /signed-url", [assetsBucket, "grantPut"])

  const web = new StaticSite(stack, "web", {
    // customDomain: stack.stage === "prod" ? {
    //   domainName: "uploadsappagainb.smw.wtf",
    //   hostedZone: "smw.wtf",
    // } : undefined,
    path: "packages/web",
    buildOutput: "dist",
    buildCommand: "npm run build",
    environment: {
      VITE_APP_API_URL: api.url,
      VITE_APP_KINDE_AUDIENCE: audience,
    },
  });

  stack.addOutputs({
    ApiEndpoint: api.url,
    WebsiteURL: web.url,
  });
}
