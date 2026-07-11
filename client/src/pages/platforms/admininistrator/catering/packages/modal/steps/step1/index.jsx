import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
const Step1 = ({ form, setForm = () => {} }) => {
  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-2 gap-5">
        <div className="grid w-full  items-center gap-1.5">
          <Label htmlFor="company">Name</Label>
          <Input
            type="text"
            value={form?.name || ""}
            onChange={({ target }) =>
              setForm({
                ...form,
                name: target.value,
              })
            }
            required
            id="company"
            placeholder="Enter package name"
          />
        </div>
        <div className="grid w-full  items-center gap-1.5">
          <Label htmlFor="company">Price</Label>
          <Input
            type="text"
            value={form?.name || ""}
            onChange={({ target }) =>
              setForm({
                ...form,
                name: target.value,
              })
            }
            required
            id="company"
            placeholder="Enter package price"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-5">
        <div className="grid w-full  items-center gap-1.5">
          <Label htmlFor="person">Minimum Pax</Label>
          <Input
            type="text"
            value={form?.contact?.person || ""}
            onChange={({ target }) =>
              setForm({
                ...form,
                contact: {
                  ...form.contact,
                  person: target.value,
                },
              })
            }
            id="person"
            placeholder="Enter contact person here.."
          />
        </div>
        <div className="grid w-full  items-center gap-1.5">
          <Label htmlFor="company">Additional Price Per Pax</Label>
          <Input
            type="text"
            value={form?.name || ""}
            onChange={({ target }) =>
              setForm({
                ...form,
                name: target.value,
              })
            }
            required
            id="company"
            placeholder="Enter additional price per pax"
          />
        </div>
      </div>

      <div className="grid w-full items-center gap-1.5">
        <Label htmlFor="description">Description</Label>
        <Textarea
          type="text-area"
          value={form?.address || ""}
          required
          onChange={({ target }) =>
            setForm({
              ...form,
              address: target.value,
            })
          }
          id="address"
          placeholder="Enter description here.."
        />
      </div>
    </div>
  );
};

export default Step1;
