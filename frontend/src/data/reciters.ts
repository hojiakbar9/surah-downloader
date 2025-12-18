export interface Reciter {
  id: string; // The folder name on the server (e.g., 'Minshawy_Murattal_128kbps')
  name: string; // The display name
}

export const reciters: Reciter[] = [
  { id: "Minshawy_Murattal_128kbps", name: "Mohamed Siddiq Al-Minshawy" },
  { id: "Alafasy_128kbps", name: "Mishary Rashid Alafasy" },
  { id: "Husary_128kbps", name: "Mahmoud Khalil Al-Husary" },
  { id: "Abdurrahmaan_As-Sudais_128kbps", name: "Abdurrahmaan As-Sudais" },
  { id: "Abdul_Basit_Murattal_192kbps", name: "Abdul Basit (Murattal)" },
  { id: "Hudhaify_128kbps", name: "Ali Al-Hudhaify" },
  { id: "Ali_Jaber_64kbps", name: "Ali Jaber" },
  { id: "Ayman_Sowaid_64kbps", name: "Ayman Sowaid" },
  { id: "Ghamadi_40kbps", name: "Saad Al-Ghamadi" },
];
