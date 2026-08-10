import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Image from "./image";
const Step1 = ({ form, setForm = () => {}, isDraft = false }) => {
  return (
    <div className="grid grid-cols-[22rem_1fr] gap-5">
      <div className="h-[17rem] ">
        <Image setForm={setForm} form={form} />
      </div>
      <div className=" grid gap-5">
        <div className="grid grid-cols-2 gap-5">
          <div className="grid w-full  items-center gap-1.5">
            <Label htmlFor="name">Name</Label>
            <Input
              type="text"
              value={form?.name || ""}
              onChange={({ target }) =>
                setForm({
                  ...form,
                  name: target.value,
                })
              }
              required={true}
              id="name"
              placeholder="Enter package name"
            />
          </div>
          <div className="grid w-full  items-center gap-1.5">
            <Label htmlFor="price">Price</Label>
            <Input
              type="number"
              value={String(form?.basePrice || "")}
              onChange={({ target }) =>
                setForm({
                  ...form,
                  basePrice: Number(target.value),
                })
              }
              required
              id="price"
              placeholder="Enter package price"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-5">
          <div className="grid w-full  items-center gap-1.5">
            <Label htmlFor="minGuests">Minimum Pax</Label>
            <Input
              type="number"
              value={String(form?.minimumGuests || "")}
              onChange={({ target }) =>
                setForm({
                  ...form,
                  minimumGuests: Number(target.value),
                })
              }
              required={!isDraft}
              id="minGuests"
              placeholder="Enter minimum pax"
            />
          </div>
          <div className="grid w-full  items-center gap-1.5">
            <Label htmlFor="pricePerPax">Additional Price Per Pax</Label>
            <Input
              type="number"
              value={String(form?.addPricePerGuest || "")}
              onChange={({ target }) =>
                setForm({
                  ...form,
                  addPricePerGuest: Number(target.value),
                })
              }
              required={!isDraft}
              id="pricePerPax"
              placeholder="Enter additional price per pax"
            />
          </div>
        </div>

        <div className="grid w-full items-center gap-1.5">
          <Label htmlFor="description">Description</Label>
          <Textarea
            type="text-area"
            value={form?.description || ""}
            onChange={({ target }) =>
              setForm({
                ...form,
                description: target.value,
              })
            }
            className="min-h-25"
            id="description"
            placeholder="Enter description here.."
          />
        </div>
      </div>
    </div>
  );
};

export default Step1;
