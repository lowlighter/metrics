/**Template processor */
export default async function(_, {data}, {imports}) {
  //Core
  await imports.plugins.core(...arguments)
  //Aliases
  const {user, computed, plugins} = data
  Object.assign(data, {
    //Base
    NAME: user.name,
    LOGIN: user.login,
    REGISTRATION_DATE: user.createdAt,
    REGISTERED_YEARS: computed.registered.years,
    LOCATION: user.location,
    WEBSITE: user.websiteUrl,
    REPOSITORIES: user.repositories.totalCount,
    REPOSITORIES_DISK_USAGE: user.repositories.totalDiskUsage,
    PACKAGES: user.packages.totalCount,
    STARRED: user.starredRepositories.totalCount,
    WATCHING: user.watching.totalCount,
    SPONSORING: user.sponsorshipsAsSponsor.totalCount,
    SPONSORS: user.sponsorshipsAsMaintainer.totalCount,
    REPOSITORIES_CONTRIBUTED_TO: user.repositoriesContributedTo.totalCount,
    COMMITS: computed.commits,
    COMMITS_PUBLIC: user.contributionsCollection.totalCommitContributions,
    COMMITS_PRIVATE: user.contributionsCollection.restrictedContributionsCount,
    ISSUES: user.contributionsCollection.totalIssueContributions,
    PULL_REQUESTS: user.contributionsCollection.totalPullRequestContributions,
    PULL_REQUESTS_REVIEWS: user.contributionsCollection.totalPullRequestReviewContributions,
    FOLLOWERS: user.followers.totalCount,
    FOLLOWING: user.following.totalCount,
    ISSUE_COMMENTS: user.issueComments.totalCount,
    ORGANIZATIONS: user.organizations.totalCount,
    WATCHERS: computed.repositories.watchers,
    STARGAZERS: computed.repositories.stargazers,
    FORKS: computed.repositories.forks,
    RELEASES: computed.repositories.releases,
    VERSION: data.meta.version,
    //Lines
    LINES_ADDED: plugins.lines?.added ?? 0,
    LINES_DELETED: plugins.lines?.deleted ?? 0,
    //Gists
    GISTS: plugins.gists?.totalCount ?? 0,
    GISTS_STARGAZERS: plugins.gists?.stargazers ?? 0,
    //Languages
    LANGUAGES: plugins.languages?.favorites?.map(({name, value, size, color}) => ({name, value, size, color})) ?? [],
    //Posts
    POSTS: plugins.posts?.list ?? [],
    //Tweets
    TWEETS: plugins.tweets?.list ?? [],
    //Topics
    TOPICS: plugins.topics?.list ?? [],
  })
}
