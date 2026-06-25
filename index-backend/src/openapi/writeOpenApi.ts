import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { createOpenApiDocument } from "./openapi";

export async function writeOpenApiDocument() {
  const docsDir = path.resolve("docs");

  await mkdir(docsDir, { recursive: true });
  await writeFile(
    path.join(docsDir, "openapi.json"),
    `${JSON.stringify(createOpenApiDocument(), null, 2)}\n`,
  );
}

writeOpenApiDocument().catch((error) => {
  console.error(error);
  process.exit(1);
});
