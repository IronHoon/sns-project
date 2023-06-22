interface EmailAddress {
  label: string;
  email: string;
}

interface UrlAddress {
  label: string;
  url: string;
}

interface PhoneNumber {
  label: string;
  number: string;
}

interface PostalAddress {
  state?: string;
  label?: string;
  region?: string;
  postCode?: string;
  country?: string;
  city?: string;
  street?: string;
}

export default interface LocalContact {
  jobTitle?: string;
  emailAddresses?: EmailAddress[];
  urlAddresses?: UrlAddress[];
  phoneNumbers?: PhoneNumber[];
  recordID?: string;
  postalAddresses?: PostalAddress[];
  thumbnailPath?: string;
  company?: string;
  middleName?: string;
  imAddresses?: any[];
  givenName?: string;
  birthday?: {
    day: number;
    month: number;
    year: number;
  };
  hasThumbnail?: boolean;
  familyName?: string;
}
