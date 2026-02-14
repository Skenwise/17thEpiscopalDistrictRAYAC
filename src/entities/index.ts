/**
 * Auto-generated entity types
 * Contains all CMS collection interfaces in a single file 
 */

/**
 * Collection ID: appaccessusers
 * Interface for AppAccessUsers
 */
export interface AppAccessUsers {
  _id: string;
  _createdDate?: Date;
  _updatedDate?: Date;
  /** @wixFieldType text */
  userEmail?: string;
  /** @wixFieldType text */
  wixOrderId?: string;
  /** @wixFieldType text */
  paymentStatus?: string;
  /** @wixFieldType datetime */
  purchaseDate?: Date | string;
  /** @wixFieldType text */
  productName?: string;
  /** @wixFieldType text */
  uniqueUserId?: string;
}


/**
 * Collection ID: coreprograms
 * Interface for CorePrograms
 */
export interface CorePrograms {
  _id: string;
  _createdDate?: Date;
  _updatedDate?: Date;
  /** @wixFieldType text */
  programName?: string;
  /** @wixFieldType text */
  acronym?: string;
  /** @wixFieldType image - Contains image URL, render with <Image> component, NOT as text */
  programIcon?: string;
  /** @wixFieldType text */
  briefDescription?: string;
  /** @wixFieldType text */
  detailedDescription?: string;
  /** @wixFieldType text */
  sdgAlignment?: string;
  /** @wixFieldType text */
  keyActivities?: string;
  /** @wixFieldType image - Contains image URL, render with <Image> component, NOT as text */
  programImage?: string;
}


/**
 * Collection ID: products
 * @catalog This collection is an eCommerce catalog
 * Interface for Products
 */
export interface Products {
  _id: string;
  _createdDate?: Date;
  _updatedDate?: Date;
  /** @wixFieldType text */
  itemName?: string;
  /** @wixFieldType number */
  itemPrice?: number;
  /** @wixFieldType image - Contains image URL, render with <Image> component, NOT as text */
  itemImage?: string;
  /** @wixFieldType text */
  itemDescription?: string;
  /** @wixFieldType url */
  itemUrl?: string;
}
