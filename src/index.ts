import { DurableObject } from "cloudflare:workers";

export interface Env {
  MY_DURABLE_OBJECT: DurableObjectNamespace<MyDurableObject>;
}

export class MyDurableObject extends DurableObject {
  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
  }

  async throwObject(): Promise<string> {
    const data = { data: "IMPORTANT DATA GOES HERE" };
    throw new Error(JSON.stringify(data));
  }
}

export default {
  async fetch(request, env, ctx): Promise<Response> {
    const id: DurableObjectId = env.MY_DURABLE_OBJECT.idFromName(
      new URL(request.url).pathname
    );

    const stub = env.MY_DURABLE_OBJECT.get(id);
    let output = "";
    try {
      output = await stub.throwObject();
    } catch (e: any) {
      return new Response(e.message);
    }
    return new Response(output);
  },
} satisfies ExportedHandler<Env>;
