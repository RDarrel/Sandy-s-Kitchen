import { useEffect, useRef, useState } from "react";
import { Loader, PhilippinePeso } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { capitalize } from "@/services/utilities";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import {
  SetNEW_MENU,
  SetUPDATED_MENU,
  TOGGLE,
  UPDATE,
} from "@/services/redux/slices/menu/menus";
import Bundles from "./bundles";
import { Category, Type } from "@/services/fakeDB";
import { SAVE } from "@/services/redux/slices/menu/menus";
import Cloudinary from "@/services/utilities/cloudinary";
import { UPLOAD } from "@/services/redux/slices/persons/auth";
import MenuImage from "./image";
import Name, { isExistingMenuName } from "./name";

const initialForm = {
  name: "",
  category: "",
  price: "",
  type: "prepared",
  description: "",
  image: null,
  bundleItems: [],
};

const Modal = () => {
  const { token } = useSelector(({ auth }) => auth);
  const {
    showModal,
    selected,
    willCreate,
    category: actCategory,
    collections,
  } = useSelector(({ menus }) => menus);
  const { collections: categories } = useSelector(
    ({ menuCategories }) => menuCategories,
  );
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState("");
  const dispatch = useDispatch();
  const fileInputRef = useRef(null);

  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  useEffect(() => {
    if (showModal) {
      if (!willCreate) {
        setForm(selected);
        setImagePreview(Cloudinary.getMenuImg(selected.imgId, selected._id));
      } else {
        setForm({
          ...initialForm,
          category: categories[0]?._id,
          ...(actCategory !== "all" && { category: actCategory }),
        });
        setImagePreview("");
      }
    }
  }, [showModal, selected, willCreate, actCategory, categories]);

  const toggle = () => dispatch(TOGGLE());
  const handleChange = (key, value) => {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const handleTypeChange = (value) => {
    setForm((current) => ({
      ...current,
      type: value,
      bundleItems: value === "bundle" ? current.bundleItems : [],
    }));
  };

  const handleSave = async () => {
    try {
      const { payload } = await dispatch(SAVE({ data: form, token })).unwrap();
      const buildForm = Cloudinary.buildFileForm(
        form.image,
        "menus",
        payload._id,
        {
          menuId: payload._id,
        },
      );
      const { imgId } = await dispatch(
        UPLOAD({ data: buildForm, token }),
      ).unwrap();

      dispatch(SetNEW_MENU({ ...payload, imgId }));
      toast.success("Successfully saved menu.");
      toggle();
    } catch (error) {
      toast.error(error?.message || error || "Failed to save menu.");
    } finally {
      setSubmitting(false);
      setForm(initialForm);
      setImagePreview("");
    }
  };
  const handleUpdate = async () => {
    try {
      const { payload } = await dispatch(
        UPDATE({ data: form, token }),
      ).unwrap();
      var imgId = selected.imgId;

      if (form.image) {
        const buildForm = Cloudinary.buildFileForm(
          form.image,
          "menus",
          payload._id,
          {
            menuId: payload._id,
          },
        );
        const imgPayload = await dispatch(
          UPLOAD({ data: buildForm, token }),
        ).unwrap();
        imgId = imgPayload.imgId;
      }

      dispatch(SetUPDATED_MENU({ ...payload, imgId }));
      toast.success("Successfully updated menu.");
      toggle();
    } catch (error) {
      toast.error(error?.message || error || "Failed to update menu.");
    } finally {
      setSubmitting(false);
      setForm(initialForm);
      setImagePreview("");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (hasDuplicateName) {
      toast.error("This menu name already exists.");
      return;
    }

    if (!form.image && !form.imgId) {
      toast.error("Please upload a menu image.");
      return;
    }

    setSubmitting(true);

    if (willCreate) {
      return await handleSave();
    }

    await handleUpdate();
  };

  const hasDuplicateName = isExistingMenuName(
    collections,
    form.name,
    selected?._id,
  );

  return (
    <Dialog open={showModal} onOpenChange={toggle}>
      <DialogContent
        className={`border border-border bg-white shadow-[0_28px_80px_rgba(15,23,42,0.22)] ${
          form.type === "bundle" ? "max-w-5xl" : "max-w-2xl"
        }`}
      >
        <DialogHeader>
          <DialogTitle className="text-xl">
            {willCreate ? "Create" : "Update"} Menu Item
          </DialogTitle>
          <DialogDescription>
            Fill in the core details for a new kitchen or resale item.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-5 ">
            <section className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="item-category">Category</Label>
                <Select
                  value={form.category || ""}
                  required
                  onValueChange={(value) => handleChange("category", value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Categories</SelectLabel>
                      {categories?.map((category, index) => (
                        <SelectItem key={index} value={category?._id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="item-type">Type</Label>
                <Select value={form.type} onValueChange={handleTypeChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Type</SelectLabel>
                      {Type.collections.map((type) => (
                        <SelectItem key={type} value={type}>
                          {capitalize(type)}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </section>

            {form.type === "bundle" && (
              <Bundles form={form} setForm={setForm} />
            )}

            <section className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="item-name">Item Name</Label>
                <Input
                  id="item-name"
                  value={form.name}
                  onChange={(event) => handleChange("name", event.target.value)}
                  placeholder="e.g. Pork Sisig"
                  required
                />
                <Name name={form.name} selectedId={selected?._id} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="item-price">Price</Label>
                <div className="relative">
                  <PhilippinePeso className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="item-price"
                    type="number"
                    min="1"
                    step="0.01"
                    value={form.price}
                    onChange={(event) =>
                      handleChange("price", event.target.value)
                    }
                    placeholder="0.00"
                    className="pl-9"
                    required
                  />
                </div>
              </div>
            </section>

            <section className="grid gap-6">
              <MenuImage
                fileInputRef={fileInputRef}
                form={form}
                imagePreview={imagePreview}
                setForm={setForm}
                setImagePreview={setImagePreview}
              />

              <div className="space-y-2">
                <Label htmlFor="item-description">Description</Label>
                <Textarea
                  id="item-description"
                  value={form.description}
                  onChange={(event) =>
                    handleChange("description", event.target.value)
                  }
                  placeholder="Add a short product description for staff and menu display."
                  className="min-h-28 resize-none"
                  required
                />
              </div>

              <div className="flex flex-col-reverse gap-2 border-t border-border pt-5 sm:flex-row sm:justify-end">
                <Button type="button" variant="outline" onClick={toggle}>
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting || hasDuplicateName}>
                  {willCreate ? "Save" : "Update"}
                  {submitting && <Loader className="animate-spin" />}
                </Button>
              </div>
            </section>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default Modal;
