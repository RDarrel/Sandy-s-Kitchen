import { useEffect, useRef, useState } from "react";
import { ImagePlus, Loader, PhilippinePeso, Trash2 } from "lucide-react";

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
} from "@/services/redux/slices/menu/menu";
import Bundles from "./bundles";
import { Category, Type } from "@/services/fakeDB";
import { SAVE } from "@/services/redux/slices/menu/menu";
import Cloudinary from "@/services/utilities/cloudinary";
import { UPLOAD } from "@/services/redux/slices/persons/auth";

const initialForm = {
  name: "",
  category: "main",
  price: "",
  type: "prepared",
  description: "",
  image: null,
  bundleItems: [],
};

const Modal = () => {
  const { token } = useSelector(({ auth }) => auth);
  const { showModal, selected, willCreate } = useSelector(({ menu }) => menu);
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
        setForm(initialForm);
        setImagePreview("");
      }
    }
  }, [showModal, selected, willCreate]);

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

  const handleImageChange = (event) => {
    const [file] = event.target.files || [];

    if (!file) {
      return;
    }

    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }

    const previewUrl = URL.createObjectURL(file);
    const reader = new FileReader();

    reader.onload = () => {
      const image = new Image();

      image.onload = () => {
        setForm((current) => ({
          ...current,
          image: reader.result,
        }));
        setImagePreview(previewUrl);
      };

      image.src = reader.result;
    };

    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }

    setForm((current) => ({
      ...current,
      image: null,
    }));
    setImagePreview("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <Dialog open={showModal} onOpenChange={toggle}>
      <DialogContent
        className={`rounded-[28px] border border-border bg-background p-0 shadow-[0_28px_80px_rgba(15,23,42,0.22)] ${
          form.type === "bundle" ? "max-w-5xl" : "max-w-2xl"
        }`}
      >
        <div className="border-b border-border bg-gradient-to-r from-primary/10 via-background to-primary/5 px-7 py-2">
          <DialogHeader>
            <DialogTitle className="text-xl">Add Menu Item</DialogTitle>
            <DialogDescription>
              Fill in the core details for a new kitchen or resale item.
            </DialogDescription>
          </DialogHeader>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-5 px-7 pt-4 pb-6">
            <section className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="item-category">Category</Label>
                <Select
                  value={form.category}
                  onValueChange={(value) => handleChange("category", value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Categories</SelectLabel>
                      {Category.collections.map((category, index) => (
                        <SelectItem key={index} value={category.value}>
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
              </div>

              <div className="space-y-2">
                <Label htmlFor="item-price">Price</Label>
                <div className="relative">
                  <PhilippinePeso className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="item-price"
                    type="number"
                    min="0"
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
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <Label htmlFor="item-image">Menu Image</Label>
                    <p className="text-xs text-muted-foreground">
                      Upload a clear photo for this menu item.
                    </p>
                  </div>
                  {form.image && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleRemoveImage}
                    >
                      <Trash2 className="h-4 w-4" />
                      Remove
                    </Button>
                  )}
                </div>

                <input
                  ref={fileInputRef}
                  id="item-image"
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  className="hidden"
                  onChange={handleImageChange}
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex w-full flex-col items-center justify-center rounded-[22px] border border-dashed border-border bg-muted/20 px-5 py-8 text-center transition hover:border-primary hover:bg-primary/5"
                >
                  {imagePreview ? (
                    <div className="flex h-52 w-full items-center justify-center rounded-2xl bg-background/80 p-3 shadow-sm">
                      <img
                        src={imagePreview}
                        alt="Menu preview"
                        className="max-h-full w-full rounded-xl object-contain"
                      />
                    </div>
                  ) : (
                    <>
                      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <ImagePlus className="h-5 w-5" />
                      </div>
                      <span className="text-sm font-medium">
                        Click to upload menu image
                      </span>
                      <span className="mt-1 text-xs text-muted-foreground">
                        PNG, JPG, or WEBP. Best for food cards and menu preview.
                      </span>
                    </>
                  )}
                </button>
              </div>

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
                <Button type="submit" disabled={submitting}>
                  Save Item {submitting && <Loader className="animate-spin" />}
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
