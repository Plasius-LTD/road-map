const DEFAULT_ELIGIBLE_STATUSES = ["Ready", "Backlog", "In progress", "In review"];
const DEFAULT_EXCLUDED_STATUSES = ["Done"];
const DEFAULT_PAGE_SIZE = 25;
const DEFAULT_MAX_PAGES = 4;

export const PROJECT_ITEMS_QUERY = `query($owner:String!, $number:Int!, $pageSize:Int!, $cursor:String) {
  organization(login:$owner) {
    projectV2(number:$number) {
      id
      title
      items(first:$pageSize, after:$cursor) {
        pageInfo {
          hasNextPage
          endCursor
        }
        nodes {
          id
          content {
            __typename
            ... on Issue {
              number
              title
              url
              repository {
                nameWithOwner
              }
              assignees(first:10) {
                nodes {
                  login
                }
              }
            }
            ... on PullRequest {
              number
              title
              url
              repository {
                nameWithOwner
              }
              assignees(first:10) {
                nodes {
                  login
                }
              }
            }
            ... on DraftIssue {
              title
              body
            }
          }
          fieldValues(first:10) {
            nodes {
              __typename
              ... on ProjectV2ItemFieldSingleSelectValue {
                name
                field {
                  ... on ProjectV2SingleSelectField {
                    name
                  }
                }
              }
              ... on ProjectV2ItemFieldUserValue {
                users(first:10) {
                  nodes {
                    login
                  }
                }
                field {
                  ... on ProjectV2FieldCommon {
                    name
                  }
                }
              }
              ... on ProjectV2ItemFieldRepositoryValue {
                repository {
                  nameWithOwner
                }
                field {
                  ... on ProjectV2FieldCommon {
                    name
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}`;

export function defaultFindNextOptions(overrides = {}) {
  return {
    eligibleStatuses: [...DEFAULT_ELIGIBLE_STATUSES],
    excludedStatuses: [...DEFAULT_EXCLUDED_STATUSES],
    pageSize: DEFAULT_PAGE_SIZE,
    maxPages: DEFAULT_MAX_PAGES,
    ...overrides
  };
}

export function normalizeProjectItem(node) {
  const content = node.content ?? {};
  const fieldValues = node.fieldValues?.nodes ?? [];
  const singleSelectValues = new Map();
  const userValues = new Map();
  let repository = content.repository?.nameWithOwner ?? null;

  for (const fieldValue of fieldValues) {
    const fieldName = fieldValue.field?.name;
    if (!fieldName) {
      continue;
    }

    if (fieldValue.__typename === "ProjectV2ItemFieldSingleSelectValue") {
      singleSelectValues.set(fieldName, fieldValue.name ?? null);
    }

    if (fieldValue.__typename === "ProjectV2ItemFieldUserValue") {
      userValues.set(
        fieldName,
        (fieldValue.users?.nodes ?? [])
          .map((user) => user.login)
          .filter(Boolean)
      );
    }

    if (fieldValue.__typename === "ProjectV2ItemFieldRepositoryValue" && fieldValue.repository?.nameWithOwner) {
      repository = fieldValue.repository.nameWithOwner;
    }
  }

  return {
    itemId: node.id,
    contentType: content.__typename ?? "Unknown",
    number: content.number ?? null,
    title: content.title ?? null,
    url: content.url ?? null,
    repository,
    status: singleSelectValues.get("Status") ?? null,
    priority: singleSelectValues.get("Priority") ?? null,
    projectAssignees: userValues.get("Assignees") ?? [],
    contentAssignees: (content.assignees?.nodes ?? [])
      .map((assignee) => assignee.login)
      .filter(Boolean)
  };
}

export function getAssignees(item) {
  return [...new Set([...(item.projectAssignees ?? []), ...(item.contentAssignees ?? [])])];
}

export function isEligibleProjectItem(item, options = {}) {
  const normalizedOptions = defaultFindNextOptions(options);
  const assignees = getAssignees(item);

  if (!item.title || !item.status || normalizedOptions.excludedStatuses.includes(item.status)) {
    return false;
  }

  if (normalizedOptions.eligibleStatuses.length > 0 && !normalizedOptions.eligibleStatuses.includes(item.status)) {
    return false;
  }

  if (normalizedOptions.selfLogin && assignees.length > 0 && !assignees.includes(normalizedOptions.selfLogin)) {
    return false;
  }

  return true;
}

export function selectNextEligibleItem(items, options = {}) {
  const normalizedOptions = defaultFindNextOptions(options);
  const eligible = items
    .filter((item) => isEligibleProjectItem(item, normalizedOptions))
    .sort((left, right) => compareEligibleItems(left, right, normalizedOptions));

  return eligible[0] ?? null;
}

export function summarizeFindNextResult(response, options = {}) {
  const normalizedOptions = defaultFindNextOptions(options);
  const project = response?.data?.organization?.projectV2;
  if (!project) {
    throw new Error("Project not found in GraphQL response.");
  }

  const items = (project.items?.nodes ?? []).map(normalizeProjectItem);
  return {
    projectId: project.id,
    projectTitle: project.title,
    items,
    candidate: selectNextEligibleItem(items, normalizedOptions),
    pageInfo: project.items?.pageInfo ?? { hasNextPage: false, endCursor: null }
  };
}

export function parseFieldMapResponse(response) {
  const project = response?.project ?? response;
  const fields = project.fields ?? [];
  const statusField = fields.find((field) => field.name === "Status");
  if (!statusField) {
    throw new Error("Project is missing a Status field.");
  }

  const statuses = Object.fromEntries((statusField.options ?? []).map((option) => [option.name, option.id]));
  return {
    projectId: project.id,
    projectNumber: project.number,
    projectTitle: project.title,
    statusFieldId: statusField.id,
    statuses
  };
}

function compareEligibleItems(left, right, options) {
  const priorityDelta = priorityRank(left.priority) - priorityRank(right.priority);
  if (priorityDelta !== 0) {
    return priorityDelta;
  }

  const workTypeDelta = workTypeRank(left.title) - workTypeRank(right.title);
  if (workTypeDelta !== 0) {
    return workTypeDelta;
  }

  const statusDelta = statusRank(left.status, options.eligibleStatuses) - statusRank(right.status, options.eligibleStatuses);
  if (statusDelta !== 0) {
    return statusDelta;
  }

  if (left.number != null && right.number != null) {
    return left.number - right.number;
  }

  return (left.title ?? "").localeCompare(right.title ?? "");
}

function priorityRank(priority) {
  switch (priority) {
    case "P0":
      return 0;
    case "P1":
      return 1;
    case "P2":
      return 2;
    default:
      return 3;
  }
}

function statusRank(status, eligibleStatuses) {
  const index = eligibleStatuses.indexOf(status);
  return index === -1 ? eligibleStatuses.length : index;
}

function workTypeRank(title) {
  if (title?.startsWith("[TASK]")) {
    return 0;
  }
  if (title?.startsWith("[STORY]")) {
    return 1;
  }
  if (title?.startsWith("[FEATURE]")) {
    return 2;
  }
  if (title?.startsWith("[EPIC]")) {
    return 3;
  }
  return 4;
}
