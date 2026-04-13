import React, { useEffect, useState } from "react";
import "./print.css";
import { format } from "@/services/utilities";

const ClaimStub = () => {
  const [sale, setSale] = useState({});

  useEffect(() => {
    const fakeDb = localStorage.getItem("claimStub");
    if (!fakeDb) return false;
    const data = JSON.parse(fakeDb);
    setSale(data);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      window.print();
      window.close();
    }, 90);

    return () => clearTimeout(timer);
  }, []);

  const { cashier, cart = [], amount: totalAmount, cash = 0, createdAt } = sale;
  const { fullName = {} } = cashier || {};
  const change = cash - totalAmount;

  const vatRate = 0.12;
  const vatableSales = totalAmount / (1 + vatRate);
  const vat = totalAmount - vatableSales;

  return (
    <div className="container-receipt mt-1">
      <div className="header">
        <h6 className="store">PETROMIC</h6>
        <h6 className=" -mt-1  block">Gas Station</h6>
        <h6 className="address">Brgy. Rio Chico Gen. Tinio, Nueva Ecija</h6>
      </div>
      <small className="font-bold text-center block">
        {new Date(createdAt).toDateString()},{" "}
        {new Date(createdAt).toLocaleTimeString()}
      </small>
      <div
        className="text-center"
        style={{
          border: "1px dashed #000",
          borderRadius: "5px",
          padding: "2px",
          position: "relative",
          marginTop: "7.5px",
        }}
      >
        <small
          style={{
            position: "absolute",
            fontWeight: 600,
            top: "-7px",
            left: "50%",
            transform: "translateX(-50%)",
            backgroundColor: "white",
            padding: "0 3px",
          }}
        >
          Transaction ID
        </small>
        <span className="block mt-">{sale?._id}</span>
      </div>

      <div className="receipt-table mt-1">
        <div className="receipt-table-header-container">
          <div className="receipt-table-header">
            <span>Fuel</span>
            <span>Liters</span>
            <span>Amount</span>
          </div>
        </div>

        {cart.map((item, i) => {
          const { fuel, amount } = item;
          const { pricing } = fuel;
          const { cost, markup } = pricing;
          const srp = cost + markup;
          return (
            <div key={i} className="receipt-row">
              <span className="item-name">{fuel.name}</span>
              <span>{format.liters(amount, srp)}</span>
              <span>{format.peso(amount)}</span>
            </div>
          );
        })}

        <div className="totals-printout">
          <span>VATable Sales:</span>
          <span>{format.peso(vatableSales)}</span>
        </div>
        <div className="totals-printout">
          <span>VAT (12%):</span>
          <span>{format.peso(vat)}</span>
        </div>

        <div className="totals-printout">
          <span>Total:</span>
          <span className="font-weight-bold">{format.peso(totalAmount)}</span>
        </div>

        <div className="footer-receipt">
          <div className="flex justify-between">
            <span className="block">Tendered:</span>
            <span className="block">{format.peso(cash)}</span>
          </div>
          <div className="flex justify-between -mt-1">
            <span>Change:</span>
            <span>{format.peso(change)}</span>
          </div>
        </div>
        <div className="flex justify-between cashier">
          <span>Cashier:</span>
          <span>{`${fullName.fname} ${fullName.lname}`}</span>
        </div>

        <div className="text-center mt-3">
          <small className="block">THIS SERVES AS YOUR SALES INVOICE</small>
          <small>THANK YOU. DRIVE SAFELY!</small>
        </div>
      </div>
    </div>
  );
};

export default ClaimStub;
