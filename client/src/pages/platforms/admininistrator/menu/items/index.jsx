import React, { useMemo, useState } from "react";
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  UtensilsCrossed,
  Package2,
  ChefHat,
  BadgeCheck,
  FileWarning,
} from "lucide-react";
import Modal from "./modal";

const categories = ["All", "Main", "Side Dish", "Dessert", "Resell"];

const fakeMenus = [
  {
    id: 1,
    name: "Pork Sisig",
    category: "Main",
    price: 129,
    stock: 18,
    hasRecipe: true,
    isPublish: true,
    chefApprovedBy: "Chef Ramon",
    description:
      "Savory chopped pork sisig served hot with onions, chili, and rice.",
    image:
      "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 2,
    name: "Liempo Meal",
    category: "Main",
    price: 149,
    stock: 7,
    hasRecipe: true,
    isPublish: false,
    chefApprovedBy: null,
    description:
      "Juicy grilled liempo with rice, dipping sauce, and fresh garnish.",
    image:
      "https://images.unsplash.com/photo-1559847844-5315695dadae?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 3,
    name: "French Fries",
    category: "Side Dish",
    price: 79,
    stock: 4,
    hasRecipe: true,
    isPublish: true,
    chefApprovedBy: "Chef Ana",
    description: "Crispy golden fries served with flavorful seasoning and dip.",
    image:
      "https://images.unsplash.com/photo-1576107232684-1279f390859f?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 4,
    name: "Halo-Halo",
    category: "Dessert",
    price: 95,
    stock: 10,
    hasRecipe: true,
    isPublish: true,
    chefApprovedBy: "Chef Marco",
    description:
      "A refreshing Filipino dessert with crushed ice, milk, and sweet toppings.",
    image:
      "https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 5,
    name: "Chocolate Cake Slice",
    category: "Dessert",
    price: 85,
    stock: 0,
    hasRecipe: false,
    isPublish: false,
    chefApprovedBy: null,
    description:
      "Moist chocolate cake slice perfect for after-meal dessert cravings.",
    image:
      "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 6,
    name: "Bottled Water",
    category: "Resell",
    price: 25,
    stock: 33,
    hasRecipe: false,
    isPublish: true,
    chefApprovedBy: null,
    description: "Chilled bottled water ready for resale and add-on orders.",
    image:
      "https://images.unsplash.com/photo-1564419320461-6870880221ad?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 7,
    name: "Softdrinks in Can",
    category: "Resell",
    price: 45,
    stock: 2,
    hasRecipe: false,
    isPublish: true,
    chefApprovedBy: null,
    description: "Cold canned softdrinks available as a resale item for meals.",
    image:
      "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 8,
    name: "Chicken Nuggets",
    category: "Side Dish",
    price: 89,
    stock: 12,
    hasRecipe: true,
    isPublish: false,
    chefApprovedBy: "Chef Mia",
    description:
      "Crunchy chicken nuggets served hot and crispy with a dipping sauce.",
    image:
      "https://images.unsplash.com/photo-1606755962773-d324e0a13086?auto=format&fit=crop&w=900&q=80",
  },
];

const getStockMeta = (stock) => {
  if (stock <= 0) {
    return {
      label: "Out of Stock",
      className: "bg-red-50 text-red-600 border-red-200",
      icon: Package2,
    };
  }

  if (stock <= 5) {
    return {
      label: `Low Stock (${stock})`,
      className: "bg-amber-50 text-amber-600 border-amber-200",
      icon: Package2,
    };
  }

  return {
    label: `In Stock (${stock})`,
    className: "bg-green-50 text-green-600 border-green-200",
    icon: Package2,
  };
};

const getPublishMeta = (item) => {
  // Resell items can be publishable even without chef recipe workflow
  if (item.category === "Resell") {
    return {
      label: item.isPublish ? "Published" : "Hidden",
      className: item.isPublish
        ? "bg-blue-50 text-blue-700 border-blue-200"
        : "bg-slate-100 text-slate-600 border-slate-200",
      icon: BadgeCheck,
      helper: item.isPublish
        ? "Ready for selling"
        : "Not visible for selling yet",
    };
  }

  if (!item.hasRecipe) {
    return {
      label: "Needs Recipe",
      className: "bg-slate-100 text-slate-700 border-slate-200",
      icon: FileWarning,
      helper: "Chef needs to add a recipe first",
    };
  }

  if (!item.isPublish) {
    return {
      label: "Pending Chef Approval",
      className: "bg-amber-50 text-amber-700 border-amber-200",
      icon: ChefHat,
      helper: item.chefApprovedBy
        ? `Draft only • Last handled by ${item.chefApprovedBy}`
        : "Recipe exists but not published yet",
    };
  }

  return {
    label: "Published",
    className: "bg-green-50 text-green-700 border-green-200",
    icon: BadgeCheck,
    helper: item.chefApprovedBy
      ? `Approved by ${item.chefApprovedBy}`
      : "Ready for selling",
  };
};

