//Setup
  export default async function({q}, {enabled = false} = {}) {
    //Plugin execution
      try {
        //Check if plugin is enabled and requirements are met
          if ((!enabled)||(!q.screenshot))
            return null
        //Results
          return {}
      }
    //Handle errors
      catch (error) {
        throw {error:{message:"An error occured", instance:error}}
      }
  }