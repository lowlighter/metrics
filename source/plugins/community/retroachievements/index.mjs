// https://retroachievements.org/UserPic/TheROG.png

export default async function (
  { q, imports, data, account },
  { enabled = false, extras = false } = {}
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
    const { token, username, target, showachievements, lastsin } =
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
    const profilePic = `${retroachievementsUrl}${UserPic}`;

    const lastPlayedGame = await imports.axios.get(
      `https://retroachievements.org/API/API_GetGameInfoAndUserProgress.php?z=${username}&u=${target}&g=${lastGameId}&y=${token}`
    );
    const {
      data: {
        Title: title,
        ImageIcon,
        Genre: genre,
        NumAchievements: totalAchievements,
        NumAwardedToUser: awardedAchievements,
        UserCompletion: progress,
      },
    } = lastPlayedGame;
    const gameIcon = `${retroachievementsUrl}${ImageIcon}`;

    let lastGameAchievements = null
    if (showachievements) {
      const minutesToLookBack = lastsin * 1440 //Minutes in a day
      const lastUnlocked = await imports.axios.get(
        `https://retroachievements.org/API/API_GetUserRecentAchievements.php?z=${username}&y=${token}&u=${target}&m=${minutesToLookBack}`
      );

      lastGameAchievements = lastUnlocked.data.map(achievement => ({
        title: achievement.Title,
        description: achievement.Description,
        badgeUrl: `${retroachievementsUrl}${achievement.BadgeName}`,
      }))
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
