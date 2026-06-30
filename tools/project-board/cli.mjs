#!/usr/bin/env node
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import {
  PROJECT_ITEMS_QUERY,
  defaultFindNextOptions,
  parseFieldMapResponse,
  selectNextEligibleItem,
  summarizeFindNextResult
} from "./index.mjs";

const execFileAsync = promisify(execFile);
const ghBinary = process.env.PLASIUS_GH_BIN || "gh";
const [command, ...args] = process.argv.slice(2);

if (!command || command === "--help" || command === "-h") {
  printHelp();
  process.exit(0);
}

try {
  switch (command) {
    case "fields":
      await runFieldsCommand(args);
      break;
    case "find-next":
      await runFindNextCommand(args);
      break;
    case "find-item":
      await runFindItemCommand(args);
      break;
    case "set-status":
      await runSetStatusCommand(args);
      break;
    case "claim":
      await runClaimCommand(args);
      break;
    case "comment":
      await runCommentCommand(args);
      break;
    default:
      throw new Error(`Unknown command: ${command}`);
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}

async function runFieldsCommand(args) {
  const options = parseCommonProjectArguments(args);
  const project = await resolveProjectContext(options);
  console.log(JSON.stringify(project, null, 2));
}

async function runFindNextCommand(args) {
  const options = parseFindNextArguments(args);
  const project = await resolveProjectContext(options);
  const result = await scanProjectItems(options, (items) => selectNextEligibleItem(items, options));

  console.log(JSON.stringify({
    projectId: project.projectId,
    projectTitle: project.projectTitle,
    candidate: result.match,
    pagesScanned: result.pagesScanned,
    itemsExamined: result.itemsExamined,
    nextCursor: result.nextCursor,
    ...(result.match ? {} : { scannedItems: result.scannedItems })
  }, null, 2));
}

async function runFindItemCommand(args) {
  const options = parseFindItemArguments(args);
  const project = await resolveProjectContext(options);
  const result = await scanProjectItems(options, (items) => items.find((item) => {
    const repositoryMatches = item.repository === options.repository;
    const numberMatches = item.number === options.issueNumber;
    return repositoryMatches && numberMatches;
  }) ?? null);

  console.log(JSON.stringify({
    projectId: project.projectId,
    projectTitle: project.projectTitle,
    item: result.match,
    pagesScanned: result.pagesScanned,
    itemsExamined: result.itemsExamined,
    nextCursor: result.nextCursor
  }, null, 2));
}

async function runSetStatusCommand(args) {
  const options = parseSetStatusArguments(args);
  const project = await resolveProjectContext(options);
  const statusId = project.statuses[options.status];
  if (!statusId) {
    throw new Error(`Unknown status "${options.status}".`);
  }

  await ghText([
    "project",
    "item-edit",
    "--id",
    options.itemId,
    "--project-id",
    project.projectId,
    "--field-id",
    project.statusFieldId,
    "--single-select-option-id",
    statusId
  ]);

  console.log(JSON.stringify({
    itemId: options.itemId,
    status: options.status
  }, null, 2));
}

async function runClaimCommand(args) {
  const options = parseClaimArguments(args);
  const project = await resolveProjectContext(options);
  const statusId = project.statuses[options.status];
  if (!statusId) {
    throw new Error(`Unknown status "${options.status}".`);
  }

  if (options.repository && options.issueNumber && options.assignee) {
    await ghText([
      "api",
      `repos/${options.repository}/issues/${options.issueNumber}`,
      "-X",
      "PATCH",
      "-f",
      `assignees[]=${options.assignee}`
    ]);
  }

  await ghText([
    "project",
    "item-edit",
    "--id",
    options.itemId,
    "--project-id",
    project.projectId,
    "--field-id",
    project.statusFieldId,
    "--single-select-option-id",
    statusId
  ]);

  console.log(JSON.stringify({
    itemId: options.itemId,
    repository: options.repository ?? null,
    issueNumber: options.issueNumber ?? null,
    assignee: options.assignee ?? null,
    status: options.status
  }, null, 2));
}

async function runCommentCommand(args) {
  const options = parseCommentArguments(args);
  await ghText([
    "api",
    `repos/${options.repository}/issues/${options.issueNumber}/comments`,
    "-X",
    "POST",
    "-f",
    `body=${options.body}`
  ]);

  console.log(JSON.stringify({
    repository: options.repository,
    issueNumber: options.issueNumber
  }, null, 2));
}

async function scanProjectItems(options, matcher) {
  let cursor = options.cursor ?? null;
  let pagesScanned = 0;
  let itemsExamined = 0;
  const scannedItems = [];

  while (pagesScanned < options.maxPages) {
    const response = await ghJson([
      "api",
      "graphql",
      "-f",
      `query=${PROJECT_ITEMS_QUERY}`,
      "-f",
      `owner=${options.owner}`,
      "-F",
      `number=${options.projectNumber}`,
      "-F",
      `pageSize=${options.pageSize}`,
      ...(cursor ? ["-f", `cursor=${cursor}`] : [])
    ]);
    const summary = summarizeFindNextResult(response, options);
    scannedItems.push(...summary.items);
    itemsExamined += summary.items.length;
    pagesScanned += 1;

    const match = matcher(scannedItems, summary.pageInfo);
    if (match) {
      return {
        match,
        pagesScanned,
        itemsExamined,
        nextCursor: summary.pageInfo.endCursor,
        scannedItems
      };
    }

    if (!summary.pageInfo.hasNextPage || !summary.pageInfo.endCursor) {
      return {
        match: null,
        pagesScanned,
        itemsExamined,
        nextCursor: cursor,
        scannedItems
      };
    }

    cursor = summary.pageInfo.endCursor;
  }

  return {
    match: null,
    pagesScanned,
    itemsExamined,
    nextCursor: cursor,
    scannedItems
  };
}

async function resolveProjectContext(options) {
  const projectList = await ghJson([
    "project",
    "list",
    "--owner",
    options.owner,
    "--format",
    "json"
  ]);
  const project = (projectList.projects ?? []).find((entry) => entry.number === options.projectNumber);
  if (!project) {
    throw new Error(`Project #${options.projectNumber} not found for ${options.owner}.`);
  }

  const fieldList = await ghJson([
    "project",
    "field-list",
    String(options.projectNumber),
    "--owner",
    options.owner,
    "--format",
    "json"
  ]);

  return parseFieldMapResponse({
    id: project.id,
    number: project.number,
    title: project.title,
    fields: fieldList.fields ?? []
  });
}

function parseCommonProjectArguments(args) {
  const options = {
    projectNumber: 1
  };

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    switch (arg) {
      case "--owner":
        options.owner = requireValue(args, ++index, arg);
        break;
      case "--project-number":
        options.projectNumber = Number(requireValue(args, ++index, arg));
        break;
      default:
        throw new Error(`Unknown argument: ${arg}`);
    }
  }

  if (!options.owner) {
    throw new Error("--owner is required.");
  }

  if (!Number.isInteger(options.projectNumber) || options.projectNumber <= 0) {
    throw new Error("--project-number must be a positive integer.");
  }

  return options;
}

