/**Mocked data */
export default async function({faker}, target, that, [{username: login, page, per_page}]) {
  console.debug("metrics/compute/mocks > mocking rest api result > rest.activity.listEventsForAuthenticatedUser")
  return ({
    status: 200,
    url: `https://api.github.com/users/${login}/events?per_page=${per_page}&page=${page}`,
    headers: {
      server: "GitHub.com",
      status: "200 OK",
      "x-oauth-scopes": "repo",
    },
    data: page < 1 ? [] : [
      {
        id: "10000000000",
        type: "CommitCommentEvent",
        actor: {
          login,
        },
        repo: {
          name: `${faker.random.word()}/${faker.random.word()}`,
        },
        payload: {
          comment: {
            user: {
              login,
            },
            path: faker.system.fileName(),
            commit_id: "MOCKED_SHA",
            body: faker.lorem.sentence(),
          },
        },
        created_at: faker.date.recent(7),
        public: true,
      },
      {
        id: "10000000001",
        type: "PullRequestReviewCommentEvent",
        actor: {
          login,
        },
        repo: {
          name: `${faker.random.word()}/${faker.random.word()}`,
        },
        payload: {
          action: "created",
          comment: {
            user: {
              login,
            },
            body: faker.lorem.paragraph(),
          },
          pull_request: {
            title: faker.lorem.sentence(),
            number: 1,
            user: {
              login: faker.internet.userName(),
            },
            body: "",
          },
        },
        created_at: faker.date.recent(7),
        public: true,
      },
      {
        id: "10000000002",
        type: "IssuesEvent",
        actor: {
          login,
        },
        repo: {
          name: `${faker.random.word()}/${faker.random.word()}`,
        },
        payload: {
          action: faker.helpers.arrayElement(["opened", "closed", "reopened"]),
          issue: {
            number: 2,
            title: faker.lorem.sentence(),
            user: {
              login,
            },
            body: faker.lorem.paragraph(),
            performed_via_github_app: null,
          },
        },
        created_at: faker.date.recent(7),
        public: true,
      },
      {
        id: "10000000003",
        type: "GollumEvent",
        actor: {
          login,
        },
        repo: {
          name: `${faker.random.word()}/${faker.random.word()}`,
        },
        payload: {
          pages: [
            {
              page_name: faker.lorem.sentence(),
              title: faker.lorem.sentence(),
              summary: null,
              action: "created",
              sha: "MOCKED_SHA",
            },
          ],
        },
        created_at: faker.date.recent(7),
        public: true,
      },
      {
        id: "10000000004",
        type: "IssueCommentEvent",
        actor: {
          login,
        },
        repo: {
          name: `${faker.random.word()}/${faker.random.word()}`,
        },
        payload: {
          action: "created",
          issue: {
            number: 3,
            title: faker.lorem.sentence(),
            user: {
              login,
            },
            labels: [
              {
                name: "lorem ipsum",
                color: "d876e3",
              },
            ],
            state: "open",
          },
          comment: {
            body: faker.lorem.paragraph(),
            performed_via_github_app: null,
          },
        },
        created_at: faker.date.recent(7),
        public: true,
      },
      {
        id: "10000000005",
        type: "ForkEvent",
        actor: {
          login,
        },
        repo: {
          name: `${faker.random.word()}/${faker.random.word()}`,
        },
        payload: {
          forkee: {
            name: faker.random.word(),
            full_name: `${faker.random.word()}/${faker.random.word()}`,
          },
        },
        created_at: faker.date.recent(7),
        public: true,
      },
      {
        id: "10000000006",
        type: "PullRequestReviewEvent",
        actor: {
          login,
        },
        repo: {
          name: `${faker.random.word()}/${faker.random.word()}`,
        },
        payload: {
          action: "created",
          review: {
            user: {
              login,
            },
            state: "approved",
          },
          pull_request: {
            state: "open",
            number: 4,
            locked: false,
            title: faker.lorem.sentence(),
            user: {
              login: faker.internet.userName(),
            },
          },
        },
        created_at: faker.date.recent(7),
        public: true,
      },
      {
        id: "10000000007",
        type: "ReleaseEvent",
        actor: {
          login,
        },
        repo: {
          name: `${faker.random.word()}/${faker.random.word()}`,
        },
        payload: {
          action: "published",
          release: {
            tag_name: `v${faker.datatype.number()}.${faker.datatype.number()}`,
            name: faker.random.words(4),
            draft: faker.datatype.boolean(),
            prerelease: faker.datatype.boolean(),
          },
        },
        created_at: faker.date.recent(7),
        public: true,
      },
      {
        id: "10000000008",
        type: "CreateEvent",
        actor: {
          login,
        },
        repo: {
          name: `${faker.random.word()}/${faker.random.word()}`,
        },
        payload: {
          ref: faker.lorem.slug(),
          ref_type: faker.helpers.arrayElement(["tag", "branch"]),
          master_branch: "master",
        },
        created_at: faker.date.recent(7),
        public: true,
      },
      {
        id: "100000000009",
        type: "WatchEvent",
        actor: {
          login,
        },
        repo: {
          name: "lowlighter/metrics",
        },
        payload: {action: "started"},
        created_at: faker.date.recent(7),
        public: true,
      },
      {
        id: "10000000010",
        type: "DeleteEvent",
        actor: {
          login,
        },
        repo: {
          name: `${faker.random.word()}/${faker.random.word()}`,
        },
        payload: {
          ref: faker.lorem.slug(),
          ref_type: faker.helpers.arrayElement(["tag", "branch"]),
        },
        created_at: faker.date.recent(7),
        public: true,
      },
      {
        id: "10000000011",
        type: "PushEvent",
        actor: {
          login,
        },
        repo: {
          name: `${faker.random.word()}/${faker.random.word()}`,
        },
        payload: {
          size: 1,
          ref: "refs/heads/master",
          commits: [
            {
              sha: "MOCKED_SHA",
              message: faker.lorem.sentence(),
              url: "https://api.github.com/repos/lowlighter/metrics/commits/MOCKED_SHA",
              author: {
                email: faker.internet.email(),
              },
            },
          ],
        },
        created_at: faker.date.recent(7),
        public: true,
      },
      {
        id: "10000000012",
        type: "PullRequestEvent",
        actor: {
          login,
        },
        repo: {
          name: `${faker.random.word()}/${faker.random.word()}`,
        },
        payload: {
          action: faker.helpers.arrayElement(["opened", "closed"]),
          number: 5,
          pull_request: {
            user: {
              login,
            },
            state: "open",
            title: faker.lorem.sentence(),
            additions: faker.datatype.number(1000),
            deletions: faker.datatype.number(1000),
            changed_files: faker.datatype.number(10),
          },
        },
        created_at: faker.date.recent(7),
        public: true,
      },
      {
        id: "10000000013",
        type: "MemberEvent",
        actor: {
          login,
        },
        repo: {
          name: `${faker.random.word()}/${faker.random.word()}`,
        },
        payload: {
          member: {
            login: faker.internet.userName(),
          },
          action: "added",
        },
        created_at: faker.date.recent(7),
        public: true,
      },
      {
        id: "10000000014",
        type: "PublicEvent",
        actor: {
          login,
        },
        repo: {
          name: `${faker.random.word()}/${faker.random.word()}`,
        },
        payload: {},
        created_at: faker.date.recent(7),
        public: true,
      },
    ],
  })
}
