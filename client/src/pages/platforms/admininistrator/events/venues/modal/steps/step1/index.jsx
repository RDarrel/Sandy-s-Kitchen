import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
const Step1 = ({ form, setForm = () => {}, isDraft = false }) => {
  return (
    <div className=" gap-5">
      <div className=" grid gap-5">
        <div className="grid grid-cols-4 gap-5">
          <div className="grid w-full  items-center gap-1.5 col-span-2">
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
              placeholder="Enter venue name"
            />
          </div>
          <div className="grid w-full  items-center gap-1.5">
            <Label htmlFor="price">Base Price</Label>
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
              min="1"
              placeholder="e.g. 5,000"
            />
          </div>
          <div className="grid w-full  items-center gap-1.5">
            <Label htmlFor="capacity">Max Capacity</Label>
            <Input
              type="number"
              value={String(form?.capacity || "")}
              onChange={({ target }) =>
                setForm({
                  ...form,
                  capacity: Number(target.value),
                })
              }
              required={!isDraft}
              id="capacity"
              placeholder="e.g. 100 guests"
              min="1"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-5">
          <div className="grid w-full  items-center gap-1.5">
            <Label htmlFor="duration">Duration Hours</Label>
            <div className="grid grid-cols-2 gap-2">
              <InputGroup className="max-w-xs">
                <InputGroupAddon align="inline-start">Min</InputGroupAddon>
                <InputGroupInput
                  required
                  value={String(form?.duration?.min || "")}
                  onChange={({ target }) =>
                    setForm({
                      ...form,
                      duration: { ...form.duration, min: Number(target.value) },
                    })
                  }
                  type="number"
                  id="duration"
                  min="1"
                  placeholder="e.g 2 hrs"
                />
              </InputGroup>
              <InputGroup className="max-w-xs">
                <InputGroupAddon align="inline-start">Max</InputGroupAddon>
                <InputGroupInput
                  value={String(form?.duration?.max || "")}
                  onChange={({ target }) =>
                    setForm({
                      ...form,
                      duration: { ...form.duration, max: Number(target.value) },
                    })
                  }
                  required
                  min="1"
                  type="number"
                  placeholder="e.g 8 hrs"
                  id="duration"
                />
              </InputGroup>
            </div>
          </div>
          <div className="grid w-full  items-center gap-1.5">
            <Label htmlFor="pricePerPax">Additional Charges</Label>
            <div className="grid grid-cols-2 gap-2">
              <InputGroup className="max-w-xs">
                <InputGroupAddon align="inline-start">Per Hour</InputGroupAddon>
                <InputGroupInput
                  value={String(form?.additionalCharges?.perHour || "")}
                  onChange={({ target }) =>
                    setForm({
                      ...form,
                      additionalCharges: {
                        ...form.additionalCharges,
                        perHour: Number(target.value),
                      },
                    })
                  }
                  required
                  min="1"
                  type="number"
                  id="duration"
                  placeholder="e.g. 100"
                />
              </InputGroup>
              <InputGroup className="max-w-xs">
                <InputGroupAddon align="inline-start">Per Pax</InputGroupAddon>
                <InputGroupInput
                  required
                  value={String(form?.additionalCharges?.perPax || "")}
                  onChange={({ target }) =>
                    setForm({
                      ...form,
                      additionalCharges: {
                        ...form.additionalCharges,
                        perPax: Number(target.value),
                      },
                    })
                  }
                  min="1"
                  type="number"
                  placeholder="e.g. 300"
                  id="duration"
                />
              </InputGroup>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-5">
          <div className="grid col-span-2 w-full  items-center gap-1.5">
            <Label htmlFor="address">Address</Label>
            <Input
              value={String(form?.address || "")}
              onChange={({ target }) =>
                setForm({
                  ...form,
                  address: target.value,
                })
              }
              required
              id="address"
              placeholder="Enter address"
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="setting">Venue Setting</Label>
            <Select
              id="setting"
              value={form.setting}
              onValueChange={(value) =>
                setForm((prev) => ({ ...prev, setting: value }))
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a venue setting" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Select Setting</SelectLabel>
                  <SelectItem value="Indoor">Indoor</SelectItem>
                  <SelectItem value="Outdoor">Outdoor</SelectItem>
                  <SelectItem value="Indoor & Outdoor">
                    Indoor & Outdoor
                  </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
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