function parseFindNextArguments(args) {
  const options = {
    ...defaultFindNextOptions(),
    ...parseCommonProjectArguments(extractProjectArguments(args))
  };
  options.eligibleStatuses = [];
  options.excludedStatuses = [];

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    switch (arg) {
      case "--owner":
      case "--project-number":
        index += 1;
        break;
      case "--cursor":
        options.cursor = requireValue(args, ++index, arg);
        break;
      case "--eligible-status":
        options.eligibleStatuses.push(requireValue(args, ++index, arg));
        break;
      case "--exclude-status":
        options.excludedStatuses.push(requireValue(args, ++index, arg));
        break;
      case "--max-pages":
        options.maxPages = Number(requireValue(args, ++index, arg));
        break;
      case "--page-size":
        options.pageSize = Number(requireValue(args, ++index, arg));
        break;
      case "--self-login":
        options.selfLogin = requireValue(args, ++index, arg);
        break;
      default:
        if (!["--owner", "--project-number"].includes(arg)) {
          throw new Error(`Unknown argument: ${arg}`);
        }
    }
  }

  if (options.eligibleStatuses.length === 0) {
    options.eligibleStatuses = defaultFindNextOptions().eligibleStatuses;
  }
  if (options.excludedStatuses.length === 0) {
    options.excludedStatuses = defaultFindNextOptions().excludedStatuses;
  }
  if (!Number.isInteger(options.pageSize) || options.pageSize <= 0) {
    throw new Error("--page-size must be a positive integer.");
  }
  if (!Number.isInteger(options.maxPages) || options.maxPages <= 0) {
    throw new Error("--max-pages must be a positive integer.");
  }

  return options;
}

function parseSetStatusArguments(args) {
  const options = parseCommonProjectArguments(extractProjectArguments(args));

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    switch (arg) {
      case "--owner":
      case "--project-number":
        index += 1;
        break;
      case "--item-id":
        options.itemId = requireValue(args, ++index, arg);
        break;
      case "--status":
        options.status = requireValue(args, ++index, arg);
        break;
      default:
        throw new Error(`Unknown argument: ${arg}`);
    }
  }

  if (!options.itemId) {
    throw new Error("--item-id is required.");
  }
  if (!options.status) {
    throw new Error("--status is required.");
  }

  return options;
}

function parseFindItemArguments(args) {
  const options = {
    pageSize: defaultFindNextOptions().pageSize,
    maxPages: defaultFindNextOptions().maxPages,
    ...parseCommonProjectArguments(extractProjectArguments(args))
  };

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    switch (arg) {
      case "--owner":
      case "--project-number":
        index += 1;
        break;
      case "--repo":
        options.repository = requireValue(args, ++index, arg);
        break;
      case "--issue-number":
        options.issueNumber = Number(requireValue(args, ++index, arg));
        break;
      case "--cursor":
        options.cursor = requireValue(args, ++index, arg);
        break;
      case "--page-size":
        options.pageSize = Number(requireValue(args, ++index, arg));
        break;
      case "--max-pages":
        options.maxPages = Number(requireValue(args, ++index, arg));
        break;
      default:
        throw new Error(`Unknown argument: ${arg}`);
    }
  }

  if (!options.repository) {
    throw new Error("--repo is required.");
  }
  if (!Number.isInteger(options.issueNumber) || options.issueNumber <= 0) {
    throw new Error("--issue-number must be a positive integer.");
  }
  if (!Number.isInteger(options.pageSize) || options.pageSize <= 0) {
    throw new Error("--page-size must be a positive integer.");
  }
  if (!Number.isInteger(options.maxPages) || options.maxPages <= 0) {
    throw new Error("--max-pages must be a positive integer.");
  }

  return options;
}

