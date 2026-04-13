const Purchases = require("../../models/assets/Purchases"),
  Audit = require("../../models/Audit"),
  Stocks = require("../../models/assets/Stocks");

exports.save = async (req, res) => {
  try {
    const {
      ltrs,
      action,
      fuelName,
      role,
      performBy,
      supplierName = "",
    } = req.body;

    let description = `${ltrs} liters of ${fuelName}`;
    if (role === "administrator" && supplierName) {
      description += ` ordered from ${supplierName}`;
    }
    const createdPurchase = await Purchases.create(req.body);
    await Audit.create({
      action: `${action} fuel`,
      user: performBy,
      role,
      description,
    });
    res.status(201).json({
      success: "Ordered Successfully",
      payload: createdPurchase,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.browse = async (req, res) => {
  try {
    const { status, isShort = "", stockman = "" } = req.query;

    const filter = {
      deletedAt: { $exists: false },
      status,
      isShort: isShort ? true : false,
    };

    // Kung may laman ang stockman, idagdag sa filter
    if (stockman && (status === "request" || status === "received")) {
      filter[`${status}.by`] = stockman;
    }

    const purchases = await Purchases.find(filter)
      .populate("supplier")
      .populate("fuel")
      .populate("received.by")
      .populate("request.by")
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: "Suppliers Fetched Successfully",
      payload: purchases,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const handleAudit = async (obj) => {
  try {
    const {
      auditType = "",
      performBy = "",
      fuelName = "",
      ltrs = "",
      role = "",
      supplierName = "",
      amt,
    } = obj || {};
    if (auditType === "approvedReq") {
      const description = `${ltrs?.toLocaleString()} liters of ${fuelName} from ${supplierName}`;
      await Audit.create({
        action: "APPROVE FUEL REQUEST",
        user: performBy,
        role,
        description,
      });
    } else if (auditType === "receivedReq") {
      const description = `${ltrs?.toLocaleString()} liters of ${fuelName} delivered by ${supplierName}`;
      await Audit.create({
        action: "RECEIVE FUEL ORDER",
        user: performBy,
        role,
        description,
      });
    } else if (auditType === "redelivery") {
      const description = `${ltrs?.toLocaleString()} liters of ${fuelName} from ${supplierName} due to previous discrepancy.`;
      await Audit.create({
        action: "RE-DELIVER FUEL",
        user: performBy,
        role,
        description,
      });
    } else if (auditType === "refunded") {
      const description = `${amt} refunded for ${ltrs?.toLocaleString()} liters ${fuelName} from ${supplierName} due to previous discrepancy.`;
      await Audit.create({
        action: "REFUND FUEL ORDER",
        user: performBy,
        role,
        description,
      });
    }
  } catch (error) {
    console.log("error in handle audit", error.message);
  }
};

exports.update = async (req, res) => {
  try {
    const {
      purchase,
      discrepancyPurchase = null,
      performBy,
      role,
      ltrs,
      fuelName,
      supplierName,
    } = req.body;
    const { status = "", liters = {}, updatingRequest } = purchase;
    const updatedPurchase = await Purchases.findByIdAndUpdate(
      purchase._id,
      purchase,
      { new: true }
    )
      .populate("supplier")
      .populate("fuel")
      .lean();

    await handleAudit(req.body);

    if (discrepancyPurchase) {
      const { liters: desc } = discrepancyPurchase;
      const description = `Expected ${Number(
        ltrs + desc?.request
      )?.toLocaleString()} liters but received ${
        desc?.request
      } liters of ${fuelName} from ${supplierName}`;
      await Audit.create({
        action: "RECORD FUEL DISCREPANCY",
        user: performBy,
        role,
        description,
      });
      await Purchases.create(discrepancyPurchase);
    }

    if (status === "received") {
      const { fuel } = updatedPurchase;
      const { _id } = fuel;
      await Stocks.findOneAndUpdate(
        { fuel: _id },
        {
          $inc: { liters: liters.received }, // dagdag lang sa dati
          $setOnInsert: { fuel: _id }, // kung walang existing, iset fuel
        },
        { upsert: true, new: true } // upsert para mag-create, new para ibalik updated doc
      );
    }
    res.status(201).json({
      success: "Ordered Successfully",
      payload: { purchase: updatedPurchase, updatingRequest },
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.destroy = async (req, res) => {
  try {
    const deletedPurchase = await Purchases.findByIdAndUpdate(
      req.body?._id,
      { deletedAt: new Date() },
      { new: true }
    ).lean();

    res.status(200).json({
      success: "Purchase Deleted Successfully",
      payload: deletedPurchase?._id,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
