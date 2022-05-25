/**Achievements list for users accounts */
export default async function({list, login, data, computed, imports, graphql, queries, rest, rank, leaderboard}) {
  //Initialization
  const {user} = await graphql(queries.achievements({login}))
  const scores = {followers: user.followers.totalCount, created: user.repositories.totalCount, stars: user.popular.nodes?.[0]?.stargazers?.totalCount ?? 0, forks: Math.max(0, ...data.user.repositories.nodes.map(({forkCount}) => forkCount))}
  const ranks = await graphql(queries.achievements.ranking(scores))
  const requirements = {stars: 5, followers: 3, forks: 1, created: 1}

  //Developer
  {
    const value = user.repositories.totalCount
    const unlock = user.repositories.nodes?.shift()
    list.push({
      title: "Developer",
      text: `Published ${value} public repositor${imports.s(value, "y")}`,
      icon:
        '<g stroke-linecap="round" stroke-width="2" fill="none" fill-rule="evenodd"><g stroke="#primary"><path d="M20 24l-3.397 3.398a.85.85 0 000 1.203L20.002 32M37.015 24l3.399 3.398a.85.85 0 010 1.203L37.014 32" stroke-linejoin="round"/><path d="M31.029 21.044L25.976 35.06"/></g><path stroke="#secondary" stroke-linejoin="round" d="M23.018 10h8.984M26 47h5M8 16h16m9 0h15.725M8 41h13"/><path d="M5.027 34.998c.673 2.157 1.726 4.396 2.81 6.02m43.38-19.095C50.7 19.921 49.866 17.796 48.79 16" stroke="#secondary"/><path stroke="#primary" stroke-linejoin="round" d="M26 41h17"/><path d="M7.183 16C5.186 19.582 4 23.619 4 28M42.608 47.02c2.647-1.87 5.642-5.448 7.295-9.18C51.52 34.191 52.071 30.323 52 28" stroke="#primary"/><path stroke="#primary" stroke-linejoin="round" d="M7.226 16H28M13.343 47H21"/><path d="M13.337 47.01a24.364 24.364 0 006.19 3.45 24.527 24.527 0 007.217 1.505c2.145.108 4.672-.05 7.295-.738" stroke="#primary"/><path stroke="#primary" stroke-linejoin="round" d="M36 47h6.647M12 10h6M37 10h6.858"/><path d="M43.852 10c-4.003-3.667-9.984-6.054-16.047-6-2.367.021-4.658.347-6.81 1.045" stroke="#primary"/><path stroke="#secondary" stroke-linejoin="round" d="M5.041 35h4.962M47 22h4.191"/></g>',
      ...rank(value, [1, 20, 50, 100, 250]),
      value,
      unlock: new Date(unlock?.createdAt),
      leaderboard: leaderboard({user: ranks.created_rank.userCount, requirement: scores.created >= requirements.created, type: "users"}),
    })
  }

  //Forker
  {
    const value = user.forks.totalCount
    const unlock = user.forks.nodes?.shift()
    list.push({
      title: "Forker",
      text: `Forked ${value} public repositor${imports.s(value, "y")}`,
      icon:
        '<g stroke-width="2" fill="none" fill-rule="evenodd"><path d="M37.303 21.591a5.84 5.84 0 00-1.877-1.177 6.138 6.138 0 00-4.432 0 5.822 5.822 0 00-1.879 1.177L28 22.638l-1.115-1.047c-1.086-1.018-2.559-1.59-4.094-1.59-1.536 0-3.008.572-4.094 1.59-1.086 1.02-1.696 2.4-1.696 3.84 0 1.441.61 2.823 1.696 3.841l1.115 1.046L28 38l8.189-7.682 1.115-1.046a5.422 5.422 0 001.256-1.761 5.126 5.126 0 000-4.157 5.426 5.426 0 00-1.256-1.763z" stroke="#primary" stroke-linecap="round" stroke-linejoin="round"/><path d="M15.967 42.705A18.922 18.922 0 0028 47a18.92 18.92 0 0011.076-3.56m-.032-30.902A18.914 18.914 0 0028 9c-4.09 0-7.876 1.292-10.976 3.49" stroke="#secondary" stroke-linecap="round"/><g transform="translate(7 10)" stroke="#primary"><path d="M6 0v7c0 2.21-1.343 3-3 3s-3-.79-3-3V0" stroke-linecap="round" stroke-linejoin="round"/><path stroke-linecap="round" d="M3 0v19.675"/><rect stroke-linejoin="round" x="1" y="20" width="4" height="16" rx="2"/></g><g transform="translate(43 10)" stroke="#primary"><path stroke-linecap="round" d="M2 15.968v3.674"/><path d="M4 15.642H0L.014 4.045A4.05 4.05 0 014.028 0L4 15.642z" stroke-linecap="round" stroke-linejoin="round"/><rect stroke-linejoin="round" y="19.968" width="4" height="16" rx="2"/></g><path d="M41.364 8.062A23.888 23.888 0 0028 4a23.89 23.89 0 00-11.95 3.182M4.75 22.021A24.045 24.045 0 004 28c0 1.723.182 3.404.527 5.024m10.195 14.971A23.888 23.888 0 0028 52c4.893 0 9.444-1.464 13.239-3.979m9-10.98A23.932 23.932 0 0052 28c0-2.792-.477-5.472-1.353-7.964" stroke="#secondary" stroke-linecap="round"/></g>',
      ...rank(value, [1, 5, 10, 20, 50]),
      value,
      unlock: new Date(unlock?.createdAt),
    })
  }

  //Contributor
  {
    const value = user.pullRequests.totalCount
    const unlock = user.pullRequests.nodes?.shift()

    list.push({
      title: "Contributor",
      text: `Opened ${value} pull request${imports.s(value)}`,
      icon:
        '<g stroke-width="2" fill="none" fill-rule="evenodd"><path stroke="#secondary" stroke-linecap="round" stroke-linejoin="round" d="M26.022 5.014h6M26.012 53.005h6M27.003 47.003h12M44.01 20.005h5M19.01 11.003h12"/><path stroke="#primary" stroke-linecap="round" stroke-linejoin="round" d="M38.005 11.008h6M41 14.013v-6M14.007 47.003h6M17.002 50.004v-6"/><path d="M29.015 5.01l-5.003 5.992 5.003-5.992zM33.015 47.01l-5.003 5.992 5.003-5.992z" stroke="#secondary"/><path stroke="#primary" stroke-linecap="round" stroke-linejoin="round" d="M8.01 19.002h6"/><path stroke="#secondary" stroke-linecap="round" stroke-linejoin="round" d="M47.011 29h6"/><path stroke="#primary" stroke-linecap="round" stroke-linejoin="round" d="M44.012 39.003h6"/><g stroke="#secondary"><path d="M5.36 29c4.353 0 6.4 4.472 6.4 8"/><path stroke-linecap="round" stroke-linejoin="round" d="M13.99 37.995h-5M10.989 29h-6"/></g><path d="M24.503 22c1.109 0 2.007.895 2.007 2 0 1.104-.898 2-2.007 2a2.004 2.004 0 01-2.008-2c0-1.105.9-2 2.008-2zM24.5 32a2 2 0 110 4 2 2 0 010-4zm9.5 0a2 2 0 110 4 2 2 0 010-4z" stroke="#primary" stroke-linecap="round" stroke-linejoin="round"/><path stroke="#primary" d="M24.5 26.004v6.001"/><path d="M31.076 23.988l1.027-.023a1.998 1.998 0 011.932 2.01L34 31" stroke="#primary" stroke-linecap="round" stroke-linejoin="round"/><path stroke="#primary" stroke-linecap="round" stroke-linejoin="round" d="M31.588 26.222l-2.194-2.046 2.046-2.194"/><path d="M29.023 43c7.732 0 14-6.268 14-14s-6.268-14-14-14-14 6.268-14 14 6.268 14 14 14z" stroke="#primary"/></g>',
      ...rank(value, [1, 200, 500, 1000, 2500]),
      value,
      unlock: new Date(unlock?.createdAt),
    })
  }

  //Manager
  {
    const value = user.projects.totalCount
    const unlock = user.projects.nodes?.shift()

    list.push({
      title: "Manager",
      text: `Created ${value} user project${imports.s(value)}`,
      icon:
        '<g stroke-width="2" fill="none" fill-rule="evenodd"><path d="M29 16V8.867C29 7.705 29.627 7 30.692 7h18.616C50.373 7 51 7.705 51 8.867v38.266C51 48.295 50.373 49 49.308 49H30.692C29.627 49 29 48.295 29 47.133V39m-4-23V9c0-1.253-.737-2-2-2H7c-1.263 0-2 .747-2 2v34c0 1.253.737 2 2 2h16c1.263 0 2-.747 2-2v-4" stroke="#secondary" stroke-linecap="round"/><path stroke="#secondary" d="M51.557 12.005h-22M5 12.005h21"/><path d="M14 33V22c0-1.246.649-2 1.73-2h28.54c1.081 0 1.73.754 1.73 2v11c0 1.246-.649 2-1.73 2H15.73c-1.081 0-1.73-.754-1.73-2z" stroke="#primary" stroke-linecap="round" stroke-linejoin="round"/><path d="M19 29v-3c0-.508.492-1 1-1h3c.508 0 1 .492 1 1v3c0 .508-.492 1-1 1h-3c-.508-.082-1-.492-1-1z" stroke="#primary"/><path stroke="#primary" stroke-linecap="round" stroke-linejoin="round" d="M28.996 27.998h12M9.065 20.04a7.062 7.062 0 00-.023 1.728m.775 2.517c.264.495.584.954.954 1.369"/></g>',
      ...rank(value, [1, 2, 3, 4, 5]),
      value,
      unlock: new Date(unlock?.createdAt),
    })
  }

  //Reviewer
  {
    const value = user.contributionsCollection.pullRequestReviewContributions.totalCount
    const unlock = user.contributionsCollection.pullRequestReviewContributions.nodes?.shift()

    list.push({
      title: "Reviewer",
      text: `Reviewed ${value} pull request${imports.s(value)}`,
      icon:
        '<g stroke-linecap="round" stroke-width="2" fill="none" fill-rule="evenodd"><g stroke="#secondary"><path d="M26.009 34.01c.444-.004.9.141 1.228.414.473.394.766.959.76 1.54-.01.735-.333 1.413-.97 2.037.66.718.985 1.4.976 2.048-.012.828-.574 1.58-1.687 2.258.624.788.822 1.549.596 2.28-.225.733-.789 1.219-1.69 1.459.703.833.976 1.585.82 2.256-.178.763-.313 1.716-2.492 1.711" stroke-linejoin="round"/><g stroke-linejoin="round"><path d="M18.548 28.422c1.184-4.303-2.132-5.292-2.132-5.292-.873 2.296-1.438 3.825-4.231 8.108-1.285 1.97-1.926 3.957-1.877 5.796M18.391 34.011L24.993 34c2.412-.009.211-.005-6.602.012zM5.004 37.017l5.234-.014-5.234.014z"/></g><g stroke-linejoin="round"><path d="M18.548 28.422c1.184-4.303-2.132-5.292-2.132-5.292-.873 2.296-1.438 3.825-4.231 8.108-1.285 1.97-1.926 3.957-1.877 5.796M5.004 37.017l5.234-.014-5.234.014zM7 48.012h4.01c1.352 1.333 2.672 2 3.961 2.001 0 0 .485-.005 5.46-.005h3.536"/></g><path d="M18.793 27.022c-.062.933-.373 2.082-.933 3.446-.561 1.364-.433 2.547.383 3.547"/></g><path d="M45 16.156V23a2 2 0 01-2 2H31l-6 4v-4h-1.934M12 23V8a2 2 0 012-2h29a2 2 0 012 2v10" stroke="#primary" stroke-linejoin="round"/><path stroke="#primary" stroke-linejoin="round" d="M23 12.014l-3 3 3 3M34 12.014l3 3-3 3"/><path stroke="#primary" d="M30.029 10l-3.015 10.027"/><path d="M32 39h3l6 4v-4h8a2 2 0 002-2V22a2 2 0 00-2-2h.138" stroke="#secondary" stroke-linejoin="round"/><path stroke="#primary" stroke-linejoin="round" d="M33 29h12M33 34h6M43 34h2"/></g>',
      ...rank(value, [1, 200, 500, 1000, 2500]),
      value,
      unlock: new Date(unlock?.createdAt),
    })
  }

  //Packager
  {
    const value = user.packages.totalCount + ((await rest.packages.listPackagesForUser({package_type: "container", username: login}).catch(() => ({data: []})))?.data?.length || 0)
    const unlock = user.packages.nodes?.shift()

    list.push({
      title: "Packager",
      text: `Created ${value} package${imports.s(value)}`,
      icon:
        '<g fill="none"><path fill="#secondary" d="M28.53 27.64l-11.2 6.49V21.15l11.23-6.48z"/><path d="M40.4 34.84c-.17 0-.34-.04-.5-.13l-11.24-6.44a.99.99 0 01-.37-1.36.99.99 0 011.36-.37l11.24 6.44c.48.27.65.89.37 1.36-.17.32-.51.5-.86.5z" fill="#primary"/><path d="M29.16 28.4c-.56 0-1-.45-1-1.01l.08-12.47c0-.55.49-1 1.01-.99.55 0 1 .45.99 1.01l-.08 12.47c0 .55-.45.99-1 .99z" fill="#primary"/><path d="M18.25 34.65a.996.996 0 01-.5-1.86l10.91-6.25a.997.997 0 11.99 1.73l-10.91 6.25c-.15.09-.32.13-.49.13z" fill="#primary"/><path d="M29.19 41.37c-.17 0-.35-.04-.5-.13l-11.23-6.49c-.31-.18-.5-.51-.5-.87V20.91c0-.36.19-.69.5-.87l11.23-6.49c.31-.18.69-.18 1 0l11.23 6.49c.31.18.5.51.5.87v12.97c0 .36-.19.69-.5.87l-11.23 6.49c-.15.08-.32.13-.5.13zm-10.23-8.06l10.23 5.91 10.23-5.91V21.49l-10.23-5.91-10.23 5.91v11.82zM40.5 11.02c-1.75 0-3.18-1.43-3.18-3.18 0-1.75 1.43-3.18 3.18-3.18 1.75 0 3.18 1.43 3.18 3.18 0 1.75-1.43 3.18-3.18 3.18zm0-4.36c-.65 0-1.18.53-1.18 1.18 0 .65.53 1.18 1.18 1.18.65 0 1.18-.53 1.18-1.18 0-.65-.53-1.18-1.18-1.18zm-23.19 4.36c-1.75 0-3.18-1.43-3.18-3.18 0-1.75 1.43-3.18 3.18-3.18 1.75 0 3.18 1.43 3.18 3.18 0 1.75-1.42 3.18-3.18 3.18zm0-4.36c-.65 0-1.18.53-1.18 1.18 0 .65.53 1.18 1.18 1.18.65 0 1.18-.53 1.18-1.18 0-.65-.53-1.18-1.18-1.18zm23.37 43.8c-1.75 0-3.18-1.43-3.18-3.18 0-1.75 1.43-3.18 3.18-3.18 1.75 0 3.18 1.43 3.18 3.18 0 1.75-1.42 3.18-3.18 3.18zm0-4.35c-.65 0-1.18.53-1.18 1.18 0 .65.53 1.18 1.18 1.18.65 0 1.18-.53 1.18-1.18 0-.65-.53-1.18-1.18-1.18zm-23.06 4.11c-1.75 0-3.18-1.43-3.18-3.18 0-1.75 1.43-3.18 3.18-3.18 1.75 0 3.18 1.43 3.18 3.18 0 1.75-1.43 3.18-3.18 3.18zm0-4.36c-.65 0-1.18.53-1.18 1.18 0 .65.53 1.18 1.18 1.18.65 0 1.18-.53 1.18-1.18 0-.65-.53-1.18-1.18-1.18zM6.18 30.72C4.43 30.72 3 29.29 3 27.54c0-1.75 1.43-3.18 3.18-3.18 1.75 0 3.18 1.43 3.18 3.18 0 1.75-1.43 3.18-3.18 3.18zm0-4.36c-.65 0-1.18.53-1.18 1.18 0 .65.53 1.18 1.18 1.18.65 0 1.18-.53 1.18-1.18 0-.65-.53-1.18-1.18-1.18zm45.64 4.36c-1.75 0-3.18-1.43-3.18-3.18 0-1.75 1.43-3.18 3.18-3.18 1.75 0 3.18 1.43 3.18 3.18 0 1.75-1.43 3.18-3.18 3.18zm0-4.36c-.65 0-1.18.53-1.18 1.18 0 .65.53 1.18 1.18 1.18.65 0 1.18-.53 1.18-1.18 0-.65-.53-1.18-1.18-1.18z" fill="#primary"/><path d="M29.1 10.21c-.55 0-1-.45-1-1V3.52c0-.55.45-1 1-1s1 .45 1 1v5.69c0 .56-.45 1-1 1zM7.44 20.95c-.73 0-1.32-.59-1.32-1.32v-5.38l4.66-2.69c.63-.37 1.44-.15 1.8.48.36.63.15 1.44-.48 1.8l-3.34 1.93v3.86c0 .73-.59 1.32-1.32 1.32zm4 22.68c-.22 0-.45-.06-.66-.18l-4.66-2.69v-5.38c0-.73.59-1.32 1.32-1.32.73 0 1.32.59 1.32 1.32v3.86l3.34 1.93c.63.36.85 1.17.48 1.8-.24.42-.68.66-1.14.66zm17.64 10.39l-4.66-2.69c-.63-.36-.85-1.17-.48-1.8.36-.63 1.17-.85 1.8-.48l3.34 1.93 3.34-1.93a1.32 1.32 0 011.8.48c.36.63.15 1.44-.48 1.8l-4.66 2.69zm17.64-10.39a1.32 1.32 0 01-.66-2.46l3.34-1.93v-3.86c0-.73.59-1.32 1.32-1.32.73 0 1.32.59 1.32 1.32v5.38l-4.66 2.69c-.21.12-.44.18-.66.18zm4-22.68c-.73 0-1.32-.59-1.32-1.32v-3.86l-3.34-1.93c-.63-.36-.85-1.17-.48-1.8.36-.63 1.17-.85 1.8-.48l4.66 2.69v5.38c0 .73-.59 1.32-1.32 1.32z" fill="#secondary"/><path d="M33.08 6.15c-.22 0-.45-.06-.66-.18l-3.34-1.93-3.34 1.93c-.63.36-1.44.15-1.8-.48a1.32 1.32 0 01.48-1.8L29.08 1l4.66 2.69c.63.36.85 1.17.48 1.8a1.3 1.3 0 01-1.14.66zm-3.99 47.3c-.55 0-1-.45-1-1v-7.13c0-.55.45-1 1-1s1 .45 1 1v7.13c0 .55-.44 1-1 1zM13.86 19.71c-.17 0-.34-.04-.5-.13L7.2 16a1 1 0 011-1.73l6.17 3.58c.48.28.64.89.36 1.37-.19.31-.52.49-.87.49zm36.63 21.23c-.17 0-.34-.04-.5-.13l-6.17-3.57a.998.998 0 01-.36-1.37c.28-.48.89-.64 1.37-.36L51 39.08c.48.28.64.89.36 1.37-.19.31-.52.49-.87.49zM44.06 19.8c-.35 0-.68-.18-.87-.5-.28-.48-.11-1.09.36-1.37l6.17-3.57c.48-.28 1.09-.11 1.37.36.28.48.11 1.09-.36 1.37l-6.17 3.57c-.16.1-.33.14-.5.14zM7.43 41.03c-.35 0-.68-.18-.87-.5-.28-.48-.11-1.09.36-1.37l6.17-3.57c.48-.28 1.09-.11 1.37.36.28.48.11 1.09-.36 1.37l-6.17 3.57c-.15.09-.33.14-.5.14z" fill="#secondary"/></g>',
      ...rank(value, [1, 5, 10, 20, 30]),
      value,
      unlock: new Date(unlock?.createdAt),
    })
  }

  //Gister
  {
    const value = user.gists.totalCount
    const unlock = user.gists.nodes?.shift()

    list.push({
      title: "Gister",
      text: `Published ${value} gist${imports.s(value)}`,
      icon:
        '<g stroke-width="2" fill="none" fill-rule="evenodd"><path d="M20 48.875v-12.75c0-1.33.773-2.131 2.385-2.125h26.23c1.612-.006 2.385.795 2.385 2.125v12.75C51 50.198 50.227 51 48.615 51h-26.23C20.773 51 20 50.198 20 48.875zM37 40.505h9M37 44.492h6" stroke="#primary" stroke-linecap="round" stroke-linejoin="round"/><path stroke="#secondary" stroke-linecap="round" stroke-linejoin="round" d="M14 30h-4M16 35h-3M47 10H5M42 15H24M19 15h-9M16 25h-3M42 20h-2M42 20h-2M42 25h-2M16 20h-3"/><path stroke="#primary" stroke-linecap="round" stroke-linejoin="round" d="M31.974 25H24"/><path d="M22 20h12a2 2 0 012 2v6a2 2 0 01-2 2H22a2 2 0 01-2-2v-6a2 2 0 012-2z" stroke="#primary"/><path d="M5 33V7a2 2 0 012-2h38a2 2 0 012 2v23" stroke="#secondary" stroke-linecap="round"/><path d="M5 30v8c0 1.105.892 2 1.993 2H16" stroke="#secondary" stroke-linecap="round"/><g stroke="#primary" stroke-linecap="round"><path d="M26.432 37.933v7.07M26.432 37.933v9.07M24.432 40.433h7.07M24.432 40.433h8.07M24.432 44.433h7.07M24.432 44.433h8.07M30.432 37.933v9.07"/></g></g>',
      ...rank(value, [1, 20, 50, 100, 250]),
      value,
      unlock: new Date(unlock?.createdAt),
    })
  }

  //Worker
  {
    const value = user.organizations.totalCount
    const unlock = user.organizations.nodes?.shift()

    list.push({
      title: "Worker",
      text: `Joined ${value} organization${imports.s(value)}`,
      icon:
        '<g stroke-linecap="round" stroke-width="2" fill="none" fill-rule="evenodd"><g stroke="#secondary" stroke-linejoin="round"><path d="M30 51H16.543v-2.998h-4v2.976l-5.537.016a2 2 0 01-2.006-2v-8.032a2 2 0 01.75-1.562l9.261-7.406 5.984 5.143m29.992 3.864v10h-6v-3h-5v3h-6m-.987-33c.133-1.116.793-2.106 1.978-2.968.44-.32 5.776-3.664 16.01-10.032v36"/><path d="M19 34.994v-8.982m16 0V49a2 2 0 01-2 2h-8.987l.011-6.957"/></g><path stroke="#secondary" d="M40 38h5M40 34h5"/><path stroke="#primary" d="M25 30h5M25 34h5M25 26h5"/><path d="M35.012 22.003H9.855a4.843 4.843 0 010-9.686h1.479c1.473-4.268 4.277-6.674 8.41-7.219 6.493-.856 9.767 4.27 10.396 5.9.734-.83 2.137-2.208 4.194-1.964a4.394 4.394 0 011.685.533" stroke="#primary" stroke-linejoin="round"/></g>',
      ...rank(value, [1, 2, 4, 8, 10]),
      value,
      unlock: new Date(unlock?.createdAt),
    })
  }

  //Stargazer
  {
    const value = user.starredRepositories.totalCount
    const unlock = user.starredRepositories.nodes?.shift()

    list.push({
      title: "Stargazer",
      text: `Starred ${value} repositor${imports.s(value, "y")}`,
      icon:
        '<g stroke-linecap="round" stroke-linejoin="round" stroke-width="2" fill="none" fill-rule="evenodd"><path stroke="#primary" d="M28.017 5v3M36.006 7.013l-1.987 2.024M20.021 7.011l1.988 2.011M28.806 30.23c-2.206-3.88-5.25-2.234-5.25-2.234 1.007 2.24 1.688 3.72 2.742 8.724.957 4.551 3.785 7.409 7.687 7.293l5.028 6.003M29.03 34.057L29 20.007m4.012 9.004V17.005m4.006 11.99l-.003-9.353"/><path d="M18.993 50.038l4.045-5.993s1.03-.262 1.954-.984m-6.983.96c-4.474-.016-6.986-5.558-6.986-9.979 0-1.764-.439-4.997-1.997-8.004 0 0 3.268-1.24 5.747 3.6.904 1.768.458 5.267.642 5.388.185.121 1.336.554 2.637 2.01m4.955-18.92a976.92 976.92 0 010 5.91m-7.995-4.986l-.003 10.97M10.031 48.021l2.369-3.003" stroke="#secondary"/><path d="M45.996 47.026l-1.99-2.497-1.993-2.5s2.995-1.485 2.995-6.46V24.033" stroke="#primary"/><path d="M41 29v-6a2 2 0 114 0v2m-8-4v-4a2 2 0 114 0v7m-8-7v-2a2 2 0 114 0v2m-8 4v-2a2 2 0 114 0v2" stroke="#primary"/><path d="M23 20v-2a2 2 0 013.043-1.707M19 19v-4a2 2 0 114 0v3m-8 3v-2a2 2 0 114 0v10" stroke="#secondary"/><path d="M6.7 12c.316 1.122.572 1.372 1.71 1.678-1.136.314-1.39.566-1.7 1.69-.316-1.121-.572-1.372-1.71-1.678 1.135-.314 1.389-.567 1.7-1.69zm42 0c.316 1.122.572 1.372 1.71 1.678-1.136.314-1.39.566-1.7 1.69-.317-1.121-.573-1.372-1.71-1.679 1.135-.313 1.389-.566 1.7-1.689zM28.021 47.627c.317 1.122.573 1.372 1.71 1.678-1.135.314-1.389.566-1.699 1.69-.318-1.121-.573-1.372-1.71-1.679 1.134-.313 1.389-.566 1.699-1.689z" stroke="#primary"/></g>',
      ...rank(value, [1, 200, 500, 1000, 2500]),
      value,
      unlock: new Date(unlock?.createdAt),
    })
  }

  //Follower
  {
    const value = user.following.totalCount
    const unlock = user.following.nodes?.shift()

    list.push({
      title: "Follower",
      text: `Following ${value} user${imports.s(value)}`,
      icon:
        '<g fill="none" fill-rule="evenodd"><path d="M35 31a7 7 0 1114 0 7 7 0 01-14 0zm12-13a3 3 0 116 0 3 3 0 01-6 0zM33 49a3 3 0 116 0 3 3 0 01-6 0zM4 15a3 3 0 116 0 3 3 0 01-6 0zm37-8.5a2.5 2.5 0 115 0 2.5 2.5 0 01-5 0zM10 14l4.029-.576M19.008 26.016L21 19M29.019 34.001l5.967-1.948M36.997 46.003l2.977-8.02M46.05 24.031L48 21M28.787 18.012l7.248 8.009" stroke="#secondary" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M43.62 29.004c-1.157 0-1.437.676-1.62 1.173-.19-.498-.494-1.167-1.629-1.167-.909 0-1.355.777-1.371 1.632-.022 1.145 1.309 2.365 3 3.358 1.669-.983 3-2.23 3-3.358 0-.89-.54-1.638-1.38-1.638z" fill="#primary"/><path stroke="#secondary" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M48.043 15.003L45 9"/><path d="M21 12a3 3 0 116 0 3 3 0 01-6 0zM27 12h3M18 12h3M21 43c-.267-1.727-1.973-3-4-3-2.08 0-3.787 1.318-4 3m4-9a3 3 0 100 6 3 3 0 000-6z" stroke="#primary" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M17 30a9 9 0 110 18 9 9 0 110-18z" stroke="#primary" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></g>',
      ...rank(value, [1, 200, 500, 1000, 2500]),
      value,
      unlock: new Date(unlock?.createdAt),
    })
  }

  //Influencer
  {
    const value = user.followers.totalCount
    const unlock = user.followers.nodes?.shift()

    list.push({
      title: "Influencer",
      text: `Followed by ${value} user${imports.s(value)}`,
      icon:
        '<g transform="translate(4 4)" stroke-width="2" fill="none" fill-rule="evenodd"><path d="M33.432 1.924A23.922 23.922 0 0024 0c-3.945 0-7.668.952-10.95 2.638m-9.86 9.398A23.89 23.89 0 000 24a23.9 23.9 0 002.274 10.21m3.45 5.347a23.992 23.992 0 0012.929 7.845m13.048-.664c4.43-1.5 8.28-4.258 11.123-7.848m3.16-5.245A23.918 23.918 0 0048 24c0-1.87-.214-3.691-.619-5.439M40.416 6.493a24.139 24.139 0 00-1.574-1.355" stroke="#secondary" stroke-linecap="round"/><path stroke="#secondary" d="M4.582 33.859l1.613-7.946"/><circle stroke="#secondary" cx="6.832" cy="23" r="3"/><path stroke="#primary" d="M17.444 39.854l4.75 3.275"/><path stroke="#secondary" stroke-linecap="round" d="M7.647 14.952l-.433 4.527"/><circle stroke="#primary" cx="15" cy="38" r="3"/><path stroke="#primary" d="M22.216 9.516l.455 4.342"/><path stroke="#secondary" stroke-linecap="round" d="M34.272 6.952l-2.828 5.25"/><path stroke="#primary" stroke-linecap="square" d="M11.873 7.235l6.424-.736"/><path stroke="#secondary" stroke-linecap="round" d="M28.811 5.445l3.718-.671"/><path stroke="#primary" d="M42.392 22.006l.456-5.763M34.349 24.426l4.374.447"/><path d="M20 28c.267-1.727 1.973-3 4-3 2.08 0 3.787 1.318 4 3m-4-9a3 3 0 110 6 3 3 0 010-6z" stroke="#primary" stroke-linecap="round" stroke-linejoin="round"/><path d="M24 14c5.523 0 10 4.477 10 10s-4.477 10-10 10-10-4.477-10-10 4.477-10 10-10z" stroke="#primary" stroke-linecap="round" stroke-linejoin="round"/><circle stroke="#secondary" cx="35.832" cy="4" r="3"/><circle stroke="#secondary" cx="44" cy="36" r="3"/><circle stroke="#secondary" cx="34.832" cy="37" r="3"/><circle stroke="#primary" cx="21.654" cy="6.437" r="3"/><path d="M25.083 48.102a3 3 0 100-6 3 3 0 000 6z" stroke="#primary"/><path d="M8.832 5a3 3 0 110 6 3 3 0 010-6z" stroke="#primary" stroke-linecap="round"/><circle stroke="#secondary" cx="4" cy="37" r="3"/><path d="M42.832 10a3 3 0 110 6 3 3 0 010-6z" stroke="#primary" stroke-linecap="round"/><path stroke="#secondary" stroke-linecap="round" d="M32.313 38.851l-1.786 1.661"/><circle stroke="#primary" cx="42" cy="25" r="3"/><path stroke="#primary" stroke-linecap="square" d="M18.228 32.388l-1.562 2.66"/><path stroke="#secondary" d="M37.831 36.739l2.951-.112"/></g>',
      ...rank(value, [1, 200, 500, 1000, 2500]),
      value,
      unlock: new Date(unlock?.createdAt),
      leaderboard: leaderboard({user: ranks.user_rank.userCount, requirement: scores.followers >= requirements.followers, type: "users"}),
    })
  }

  //Maintainer
  {
    const value = user.popular.nodes?.shift()?.stargazers?.totalCount ?? 0
    const unlock = null

    list.push({
      title: "Maintainer",
      text: `Maintaining a repository with ${value} star${imports.s(value)}`,
      icon:
        '<g transform="translate(4 4)" fill="none" fill-rule="evenodd"><path d="M39 15h.96l4.038 3-.02-3H45a2 2 0 002-2V3a2 2 0 00-2-2H31a2 2 0 00-2 2v4.035" stroke="#secondary" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path stroke="#primary" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M36 5.014l-3 3 3 3M40 5.014l3 3-3 3"/><path d="M6 37a1 1 0 110 2 1 1 0 010-2m7 0a1 1 0 110 2 1 1 0 010-2m-2.448 1a1 1 0 11-2 0 1 1 0 012 0z" fill="#primary"/><path d="M1.724 15.05A23.934 23.934 0 000 24c0 .686.029 1.366.085 2.037m19.92 21.632c1.3.218 2.634.331 3.995.331a23.92 23.92 0 009.036-1.76m13.207-13.21A23.932 23.932 0 0048 24c0-1.363-.114-2.7-.332-4M25.064.022a23.932 23.932 0 00-10.073 1.725" stroke="#secondary" stroke-width="2" stroke-linecap="round"/><path d="M19 42.062V43a2 2 0 01-2 2H9.04l-4.038 3 .02-3H3a2 2 0 01-2-2V33a2 2 0 012-2h4.045" stroke="#secondary" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M6 0a6 6 0 110 12A6 6 0 016 0z" stroke="#primary" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path stroke="#primary" stroke-width="2" stroke-linecap="round" d="M6 3v6M3 6h6"/><path d="M42 36a6 6 0 110 12 6 6 0 010-12z" stroke="#primary" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path stroke="#primary" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M44.338 40.663l-3.336 3.331-1.692-1.686M31 31c-.716-2.865-3.578-5-7-5-3.423 0-6.287 2.14-7 5"/><path d="M24 16a5 5 0 110 10 5 5 0 010-10z" stroke="#primary" stroke-width="2" stroke-linecap="round"/><circle stroke="#primary" stroke-width="2" cx="24" cy="24" r="14"/></g>',
      ...rank(value, [1, 1000, 5000, 10000, 25000]),
      value,
      unlock: new Date(unlock?.createdAt),
      leaderboard: leaderboard({user: ranks.repo_rank.repositoryCount, requirement: scores.stars >= requirements.stars, type: "repositories"}),
    })
  }

  //Inspirer
  {
    const value = Math.max(0, ...data.user.repositories.nodes.map(({forkCount}) => forkCount))
    const unlock = null
    list.push({
      title: "Inspirer",
      text: `Maintaining or created a repository which has been forked ${value} time${imports.s(value)}`,
      icon:
        '<g transform="translate(4 4)" fill="none" fill-rule="evenodd"><path d="M20.065 47.122c.44-.525.58-1.448.58-1.889 0-2.204-1.483-3.967-3.633-4.187.447-1.537.58-2.64.397-3.31-.25-.92-.745-1.646-1.409-2.235m-5.97-7.157c.371-.254.911-.748 1.62-1.48a8.662 8.662 0 001.432-2.366M47 22h-7c-1.538 0-2.749-.357-4-1h-5c-1.789.001-3-1.3-3-2.955 0-1.656 1.211-3.04 3-3.045h2c.027-1.129.513-2.17 1-3m3.082 32.004C34.545 43.028 34.02 40.569 34 39v-1h-1c-2.603-.318-5-2.913-5-5.997S30.397 26 33 26h9c2.384 0 4.326 1.024 5.27 3" stroke="#secondary" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/><g transform="translate(36)" stroke="#primary" stroke-width="2"><path fill="#primary" stroke-linecap="round" stroke-linejoin="round" d="M5.395 5.352L6.009 4l.598 1.348L8 5.408l-1.067 1.12.425 1.47-1.356-.908-1.35.91.404-1.469L4 5.41z"/><circle cx="6" cy="6" r="6"/></g><g transform="translate(0 31)" stroke="#primary" stroke-width="2"><circle cx="6" cy="6" r="6"/><g stroke-linecap="round"><path d="M6 4v4M4 6h4"/></g></g><circle stroke="#primary" stroke-width="2" cx="10.5" cy="10.5" r="10.5"/><g stroke-linecap="round"><path d="M32.01 1.37A23.96 23.96 0 0024 0c-.999 0-1.983.061-2.95.18M.32 20.072a24.21 24.21 0 00.015 7.948M12.42 45.025A23.892 23.892 0 0024 48c13.255 0 24-10.745 24-24 0-2.811-.483-5.51-1.371-8.016" stroke="#secondary" stroke-width="2"/><path stroke="#primary" stroke-width="2" d="M8.999 7.151v5.865"/><path d="M9 3a2 2 0 110 4 2 2 0 010-4zm0 10.8a2 2 0 11-.001 4 2 2 0 01.001-4z" stroke="#primary" stroke-width="1.8"/><path d="M9.622 11.838c.138-.007.989.119 1.595-.05.607-.169 1.584-.539 1.829-1.337" stroke="#primary" stroke-width="2"/><path d="M14.8 7.202a2 2 0 110 4 2 2 0 010-4z" stroke="#primary" stroke-width="1.8"/></g></g>',
      ...rank(value, [1, 100, 500, 1000, 2500]),
      value,
      unlock: new Date(unlock?.createdAt),
      leaderboard: leaderboard({user: ranks.forks_rank.repositoryCount, requirement: scores.forks >= requirements.forks, type: "repositories"}),
    })
  }

  //Polyglot
  {
    const value = new Set(data.user.repositories.nodes.flatMap(repository => repository.languages.edges.map(({node: {name}}) => name))).size
    const unlock = null

    list.push({
      title: "Polyglot",
      text: `Using ${value} different programming language${imports.s(value)}`,
      icon:
        '<g stroke-linecap="round" stroke-width="2" fill="none" fill-rule="evenodd"><path d="M17.135 7.988l-3.303.669a2 2 0 00-1.586 2.223l4.708 35.392a1.498 1.498 0 01-1.162 1.66 1.523 1.523 0 01-1.775-1.01L4.951 19.497a2 2 0 011.215-2.507l2.946-1.072" stroke="#secondary" stroke-linejoin="round"/><path d="M36.8 48H23a2 2 0 01-2-2V7a2 2 0 012-2h26a2 2 0 012 2v32.766" stroke="#primary"/><path d="M29 20.955l-3.399 3.399a.85.85 0 000 1.202l3.399 3.4M43.014 20.955l3.399 3.399a.85.85 0 010 1.202l-3.4 3.4" stroke="#primary" stroke-linejoin="round"/><path stroke="#primary" d="M38.526 18l-5.053 14.016"/><path d="M44 36a8 8 0 110 16 8 8 0 010-16z" stroke="#primary" stroke-linejoin="round"/><path d="M43.068 40.749l3.846 2.396a1 1 0 01-.006 1.7l-3.846 2.36a1 1 0 01-1.523-.853v-4.755a1 1 0 011.529-.848z" stroke="#primary" stroke-linejoin="round"/></g>',
      ...rank(value, [1, 4, 8, 16, 32]),
      value,
      unlock: new Date(unlock?.createdAt),
    })
  }

  //Member
  {
    const {years: value} = computed.registered
    const unlock = null

    list.push({
      title: "Member",
      text: `Registered ${Math.floor(value)} year${imports.s(Math.floor(value))} ago`,
      icon:
        '<g xmlns="http://www.w3.org/2000/svg" transform="translate(5 4)" fill="none" fill-rule="evenodd"><path d="M46 44.557v1a2 2 0 01-2 2H2a2 2 0 01-2-2v-1" stroke="#secondary" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M.75 40.993l.701.561a2.323 2.323 0 002.903 0l1.675-1.34a3 3 0 013.748 0l1.282 1.026a3 3 0 003.71.03l1.4-1.085a3 3 0 013.75.061l1.103.913a3 3 0 003.787.031l1.22-.976a3 3 0 013.748 0l1.282 1.026a3 3 0 003.71.03l1.4-1.085a3 3 0 013.75.061l1.429 1.182a2.427 2.427 0 003.103-.008l.832-.695A2 2 0 0046 39.191v-1.634a2 2 0 00-2-2H2a2 2 0 00-2 2v1.875a2 2 0 00.75 1.561z" stroke="#primary" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M42 31.609v.948m-38 0v-.992m25.04-15.008H35a2 2 0 012 2v1m-28 0v-1a2 2 0 012-2h6.007" stroke="#secondary" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M22 8.557h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6a1 1 0 011-1z" stroke="#primary" stroke-width="2" stroke-linejoin="round"/><path d="M4.7 10.557c.316 1.122.572 1.372 1.71 1.678-1.136.314-1.39.566-1.7 1.69-.317-1.121-.573-1.372-1.71-1.679 1.135-.313 1.389-.566 1.7-1.689zm35-8c.316 1.122.572 1.372 1.71 1.678-1.136.314-1.39.566-1.7 1.69-.317-1.121-.573-1.372-1.71-1.679 1.135-.313 1.389-.566 1.7-1.689z" stroke="#primary" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M23 5.557a2 2 0 002-2C25 2.452 24.433 0 22.273 0c-.463 0 .21 1.424-.502 1.979A2 2 0 0023 5.557z" stroke="#primary" stroke-width="2"/><path d="M4.78 27.982l1.346 1.076a3 3 0 003.748 0l1.252-1.002a3 3 0 013.748 0l1.282 1.026a3 3 0 003.711.03l1.4-1.085a3 3 0 013.75.061l1.102.913a3 3 0 003.787.031l1.22-.976a3 3 0 013.748 0l1.281 1.025a3 3 0 003.712.029l1.358-1.053a2 2 0 00.775-1.58v-.97a1.95 1.95 0 00-1.95-1.95H5.942a1.912 1.912 0 00-1.912 1.912v.951a2 2 0 00.75 1.562z" stroke="#primary" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><circle stroke="#secondary" cx="16.5" cy="2.057" r="1"/><circle stroke="#secondary" cx="14.5" cy="12.057" r="1"/><circle stroke="#secondary" cx="31.5" cy="9.057" r="1"/></g>',
      ...rank(value, [1, 3, 5, 10, 15]),
      value,
      unlock: new Date(unlock?.createdAt),
    })
  }

  //Sponsors
  {
    const value = user.sponsorshipsAsSponsor.totalCount
    const unlock = null

    list.push({
      title: "Sponsor",
      text: `Sponsoring ${value} user${imports.s(value)} or organization${imports.s(value)}`,
      icon:
        '<g xmlns="http://www.w3.org/2000/svg" fill="none" fill-rule="evenodd"><path d="M24 32c.267-1.727 1.973-3 4-3 2.08 0 3.787 1.318 4 3m-4-9a3 3 0 110 6 3 3 0 010-6z" stroke="#secondary" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M28 18c5.523 0 10 4.477 10 10s-4.477 10-10 10-10-4.477-10-10 4.477-10 10-10z" stroke="#secondary" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M46.138 15c-1.033 0-1.454.822-1.634 1.413-.019.06-.024.06-.042 0-.182-.591-.707-1.413-1.655-1.413C41.347 15 41 16.117 41 17.005c0 1.676 2.223 3.228 3.091 3.845.272.197.556.194.817 0 .798-.593 3.092-2.17 3.092-3.845 0-.888-.261-2.005-1.862-2.005zm-31-5c-1.033 0-1.454.822-1.634 1.413-.019.06-.024.06-.042 0-.182-.591-.707-1.413-1.655-1.413C10.347 10 10 11.117 10 12.005c0 1.676 2.223 3.228 3.091 3.845.272.197.556.194.817 0 .798-.593 3.092-2.17 3.092-3.845 0-.888-.261-2.005-1.862-2.005zm6 32c-1.033 0-1.454.822-1.634 1.413-.019.06-.024.06-.042 0-.182-.591-.707-1.413-1.655-1.413C16.347 42 16 43.117 16 44.005c0 1.676 2.223 3.228 3.091 3.845.272.197.556.194.817 0 .798-.593 3.092-2.17 3.092-3.845 0-.888-.261-2.005-1.862-2.005z" fill="#secondary"/><path d="M8.003 29a3 3 0 110 6 3 3 0 010-6zM32.018 5.005a3 3 0 110 6 3 3 0 010-6z" stroke="#secondary" stroke-width="2" stroke-linecap="round"/><path stroke="#secondary" stroke-width="2" d="M29.972 18.026L31.361 11M18.063 29.987l-7.004 1.401"/><path d="M22.604 11.886l.746 2.164m-9.313 9.296l-2.156-.712" stroke="#primary" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M21.304 9a1 1 0 100-2 1 1 0 000 2zM8.076 22.346a1 1 0 100-2 1 1 0 000 2z" fill="#primary"/><path d="M33.267 44.17l-.722-2.146m9.38-9.206l2.147.743" stroke="#primary" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M34.544 49.031a1 1 0 100-2 1 1 0 000 2zm13.314-13.032a1 1 0 100-2 1 1 0 000 2z" fill="#primary"/><path d="M48.019 51.004a3 3 0 100-6 3 3 0 000 6zM35.194 35.33l10.812 11.019" stroke="#secondary" stroke-width="2"/></g>',
      ...rank(value, [1, 3, 5, 10, 25]),
      value,
      unlock: new Date(unlock?.createdAt),
    })
  }

  //Deployer
  {
    const value = computed.repositories?.deployments
    const unlock = null

    list.push({
      title: "Deployer",
      text: `Repositories have been deployed ${value} time${imports.s(value)}`,
      icon:
        '<g stroke-width="2" fill="none" fill-rule="evenodd"><g stroke="#secondary"><path d="M11 40a2 2 0 100-4 2 2 0 000 4z"/><path d="M11 34v1m0 5v3m0 3v3" stroke-linecap="round"/></g><g stroke="#secondary" stroke-linecap="round" stroke-linejoin="round"><path d="M47.01 41.009h-4M45.016 39v4"/></g><path d="M27.982 5c2.79 1.873 4.46 5.876 5.008 12.01l2.059.659a1.606 1.606 0 011.606-1.665h.84a2.513 2.513 0 012.511 2.508l.004 1.496 3.197 1.588a1.951 1.951 0 011.684-.952l.509.002c.898.003 1.625.73 1.629 1.629l.008 2.115L51 27.606v1.945l-4.815-1.211c-.474.894-.87 1.48-1.192 1.757-.345-.328-.814-1.158-1.406-2.49L38.744 26.5c-.402 1.153-.845 1.828-1.328 2.026-.451-.444-1.04-1.55-1.409-2.821-1.481-.286-2.486-.56-2.994-.688-.27 2.397-1.036 6.884-2.009 10.982l5.006 4.438-6.555-1.08-1.454 3.654-1.45-3.658-6.56 1.082 4.996-4.417c-.899-4.02-1.576-7.684-2.03-10.992a37.29 37.29 0 01-2.967.679c-.38 1.252-.845 2.191-1.396 2.817-.63-.184-1.142-1.474-1.338-2.023-.705.15-2.323.519-4.853 1.107-.601 1.388-1.07 2.218-1.41 2.49a7.032 7.032 0 01-1.173-1.758L5 29.55v-1.945l3.99-3.265v-2.102a1.604 1.604 0 011.625-1.604l.528.007c.68.008 1.307.37 1.654.956l3.184-1.614.003-1.467a2.503 2.503 0 012.511-2.497l.863.003a1.6 1.6 0 011.594 1.646 62.42 62.42 0 012.024-.667c.572-6.097 2.24-10.098 5.006-12.002z" stroke="#primary" stroke-linecap="round" stroke-linejoin="round"/><path stroke="#secondary" stroke-linecap="round" d="M45.016 36.032v-2M45.016 49.032v-3M38.978 36.089v-3.153M17.016 36.089v-3.153M51.031 51.165v-2.193m0-2.972V35.013M4.974 51.165v-2.193m0-2.972V35.013"/></g>',
      ...rank(value, [1, 200, 500, 1000, 2500]),
      value,
      unlock: new Date(unlock?.createdAt),
    })
  }

  //Chatter
  {
    const value = user.discussionsStarted.totalCount + user.discussionsComments.totalCount
    const unlock = null

    list.push({
      title: "Chatter",
      text: `Participated in discussions ${value} time${imports.s(value)}`,
      icon:
        '<g fill="none" fill-rule="evenodd"><path d="M6 42c.45-3.415 3.34-6 7-6 1.874 0 3.752.956 5 3m-6-13a5 5 0 110 10 5 5 0 010-10zm38 16c-.452-3.415-3.34-6-7-6-1.874 0-3.752.956-5 3m6-13a5 5 0 100 10 5 5 0 000-10z" stroke="#secondary" stroke-width="2" stroke-linecap="round"/><path d="M37 51c-.92-4.01-4.6-7-9-7-4.401 0-8.083 2.995-9 7" stroke="#primary" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M28.01 31.004a6.5 6.5 0 110 13 6.5 6.5 0 010-13z" stroke="#primary" stroke-width="2" stroke-linecap="round"/><path d="M28 14.011a5 5 0 11-5 4.998 5 5 0 015-4.998z" stroke="#secondary" stroke-width="2" stroke-linecap="round"/><path d="M22 26c1.558-1.25 3.665-2 6-2 2.319 0 4.439.761 6 2" stroke="#secondary" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M51 9V8c0-1.3-1.574-3-3-3h-8c-1.426 0-3 1.7-3 3v13l4-4h6c2.805-.031 4-1.826 4-4V9zM5 9V8c0-1.3 1.574-3 3-3h8c1.426 0 3 1.7 3 3v13l-4-4H9c-2.805-.031-4-1.826-4-4V9z" stroke="#primary" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M43 11a1 1 0 11-2 0 1 1 0 012 0zm4 0a1 1 0 11-2 0 1 1 0 012 0zm-36 0a1 1 0 11-2 0 1 1 0 012 0zm4 0a1 1 0 11-2 0 1 1 0 012 0z" fill="#primary"/></g>',
      ...rank(value, [1, 200, 500, 1000, 2500]),
      value,
      unlock: new Date(unlock?.createdAt),
    })
  }

  //Helper
  {
    const value = user.discussionAnswers.totalCount
    const unlock = null

    list.push({
      title: "Helper",
      text: `Answered and solved ${value} discussion${imports.s(value)}`,
      icon:
        '<g xmlns="http://www.w3.org/2000/svg" fill="none" fill-rule="evenodd"><path d="M28 37c1.003.005.997-.443 1-1 .004-1.458-.004-4.629 0-6-.007-.564-.068-.987-1-1-2.118 0-4 1.79-4 4s1.882 4 4 4zM48 37c-1.003.005-.997-.443-1-1-.004-1.458.004-4.629 0-6 .007-.564.068-.987 1-1 2.118 0 4 1.79 4 4s-1.882 4-4 4z" stroke="#primary" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M26 51c.798-4.48 4.87-8.082 9.97-8.849.66-.1 1.338-.151 2.028-.151m9.606 4.038c1.27 1.408 2.12 3.102 2.396 4.945M32.002 39.71A8.966 8.966 0 0038 42a8.967 8.967 0 006.02-2.31m-.015-12.394A8.967 8.967 0 0038 25a8.966 8.966 0 00-5.994 2.286" stroke="#secondary" stroke-width="2" stroke-linecap="round"/><path d="M38 45c.17 0 .34-.004.509-.01 5.23-.219 9.596-3.785 11.01-8.613m-.004-6.766C48.052 24.634 43.45 21 38 21c-5.485 0-10.11 3.68-11.542 8.706" stroke="#primary" stroke-width="2"/><path d="M37.85 44h1.173c.54 0 .977.438.977.977v.523a1.5 1.5 0 01-3 0v-.65c0-.47.38-.85.85-.85z" fill="#primary"/><path d="M22 27h-3v4l-6-4H7a2 2 0 01-2-2V7a2 2 0 012-2h33a2 2 0 012 2v10" stroke="#secondary" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><g stroke="#primary" stroke-linecap="round" stroke-width="2"><path stroke-linejoin="round" d="M17 13l-3 3 3 3M30 13l3 3-3 3"/><path d="M25.03 10.986l-3.015 10.027"/></g></g>',
      ...rank(value, [1, 20, 50, 100, 250]),
      value,
      unlock: new Date(unlock?.createdAt),
    })
  }

  //Verified
  {
    const value = !/This user hasn't uploaded any GPG keys/i.test((await imports.axios.get(`https://github.com/${login}.gpg`)).data)
    const unlock = null

    list.push({
      title: "Verified",
      text: "Registered a GPG key to sign commits",
      icon:
        '<g stroke-linecap="round" stroke-linejoin="round" stroke-width="2" fill="none" fill-rule="evenodd"><path d="M46 17.036v13.016c0 4.014-.587 8.94-4.751 13.67-5.787 5.911-12.816 8.279-13.243 8.283-.426.003-7.91-2.639-13.222-8.283C10.718 39.4 10 34.056 10 30.052V17.036a2 2 0 012-2h32a2 2 0 012 2zM16 15c0-6.616 5.384-12 12-12s12 5.384 12 12" stroke="#secondary"/><path d="M21 15c0-3.744 3.141-7 7-7 3.86 0 7 3.256 7 7m4.703 29.63l-3.672-3.647m-17.99-17.869l-7.127-7.081" stroke="#secondary"/><path d="M28 23a8 8 0 110 16 8 8 0 010-16z" stroke="#primary"/><path stroke="#primary" d="M30.966 29.005l-4 3.994-2.002-1.995"/></g>',
      rank: value ? "$" : "X",
      progress: value ? 1 : 0,
      value,
      unlock: new Date(unlock?.createdAt),
    })
  }

  //Explorer
  {
    const value = !/doesn’t have any starred topics yet/i.test((await imports.axios.get(`https://github.com/stars/${login}/topics`)).data)
    const unlock = null

    list.push({
      title: "Explorer",
      text: "Starred a topic on GitHub Explore",
      icon:
        '<g transform="translate(3 4)" fill="none" fill-rule="evenodd"><path d="M10 37.5l.049.073a2 2 0 002.506.705l24.391-11.324a2 2 0 00.854-2.874l-2.668-4.27a2 2 0 00-2.865-.562L10.463 34.947A1.869 1.869 0 0010 37.5zM33.028 28.592l-4.033-6.58" stroke="#primary" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path stroke="#primary" stroke-width="2" stroke-linejoin="round" d="M15.52 37.004l-2.499-3.979"/><path stroke="#primary" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M25.008 48.011l.013-15.002M17.984 47.038l6.996-14.035M32.005 47.029l-6.987-14.016"/><path d="M2.032 17.015A23.999 23.999 0 001 24c0 9.3 5.29 17.365 13.025 21.35m22-.027C43.734 41.33 49 33.28 49 24a24 24 0 00-1.025-6.96M34.022 1.754A23.932 23.932 0 0025 0c-2.429 0-4.774.36-6.983 1.032" stroke="#secondary" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M40.64 8.472c-1.102-2.224-.935-4.764 1.382-6.465-.922-.087-2.209.326-3.004.784a6.024 6.024 0 00-2.674 7.229c.94 2.618 3.982 4.864 7.66 3.64 1.292-.429 2.615-1.508 2.996-2.665-1.8.625-5.258-.3-6.36-2.523zM21.013 6.015c-.22-.802-3.018-1.295-4.998-.919M4.998 8.006C2.25 9.22.808 11.146 1.011 12.009" stroke="#primary" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><circle stroke="#secondary" stroke-width="2" cx="11" cy="9" r="6"/><path d="M.994 12.022c.351 1.38 5.069 1.25 10.713-.355 5.644-1.603 9.654-4.273 9.303-5.653" stroke="#primary" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M26.978 10.105c.318 1.123.573 1.373 1.71 1.679-1.135.314-1.388.566-1.698 1.69-.318-1.122-.573-1.373-1.711-1.679 1.135-.314 1.39-.566 1.7-1.69" fill="#secondary"/><path d="M26.978 10.105c.318 1.123.573 1.373 1.71 1.679-1.135.314-1.388.566-1.698 1.69-.318-1.122-.573-1.373-1.711-1.679 1.135-.314 1.39-.566 1.7-1.69z" stroke="#secondary" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M9.929 22.737c.317 1.121.573 1.372 1.71 1.678-1.135.314-1.389.566-1.699 1.69-.318-1.121-.573-1.372-1.71-1.679 1.134-.313 1.389-.566 1.699-1.69" fill="#secondary"/><path d="M9.929 22.737c.317 1.121.573 1.372 1.71 1.678-1.135.314-1.389.566-1.699 1.69-.318-1.121-.573-1.372-1.71-1.679 1.134-.313 1.389-.566 1.699-1.69z" stroke="#secondary" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M38.912 33.684c.318 1.122.573 1.373 1.711 1.679-1.136.313-1.39.565-1.7 1.69-.317-1.123-.573-1.372-1.71-1.68 1.136-.313 1.389-.565 1.7-1.689" fill="#secondary"/><path d="M38.912 33.684c.318 1.122.573 1.373 1.711 1.679-1.136.313-1.39.565-1.7 1.69-.317-1.123-.573-1.372-1.71-1.68 1.136-.313 1.389-.565 1.7-1.689z" stroke="#secondary" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></g>',
      rank: value ? "$" : "X",
      progress: value ? 1 : 0,
      value,
      unlock: new Date(unlock?.createdAt),
    })
  }

  //Automator
  {
    const value = process.env.GITHUB_ACTIONS
    const unlock = null

    list.push({
      title: "Automator",
      text: "Use GitHub Actions to automate profile updates",
      icon:
        '<g transform="translate(4 5)" stroke-width="2" fill="none" fill-rule="evenodd"><g stroke-linecap="round" stroke-linejoin="round"><path stroke="#primary" d="M26.478 22l.696 2.087 3.478.696v2.782l-3.478 1.392-.696 1.39 1.392 3.48-1.392 1.39L23 33.827l-1.391.695L20.217 38h-2.782l-1.392-3.478-1.39-.696-3.48 1.391-1.39-1.39 1.39-3.48-.695-1.39L7 27.565v-2.782l3.478-1.392.696-1.391-1.391-3.478 1.39-1.392 3.48 1.392 1.39-.696 1.392-3.478h2.782l1.392 3.478 1.391.696 3.478-1.392 1.392 1.392z"/><path stroke="#secondary" d="M24.779 12.899l-1.475-2.212 1.475-1.475 2.95 1.475 1.474-.738.737-2.934h2.212l.737 2.934 1.475.738 2.95-1.475 1.474 1.475-1.475 2.949.738 1.475 2.949.737v2.212l-2.95.737-.737 1.475 1.475 2.949-1.475 1.475-2.949-1.475"/></g><path stroke="#primary" stroke-linecap="round" d="M5.932 5.546l7.082 6.931"/><path stroke="#secondary" stroke-linecap="round" d="M32.959 31.99l8.728 8.532"/><circle stroke="#secondary" cx="44" cy="43" r="3"/><circle stroke="#primary" cx="13" cy="2" r="2"/><circle stroke="#secondary" cx="35" cy="44" r="2"/><circle stroke="#secondary" cx="3" cy="12" r="2"/><circle stroke="#primary" cx="45" cy="34" r="2"/><path d="M3.832 0a3 3 0 110 6 3 3 0 010-6zM8.04 10.613l2.1-.613M10.334 9.758l1.914-5.669" stroke="#primary" stroke-linecap="round"/><path stroke="#secondary" stroke-linecap="round" d="M40.026 35.91l-2.025.591M35.695 41.965l1.843-5.326"/><path d="M16 2h23.038a6 6 0 016 6v24.033" stroke="#primary" stroke-linecap="round"/><path d="M32.038 44.033H9a6 6 0 01-6-6V14" stroke="#secondary" stroke-linecap="round"/><path d="M17.533 22.154l5.113 3.22a1 1 0 01-.006 1.697l-5.113 3.17a1 1 0 01-1.527-.85V23a1 1 0 011.533-.846zm11.58-7.134v-.504a1 1 0 011.53-.85l3.845 2.397a1 1 0 01-.006 1.701l-3.846 2.358" stroke="#primary" stroke-linecap="round" stroke-linejoin="round"/></g>',
      rank: value ? "$" : "X",
      progress: value ? 1 : 0,
      value,
      unlock: new Date(unlock?.createdAt),
    })
  }

  //Infographile
  {
    const {repository: {viewerHasStarred: value}, viewer: {login: _login}} = await graphql(queries.achievements.metrics())
    const unlock = null

    list.push({
      title: "Infographile",
      text: "Fervent supporter of metrics",
      icon:
        '<g stroke-linejoin="round" stroke-width="2" fill="none" fill-rule="evenodd"><g stroke="#secondary" stroke-linecap="round"><path d="M22 31h20M22 36h10"/></g><path d="M44.05 36.013a8 8 0 110 16 8 8 0 010-16z" stroke="#primary" stroke-linecap="round"/><path d="M32 43H7c-1.228 0-2-.84-2-2V7c0-1.16.772-2 2-2h7.075M47 24.04V32" stroke="#secondary" stroke-linecap="round"/><path stroke="#primary" stroke-linecap="round" d="M47.015 42.017l-4 3.994-2.001-1.995"/><path stroke="#secondary" d="M11 31h5v5h-5z"/><path d="M11 14a2 2 0 012-2m28 12a2 2 0 01-2 2h-1m-5 0h-4m-6 0h-4m-5 0h-1a2 2 0 01-2-2m0-4v-2" stroke="#secondary" stroke-linecap="round"/><path d="M18 18V7c0-1.246.649-2 1.73-2h28.54C49.351 5 50 5.754 50 7v11c0 1.246-.649 2-1.73 2H19.73c-1.081 0-1.73-.754-1.73-2z" stroke="#primary" stroke-linecap="round"/><path stroke="#primary" stroke-linecap="round" d="M22 13h4l2-3 3 5 2-2h3.052l2.982-4 3.002 4H46"/></g>',
      rank: (value) && (login === _login) ? "$" : "X",
      progress: (value) && (login === _login) ? 1 : 0,
      value,
      unlock: new Date(unlock?.createdAt),
    })
  }

  //Octonaut
  {
    const {user: {viewerIsFollowing: value}, viewer: {login: _login}} = await graphql(queries.achievements.octocat())
    const unlock = null

    list.push({
      title: "Octonaut",
      text: "Following octocat",
      icon:
        '<g fill="none" fill-rule="evenodd"><path d="M14.7 8c.316 1.122.572 1.372 1.71 1.678-1.136.314-1.39.566-1.7 1.69-.317-1.121-.573-1.372-1.71-1.679 1.135-.313 1.389-.566 1.7-1.689zm26 0c.316 1.122.572 1.372 1.71 1.678-1.136.314-1.39.566-1.7 1.69-.317-1.121-.573-1.372-1.71-1.679 1.135-.313 1.389-.566 1.7-1.689zM28.021 5c.318 1.122.574 1.372 1.711 1.678-1.136.314-1.389.566-1.7 1.69-.317-1.121-.572-1.372-1.71-1.679 1.135-.313 1.39-.566 1.7-1.689z" stroke="#primary" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><g transform="translate(4 9)" fill-rule="nonzero"><path d="M14.05 9.195C10.327 7.065 7.46 6 5.453 6 4.92 6 4 6.164 3.5 6.653s-.572.741-.711 1.14c-.734 2.1-1.562 6.317.078 9.286-8.767 25.38 15.513 24.92 21.207 24.92 5.695 0 29.746.456 21.037-24.908 1.112-2.2 1.404-5.119.121-9.284-.863-2.802-4.646-2.341-11.35 1.384a27.38 27.38 0 00-9.802-1.81c-3.358 0-6.701.605-10.03 1.814z" stroke="#secondary" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M10.323 40.074c-2.442-1.02-2.93-3.308-2.93-4.834 0-1.527.488-2.45.976-3.92.489-1.47.391-2.281-.976-5.711-1.368-3.43.976-7.535 4.884-7.535 3.908 0 7.088 3.005 11.723 2.956m0 0c4.635.05 7.815-2.956 11.723-2.956 3.908 0 6.252 4.105 4.884 7.535-1.367 3.43-1.465 4.241-.976 5.71.488 1.47.976 2.394.976 3.92 0 1.527-.488 3.816-2.93 4.835" stroke="#secondary" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><circle fill="#primary" cx="12" cy="30" r="1"/><circle fill="#primary" cx="13" cy="28" r="1"/><circle fill="#primary" cx="15" cy="28" r="1"/><circle fill="#primary" cx="23" cy="35" r="1"/><circle fill="#primary" cx="25" cy="35" r="1"/><circle fill="#primary" cx="17" cy="28" r="1"/><circle fill="#primary" cx="31" cy="28" r="1"/><circle fill="#primary" cx="33" cy="28" r="1"/><circle fill="#primary" cx="35" cy="28" r="1"/><circle fill="#primary" cx="12" cy="32" r="1"/><circle fill="#primary" cx="19" cy="30" r="1"/><circle fill="#primary" cx="19" cy="32" r="1"/><circle fill="#primary" cx="29" cy="30" r="1"/><circle fill="#primary" cx="29" cy="32" r="1"/><circle fill="#primary" cx="36" cy="30" r="1"/><circle fill="#primary" cx="36" cy="32" r="1"/></g></g>',
      rank: (value) && (login === _login) ? "$" : "X",
      progress: (value) && (login === _login) ? 1 : 0,
      value,
      unlock: new Date(unlock?.createdAt),
    })
  }
}
