export default async function (
  { q, imports, data, account },
  { token = "", enabled = false, extras = false } = {}
) {
  //Plugin execution
  try {
    //Check if plugin is enabled and requirements are met
    if (
      !q.retroachievements ||
      !imports.metadata.plugins.retroachievements.enabled(enabled, { extras })
    )
      return null;

    //Load input data
    const { username, target, showachievements, lastsin, achievementslimit } =
      imports.metadata.plugins.retroachievements.inputs({ data, account, q });
    const retroachievementsUrl = "https://retroachievements.org";

    const profile = await imports.axios.get(
      `https://retroachievements.org/API/API_GetUserProfile.php?z=${username}&u=${target}&y=${token}`
    );
    const {
      data: {
        User: user,
        UserPic,
        TotalPoints: totalPoints,
        RichPresenceMsg: presenceMessage,
        LastGameID: lastGameId,
      },
    } = profile;
    const profilePic = imports.imgb64(`${retroachievementsUrl}${UserPic}`, {width: 64, height: 64})

    const lastPlayedGame = await imports.axios.get(
      `https://retroachievements.org/API/API_GetGameInfoAndUserProgress.php?z=${username}&u=${target}&g=${lastGameId}&y=${token}`
    );
    const {
      data: {
        Title: title,
        ImageIcon,
        Genre: genre,
        ConsoleName: consoleName,
        NumAchievements: totalAchievements,
        NumAwardedToUser: awardedAchievements,
        UserCompletion: progress,
      },
    } = lastPlayedGame;
    const gameIcon = imports.imgb64(`${retroachievementsUrl}${ImageIcon}`, {width: 64, height: 64})

    let lastGameAchievements = null
    if (showachievements) {
      const minutesToLookBack = lastsin * 1440 //Minutes in a day
      const lastUnlocked = await imports.axios.get(
        `https://retroachievements.org/API/API_GetUserRecentAchievements.php?z=${username}&y=${token}&u=${target}&m=${minutesToLookBack}`
      );

      lastGameAchievements = lastUnlocked.data.map(achievement => ({
        title: achievement.Title,
        description: achievement.Description,
        badgeUrl: imports.imgb64(`${retroachievementsUrl}${achievement.BadgeURL}`, {width: 64, height: 64}),
      })).slice(0, achievementslimit)
    }

    return {
      profile: {
        user,
        profilePic,
        totalPoints,
        presenceMessage,
      },
      lastPlayedGame: {
        title,
        gameIcon,
        genre,
        consoleName,
        totalAchievements,
        awardedAchievements,
        progress,
      },
      lastUnlocked: lastGameAchievements,
    };
  } catch (error) {
    //Handle errors
    throw imports.format.error(error);
  }
}