const Items = () => {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredMenus = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return fakeMenus.filter((item) => {
      const matchesCategory =
        activeCategory === "All" || item.category === activeCategory;

      const matchesSearch =
        !keyword ||
        item.name.toLowerCase().includes(keyword) ||
        item.category.toLowerCase().includes(keyword) ||
        item.description.toLowerCase().includes(keyword);

      return matchesCategory && matchesSearch;
    });
  }, [search, activeCategory]);

  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-5">
      <div className="mx-auto max-w-7xl space-y-4">
        <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <UtensilsCrossed className="h-5 w-5" />
              </div>

              <div>
                <h1 className="text-xl font-semibold leading-tight">
                  Menu Items
                </h1>
                <p className="text-sm text-muted-foreground">
                  Manage your restaurant items, stock, and publish readiness.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-2 md:flex-row md:items-center">
              <div className="relative w-full md:w-[250px]">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search items..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="h-10 w-full rounded-xl border border-input bg-background pl-9 pr-3 text-sm outline-none transition focus:border-primary"
                />
              </div>

              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-medium text-primary-foreground transition hover:opacity-90"
              >
                <Plus className="h-4 w-4" />
                Add Item
              </button>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {categories.map((category) => {
              const isActive = activeCategory === category;

              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => setActiveCategory(category)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "border border-border bg-background text-foreground hover:border-primary hover:text-primary"
                  }`}
                >
                  {category}
                </button>
              );
            })}
          </div>
        </div>

        {filteredMenus.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filteredMenus.map((item) => {
              const stockMeta = getStockMeta(item.stock);
              const publishMeta = getPublishMeta(item);
              const PublishIcon = publishMeta.icon;
              const StockIcon = stockMeta.icon;

              return (
                <div
                  key={item.id}
                  className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="relative h-52 overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

                    <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                      <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-primary shadow">
                        {item.category}
                      </span>

                      {!item.isPublish && item.category !== "Resell" && (
                        <span className="rounded-full bg-black/65 px-3 py-1 text-xs font-semibold text-white shadow">
                          Draft
                        </span>
                      )}
                    </div>

                    <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-3">
                      <div className="min-w-0">
                        <h2 className="truncate text-xl font-bold text-white">
                          {item.name}
                        </h2>
                      </div>

                      <div className="rounded-xl bg-white/90 px-3 py-2 text-sm font-bold text-primary shadow">
                        ₱{item.price}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-1 flex-col p-4">
                    <p className="line-clamp-2 min-h-[3rem] text-sm leading-6 text-muted-foreground">
                      {item.description}
                    </p>

                    <div className="mt-4 flex flex-wrap items-start gap-2">
                      <div
                        className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium ${stockMeta.className}`}
                      >
                        <StockIcon className="h-3.5 w-3.5" />
                        {stockMeta.label}
                      </div>

                      <div
                        className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium ${publishMeta.className}`}
                      >
                        <PublishIcon className="h-3.5 w-3.5" />
                        {publishMeta.label}
                      </div>
                    </div>

                    <p className="mt-3 min-h-[2.5rem] text-xs leading-5 text-muted-foreground">
                      {publishMeta.helper}
                    </p>

                    <div className="mt-auto flex items-center gap-2 pt-4">
                      <button
                        type="button"
                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-medium text-foreground transition hover:border-primary hover:text-primary"
                      >
                        <Pencil className="h-4 w-4" />
                        Edit
                      </button>

                      <button
                        type="button"
                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-100"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-muted">
              <UtensilsCrossed className="h-6 w-6 text-muted-foreground" />
            </div>

            <h3 className="mt-4 text-lg font-semibold">No menu items found</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              No results matched your current filter or search.
            </p>
          </div>
        )}
      </div>
      <Modal isOpen={isModalOpen} setIsOpen={setIsModalOpen} />
    </div>
  );
};

export default Items;
