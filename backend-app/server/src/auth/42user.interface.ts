interface Photo {
    value: string;
  }
  
  export interface FortyTwoUser {
    id: number;
    login: string;
    displayname : string;
    email : string;
    photos: Photo[];
  }