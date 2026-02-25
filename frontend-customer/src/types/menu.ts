export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image?: string | File;
  category: string;
  sizes?: {
    size: string;
    price: number;
  }[];
  available?: boolean;
  dietary?: string[];
  altMilkOptions?: string[];
  coldFoamAvailable?: boolean;
}

export interface MenuSubcategory {
  id: string;
  name: string;
  items: MenuItem[];
}

export interface MenuCategory {
  id: string;
  name: string;
  items?: MenuItem[];
  subcategories?: MenuSubcategory[];
}