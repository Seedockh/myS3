const listFolder = (param) => {
  return {
    methods: {
      list: function () {
        console.log(`hello from mixin, ${param} !`)
      }
    }
  }
}

export default listFolder
