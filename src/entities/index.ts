/**
 * Auto-generated entity types
 * Contains all CMS collection interfaces in a single file 
 */

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
 * Collection ID: impactstatistics
 * Interface for ImpactStatistics
 */
export interface ImpactStatistics {
  _id: string;
  _createdDate?: Date;
  _updatedDate?: Date;
  /** @wixFieldType text */
  statisticLabel?: string;
  /** @wixFieldType number */
  statisticValue?: number;
  /** @wixFieldType text */
  statisticUnit?: string;
  /** @wixFieldType text */
  statisticDescription?: string;
  /** @wixFieldType url */
  linkUrl?: string;
  /** @wixFieldType image - Contains image URL, render with <Image> component, NOT as text */
  statisticImage?: string;
}
