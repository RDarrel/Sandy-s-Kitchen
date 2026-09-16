const preferredContact = (contact) => {
  const contactMap = {
    sms: "SMS",
    phone: "Phone Call",
    email: "Email",
  };
  return contactMap[contact];
};

export default preferredContact;
