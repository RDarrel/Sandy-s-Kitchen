const router = require("express").Router(),
	{
	  save,
	  browse,
	  receive_delivery,
	  update,
	} = require("../../controllers/procurement/Purchases"),
	{ validate } = require("../../middleware/jwt");

router
	.post("/save", validate, save)
	.get("/browse", validate, browse)
	.put("/update", validate, update)
	.put("/receive-delivery", validate, receive_delivery);

module.exports = router;
