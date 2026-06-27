#!/usr/bin/env node
import path from "node:path";
import {
  buildAdrSearchIndex,
  defaultWorkspaceRoot,
  writeAdrSearchIndex
} from "./indexer.mjs";

const options = parseArguments(process.argv.slice(2));

if (options.help) {
  printHelp();
  process.exit(0);
}

try {
  const workspaceRoot = path.resolve(options.workspaceRoot ?? defaultWorkspaceRoot());
  const index = await buildAdrSearchIndex({
    workspaceRoot,
    repositories: options.repositories,
    includeHidden: options.includeHidden,
    includeTemplates: options.includeTemplates
  });
  const outputDirectory = path.resolve(options.outputDirectory ?? "docs");
  const result = await writeAdrSearchIndex(index, {
    outputDirectory,
    jsonPath: options.jsonPath,
    markdownPath: options.markdownPath,
    workspaceRoot,
    check: options.check
  });

  if (options.check) {
    if (result.changed) {
      console.error("ADR search index is out of date. Run `npm run adr:index`.");
      process.exit(1);
    }

    console.log("ADR search index is up to date.");
  } else {
    console.log(`Indexed ${index.totals.adrCount} ADRs across ${index.totals.repositoriesWithAdrs} repositories.`);
    console.log(`Wrote ${path.relative(process.cwd(), result.jsonPath)}`);
    console.log(`Wrote ${path.relative(process.cwd(), result.markdownPath)}`);
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}

function parseArguments(args) {
  const parsed = {
    repositories: []
  };

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];

    switch (arg) {
      case "--check":
        parsed.check = true;
        break;
      case "--help":
      case "-h":
        parsed.help = true;
        break;
      case "--include-hidden":
        parsed.includeHidden = true;
        break;
      case "--include-templates":
        parsed.includeTemplates = true;
        break;
      case "--json":
        parsed.jsonPath = requireValue(args, ++index, arg);
        break;
      case "--markdown":
        parsed.markdownPath = requireValue(args, ++index, arg);
        break;
      case "--out-dir":
        parsed.outputDirectory = requireValue(args, ++index, arg);
        break;
      case "--repo":
        parsed.repositories.push(path.resolve(requireValue(args, ++index, arg)));
        break;
      case "--workspace-root":
        parsed.workspaceRoot = requireValue(args, ++index, arg);
        break;
      default:
        throw new Error(`Unknown argument: ${arg}`);
    }
  }

  if (parsed.repositories.length === 0) {
    delete parsed.repositories;
  }

  return parsed;
}

function requireValue(args, index, flag) {
  const value = args[index];
  if (!value || value.startsWith("--")) {
    throw new Error(`${flag} requires a value.`);
  }

  return value;
}

function printHelp() {
  console.log(`Usage: npm run adr:index -- [options]

Options:
  --workspace-root <path>  Workspace containing Plasius repository checkouts.
                           Defaults to the parent of road-map when run here.
  --repo <path>            Scan an explicit repository. May be repeated.
  --out-dir <path>         Output directory. Defaults to docs.
  --json <path>            JSON output path.
  --markdown <path>        Markdown output path.
  --check                  Fail if generated outputs differ from disk.
  --include-hidden         Include hidden directories during scanning.
  --include-templates      Include ADR template files.
  --help                   Show this help.
`);
}
