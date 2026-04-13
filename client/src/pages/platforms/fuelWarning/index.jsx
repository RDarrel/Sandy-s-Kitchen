import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import FuelStockBar from "../stockman/dashboard/fuelType";
import { useDispatch, useSelector } from "react-redux";
import { TOGGLE_WARNING } from "@/services/redux/slices/assets/stocks";

const fuelStockColors = {
  Premium: [
    "#700000",
    "#820101",
    "#A00202",
    "#AD0000",
    "#AD0000",
    "#BB0000",
    "#CA0000",
    "#D60000",
    "#E80000",
    "#FF0000",
  ],
  Unleaded: [
    "#004B00",
    "#015E01",
    "#017E01",
    "#028D02",
    "#019D01",
    "#00AE00",
    "#00C200",
    "#02D402",
    "#00E400",
    "#00FF00",
  ],
  Diesel: [
    "#575700",
    "#6A6A00",
    "#7E7E00",
    "#909000",
    "#A4A400",
    "#B7B700",
    "#CBCB00",
    "#DDDD05",
    "#EBEB02",
    "#FFFF00",
  ],
};

const fuelsColor = {
  "682378e40a661261ac790755": "#FF0000",
  "6823797e0a661261ac790756": "#008000",
  "68237a7e0a661261ac790757": "#C7BD00",
};

const FuelWarning = () => {
  const { role } = useSelector(({ auth }) => auth);
  const { showWarning, lowFuels } = useSelector(({ stocks }) => stocks);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const toggle = () => dispatch(TOGGLE_WARNING());
  const handleRefill = () => {
    const endPoint = role === "ADMINISTRATOR" ? "order-fuel" : "request-fuel";
    navigate(`/platforms/${endPoint}?refill=${lowFuels[0]?.fuel?._id}`);
    toggle();
  };
  return (
    <Dialog open={showWarning} onOpenChange={toggle}>
      <DialogContent className="max-w-[35rem]  ">
        <DialogHeader>
          <DialogTitle>Tank Info</DialogTitle>
        </DialogHeader>
        <div className="flex items-center justify-between ">
          <Card className="w-full">
            <CardHeader>
              <CardTitle className={"flex  gap-2 -mt-3"}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="22"
                  height="20"
                  viewBox="0 0 22 20"
                  fill="none"
                >
                  <path
                    d="M8.20065 1.5C9.35536 -0.500002 12.2421 -0.499998 13.3968 1.5L21.191 15C22.3457 17 20.9024 19.5 18.593 19.5H3.00446C0.69507 19.5 -0.7483 17 0.4064 15L8.20065 1.5Z"
                    fill="#FFD401"
                  />
                  <path
                    opacity="0.5"
                    d="M11.6563 4.36328L11.4347 12.511H9.35518L9.12793 4.36328H11.6563ZM10.395 16.1474C10.02 16.1474 9.69798 16.0148 9.42908 15.7496C9.16013 15.4807 9.02753 15.1587 9.03133 14.7837C9.02753 14.4125 9.16013 14.0943 9.42908 13.8292C9.69798 13.564 10.02 13.4314 10.395 13.4314C10.7548 13.4314 11.0711 13.564 11.3438 13.8292C11.6166 14.0943 11.7548 14.4125 11.7586 14.7837C11.7548 15.0337 11.6885 15.2629 11.5597 15.4712C11.4347 15.6758 11.27 15.8405 11.0654 15.9655C10.8609 16.0867 10.6374 16.1474 10.395 16.1474Z"
                    fill="black"
                  />
                </svg>
                <h6> Warning</h6>
              </CardTitle>
            </CardHeader>
            <CardContent className="-mt-4 -mb-4">
              <h6 className="opacity-[0.4] font-[400]">
                Fuel tank level is below the critical threshold. Stocks are
                running low.
              </h6>
            </CardContent>
          </Card>
        </div>

        {lowFuels?.map(({ liters, fuel }) => (
          <FuelStockBar
            fuelType={fuel.name}
            isWarning
            currentStock={liters}
            colors={fuelStockColors[fuel.name]}
            color={fuelsColor[fuel?._id]}
            svg={
              <>
                <svg
                  width="40"
                  height="40"
                  viewBox="0 0 40 40"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M10 30H22.6316M11.0526 17H21.5789M21.5789 30V12C21.5789 11.4696 21.3571 10.9609 20.9623 10.5858C20.5675 10.2107 20.032 10 19.4737 10H13.1579C12.5995 10 12.0641 10.2107 11.6692 10.5858C11.2744 10.9609 11.0526 11.4696 11.0526 12V30M21.5789 21H23.6842C24.2426 21 24.778 21.2107 25.1729 21.5858C25.5677 21.9609 25.7895 22.4696 25.7895 23V25C25.7895 25.5304 26.0113 26.0391 26.4061 26.4142C26.8009 26.7893 27.3364 27 27.8947 27C28.4531 27 28.9886 26.7893 29.3834 26.4142C29.7782 26.0391 30 25.5304 30 25V17.83C30.0002 17.5661 29.9455 17.3047 29.8389 17.061C29.7323 16.8173 29.576 16.5961 29.3789 16.41L25.7895 13"
                    stroke="#008000"
                    stroke-width="3"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </>
            }
          />
        ))}

        <DialogFooter className="mt-7">
          <Button
            onClick={handleRefill}
            type="submit"
            className="bg-[#FF4F00] hover:bg-[#e64500] w-full transition-colors duration-200 cursor-pointer"
          >
            Refill Fuel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FuelWarning;
