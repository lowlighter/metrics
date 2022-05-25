/**Achievements list for users accounts */
export default async function({list, login, data, computed, imports, graphql, queries, rest, rank, leaderboard}) {
  //Initialization
  const {organization} = await graphql(queries.achievements.organizations({login}))
  const scores = {followers: 0, created: organization.repositories.totalCount, stars: organization.popular.nodes?.[0]?.stargazers?.totalCount ?? 0, forks: Math.max(0, ...data.user.repositories.nodes.map(({forkCount}) => forkCount))}
  const ranks = await graphql(queries.achievements.ranking(scores))
  const requirements = {stars: 5, followers: 3, forks: 1, created: 1}

  //Developers
  {
    const value = organization.repositories.totalCount
    const unlock = organization.repositories.nodes?.shift()
    list.push({
      title: "Developers",
      text: `Published ${value} public repositor${imports.s(value, "y")}`,
      icon:
        '<g stroke-linecap="round" stroke-width="2" fill="none" fill-rule="evenodd"><g stroke="#primary"><path d="M20 24l-3.397 3.398a.85.85 0 000 1.203L20.002 32M37.015 24l3.399 3.398a.85.85 0 010 1.203L37.014 32" stroke-linejoin="round"/><path d="M31.029 21.044L25.976 35.06"/></g><path stroke="#secondary" stroke-linejoin="round" d="M23.018 10h8.984M26 47h5M8 16h16m9 0h15.725M8 41h13"/><path d="M5.027 34.998c.673 2.157 1.726 4.396 2.81 6.02m43.38-19.095C50.7 19.921 49.866 17.796 48.79 16" stroke="#secondary"/><path stroke="#primary" stroke-linejoin="round" d="M26 41h17"/><path d="M7.183 16C5.186 19.582 4 23.619 4 28M42.608 47.02c2.647-1.87 5.642-5.448 7.295-9.18C51.52 34.191 52.071 30.323 52 28" stroke="#primary"/><path stroke="#primary" stroke-linejoin="round" d="M7.226 16H28M13.343 47H21"/><path d="M13.337 47.01a24.364 24.364 0 006.19 3.45 24.527 24.527 0 007.217 1.505c2.145.108 4.672-.05 7.295-.738" stroke="#primary"/><path stroke="#primary" stroke-linejoin="round" d="M36 47h6.647M12 10h6M37 10h6.858"/><path d="M43.852 10c-4.003-3.667-9.984-6.054-16.047-6-2.367.021-4.658.347-6.81 1.045" stroke="#primary"/><path stroke="#secondary" stroke-linejoin="round" d="M5.041 35h4.962M47 22h4.191"/></g>',
      ...rank(value, [1, 50, 100, 200, 300]),
      value,
      unlock: new Date(unlock?.createdAt),
      leaderboard: leaderboard({user: ranks.created_rank.userCount, requirement: scores.created >= requirements.created, type: "users"}),
    })
  }

  //Forkers
  {
    const value = organization.forks.totalCount
    const unlock = organization.forks.nodes?.shift()
    list.push({
      title: "Forkers",
      text: `Forked ${value} public repositor${imports.s(value, "y")}`,
      icon:
        '<g stroke-width="2" fill="none" fill-rule="evenodd"><path d="M37.303 21.591a5.84 5.84 0 00-1.877-1.177 6.138 6.138 0 00-4.432 0 5.822 5.822 0 00-1.879 1.177L28 22.638l-1.115-1.047c-1.086-1.018-2.559-1.59-4.094-1.59-1.536 0-3.008.572-4.094 1.59-1.086 1.02-1.696 2.4-1.696 3.84 0 1.441.61 2.823 1.696 3.841l1.115 1.046L28 38l8.189-7.682 1.115-1.046a5.422 5.422 0 001.256-1.761 5.126 5.126 0 000-4.157 5.426 5.426 0 00-1.256-1.763z" stroke="#primary" stroke-linecap="round" stroke-linejoin="round"/><path d="M15.967 42.705A18.922 18.922 0 0028 47a18.92 18.92 0 0011.076-3.56m-.032-30.902A18.914 18.914 0 0028 9c-4.09 0-7.876 1.292-10.976 3.49" stroke="#secondary" stroke-linecap="round"/><g transform="translate(7 10)" stroke="#primary"><path d="M6 0v7c0 2.21-1.343 3-3 3s-3-.79-3-3V0" stroke-linecap="round" stroke-linejoin="round"/><path stroke-linecap="round" d="M3 0v19.675"/><rect stroke-linejoin="round" x="1" y="20" width="4" height="16" rx="2"/></g><g transform="translate(43 10)" stroke="#primary"><path stroke-linecap="round" d="M2 15.968v3.674"/><path d="M4 15.642H0L.014 4.045A4.05 4.05 0 014.028 0L4 15.642z" stroke-linecap="round" stroke-linejoin="round"/><rect stroke-linejoin="round" y="19.968" width="4" height="16" rx="2"/></g><path d="M41.364 8.062A23.888 23.888 0 0028 4a23.89 23.89 0 00-11.95 3.182M4.75 22.021A24.045 24.045 0 004 28c0 1.723.182 3.404.527 5.024m10.195 14.971A23.888 23.888 0 0028 52c4.893 0 9.444-1.464 13.239-3.979m9-10.98A23.932 23.932 0 0052 28c0-2.792-.477-5.472-1.353-7.964" stroke="#secondary" stroke-linecap="round"/></g>',
      ...rank(value, [1, 10, 30, 50, 100]),
      value,
      unlock: new Date(unlock?.createdAt),
    })
  }

  //Managers
  {
    const value = organization.projects.totalCount
    const unlock = organization.projects.nodes?.shift()

    list.push({
      title: "Managers",
      text: `Created ${value} user project${imports.s(value)}`,
      icon:
        '<g stroke-width="2" fill="none" fill-rule="evenodd"><path d="M29 16V8.867C29 7.705 29.627 7 30.692 7h18.616C50.373 7 51 7.705 51 8.867v38.266C51 48.295 50.373 49 49.308 49H30.692C29.627 49 29 48.295 29 47.133V39m-4-23V9c0-1.253-.737-2-2-2H7c-1.263 0-2 .747-2 2v34c0 1.253.737 2 2 2h16c1.263 0 2-.747 2-2v-4" stroke="#secondary" stroke-linecap="round"/><path stroke="#secondary" d="M51.557 12.005h-22M5 12.005h21"/><path d="M14 33V22c0-1.246.649-2 1.73-2h28.54c1.081 0 1.73.754 1.73 2v11c0 1.246-.649 2-1.73 2H15.73c-1.081 0-1.73-.754-1.73-2z" stroke="#primary" stroke-linecap="round" stroke-linejoin="round"/><path d="M19 29v-3c0-.508.492-1 1-1h3c.508 0 1 .492 1 1v3c0 .508-.492 1-1 1h-3c-.508-.082-1-.492-1-1z" stroke="#primary"/><path stroke="#primary" stroke-linecap="round" stroke-linejoin="round" d="M28.996 27.998h12M9.065 20.04a7.062 7.062 0 00-.023 1.728m.775 2.517c.264.495.584.954.954 1.369"/></g>',
      ...rank(value, [1, 2, 4, 8, 10]),
      value,
      unlock: new Date(unlock?.createdAt),
    })
  }

  //Packagers
  {
    const value = organization.packages.totalCount + ((await rest.packages.listPackagesForOrganization({package_type: "container", org: login}).catch(() => ({data: []})))?.data?.length || 0)
    const unlock = organization.packages.nodes?.shift()

    list.push({
      title: "Packagers",
      text: `Created ${value} package${imports.s(value)}`,
      icon:
        '<g fill="none"><path fill="#secondary" d="M28.53 27.64l-11.2 6.49V21.15l11.23-6.48z"/><path d="M40.4 34.84c-.17 0-.34-.04-.5-.13l-11.24-6.44a.99.99 0 01-.37-1.36.99.99 0 011.36-.37l11.24 6.44c.48.27.65.89.37 1.36-.17.32-.51.5-.86.5z" fill="#primary"/><path d="M29.16 28.4c-.56 0-1-.45-1-1.01l.08-12.47c0-.55.49-1 1.01-.99.55 0 1 .45.99 1.01l-.08 12.47c0 .55-.45.99-1 .99z" fill="#primary"/><path d="M18.25 34.65a.996.996 0 01-.5-1.86l10.91-6.25a.997.997 0 11.99 1.73l-10.91 6.25c-.15.09-.32.13-.49.13z" fill="#primary"/><path d="M29.19 41.37c-.17 0-.35-.04-.5-.13l-11.23-6.49c-.31-.18-.5-.51-.5-.87V20.91c0-.36.19-.69.5-.87l11.23-6.49c.31-.18.69-.18 1 0l11.23 6.49c.31.18.5.51.5.87v12.97c0 .36-.19.69-.5.87l-11.23 6.49c-.15.08-.32.13-.5.13zm-10.23-8.06l10.23 5.91 10.23-5.91V21.49l-10.23-5.91-10.23 5.91v11.82zM40.5 11.02c-1.75 0-3.18-1.43-3.18-3.18 0-1.75 1.43-3.18 3.18-3.18 1.75 0 3.18 1.43 3.18 3.18 0 1.75-1.43 3.18-3.18 3.18zm0-4.36c-.65 0-1.18.53-1.18 1.18 0 .65.53 1.18 1.18 1.18.65 0 1.18-.53 1.18-1.18 0-.65-.53-1.18-1.18-1.18zm-23.19 4.36c-1.75 0-3.18-1.43-3.18-3.18 0-1.75 1.43-3.18 3.18-3.18 1.75 0 3.18 1.43 3.18 3.18 0 1.75-1.42 3.18-3.18 3.18zm0-4.36c-.65 0-1.18.53-1.18 1.18 0 .65.53 1.18 1.18 1.18.65 0 1.18-.53 1.18-1.18 0-.65-.53-1.18-1.18-1.18zm23.37 43.8c-1.75 0-3.18-1.43-3.18-3.18 0-1.75 1.43-3.18 3.18-3.18 1.75 0 3.18 1.43 3.18 3.18 0 1.75-1.42 3.18-3.18 3.18zm0-4.35c-.65 0-1.18.53-1.18 1.18 0 .65.53 1.18 1.18 1.18.65 0 1.18-.53 1.18-1.18 0-.65-.53-1.18-1.18-1.18zm-23.06 4.11c-1.75 0-3.18-1.43-3.18-3.18 0-1.75 1.43-3.18 3.18-3.18 1.75 0 3.18 1.43 3.18 3.18 0 1.75-1.43 3.18-3.18 3.18zm0-4.36c-.65 0-1.18.53-1.18 1.18 0 .65.53 1.18 1.18 1.18.65 0 1.18-.53 1.18-1.18 0-.65-.53-1.18-1.18-1.18zM6.18 30.72C4.43 30.72 3 29.29 3 27.54c0-1.75 1.43-3.18 3.18-3.18 1.75 0 3.18 1.43 3.18 3.18 0 1.75-1.43 3.18-3.18 3.18zm0-4.36c-.65 0-1.18.53-1.18 1.18 0 .65.53 1.18 1.18 1.18.65 0 1.18-.53 1.18-1.18 0-.65-.53-1.18-1.18-1.18zm45.64 4.36c-1.75 0-3.18-1.43-3.18-3.18 0-1.75 1.43-3.18 3.18-3.18 1.75 0 3.18 1.43 3.18 3.18 0 1.75-1.43 3.18-3.18 3.18zm0-4.36c-.65 0-1.18.53-1.18 1.18 0 .65.53 1.18 1.18 1.18.65 0 1.18-.53 1.18-1.18 0-.65-.53-1.18-1.18-1.18z" fill="#primary"/><path d="M29.1 10.21c-.55 0-1-.45-1-1V3.52c0-.55.45-1 1-1s1 .45 1 1v5.69c0 .56-.45 1-1 1zM7.44 20.95c-.73 0-1.32-.59-1.32-1.32v-5.38l4.66-2.69c.63-.37 1.44-.15 1.8.48.36.63.15 1.44-.48 1.8l-3.34 1.93v3.86c0 .73-.59 1.32-1.32 1.32zm4 22.68c-.22 0-.45-.06-.66-.18l-4.66-2.69v-5.38c0-.73.59-1.32 1.32-1.32.73 0 1.32.59 1.32 1.32v3.86l3.34 1.93c.63.36.85 1.17.48 1.8-.24.42-.68.66-1.14.66zm17.64 10.39l-4.66-2.69c-.63-.36-.85-1.17-.48-1.8.36-.63 1.17-.85 1.8-.48l3.34 1.93 3.34-1.93a1.32 1.32 0 011.8.48c.36.63.15 1.44-.48 1.8l-4.66 2.69zm17.64-10.39a1.32 1.32 0 01-.66-2.46l3.34-1.93v-3.86c0-.73.59-1.32 1.32-1.32.73 0 1.32.59 1.32 1.32v5.38l-4.66 2.69c-.21.12-.44.18-.66.18zm4-22.68c-.73 0-1.32-.59-1.32-1.32v-3.86l-3.34-1.93c-.63-.36-.85-1.17-.48-1.8.36-.63 1.17-.85 1.8-.48l4.66 2.69v5.38c0 .73-.59 1.32-1.32 1.32z" fill="#secondary"/><path d="M33.08 6.15c-.22 0-.45-.06-.66-.18l-3.34-1.93-3.34 1.93c-.63.36-1.44.15-1.8-.48a1.32 1.32 0 01.48-1.8L29.08 1l4.66 2.69c.63.36.85 1.17.48 1.8a1.3 1.3 0 01-1.14.66zm-3.99 47.3c-.55 0-1-.45-1-1v-7.13c0-.55.45-1 1-1s1 .45 1 1v7.13c0 .55-.44 1-1 1zM13.86 19.71c-.17 0-.34-.04-.5-.13L7.2 16a1 1 0 011-1.73l6.17 3.58c.48.28.64.89.36 1.37-.19.31-.52.49-.87.49zm36.63 21.23c-.17 0-.34-.04-.5-.13l-6.17-3.57a.998.998 0 01-.36-1.37c.28-.48.89-.64 1.37-.36L51 39.08c.48.28.64.89.36 1.37-.19.31-.52.49-.87.49zM44.06 19.8c-.35 0-.68-.18-.87-.5-.28-.48-.11-1.09.36-1.37l6.17-3.57c.48-.28 1.09-.11 1.37.36.28.48.11 1.09-.36 1.37l-6.17 3.57c-.16.1-.33.14-.5.14zM7.43 41.03c-.35 0-.68-.18-.87-.5-.28-.48-.11-1.09.36-1.37l6.17-3.57c.48-.28 1.09-.11 1.37.36.28.48.11 1.09-.36 1.37l-6.17 3.57c-.15.09-.33.14-.5.14z" fill="#secondary"/></g>',
      ...rank(value, [1, 20, 50, 100, 250]),
      value,
      unlock: new Date(unlock?.createdAt),
    })
  }

  //Maintainers
  {
    const value = organization.popular.nodes?.shift()?.stargazers?.totalCount ?? 0
    const unlock = null

    list.push({
      title: "Maintainers",
      text: `Maintaining a repository with ${value} star${imports.s(value)}`,
      icon:
        '<g transform="translate(4 4)" fill="none" fill-rule="evenodd"><path d="M39 15h.96l4.038 3-.02-3H45a2 2 0 002-2V3a2 2 0 00-2-2H31a2 2 0 00-2 2v4.035" stroke="#secondary" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path stroke="#primary" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M36 5.014l-3 3 3 3M40 5.014l3 3-3 3"/><path d="M6 37a1 1 0 110 2 1 1 0 010-2m7 0a1 1 0 110 2 1 1 0 010-2m-2.448 1a1 1 0 11-2 0 1 1 0 012 0z" fill="#primary"/><path d="M1.724 15.05A23.934 23.934 0 000 24c0 .686.029 1.366.085 2.037m19.92 21.632c1.3.218 2.634.331 3.995.331a23.92 23.92 0 009.036-1.76m13.207-13.21A23.932 23.932 0 0048 24c0-1.363-.114-2.7-.332-4M25.064.022a23.932 23.932 0 00-10.073 1.725" stroke="#secondary" stroke-width="2" stroke-linecap="round"/><path d="M19 42.062V43a2 2 0 01-2 2H9.04l-4.038 3 .02-3H3a2 2 0 01-2-2V33a2 2 0 012-2h4.045" stroke="#secondary" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M6 0a6 6 0 110 12A6 6 0 016 0z" stroke="#primary" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path stroke="#primary" stroke-width="2" stroke-linecap="round" d="M6 3v6M3 6h6"/><path d="M42 36a6 6 0 110 12 6 6 0 010-12z" stroke="#primary" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path stroke="#primary" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M44.338 40.663l-3.336 3.331-1.692-1.686M31 31c-.716-2.865-3.578-5-7-5-3.423 0-6.287 2.14-7 5"/><path d="M24 16a5 5 0 110 10 5 5 0 010-10z" stroke="#primary" stroke-width="2" stroke-linecap="round"/><circle stroke="#primary" stroke-width="2" cx="24" cy="24" r="14"/></g>',
      ...rank(value, [1, 5000, 10000, 30000, 50000]),
      value,
      unlock: new Date(unlock?.createdAt),
      leaderboard: leaderboard({user: ranks.repo_rank.repositoryCount, requirement: scores.stars >= requirements.stars, type: "repositories"}),
    })
  }

  //Inspirers
  {
    const value = Math.max(0, ...data.user.repositories.nodes.map(({forkCount}) => forkCount))
    const unlock = null
    list.push({
      title: "Inspirers",
      text: `Maintaining or created a repository which has been forked ${value} time${imports.s(value)}`,
      icon:
        '<g transform="translate(4 4)" fill="none" fill-rule="evenodd"><path d="M20.065 47.122c.44-.525.58-1.448.58-1.889 0-2.204-1.483-3.967-3.633-4.187.447-1.537.58-2.64.397-3.31-.25-.92-.745-1.646-1.409-2.235m-5.97-7.157c.371-.254.911-.748 1.62-1.48a8.662 8.662 0 001.432-2.366M47 22h-7c-1.538 0-2.749-.357-4-1h-5c-1.789.001-3-1.3-3-2.955 0-1.656 1.211-3.04 3-3.045h2c.027-1.129.513-2.17 1-3m3.082 32.004C34.545 43.028 34.02 40.569 34 39v-1h-1c-2.603-.318-5-2.913-5-5.997S30.397 26 33 26h9c2.384 0 4.326 1.024 5.27 3" stroke="#secondary" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/><g transform="translate(36)" stroke="#primary" stroke-width="2"><path fill="#primary" stroke-linecap="round" stroke-linejoin="round" d="M5.395 5.352L6.009 4l.598 1.348L8 5.408l-1.067 1.12.425 1.47-1.356-.908-1.35.91.404-1.469L4 5.41z"/><circle cx="6" cy="6" r="6"/></g><g transform="translate(0 31)" stroke="#primary" stroke-width="2"><circle cx="6" cy="6" r="6"/><g stroke-linecap="round"><path d="M6 4v4M4 6h4"/></g></g><circle stroke="#primary" stroke-width="2" cx="10.5" cy="10.5" r="10.5"/><g stroke-linecap="round"><path d="M32.01 1.37A23.96 23.96 0 0024 0c-.999 0-1.983.061-2.95.18M.32 20.072a24.21 24.21 0 00.015 7.948M12.42 45.025A23.892 23.892 0 0024 48c13.255 0 24-10.745 24-24 0-2.811-.483-5.51-1.371-8.016" stroke="#secondary" stroke-width="2"/><path stroke="#primary" stroke-width="2" d="M8.999 7.151v5.865"/><path d="M9 3a2 2 0 110 4 2 2 0 010-4zm0 10.8a2 2 0 11-.001 4 2 2 0 01.001-4z" stroke="#primary" stroke-width="1.8"/><path d="M9.622 11.838c.138-.007.989.119 1.595-.05.607-.169 1.584-.539 1.829-1.337" stroke="#primary" stroke-width="2"/><path d="M14.8 7.202a2 2 0 110 4 2 2 0 010-4z" stroke="#primary" stroke-width="1.8"/></g></g>',
      ...rank(value, [1, 500, 1000, 3000, 5000]),
      value,
      unlock: new Date(unlock?.createdAt),
      leaderboard: leaderboard({user: ranks.forks_rank.repositoryCount, requirement: scores.forks >= requirements.forks, type: "repositories"}),
    })
  }

  //Polyglots
  {
    const value = new Set(data.user.repositories.nodes.flatMap(repository => repository.languages.edges.map(({node: {name}}) => name))).size
    const unlock = null

    list.push({
      title: "Polyglots",
      text: `Using ${value} different programming language${imports.s(value)}`,
      icon:
        '<g stroke-linecap="round" stroke-width="2" fill="none" fill-rule="evenodd"><path d="M17.135 7.988l-3.303.669a2 2 0 00-1.586 2.223l4.708 35.392a1.498 1.498 0 01-1.162 1.66 1.523 1.523 0 01-1.775-1.01L4.951 19.497a2 2 0 011.215-2.507l2.946-1.072" stroke="#secondary" stroke-linejoin="round"/><path d="M36.8 48H23a2 2 0 01-2-2V7a2 2 0 012-2h26a2 2 0 012 2v32.766" stroke="#primary"/><path d="M29 20.955l-3.399 3.399a.85.85 0 000 1.202l3.399 3.4M43.014 20.955l3.399 3.399a.85.85 0 010 1.202l-3.4 3.4" stroke="#primary" stroke-linejoin="round"/><path stroke="#primary" d="M38.526 18l-5.053 14.016"/><path d="M44 36a8 8 0 110 16 8 8 0 010-16z" stroke="#primary" stroke-linejoin="round"/><path d="M43.068 40.749l3.846 2.396a1 1 0 01-.006 1.7l-3.846 2.36a1 1 0 01-1.523-.853v-4.755a1 1 0 011.529-.848z" stroke="#primary" stroke-linejoin="round"/></g>',
      ...rank(value, [1, 8, 16, 32, 64]),
      value,
      unlock: new Date(unlock?.createdAt),
    })
  }

  //Sponsors
  {
    const value = organization.sponsorshipsAsSponsor.totalCount
    const unlock = null

    list.push({
      title: "Sponsors",
      text: `Sponsoring ${value} user${imports.s(value)} or organization${imports.s(value)}`,
      icon:
        '<g xmlns="http://www.w3.org/2000/svg" fill="none" fill-rule="evenodd"><path d="M24 32c.267-1.727 1.973-3 4-3 2.08 0 3.787 1.318 4 3m-4-9a3 3 0 110 6 3 3 0 010-6z" stroke="#secondary" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M28 18c5.523 0 10 4.477 10 10s-4.477 10-10 10-10-4.477-10-10 4.477-10 10-10z" stroke="#secondary" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M46.138 15c-1.033 0-1.454.822-1.634 1.413-.019.06-.024.06-.042 0-.182-.591-.707-1.413-1.655-1.413C41.347 15 41 16.117 41 17.005c0 1.676 2.223 3.228 3.091 3.845.272.197.556.194.817 0 .798-.593 3.092-2.17 3.092-3.845 0-.888-.261-2.005-1.862-2.005zm-31-5c-1.033 0-1.454.822-1.634 1.413-.019.06-.024.06-.042 0-.182-.591-.707-1.413-1.655-1.413C10.347 10 10 11.117 10 12.005c0 1.676 2.223 3.228 3.091 3.845.272.197.556.194.817 0 .798-.593 3.092-2.17 3.092-3.845 0-.888-.261-2.005-1.862-2.005zm6 32c-1.033 0-1.454.822-1.634 1.413-.019.06-.024.06-.042 0-.182-.591-.707-1.413-1.655-1.413C16.347 42 16 43.117 16 44.005c0 1.676 2.223 3.228 3.091 3.845.272.197.556.194.817 0 .798-.593 3.092-2.17 3.092-3.845 0-.888-.261-2.005-1.862-2.005z" fill="#secondary"/><path d="M8.003 29a3 3 0 110 6 3 3 0 010-6zM32.018 5.005a3 3 0 110 6 3 3 0 010-6z" stroke="#secondary" stroke-width="2" stroke-linecap="round"/><path stroke="#secondary" stroke-width="2" d="M29.972 18.026L31.361 11M18.063 29.987l-7.004 1.401"/><path d="M22.604 11.886l.746 2.164m-9.313 9.296l-2.156-.712" stroke="#primary" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M21.304 9a1 1 0 100-2 1 1 0 000 2zM8.076 22.346a1 1 0 100-2 1 1 0 000 2z" fill="#primary"/><path d="M33.267 44.17l-.722-2.146m9.38-9.206l2.147.743" stroke="#primary" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M34.544 49.031a1 1 0 100-2 1 1 0 000 2zm13.314-13.032a1 1 0 100-2 1 1 0 000 2z" fill="#primary"/><path d="M48.019 51.004a3 3 0 100-6 3 3 0 000 6zM35.194 35.33l10.812 11.019" stroke="#secondary" stroke-width="2"/></g>',
      ...rank(value, [1, 5, 10, 20, 50]),
      value,
      unlock: new Date(unlock?.createdAt),
    })
  }

  //Organization
  {
    const value = organization.membersWithRole.totalCount
    const unlock = null

    list.push({
      title: "Organization",
      text: `Has ${value} member${imports.s(value)}`,
      icon:
        '<g xmlns="http://www.w3.org/2000/svg" fill="none" fill-rule="evenodd"><path d="M6 42c.45-3.415 3.34-6 7-6 1.874 0 3.752.956 5 3m-6-13a5 5 0 110 10 5 5 0 010-10zm38 16c-.452-3.415-3.34-6-7-6-1.874 0-3.752.956-5 3m6-13a5 5 0 100 10 5 5 0 000-10z" stroke="#primary" stroke-width="2" stroke-linecap="round"/><path d="M37 51c-.92-4.01-4.6-7-9-7-4.401 0-8.083 2.995-9 7" stroke="#secondary" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M28.01 31.004a6.5 6.5 0 110 13 6.5 6.5 0 010-13z" stroke="#secondary" stroke-width="2" stroke-linecap="round"/><path d="M28 14.011a5 5 0 11-5 4.998 5 5 0 015-4.998z" stroke="#primary" stroke-width="2" stroke-linecap="round"/><path d="M22 26c1.558-1.25 3.665-2 6-2 2.319 0 4.439.761 6 2" stroke="#primary" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M51 9V8c0-1.3-1.574-3-3-3h-8c-1.426 0-3 1.7-3 3v13l4-4h6c2.805-.031 4-1.826 4-4V9zM5 9V8c0-1.3 1.574-3 3-3h8c1.426 0 3 1.7 3 3v13l-4-4H9c-2.805-.031-4-1.826-4-4V9z" stroke="#secondary" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M43 11a1 1 0 11-2 0 1 1 0 012 0zm4 0a1 1 0 11-2 0 1 1 0 012 0zm-36 0a1 1 0 11-2 0 1 1 0 012 0zm4 0a1 1 0 11-2 0 1 1 0 012 0z" fill="#secondary"/></g>',
      ...rank(value, [1, 100, 500, 1000, 2500]),
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
}
