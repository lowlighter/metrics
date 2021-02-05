/**Template processor */
  export default async function(_, __, {imports}) {
    //Core
      await imports.plugins.core(...arguments)
  }
