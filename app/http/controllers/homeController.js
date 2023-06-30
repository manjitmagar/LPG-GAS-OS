const Menu = require("../../models/menu");

function homeController() {
  return {
    async index(req, res) {
      const gas = await Menu.find();
      return res.render('home', { gas: gas })

      //Menu.find().then(function(gas){
      //   console.log(gas)
      //   return res.render('home',{ gas:gas})
      // })
    },
  };
}

module.exports = homeController;
