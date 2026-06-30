import assert from "node:assert/strict";
import test from "node:test";
import {
  isEligibleProjectItem,
  normalizeProjectItem,
  parseFieldMapResponse,
  selectNextEligibleItem,
  summarizeFindNextResult
} from "../index.mjs";

test("normalizeProjectItem merges content and project field values", () => {
  const item = normalizeProjectItem({
    id: "item-1",
    content: {
      __typename: "Issue",
      number: 524,
      title: "[TASK] Unblock GraphQL paging",
      url: "https://example.test/issues/524",
      repository: {
        nameWithOwner: "Plasius-LTD/road-map"
      },
      assignees: {
        nodes: [{ login: "zephod111r" }]
      }
    },
    fieldValues: {
      nodes: [
        {
          __typename: "ProjectV2ItemFieldSingleSelectValue",
          name: "Ready",
          field: { name: "Status" }
        },
        {
          __typename: "ProjectV2ItemFieldSingleSelectValue",
          name: "P0",
          field: { name: "Priority" }
        },
        {
          __typename: "ProjectV2ItemFieldUserValue",
          users: {
            nodes: [{ login: "teammate" }]
          },
          field: { name: "Assignees" }
        }
      ]
    }
  });

  assert.deepEqual(item, {
    itemId: "item-1",
    contentType: "Issue",
    number: 524,
    title: "[TASK] Unblock GraphQL paging",
    url: "https://example.test/issues/524",
    repository: "Plasius-LTD/road-map",
    status: "Ready",
    priority: "P0",
    projectAssignees: ["teammate"],
    contentAssignees: ["zephod111r"]
  });
});

test("isEligibleProjectItem excludes done and foreign-assigned items", () => {
  assert.equal(isEligibleProjectItem({
    title: "[TASK] Done item",
    status: "Done",
    projectAssignees: [],
    contentAssignees: []
  }, { selfLogin: "zephod111r" }), false);

  assert.equal(isEligibleProjectItem({
    title: "[TASK] Other owner's item",
    status: "Ready",
    projectAssignees: ["teammate"],
    contentAssignees: []
  }, { selfLogin: "zephod111r" }), false);

  assert.equal(isEligibleProjectItem({
    title: "[TASK] My item",
    status: "Ready",
    projectAssignees: [],
    contentAssignees: ["zephod111r"]
  }, { selfLogin: "zephod111r" }), true);
});

test("selectNextEligibleItem prefers priority, then granular work type", () => {
  const selection = selectNextEligibleItem([
    {
      title: "[FEATURE] Later feature",
      status: "Ready",
      priority: "P1",
      number: 900,
      projectAssignees: [],
      contentAssignees: []
    },
    {
      title: "[TASK] Important task",
      status: "Backlog",
      priority: "P0",
      number: 901,
      projectAssignees: [],
      contentAssignees: []
    },
    {
      title: "[STORY] My story",
      status: "Ready",
      priority: "P0",
      number: 902,
      projectAssignees: ["zephod111r"],
      contentAssignees: []
    }
  ], { selfLogin: "zephod111r" });

  assert.equal(selection.title, "[TASK] Important task");
});

test("summarizeFindNextResult returns the next candidate and cursor", () => {
  const summary = summarizeFindNextResult({
    data: {
      organization: {
        projectV2: {
          id: "project-1",
          title: "Plasius-LTD-site",
          items: {
            pageInfo: {
              hasNextPage: true,
              endCursor: "cursor-2"
            },
            nodes: [
              {
                id: "item-1",
                content: {
                  __typename: "Issue",
                  number: 100,
                  title: "[FEATURE] Already owned elsewhere",
                  repository: { nameWithOwner: "Plasius-LTD/plasius-ltd-site" },
                  assignees: { nodes: [{ login: "another-user" }] }
                },
                fieldValues: {
                  nodes: [
                    {
                      __typename: "ProjectV2ItemFieldSingleSelectValue",
                      name: "Ready",
                      field: { name: "Status" }
                    }
                  ]
                }
              },
              {
                id: "item-2",
                content: {
                  __typename: "Issue",
                  number: 101,
                  title: "[TASK] Next action",
                  repository: { nameWithOwner: "Plasius-LTD/road-map" },
                  assignees: { nodes: [] }
                },
                fieldValues: {
                  nodes: [
                    {
                      __typename: "ProjectV2ItemFieldSingleSelectValue",
                      name: "Backlog",
                      field: { name: "Status" }
                    },
                    {
                      __typename: "ProjectV2ItemFieldSingleSelectValue",
                      name: "P1",
                      field: { name: "Priority" }
                    }
                  ]
                }
              }
            ]
          }
        }
      }
    }
  }, {
    selfLogin: "zephod111r"
  });

  assert.equal(summary.projectId, "project-1");
  assert.equal(summary.candidate.title, "[TASK] Next action");
  assert.equal(summary.pageInfo.endCursor, "cursor-2");
});

test("parseFieldMapResponse extracts status option ids", () => {
  const fields = parseFieldMapResponse({
    id: "project-1",
    number: 1,
    title: "Plasius-LTD-site",
    fields: [
      {
        id: "status-field",
        name: "Status",
        options: [
          { id: "ready-id", name: "Ready" },
          { id: "progress-id", name: "In progress" }
        ]
      }
    ]
  });

  assert.deepEqual(fields, {
    projectId: "project-1",
    projectNumber: 1,
    projectTitle: "Plasius-LTD-site",
    statusFieldId: "status-field",
    statuses: {
      Ready: "ready-id",
      "In progress": "progress-id"
    }
  });
});