function parseClaimArguments(args) {
  const options = parseCommonProjectArguments(extractProjectArguments(args));

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    switch (arg) {
      case "--owner":
      case "--project-number":
        index += 1;
        break;
      case "--item-id":
        options.itemId = requireValue(args, ++index, arg);
        break;
      case "--status":
        options.status = requireValue(args, ++index, arg);
        break;
      case "--repo":
        options.repository = requireValue(args, ++index, arg);
        break;
      case "--issue-number":
        options.issueNumber = Number(requireValue(args, ++index, arg));
        break;
      case "--assignee":
        options.assignee = requireValue(args, ++index, arg);
        break;
      default:
        throw new Error(`Unknown argument: ${arg}`);
    }
  }

  if ((options.repository || options.issueNumber || options.assignee) &&
      !(options.repository && options.issueNumber && options.assignee)) {
    throw new Error("--repo, --issue-number, and --assignee must be provided together.");
  }
  if (!options.itemId) {
    throw new Error("--item-id is required.");
  }
  if (!options.status) {
    throw new Error("--status is required.");
  }

  return options;
}

function parseCommentArguments(args) {
  const options = {};

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    switch (arg) {
      case "--repo":
        options.repository = requireValue(args, ++index, arg);
        break;
      case "--issue-number":
        options.issueNumber = Number(requireValue(args, ++index, arg));
        break;
      case "--body":
        options.body = requireValue(args, ++index, arg);
        break;
      default:
        throw new Error(`Unknown argument: ${arg}`);
    }
  }

  if (!options.repository) {
    throw new Error("--repo is required.");
  }
  if (!Number.isInteger(options.issueNumber) || options.issueNumber <= 0) {
    throw new Error("--issue-number must be a positive integer.");
  }
  if (!options.body) {
    throw new Error("--body is required.");
  }

  return options;
}

function extractProjectArguments(args) {
  const extracted = [];
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === "--owner" || arg === "--project-number") {
      extracted.push(arg, requireValue(args, ++index, arg));
    }
  }
  return extracted;
}

function requireValue(args, index, flag) {
  const value = args[index];
  if (!value || value.startsWith("--")) {
    throw new Error(`${flag} requires a value.`);
  }

  return value;
}

async function ghJson(args) {
  const { stdout } = await execFileAsync(ghBinary, args, {
    encoding: "utf8",
    maxBuffer: 10 * 1024 * 1024
  });
  return JSON.parse(stdout);
}

async function ghText(args) {
  await execFileAsync(ghBinary, args, {
    encoding: "utf8",
    maxBuffer: 10 * 1024 * 1024
  });
}

function printHelp() {
  console.log(`Usage: npm run project:board -- <command> [options]

Commands:
  fields       Print the project id, status field id, and status option ids.
  find-next    Page minimally through project items and return the next eligible item.
  find-item    Page minimally through project items until one repo + issue match is found.
  set-status   Update one project item's Status field by name.
  claim        Optionally assign a linked issue, then set project Status by name.
  comment      Add a comment to a linked issue through REST.

Common options:
  --owner <login>          GitHub organization or user login.
  --project-number <n>     Project number. Defaults to 1.

find-next options:
  --self-login <login>     Only include items assigned to this login or unassigned.
  --page-size <n>          GraphQL page size. Defaults to 25.
  --max-pages <n>          Maximum pages to scan in one run. Defaults to 4.
  --cursor <value>         Resume from a saved endCursor.
  --eligible-status <name> Repeatable. Defaults to Ready, Backlog, In progress, In review.
  --exclude-status <name>  Repeatable. Defaults to Done.

find-item options:
  --repo <owner/name>      Repository containing the linked issue.
  --issue-number <n>       Linked issue number to locate.
  --page-size <n>          GraphQL page size. Defaults to 25.
  --max-pages <n>          Maximum pages to scan in one run. Defaults to 4.
  --cursor <value>         Resume from a saved endCursor.

set-status / claim options:
  --item-id <id>           Project item id to update.
  --status <name>          Status name, for example "In progress".

claim options:
  --repo <owner/name>      Linked repository for the issue assignment step.
  --issue-number <n>       Issue number to assign.
  --assignee <login>       GitHub login to assign before updating project status.

comment options:
  --repo <owner/name>      Repository containing the issue.
  --issue-number <n>       Issue number to comment on.
  --body <text>            Comment body.
`);
}
